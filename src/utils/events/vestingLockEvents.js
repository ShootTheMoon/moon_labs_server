// Mongoose Schemas
const vestingLocksInfo = require("../../models/vestingLocks/vestingLocksInfo");

// Abi Imports
const erc20abi = require("../../abis/erc20abi.json");

// Utils Imports
const { handleCoinGekoLogos } = require("../coinGekoHelpers");

// Dict Imports
const { vestingLocks: vestingModels } = require("../dicts/chainToModelDict");
const { vestingLocker: vestingContracts } = require("../dicts/chainToContractsDict");
const web3Dict = require("../dicts/chainToWeb3Dict");

const ethEvents = async () => {
  const chain = 1;
  const contract = vestingContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const arbEvents = async () => {
  const chain = 42161;
  const contract = vestingContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const bscEvents = async () => {
  const chain = 56;
  const contract = vestingContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const avaxEvents = async () => {
  const chain = 43114;
  const contract = vestingContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const goerliEvents = async () => {
  const chain = 5;
  const contract = vestingContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const bscTestnetEvents = async () => {
  const chain = 97;
  const contract = vestingContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const handleNewBlocks = async (web3, chain, contract) => {
  if (!(await vestingLocksInfo.exists({ chain: chain }))) {
    vestingLocksInfo.create({
      chain: chain,
      lastScannedBlock: await web3.eth.getBlockNumber(),
    });
  }

  const schema = vestingModels[chain];

  web3.eth.subscribe("newBlockHeaders", async (err, event) => {
    if (event) {
      const info = await vestingLocksInfo.findOne({ chain: chain });

      const fromBlock = info.lastScannedBlock;
      const toBlock = event.number - info.lastScannedBlock > 5000 ? info.lastScannedBlock + 5000 : false;

      console.log(`Scanning Block: ${fromBlock} - Moon Vest (${chain})`);
      getEvents(fromBlock, toBlock, web3, chain, contract, schema);

      info.lastScannedBlock = toBlock == false ? event.number : toBlock;
      info.save();
    }
    if (err) {
      console.log(err);
    }
  });
};

const getEvents = (fromBlock, toBlock, web3, chainId, contract, schema) => {
  contract
    .getPastEvents("LockCreated", {
      fromBlock: fromBlock,
      toBlock: toBlock ? toBlock : "latest",
    })
    .then(async (events) => {
      for (let event of events) {
        await handleLockCreated(event, web3, chainId, contract, schema);
      }

      contract
        .getPastEvents("TokensWithdrawn", {
          fromBlock: fromBlock,
          toBlock: toBlock ? toBlock : "latest",
        })
        .then((events) => {
          for (let event of events) {
            handleTokensWithdrawn(event, web3, contract, schema);
          }
        });

      contract
        .getPastEvents("LockTransferred", {
          fromBlock: fromBlock,
          toBlock: toBlock ? toBlock : "latest",
        })
        .then((events) => {
          for (let event of events) {
            handleLockTransferred(event, web3, contract, schema);
          }
        });
    });
};

const handleLockCreated = async (event, web3, chainId, contract, schema) => {
  const nonce = event.returnValues.nonce;
  const numOfLocks = event.returnValues.numOfLocks;
  const creator = event.returnValues.creator;
  const blockNumber = event.blockNumber;
  const hash = event.transactionHash;
  const tokenAddress = event.returnValues.token;

  handleCoinGekoLogos(tokenAddress, chainId);
  for (let i = numOfLocks - 1; i >= 0; i--) {
    if (!(await schema.exists({ nonce: nonce - i }))) {
      // Get lock info from token locker contract
      const lock = await contract.methods.getInstance(nonce - i).call();
      // If lock is deleted break
      if (lock[0] === "0x0000000000000000000000000000000000000000") continue;

      const tokenContract = new web3.eth.Contract(erc20abi, lock[0]);

      // Get token information
      const name = await tokenContract.methods.name().call();
      const symbol = await tokenContract.methods.symbol().call();
      const supply = await tokenContract.methods.totalSupply().call();
      const decimals = await tokenContract.methods.decimals().call();

      const { timestamp } = await web3.eth.getBlock(blockNumber);

      schema.create({
        nonce: nonce - i,
        chain: chainId,
        tokenInfo: {
          address: tokenAddress.toLowerCase(),
          name: name,
          symbol: symbol,
          supply: supply,
          decimals: decimals,
        },
        lockInfo: {
          withdrawalAddress: lock[1].toLowerCase(),
          depositedAmount: lock[2],
          currentAmount: lock[2] - lock[3],
          withdrawnAmount: lock[3],
          startDate: lock[4],
          endDate: lock[5],
          creation: { creator: creator.toLowerCase(), amount: lock[2], startDate: lock[4], endDate: lock[5], block: blockNumber, time: timestamp, hash: hash.toLowerCase() },
        },
      });
    }
  }
};

const handleTokensWithdrawn = async (event, web3, contract, schema) => {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.withdraws.hash": hash });

  if (lock && !found) {
    const withdrawer = event.returnValues.owner;
    const amount = event.returnValues.amount;
    const blockNumber = event.blockNumber;
    const lockInstance = await contract.methods.getInstance(nonce).call();

    const { timestamp } = await web3.eth.getBlock(blockNumber);
    // Update lock info
    lock.lockInfo.currentAmount = lockInstance[2] - lockInstance[3];
    // Because the nonce is deleted from the blockchain, the withdraw amount will return zero so we check for current amount to be zero. If so then we know all tokens have been withdrawn from the lock
    lock.lockInfo.withdrawnAmount = lockInstance[2] == "0" ? lock.lockInfo.depositedAmount : lockInstance[3];
    // Push withdraw instance
    lock.lockInfo.withdraws.push({ withdrawer: withdrawer.toLowerCase(), amount: amount, block: blockNumber, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }
};

const handleLockTransferred = async (event, web3, contract, schema) => {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.lockTransfers.hash": hash });

  if (lock && !found) {
    const from = event.returnValues.from;
    const to = event.returnValues.to;
    const blockNumber = event.blockNumber;
    const { timestamp } = await web3.eth.getBlock(blockNumber);
    const lockInstance = await contract.methods.getInstance(nonce).call();
    // Update lock info
    lock.lockInfo.withdrawalAddress = lockInstance[1].toLowerCase();

    // Push withdraw instance
    lock.lockInfo.lockTransfers.push({ from: from.toLowerCase(), to: to.toLowerCase(), block: blockNumber, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }
};

const vestingLockEvents = () => {
  goerliEvents();
};

module.exports = vestingLockEvents;

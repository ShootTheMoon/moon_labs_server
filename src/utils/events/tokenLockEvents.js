// Mongoose Schemas
const tokenLocksInfo = require("../../models/tokenLocks/tokenLocksInfo");

// Abi Imports
const erc20abi = require("../../abis/erc20abi.json");

// Utils Imports
const { tokenLocks: tokenModels } = require("../dicts/chainToModelDict");
const { tokenLocker: tokenContracts } = require("../dicts/chainToContractsDict");
const web3Dict = require("../dicts/chainToWeb3Dict");

const ethEvents = async () => {
  const chain = 1;
  const contract = tokenContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const arbEvents = async () => {
  const chain = 42161;
  const contract = tokenContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const bscEvents = async () => {
  const chain = 56;
  const contract = tokenContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const avaxEvents = async () => {
  const chain = 43114;
  const contract = tokenContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const goerliEvents = async () => {
  const chain = 5;
  const contract = tokenContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const bscTestnetEvents = async () => {
  const chain = 97;
  const contract = tokenContracts[chain];
  const web3 = web3Dict[chain];

  handleNewBlocks(web3, chain, contract);
};

const handleNewBlocks = async (web3, chain, contract) => {
  if (!(await tokenLocksInfo.exists({ chain: chain }))) {
    tokenLocksInfo.create({
      chain: chain,
      lastScannedBlock: await web3.eth.getBlockNumber(),
    });
  }

  const schema = tokenModels[chain];

  web3.eth.subscribe("newBlockHeaders", async (err, event) => {
    if (event) {
      const info = await tokenLocksInfo.findOne({ chain: chain });

      const fromBlock = info.lastScannedBlock;
      const toBlock = event.number - info.lastScannedBlock > 5000 ? info.lastScannedBlock + 5000 : false;

      console.log(`Scanning Block: ${fromBlock} - Moon Lock Token (${chain})`);
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

      contract
        .getPastEvents("WithdrawalTransferred", {
          fromBlock: fromBlock,
          toBlock: toBlock ? toBlock : "latest",
        })
        .then((events) => {
          for (let event of events) {
            handleWithdrawTransferred(event, web3, contract, schema);
          }
        });

      contract
        .getPastEvents("LockRelocked", {
          fromBlock: fromBlock,
          toBlock: toBlock ? toBlock : "latest",
        })
        .then((events) => {
          for (let event of events) {
            handleLockRelocked(event, web3, contract, schema);
          }
        });

      contract
        .getPastEvents("LockSplit", {
          fromBlock: fromBlock,
          toBlock: toBlock ? toBlock : "latest",
        })
        .then((events) => {
          for (let event of events) {
            handleLockSplit(event, web3, chainId, contract, schema);
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

  for (let i = numOfLocks - 1; i >= 0; i--) {
    // Check of lock already exists
    if (!(await schema.exists({ nonce: nonce - i }))) {
      // Get lock info from token locker contract
      const lock = await contract.methods.getLock(nonce - i).call();
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
          owner: lock[1].toLowerCase(),
          withdrawalAddress: lock[2].toLowerCase(),
          depositedAmount: lock[3],
          currentAmount: lock[4],
          withdrawnAmount: 0,
          startDate: lock[5],
          endDate: lock[6],
          creation: { creator: creator.toLowerCase(), amount: lock[3], startDate: lock[5], endDate: lock[6], block: blockNumber, time: timestamp, hash: hash.toLowerCase() },
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
    const withdrawer = event.returnValues.withdrawer;
    const amount = event.returnValues.amount;
    const blockNumber = event.blockNumber;
    const lockInstance = await contract.methods.getLock(nonce).call();

    const { timestamp } = await web3.eth.getBlock(blockNumber);
    // Update lock info
    lock.lockInfo.currentAmount = lockInstance[4];
    lock.lockInfo.withdrawnAmount = lock.lockInfo.depositedAmount - lockInstance[4];

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
    const lockInstance = await contract.methods.getLock(nonce).call();
    // Update lock info
    lock.lockInfo.owner = lockInstance[1].toLowerCase();

    // Push withdraw instance
    lock.lockInfo.lockTransfers.push({ from: from.toLowerCase(), to: to.toLowerCase(), block: blockNumber, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }
};

const handleWithdrawTransferred = async (event, web3, contract, schema) => {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.withdrawalTransfers.hash": hash });

  if (lock && !found) {
    const from = event.returnValues.from;
    const to = event.returnValues.to;
    const blockNumber = event.blockNumber;
    const { timestamp } = await web3.eth.getBlock(blockNumber);
    const lockInstance = await contract.methods.getLock(nonce).call();
    // Update lock info
    lock.lockInfo.withdrawalAddress = lockInstance[2].toLowerCase();

    // Push withdraw instance
    lock.lockInfo.withdrawalTransfers.push({ from: from.toLowerCase(), to: to.toLowerCase(), block: blockNumber, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }
};

const handleLockRelocked = async (event, web3, contract, schema) => {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.relocks.hash": hash });

  if (lock && !found) {
    const owner = event.returnValues.owner;
    const amount = event.returnValues.amount;
    const startTime = event.returnValues.startTime;
    const endTime = event.returnValues.endTime;
    const blockNumber = event.blockNumber;
    const lockInstance = await contract.methods.getLock(nonce).call();
    const { timestamp } = await web3.eth.getBlock(blockNumber);

    // Update lock info
    lock.lockInfo.depositedAmount = lockInstance[3];
    lock.lockInfo.currentAmount = lockInstance[4];
    if (lockInstance[0] === "0x0000000000000000000000000000000000000000") {
      lock.lockInfo.startDate += startTime;
      lock.lockInfo.endDate += endTime;
    } else {
      lock.lockInfo.startDate = lockInstance[5];
      lock.lockInfo.endDate = lockInstance[6];
    }
    // Push withdraw instance
    lock.lockInfo.relocks.push({ owner: owner.toLowerCase(), amount: amount, startTime: startTime, endTime: endTime, block: blockNumber, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }
};

const handleLockSplit = async (event, web3, chainId, contract, schema) => {
  const nonce = event.returnValues.nonce;
  const newNonce = event.returnValues.newNonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.splits.hash": hash });

  const from = event.returnValues.from;
  const to = event.returnValues.to;
  const amount = event.returnValues.amount;
  const blockNumber = event.blockNumber;
  const lockInstance = await contract.methods.getLock(nonce).call();
  const { timestamp } = await web3.eth.getBlock(blockNumber);

  if (lock && !found) {
    // Update lock info
    lock.lockInfo.depositedAmount = lockInstance[3];
    lock.lockInfo.currentAmount = lockInstance[4];
    // Push withdraw instance
    lock.lockInfo.splits.push({ from: from.toLowerCase(), to: to.toLowerCase(), amount: amount, block: blockNumber, newNonce: newNonce, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }

  if (!(await schema.exists({ nonce: newNonce }))) {
    // Get lock info from token locker contract
    const splitLock = await contract.methods.getLock(newNonce).call();
    // If lock is deleted break
    if (splitLock[0] === "0x0000000000000000000000000000000000000000") return;

    schema.create({
      nonce: newNonce,
      chain: chainId,
      tokenInfo: {
        address: lock.tokenInfo.address,
        name: lock.tokenInfo.name,
        symbol: lock.tokenInfo.symbol,
        supply: lock.tokenInfo.supply,
        decimals: lock.tokenInfo.decimals,
        logo: lock.tokenInfo.logo && lock.tokenInfo.logo,
      },
      lockInfo: {
        owner: splitLock[1].toLowerCase(),
        withdrawalAddress: splitLock[2].toLowerCase(),
        depositedAmount: splitLock[3],
        currentAmount: splitLock[4],
        withdrawnAmount: BigInt(splitLock[3]) - BigInt(splitLock[4]),
        startDate: splitLock[5],
        endDate: splitLock[6],
        creation: { creator: from.toLowerCase(), amount: amount, startDate: splitLock[5], endDate: splitLock[6], block: blockNumber, time: timestamp, hash: hash.toLowerCase() },
      },
    });
  }
};

const tokenLockEvents = () => {
  goerliEvents();
};

module.exports = tokenLockEvents;

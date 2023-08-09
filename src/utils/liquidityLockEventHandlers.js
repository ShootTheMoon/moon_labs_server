// Abi Imports
const erc20abi = require("../abis/erc20abi.json");
const uniswapV2PairAbi = require("../abis/uniswapV2PairAbi.json");

// Utils Imports
const { handleCoinGekoLogos } = require("./coinGekoHelpers");

// Dict Imports
const { dexFactories } = require("./dicts/chainToAmmDict");

async function handleLiquidityLockCreation(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const creator = event.returnValues.creator;
  const blockNumber = event.blockNumber;
  const hash = event.transactionHash;
  const pairAddress = event.returnValues.token;

  let token0;
  let token1;

  try {
    const pairContract = new web3.eth.Contract(uniswapV2PairAbi, pairAddress);
    const token0Contract = new web3.eth.Contract(erc20abi, await pairContract.methods.token0().call());
    const token1Contract = new web3.eth.Contract(erc20abi, await pairContract.methods.token1().call());

    handleCoinGekoLogos(token0Contract._address, chainId);
    handleCoinGekoLogos(token1Contract._address, chainId);

    const getDexFactory = async (pairAddress, token0, token1) => {
      const chainFactories = dexFactories[chainId];
      for (let factory of chainFactories) {
        const factoryContract = new web3.eth.Contract(factory.abi, factory.address);
        const resultAddress = await factoryContract.methods.getPair(token0, token1).call();
        if (resultAddress.toLowerCase() == pairAddress.toLowerCase()) return [true, factory.name];
      }
      return [false];
    };

    const [pairCheck, factoryName] = await getDexFactory(pairAddress, token0Contract._address, token1Contract._address);
    if (pairCheck) {
      dexName = factoryName;
    } else {
      return;
    }

    token0 = { address: token0Contract._address.toLowerCase(), symbol: await token0Contract.methods.symbol().call(), name: await token0Contract.methods.name().call(), decimals: await token0Contract.methods.decimals().call() };
    token1 = { address: token1Contract._address.toLowerCase(), symbol: await token1Contract.methods.symbol().call(), name: await token1Contract.methods.name().call(), decimals: await token1Contract.methods.decimals().call() };
  } catch (err) {
    console.log(err);
    return;
  }

  // Check of lock already exists
  if (!(await schema.exists({ nonce: nonce }))) {
    // Get lock info from token locker contract
    const lock = await contract.methods.getLock(nonce).call();
    // If lock is deleted break
    if (lock[0] === "0x0000000000000000000000000000000000000000") return;

    const tokenContract = new web3.eth.Contract(erc20abi, lock[0]);

    // Get token information
    const name = await tokenContract.methods.name().call();
    const symbol = await tokenContract.methods.symbol().call();
    const supply = await tokenContract.methods.totalSupply().call();
    const decimals = await tokenContract.methods.decimals().call();

    const { timestamp } = await web3.eth.getBlock(blockNumber);

    await schema.create({
      nonce: nonce,
      chain: chainId,
      dex: dexName,
      token0: token0,
      token1: token1,
      tokenInfo: {
        address: pairAddress.toLowerCase(),
        name: name,
        symbol: symbol,
        supply: supply,
        decimals: decimals,
      },
      lockInfo: {
        owner: lock[1].toLowerCase(),
        depositedAmount: lock[2],
        currentAmount: lock[3],
        withdrawnAmount: 0,
        unlockDate: lock[4],
        creation: { creator: creator.toLowerCase(), amount: lock[3], unlockDate: lock[4], block: blockNumber, time: timestamp, hash: hash.toLowerCase() },
      },
    });
  }
}

async function handleLiquidityLockCreationRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;

  if (await schema.exists({ nonce: nonce })) {
    schema.deleteMany({ nonce: nonce });
  }
}

async function handleLiquidityLockWithdrawal(event, web3, chainId, contract, schema) {
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
}

async function handleLiquidityLockWithdrawalRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.withdraws.hash": hash });

  if (lock && found) {
    const lockInstance = await contract.methods.getLock(nonce).call();

    // Update lock info
    lock.lockInfo.currentAmount = lockInstance[4];
    lock.lockInfo.withdrawnAmount = lock.lockInfo.depositedAmount - lockInstance[4];

    // Find the withdraw instance and remove from database
    for (let [i, withdraw] of lock.lockInfo.withdraws.entries()) {
      if (withdraw.hash == hash) lock.lockInfo.withdraws.splice(i, 1);
    }

    lock.save();
  }
}

async function handleLiquidityLockTransfer(event, web3, contract, schema) {
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

    // Push transfer instance
    lock.lockInfo.lockTransfers.push({ from: from.toLowerCase(), to: to.toLowerCase(), block: blockNumber, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }
}
async function handleLiquidityLockTransferRevert(event, web3, contract, schema) {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.lockTransfers.hash": hash });

  if (lock && found) {
    const lockInstance = await contract.methods.getLock(nonce).call();
    // Update lock info
    lock.lockInfo.owner = lockInstance[1].toLowerCase();

    // Find the transfer instance and remove from database
    for (let [i, transfer] of lock.lockInfo.lockTransfers.entries()) {
      if (transfer.hash == hash) lock.lockInfo.lockTransfers.splice(i, 1);
    }

    lock.save();
  }
}

async function handleLiquidityLockRelock(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.relocks.hash": hash });

  if (lock && !found) {
    const owner = event.returnValues.owner;
    const amount = event.returnValues.amount;
    const unlockTime = event.returnValues.unlockTime ? event.returnValues.unlockTime : event.returnValues.unlockDate;
    const blockNumber = event.blockNumber;
    const lockInstance = await contract.methods.getLock(nonce).call();
    const { timestamp } = await web3.eth.getBlock(blockNumber);

    // Update lock info
    lock.lockInfo.depositedAmount = lockInstance[2];
    lock.lockInfo.currentAmount = lockInstance[3];
    if (lockInstance[0] === "0x0000000000000000000000000000000000000000") {
      lock.lockInfo.unlockDate += unlockTime;
    } else {
      lock.lockInfo.unlockDate = lockInstance[4];
    }
    // Push withdraw instance
    lock.lockInfo.relocks.push({ owner: owner.toLowerCase(), amount: amount, unlockTime: unlockTime, block: blockNumber, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }
}

async function handleLiquidityLockRelockRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.relocks.hash": hash });

  if (lock && found) {
    const unlockTime = event.returnValues.unlockTime ? event.returnValues.unlockTime : event.returnValues.unlockDate;
    const lockInstance = await contract.methods.getLock(nonce).call();

    // Update lock info
    lock.lockInfo.depositedAmount = lockInstance[2];
    lock.lockInfo.currentAmount = lockInstance[3];
    if (lockInstance[0] === "0x0000000000000000000000000000000000000000") {
      lock.lockInfo.unlockDate -= unlockTime;
    } else {
      lock.lockInfo.unlockDate = lockInstance[4];
    }

    // Find the relock instance and remove from database
    for (let [i, relock] of lock.lockInfo.relocks.entries()) {
      if (relock.hash == hash) lock.lockInfo.relocks.splice(i, 1);
    }

    lock.save();
  }
}

async function handleLiquidityLockSplit(event, web3, chainId, contract, schema) {
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

    await schema.create({
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
        unlockDate: splitLock[5],
        creation: { creator: from.toLowerCase(), amount: amount, unlockDate: splitLock[5], block: blockNumber, time: timestamp, hash: hash.toLowerCase() },
      },
    });
  }
}

async function handleLiquidityLockSplitRevert(event, web3, chainId, contract, schema) {
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

  if (lock && found) {
    // Update lock info
    lock.lockInfo.depositedAmount = lockInstance[3];
    lock.lockInfo.currentAmount = lockInstance[4];

    // Find the relock instance and remove from database
    for (let [i, split] of lock.lockInfo.splits.entries()) {
      if (split.hash == hash) lock.lockInfo.splits.splice(i, 1);
    }

    lock.save();
  }

  if (await schema.exists({ nonce: newNonce })) {
    schema.deleteMany({ nonce: newNonce });
  }
}

module.exports = {
  handleLiquidityLockCreation,
  handleLiquidityLockCreationRevert,
  handleLiquidityLockWithdrawal,
  handleLiquidityLockWithdrawalRevert,
  handleLiquidityLockTransfer,
  handleLiquidityLockTransferRevert,
  handleLiquidityLockRelock,
  handleLiquidityLockRelockRevert,
  handleLiquidityLockSplit,
  handleLiquidityLockSplitRevert,
};

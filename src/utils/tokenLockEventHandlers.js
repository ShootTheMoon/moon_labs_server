// Abi Imports
const erc20abi = require("../abis/erc20abi.json");

// Utils Imports
const { handleCoinGekoLogos } = require("./coinGekoHelpers");

// Token Handlers
async function handleTokenLockCreation(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const numOfLocks = event.returnValues.numOfLocks;
  const creator = event.returnValues.creator;
  const blockNumber = event.blockNumber;
  const hash = event.transactionHash;
  const tokenAddress = event.returnValues.token;

  handleCoinGekoLogos(tokenAddress, chainId);

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

      await schema.create({
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
}

async function handleTokenLockCreationRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;

  if (await schema.exists({ nonce: nonce })) {
    schema.deleteMany({ nonce: nonce });
  }
}

async function handleTokenLockWithdrawal(event, web3, chainId, contract, schema) {
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

async function handleTokenLockWithdrawalRevert(event, web3, chainId, contract, schema) {
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

async function handleTokenLockTransfer(event, web3, chainId, contract, schema) {
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

async function handleTokenLockTransferRevert(event, web3, chainId, contract, schema) {
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

async function handleTokenLockWithdrawTransfer(event, web3, chainId, contract, schema) {
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
}

async function handleTokenLockWithdrawTransferRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.withdrawalTransfers.hash": hash });

  if (lock && found) {
    const lockInstance = await contract.methods.getLock(nonce).call();
    // Update lock info
    lock.lockInfo.withdrawalAddress = lockInstance[2].toLowerCase();

    // Find the withdrawal transfer instance and remove from database
    for (let [i, transfer] of lock.lockInfo.withdrawalTransfers.entries()) {
      if (transfer.hash == hash) lock.lockInfo.withdrawalTransfers.splice(i, 1);
    }

    lock.save();
  }
}

async function handleTokenLockRelock(event, web3, chainId, contract, schema) {
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
    // Push relock instance
    lock.lockInfo.relocks.push({ owner: owner.toLowerCase(), amount: amount, startTime: startTime, endTime: endTime, block: blockNumber, time: timestamp, hash: hash.toLowerCase() });
    lock.save();
  }
}

async function handleTokenLockRelockRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.relocks.hash": hash });

  if (lock && found) {
    const startTime = event.returnValues.startTime;
    const endTime = event.returnValues.endTime;
    const lockInstance = await contract.methods.getLock(nonce).call();

    // Update lock info
    lock.lockInfo.depositedAmount = lockInstance[3];
    lock.lockInfo.currentAmount = lockInstance[4];
    if (lockInstance[0] === "0x0000000000000000000000000000000000000000") {
      lock.lockInfo.startDate -= startTime;
      lock.lockInfo.endDate -= endTime;
    } else {
      lock.lockInfo.startDate = lockInstance[5];
      lock.lockInfo.endDate = lockInstance[6];
    }

    // Find the relock instance and remove from database
    for (let [i, relock] of lock.lockInfo.relocks.entries()) {
      if (relock.hash == hash) lock.lockInfo.relocks.splice(i, 1);
    }

    lock.save();
  }
}

async function handleTokenLockSplit(event, web3, chainId, contract, schema) {
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

    // Push split instance
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
        startDate: splitLock[5],
        endDate: splitLock[6],
        creation: { creator: from.toLowerCase(), amount: amount, startDate: splitLock[5], endDate: splitLock[6], block: blockNumber, time: timestamp, hash: hash.toLowerCase() },
      },
    });
  }
}

async function handleTokenLockSplitRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const newNonce = event.returnValues.newNonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.splits.hash": hash });

  const lockInstance = await contract.methods.getLock(nonce).call();

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
  handleTokenLockCreation,
  handleTokenLockCreationRevert,
  handleTokenLockRelock,
  handleTokenLockRelockRevert,
  handleTokenLockSplit,
  handleTokenLockSplitRevert,
  handleTokenLockTransfer,
  handleTokenLockTransferRevert,
  handleTokenLockWithdrawTransfer,
  handleTokenLockWithdrawTransferRevert,
  handleTokenLockWithdrawal,
  handleTokenLockWithdrawalRevert,
};

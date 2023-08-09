// Abi Imports
const erc20abi = require("../abis/erc20abi.json");

// Utils Imports
const { handleCoinGekoLogos } = require("./coinGekoHelpers");

async function handleVestingLockCreation(event, web3, chainId, contract, schema) {
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
}

async function handleTokenLockCreationRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;

  if (await schema.exists({ nonce: nonce })) {
    schema.deleteMany({ nonce: nonce });
  }
}

async function handleVestingLockWithdrawal(event, web3, chainId, contract, schema) {
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
}

async function handleVestingLockWithdrawalRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.withdraws.hash": hash });

  if (lock && found) {
    const lockInstance = await contract.methods.getInstance(nonce).call();

    // Update lock info
    lock.lockInfo.currentAmount = lockInstance[2] - lockInstance[3];
    // Because the nonce is deleted from the blockchain, the withdraw amount will return zero so we check for current amount to be zero. If so then we know all tokens have been withdrawn from the lock
    lock.lockInfo.withdrawnAmount = lockInstance[2] == "0" ? lock.lockInfo.depositedAmount : lockInstance[3];

    // Find the withdraw instance and remove from database
    for (let [i, withdraw] of lock.lockInfo.withdraws.entries()) {
      if (withdraw.hash == hash) lock.lockInfo.withdraws.splice(i, 1);
    }

    lock.save();
  }
}

async function handleVestingLockTransfer(event, web3, chainId, contract, schema) {
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
}

async function handleVestingLockTransferRevert(event, web3, chainId, contract, schema) {
  const nonce = event.returnValues.nonce;
  const hash = event.transactionHash;

  const lock = await schema.findOne({ nonce: nonce });
  const found = await schema.exists({ nonce: nonce, "lockInfo.lockTransfers.hash": hash });

  if (lock && found) {
    const lockInstance = await contract.methods.getInstance(nonce).call();
    // Update lock info
    lock.lockInfo.withdrawalAddress = lockInstance[1].toLowerCase();

    // Find the transfer instance and remove from database
    for (let [i, transfer] of lock.lockInfo.lockTransfers.entries()) {
      if (transfer.hash == hash) lock.lockInfo.lockTransfers.splice(i, 1);
    }

    lock.save();
  }
}

module.exports = { handleVestingLockCreation, handleTokenLockCreationRevert, handleVestingLockWithdrawal, handleVestingLockWithdrawalRevert, handleVestingLockTransfer, handleVestingLockTransferRevert };

const mongoose = require("mongoose");

const createVestingLockSchema = (name) => {
  const creation = new mongoose.Schema({
    creator: { type: String, required: true },
    amount: { type: String, required: true },
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, sparse: true },
  });

  const lockTransfer = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, sparse: true },
  });

  const withdrawalTransfer = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, sparse: true },
  });

  const split = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: String, required: true },
    newNonce: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, sparse: true },
  });

  const relock = new mongoose.Schema({
    owner: { type: String, required: true },
    amount: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, sparse: true },
  });

  const withdraw = new mongoose.Schema({
    withdrawer: { type: String, required: true },
    amount: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, sparse: true },
  });

  const tokenLocks = new mongoose.Schema(
    {
      nonce: { type: Number, required: true, unique: true },
      chain: { type: Number, required: true },
      tokenInfo: {
        address: { type: String, required: true },
        name: { type: String, required: true },
        symbol: { type: String, required: true },
        supply: { type: String, required: true },
        decimals: { type: Number, required: true },
      },
      lockInfo: {
        owner: { type: String, required: true },
        withdrawalAddress: { type: String, required: true },
        depositedAmount: { type: String, required: true },
        currentAmount: { type: String, required: true },
        withdrawnAmount: { type: String, required: true },
        startDate: { type: Number, required: true },
        endDate: { type: Number, required: true },
        creation: { type: creation, required: true },
        lockTransfers: [lockTransfer],
        withdrawalTransfers: [withdrawalTransfer],
        splits: [split],
        relocks: [relock],
        withdraws: [withdraw],
      },
    },
    { collection: name }
  );

  return mongoose.models[name] || mongoose.model(name, tokenLocks);
};

module.exports = createVestingLockSchema;

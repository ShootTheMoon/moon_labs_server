const mongoose = require("mongoose");

const createVestingLockSchema = (name) => {
  const creation = new mongoose.Schema({
    creator: { type: String, required: true },
    amount: { type: String, required: true },
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true },
  });

  const lockTransfer = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true },
  });

  const withdraw = new mongoose.Schema({
    withdrawer: { type: String, required: true },
    amount: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true },
  });

  const vestingLocks = new mongoose.Schema(
    {
      nonce: { type: Number, required: true },
      chain: { type: Number, required: true },
      tokenInfo: {
        address: { type: String, required: true },
        name: { type: String, required: true },
        symbol: { type: String, required: true },
        supply: { type: String, required: true },
        decimals: { type: Number, required: true },
      },
      lockInfo: {
        withdrawalAddress: { type: String, required: true },
        depositedAmount: { type: String, required: true },
        currentAmount: { type: String, required: true },
        withdrawnAmount: { type: String, required: true },
        startDate: { type: Number, required: true },
        endDate: { type: Number, required: true },
        creation: { type: creation, required: true },
        lockTransfers: [lockTransfer],
        withdraws: [withdraw],
      },
    },
    { collection: name }
  );

  return mongoose.models[name] || mongoose.model(name, vestingLocks);
};

module.exports = createVestingLockSchema;

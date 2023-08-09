const mongoose = require("mongoose");

const createLiquidityLockSchema = (name) => {
  const creation = new mongoose.Schema({
    creator: { type: String, required: true },
    amount: { type: String, required: true },
    unlockDate: { type: Number, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, unique: true },
  });

  const lockTransfer = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, unique: true },
  });

  const split = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: String, required: true },
    newNonce: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, unique: true },
  });

  const relock = new mongoose.Schema({
    owner: { type: String, required: true },
    amount: { type: String, required: true },
    unlockTime: { type: Number, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, unique: true },
  });

  const withdraw = new mongoose.Schema({
    withdrawer: { type: String, required: true },
    amount: { type: String, required: true },
    block: { type: Number, required: true },
    time: { type: Number, required: true },
    hash: { type: String, required: true, unique: true },
  });

  const liquidityLocks = new mongoose.Schema(
    {
      nonce: { type: Number, required: true, unique: true },
      chain: { type: Number, required: true },
      dex: { type: String, require: true },
      token0: { address: { type: String, require: true }, symbol: { type: String, require: true }, name: { type: String, require: true }, decimals: { type: Number, require: true } },
      token1: { address: { type: String, require: true }, symbol: { type: String, require: true }, name: { type: String, require: true }, decimals: { type: Number, require: true } },
      tokenInfo: {
        address: { type: String, required: true },
        name: { type: String, required: true },
        symbol: { type: String, required: true },
        supply: { type: String, required: true },
        decimals: { type: Number, required: true },
      },
      lockInfo: {
        owner: { type: String, required: true },
        depositedAmount: { type: String, required: true },
        currentAmount: { type: String, required: true },
        withdrawnAmount: { type: String, required: true },
        unlockDate: { type: Number, required: true },
        creation: { type: creation, required: true },
        lockTransfers: [lockTransfer],
        splits: [split],
        relocks: [relock],
        withdraws: [withdraw],
      },
    },
    { collection: name }
  );

  return mongoose.models[name] || mongoose.model(name, liquidityLocks);
};

module.exports = createLiquidityLockSchema;

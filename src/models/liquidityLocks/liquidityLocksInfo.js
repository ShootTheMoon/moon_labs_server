const mongoose = require("mongoose");

const tokenBurn = new mongoose.Schema({
  amount: { type: String, required: true },
  hash: { type: String, required: true, sparse: true },
});

const liquidityLocksInfo = new mongoose.Schema(
  {
    chain: { type: Number, required: true },
    lastScannedBlock: { type: Number, required: true },
    tokenBurns: [tokenBurn],
  },
  { collection: "liquidityLocksInfo" }
);

module.exports = mongoose.model("liquidityLocksInfo", liquidityLocksInfo);

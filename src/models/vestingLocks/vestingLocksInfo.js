const mongoose = require("mongoose");

const tokenBurn = new mongoose.Schema({
  amount: { type: String, required: true },
  hash: { type: String, required: true, sparse: true },
});

const vestingLocksInfo = new mongoose.Schema(
  {
    chain: { type: Number, required: true },
    lastScannedBlock: { type: Number, required: true },
    tokenBurns: [tokenBurn],
  },
  { collection: "vestingLocksInfo" }
);

module.exports = mongoose.model("vestingLocksInfo", vestingLocksInfo);

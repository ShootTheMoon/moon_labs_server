const mongoose = require("mongoose");

const tokenBurn = new mongoose.Schema({
  amount: { type: String, required: true },
  hash: { type: String, required: true, unique: true },
});

const tokenLocksInfo = new mongoose.Schema(
  {
    chain: { type: Number, required: true },
    lastScannedBlock: { type: Number, required: true },
    tokenBurns: [tokenBurn],
  },
  { collection: "tokenLocksInfo" }
);

module.exports = mongoose.model("tokenLocksInfo", tokenLocksInfo);

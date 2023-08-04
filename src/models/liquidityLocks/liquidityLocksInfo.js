const mongoose = require("mongoose");

const liquidityLocksInfo = new mongoose.Schema(
  {
    chain: { type: Number, required: true },
    lastScannedBlock: { type: Number, required: true },
  },
  { collection: "liquidityLocksInfo" }
);

module.exports = mongoose.model("liquidityLocksInfo", liquidityLocksInfo);

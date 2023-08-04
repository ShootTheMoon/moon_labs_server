const mongoose = require("mongoose");

const vestingLocksInfo = new mongoose.Schema(
  {
    chain: { type: Number, required: true },
    lastScannedBlock: { type: Number, required: true },
  },
  { collection: "vestingLocksInfo" }
);

module.exports = mongoose.model("vestingLocksInfo", vestingLocksInfo);

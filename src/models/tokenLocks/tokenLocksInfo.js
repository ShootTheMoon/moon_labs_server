const mongoose = require("mongoose");

const tokenLocksInfo = new mongoose.Schema(
  {
    chain: { type: Number, required: true },
    lastScannedBlock: { type: Number, required: true },
  },
  { collection: "tokenLocksInfo" }
);

module.exports = mongoose.model("tokenLocksInfo", tokenLocksInfo);

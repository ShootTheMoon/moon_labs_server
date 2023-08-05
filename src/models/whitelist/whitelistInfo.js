const mongoose = require("mongoose");

const whitelistInfo = new mongoose.Schema(
  {
    chain: { type: Number, required: true },
    lastScannedBlock: { type: Number, required: true },
  },
  { collection: "whitelistInfo" }
);

module.exports = mongoose.model("whitelistInfo", whitelistInfo);

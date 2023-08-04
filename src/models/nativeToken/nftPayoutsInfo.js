const mongoose = require("mongoose");

const nftPayoutsInfo = new mongoose.Schema(
  {
    lastScannedBlock: { type: Number, required: true },
    lastNonce: { type: Number, required: true },
    totalPayout: { type: String, required: true },
  },
  { collection: "nftPayoutsInfo" }
);

module.exports = mongoose.model("nftPayoutsInfo", nftPayoutsInfo);

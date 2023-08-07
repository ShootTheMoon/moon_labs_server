const mongoose = require("mongoose");

const metaData = new mongoose.Schema(
  {
    chain: { type: Number, required: true },
    address: { type: String, required: true },
    coinGeckoLogoSmall: { type: String, required: false },
    coinGeckoLogoLarge: { type: String, required: false },
  },
  { collection: "metaData" }
);

module.exports = mongoose.model("metaData", metaData);

const mongoose = require("mongoose");

const payout = new mongoose.Schema({
  owner: { type: String, required: true },
  amount: { type: String, required: true },
  time: { type: Number, required: true },
  hash: { type: String, required: true },
});

const nftPayouts = new mongoose.Schema(
  {
    nonce: { type: Number, required: true },
    payouts: { type: [payout], required: false },
  },
  { collection: "nftPayouts" }
);

module.exports = mongoose.model("nftPayouts", nftPayouts);

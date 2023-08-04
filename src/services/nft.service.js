// Schema Imports
const nftPayouts = require("../models/nativeToken/nftPayouts");
const nftPayoutInfo = require("../models/nativeToken/nftPayoutsInfo");
// Abi Imports
const nftAbi = require("../abis/nftAbi.json");
// Global Imports
const { MLAB_NFT_ADDRESS } = process.env;
// Dict Imports
const { web3 } = require("../utils/web3Helpers");

// Get NFT balance of a single address
async function nftBalance(req) {
  const address = req.query.address;
  const contract = new web3.eth.eth.Contract(nftAbi, MLAB_NFT_ADDRESS);
  try {
    return await contract.methods.balanceOf(address).call();
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

// Get total global payout and last paid nonce
async function globalPayoutData() {
  try {
    return await nftPayoutInfo.findOne();
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

// Get total rewards for a single address
async function addressPayoutData(req) {
  //Owner address
  const address = req.query.address;
  const nftInfo = await nftPayouts.find({ "payouts.owner": address.toLowerCase() });
  try {
    let rewards = 0n;

    const payouts = [];

    for (let i = 0; i < nftInfo.length; i++) {
      for (let j = 0; j < nftInfo[i].payouts.length; j++) {
        if (nftInfo[i].payouts[j].owner == address.toLowerCase()) {
          payouts.push({ nonce: nftInfo[i].nonce, amount: nftInfo[i].payouts[j].amount, time: nftInfo[i].payouts[j].time, hash: nftInfo[i].payouts[j].hash });

          rewards += BigInt(nftInfo[i].payouts[j].amount);
        }
      }
    }
    rewards = rewards.toString();

    return { rewards, payouts };
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

module.exports = { globalPayoutData, addressPayoutData, nftBalance };

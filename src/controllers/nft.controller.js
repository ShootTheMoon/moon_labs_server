// Service Imports
const nft = require("../services/nft.service");

async function get_globalPayoutData(req, res, next) {
  try {
    res.json(await nft.globalPayoutData());
  } catch (err) {
    console.error(`Error with gas price controller: ${err.message}`);
    next(err);
  }
}

async function get_addressPayoutData(req, res, next) {
  try {
    res.json(await nft.addressPayoutData(req));
  } catch (err) {
    console.error(`Error with gas price controller: ${err.message}`);
    next(err);
  }
}

async function get_nftBalance(req, res, next) {
  try {
    res.json(await nft.nftBalance(req));
  } catch (err) {
    console.error(`Error with gas price controller: ${err.message}`);
    next(err);
  }
}

module.exports = { get_addressPayoutData, get_globalPayoutData, get_nftBalance };

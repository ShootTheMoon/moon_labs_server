// Utils Imports
const { web3 } = require("../utils/web3Helpers");
const { checkValidWallet } = require("../utils/walletHelpers");
const { price } = require("../utils/priceHelpers");
// Service Imports
const { getMetaDataLogo } = require("../services/helpers.service");

// GET
async function get_mlabPrice(req, res, next) {
  try {
    const mlab = price.mlab;
    res.json({ mlab });
  } catch (err) {
    console.error(`Error with mlab price controller: ${err.message}`);
    next(err);
  }
}

async function get_validWallet(req, res, next) {
  try {
    const valid = await checkValidWallet(req.query.address, web3.eth);
    if (typeof valid != "boolean") {
      throw new Error(valid);
    }
    res.json(valid);
  } catch (err) {
    console.error(`Error with valid wallet controller: ${err.message}`);
    next(err);
  }
}

async function get_tokenLogo(req, res, next) {
  try {
    res.json(await getMetaDataLogo(req));
  } catch (err) {
    console.error(`Error with token logo controller: ${err.message}`);
    next(err);
  }
}
module.exports = { get_mlabPrice, get_validWallet, get_tokenLogo };

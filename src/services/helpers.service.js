// Models Imports
const metaData = require("../models/metaData");
// Dict Imports
const { tokenLocks: tokenLockModel, vestingLocks: vestingLockModel, liquidityLocks: liquidityLockModel } = require("../utils/dicts/chainToModelDict");
const web3Dict = require("../utils/dicts/chainToWeb3Dict");

async function getMetaDataLogo(req) {
  try {
    const chain = req.query.chain;
    const address = req.query.address;
    if (chain && address) {
      const data = await metaData.findOne({ chain: chain, address: address.toLowerCase() });
      if (data) return { large: data.coinGeckoLogoLarge, small: data.coinGeckoLogoSmall };
      return { large: false, small: false };
    }
    return { err: "Invalid query parameters" };
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

async function get_lockCreation(req) {
  try {
    const chain = req.query.chain;

    const hash = req.query.hash;
    if (hash.length != 66) return { type: null, locks: [], err: "Invalid hash length" };

    const tokenLock = tokenLockModel[chain];
    if (!tokenLock) return { type: null, locks: [], err: "Invalid chain" };

    const validHash = await web3Dict[chain].eth.getTransaction(hash);

    if (!validHash) return { err: "Hash does not exist" };

    let data = await tokenLock.find({ "lockInfo.creation.hash": hash.toLowerCase() });
    if (data.length > 0) return { type: "token", locks: data };

    const liquidityLock = liquidityLockModel[chain];

    data = await liquidityLock.find({ "lockInfo.creation.hash": hash.toLowerCase() });
    if (data.length > 0) return { type: "liquidity", locks: data };

    const vestingLock = vestingLockModel[chain];

    data = await vestingLock.find({ "lockInfo.creation.hash": hash.toLowerCase() });
    if (data.length > 0) return { type: "vesting", locks: data };

    return { type: null, locks: [], err: "Pending" };
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

module.exports = { getMetaDataLogo, get_lockCreation };

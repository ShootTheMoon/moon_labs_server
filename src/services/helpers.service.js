// Models Imports
const metaData = require("../models/metaData");

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

module.exports = { getMetaDataLogo };

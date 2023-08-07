// Library Imports
const axios = require("axios");
// Model Imports
const metaData = require("../models/metaData");

const handleCoinGekoLogos = async (address, chain) => {
  try {
    const found = await metaData.exists({ chain: chain, address: address });
    if (!found) {
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${chain}/contract/${address}`);

        metaData.create({ chain: chain, address: address.toLowerCase(), coinGeckoLogoLarge: response.data?.image.large, coinGeckoLogoSmall: response.data?.image.small });
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { handleCoinGekoLogos };

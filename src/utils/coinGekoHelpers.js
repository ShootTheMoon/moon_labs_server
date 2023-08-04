// Library Imports
const axios = require("axios");

const createTokenLockSchema = require("../../schemas/moonLockToken/tokenLock");

const tokenLocksEth = createTokenLockSchema("tokenLocksEth");
const tokenLocksGoerli = createTokenLockSchema("tokenLocksGoerli");

const handleCoinGekoLogos = async (address, chain) => {
  let found = false;
  if (chain == 1) {
    found = await tokenLocksEth.exists({ "tokenInfo.address": address, "tokenInfo.logo": { $ne: null } });
    if (found) return (await tokenLocksEth.findOne({ "tokenInfo.address": address })).tokenInfo.logo;
  } else if (chain == 5) {
    found = await tokenLocksGoerli.exists({ "tokenInfo.address": address, "tokenInfo.logo": { $ne: null } });
    if (found) return (await tokenLocksGoerli.findOne({ "tokenInfo.address": address })).tokenInfo.logo;
  }

  if (!found) {
    try {
      return (await axios.get(`https://api.coingecko.com/api/v3/coins/${chain}/contract/${address}`)).data.image.large;
    } catch (err) {
      return null;
    }
  }
};

module.exports = handleCoinGekoLogos;

// Library Imports
const axios = require("axios");

// Global Variables
const { ANKR_API } = process.env;

const getEthPrice = async () => {
  // Get eth price from ankr
  try {
    const ethRes = await axios.post(`https://rpc.ankr.com/multichain/${ANKR_API}`, {
      jsonrpc: "2.0",
      method: "ankr_getTokenPrice",
      params: {
        blockchain: "eth",
        contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      },
      id: 1,
    });
    if (ethRes.data.result.usdPrice != undefined) {
      return ethRes.data.result.usdPrice;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getBnbPrice = async () => {
  // Get bnb price from ankr
  try {
    const bnbRes = await axios.post(`https://rpc.ankr.com/multichain/${ANKR_API}`, {
      jsonrpc: "2.0",
      method: "ankr_getTokenPrice",
      params: {
        blockchain: "bsc",
        contractAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      },
      id: 1,
    });

    if (bnbRes.data.result.usdPrice != undefined) {
      return bnbRes.data.result.usdPrice;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getAvaxPrice = async () => {
  // Get avalanche price from ankr
  try {
    const avalancheRes = await axios.post(`https://rpc.ankr.com/multichain/${ANKR_API}`, {
      jsonrpc: "2.0",
      method: "ankr_getTokenPrice",
      params: {
        blockchain: "avalanche",
        contractAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      },
      id: 1,
    });

    if (avalancheRes.data.result.usdPrice != undefined) {
      return avalancheRes.data.result.usdPrice;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = { getEthPrice, getBnbPrice, getAvaxPrice };

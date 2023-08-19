// Utils Imports
const { web3 } = require("../web3Helpers");

const web3Dict = {
  1: web3.eth,
  8008: web3.eth,
  42161: web3.arb,
  56: web3.bsc,
  43114: web3.avax,
  5: web3.gor,
  97: web3.bsct,
};

module.exports = web3Dict;

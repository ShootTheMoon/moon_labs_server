// Utils import
const { getEthPrice, getBnbPrice, getAvaxPrice } = require("./ankrHelpers");
const { getMlabPrice } = require("./erc20Helpers");
const { web3 } = require("./web3Helpers");

const price = {};

const gasPrice = {};

async function getChainPrice() {
  const _ethPrice = await getEthPrice();
  const _bnbPrice = await getBnbPrice();
  const _avaxPrice = await getAvaxPrice();
  const _mlabPrice = await getMlabPrice(_ethPrice);

  price.eth = _ethPrice ? _ethPrice : price.eth;
  price.bnb = _bnbPrice ? _bnbPrice : price.bnb;
  price.avax = _avaxPrice ? _avaxPrice : price.avax;
  price.mlab = _mlabPrice ? _mlabPrice : price.mlab;
}

async function getGasPrice() {
  // Get eth gas price
  web3.eth.eth.getGasPrice(function (e, r) {
    gasPrice.eth = (r / 10 ** 9).toFixed(0);
  });

  // Get arb gas price
  web3.arb.eth.getGasPrice(function (e, r) {
    gasPrice.arb = (r / 10 ** 9).toFixed(0);
  });

  // Get avalanche gas price
  web3.avax.eth.getGasPrice(function (e, r) {
    gasPrice.avax = (r / 10 ** 9).toFixed(0);
  });

  // Get bsc gas price
  web3.bsc.eth.getGasPrice(function (e, r) {
    gasPrice.bsc = (r / 10 ** 9).toFixed(0);
  });

  // Get sepolia gas price
  web3.gor.eth.getGasPrice(function (e, r) {
    gasPrice.gor = (r / 10 ** 9).toFixed(0);
  });

  // Get bsc testnet gas price
  web3.bsct.eth.getGasPrice(function (e, r) {
    gasPrice.bsct = (r / 10 ** 9).toFixed(0);
  });
}

async function startChainPrice() {
  getChainPrice();
  setInterval(async () => {
    getChainPrice();
  }, 20000);
}

async function startGasPrice() {
  getGasPrice();
  setInterval(() => {
    getGasPrice();
  }, 10000);
}

module.exports = { startGasPrice, startChainPrice, gasPrice, price };

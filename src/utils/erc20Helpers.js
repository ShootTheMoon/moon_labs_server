// Abi Imports
const uniswapV2RouterAbi = require("../abis/uniswapV2RouterAbi.json");
// Global Variables
const { MLAB_TOKEN_ADDRESS } = process.env;
// Utils Imports
const { web3 } = require("./web3Helpers");

const getMlabPrice = async (ethPrice) => {
  try {
    if (!ethPrice) return null;
    const routerContract = new web3.eth.eth.Contract(uniswapV2RouterAbi, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
    const result = await routerContract.methods.getAmountsOut(10 ** 9 + "", [MLAB_TOKEN_ADDRESS, await routerContract.methods.WETH().call()]).call();
    return (result[1] / 10 ** 18) * ethPrice;
  } catch (err) {
    console.log("Token Price", err);
    return null;
  }
};

module.exports = { getMlabPrice };

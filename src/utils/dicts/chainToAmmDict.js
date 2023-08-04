const uniswapV2FactoryAbi = require("../../abis/uniswapV2FactoryAbi.json");

const dexFactories = {
  5: [{ address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f".toLowerCase(), name: "UniswapV2", abi: uniswapV2FactoryAbi }],
  1: [
    { address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f".toLowerCase(), name: "UniswapV2", abi: uniswapV2FactoryAbi },
    { address: "0xEfF92A263d31888d860bD50809A8D171709b7b1c".toLowerCase(), name: "PancakeSwapV2", abi: uniswapV2FactoryAbi },
  ],
};

module.exports = { dexFactories };

const uniswapV2FactoryAbi = require("../../abis/uniswapV2FactoryAbi.json");

const dexFactoriesV2 = {
  1: [
    { address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f".toLowerCase(), name: "UniswapV2", abi: uniswapV2FactoryAbi },
    { address: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73".toLowerCase(), name: "PancakeSwapV2", abi: uniswapV2FactoryAbi },
    { address: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac".toLowerCase(), name: "SushiSwapV2", abi: uniswapV2FactoryAbi },
  ],
  56: [{ address: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73".toLowerCase(), name: "PancakeSwapV2", abi: uniswapV2FactoryAbi }],
  42161: [
    { address: "0x6EcCab422D763aC031210895C81787E87B43A652".toLowerCase(), name: "Camelot", abi: uniswapV2FactoryAbi },
    { address: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4".toLowerCase(), name: "SushiSwapV2", abi: uniswapV2FactoryAbi },
  ],
  5: [{ address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f".toLowerCase(), name: "UniswapV2", abi: uniswapV2FactoryAbi }],
};

module.exports = { dexFactoriesV2 };

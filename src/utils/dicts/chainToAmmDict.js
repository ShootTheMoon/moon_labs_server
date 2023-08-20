const uniswapV2FactoryAbi = require("../../abis/uniswapV2FactoryAbi.json");

const dexFactoriesV2 = {
  5: [{ address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f".toLowerCase(), name: "UniswapV2", abi: uniswapV2FactoryAbi }],
  1: [
    { address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f".toLowerCase(), name: "UniswapV2", abi: uniswapV2FactoryAbi },
    { address: "0xEfF92A263d31888d860bD50809A8D171709b7b1c".toLowerCase(), name: "PancakeSwapV2", abi: uniswapV2FactoryAbi },
    { address: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac".toLowerCase(), name: "SushiSwapV2", abi: uniswapV2FactoryAbi },
  ],
  42161: [
    { address: "0x6EcCab422D763aC031210895C81787E87B43A652".toLowerCase(), name: "Camelot", abi: uniswapV2FactoryAbi },
    { address: "0xFe8EC10Fe07A6a6f4A2584f8cD9FE232930eAF55".toLowerCase(), name: "SpartaDex", abi: uniswapV2FactoryAbi },
    { address: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4".toLowerCase(), name: "SushiSwapV2", abi: uniswapV2FactoryAbi },
  ],
};

module.exports = { dexFactoriesV2 };

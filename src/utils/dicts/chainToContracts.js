// Global Variables
const {
  MOON_LOCK_LIQUIDITY_ADDRESS_ETH,
  MOON_LOCK_LIQUIDITY_ADDRESS_ARBITRUM,
  MOON_LOCK_LIQUIDITY_ADDRESS_AVAX,
  MOON_LOCK_LIQUIDITY_ADDRESS_GOERLI,
  MOON_LOCK_LIQUIDITY_ADDRESS_BSC,
  MOON_LOCK_LIQUIDITY_ADDRESS_BSC_TESTNET,
  MOON_LOCK_TOKEN_ADDRESS_ETH,
  MOON_LOCK_TOKEN_ADDRESS_ARBITRUM,
  MOON_LOCK_TOKEN_ADDRESS_BSC,
  MOON_LOCK_TOKEN_ADDRESS_AVAX,
  MOON_LOCK_TOKEN_ADDRESS_GOERLI,
  MOON_LOCK_TOKEN_ADDRESS_BSC_TESTNET,
  MOON_VEST_ADDRESS_ETH,
  MOON_VEST_ADDRESS_ARBITRUM,
  MOON_VEST_ADDRESS_BSC,
  MOON_VEST_ADDRESS_AVAX,
  MOON_VEST_ADDRESS_GOERLI,
  MOON_VEST_ADDRESS_BSC_TESTNET,
} = process.env;
// Abi Imports
const moonLabsLiquidityLockerAbi = require("../../abis/moonLabsLiquidityLockerAbi.json");
const moonLabsTokenLockerAbi = require("../../abis/moonLabsTokenLockerAbi.json");
const moonLabsVestingLockerAbi = require("../../abis/moonLabsVestingLockerAbi.json");
// Utils Imports
const { web3 } = require("../web3Helpers");

const liquidityLocker = {
  1: new web3.eth.eth.Contract(moonLabsLiquidityLockerAbi, MOON_LOCK_LIQUIDITY_ADDRESS_ETH.toLowerCase()),
  42161: new web3.arb.eth.Contract(moonLabsLiquidityLockerAbi, MOON_LOCK_LIQUIDITY_ADDRESS_ARBITRUM.toLowerCase()),
  56: new web3.bsc.eth.Contract(moonLabsLiquidityLockerAbi, MOON_LOCK_LIQUIDITY_ADDRESS_BSC.toLowerCase()),
  43114: new web3.avax.eth.Contract(moonLabsLiquidityLockerAbi, MOON_LOCK_LIQUIDITY_ADDRESS_AVAX.toLowerCase()),
  5: new web3.gor.eth.Contract(moonLabsLiquidityLockerAbi, MOON_LOCK_LIQUIDITY_ADDRESS_GOERLI.toLowerCase()),
  97: new web3.bsct.eth.Contract(moonLabsLiquidityLockerAbi, MOON_LOCK_LIQUIDITY_ADDRESS_BSC_TESTNET.toLowerCase()),
};

const tokenLocker = {
  1: new web3.eth.eth.Contract(moonLabsTokenLockerAbi, MOON_LOCK_TOKEN_ADDRESS_ETH.toLowerCase()),
  42161: new web3.arb.eth.Contract(moonLabsTokenLockerAbi, MOON_LOCK_TOKEN_ADDRESS_ARBITRUM.toLowerCase()),
  56: new web3.bsc.eth.Contract(moonLabsTokenLockerAbi, MOON_LOCK_TOKEN_ADDRESS_BSC.toLowerCase()),
  43114: new web3.avax.eth.Contract(moonLabsTokenLockerAbi, MOON_LOCK_TOKEN_ADDRESS_AVAX.toLowerCase()),
  5: new web3.gor.eth.Contract(moonLabsTokenLockerAbi, MOON_LOCK_TOKEN_ADDRESS_GOERLI.toLowerCase()),
  97: new web3.bsct.eth.Contract(moonLabsTokenLockerAbi, MOON_LOCK_TOKEN_ADDRESS_BSC_TESTNET.toLowerCase()),
};

const vestingLocker = {
  1: new web3.eth.eth.Contract(moonLabsVestingLockerAbi, MOON_VEST_ADDRESS_ETH.toLowerCase()),
  42161: new web3.arb.eth.Contract(moonLabsVestingLockerAbi, MOON_VEST_ADDRESS_ARBITRUM.toLowerCase()),
  56: new web3.bsc.eth.Contract(moonLabsVestingLockerAbi, MOON_VEST_ADDRESS_BSC.toLowerCase()),
  43114: new web3.avax.eth.Contract(moonLabsVestingLockerAbi, MOON_VEST_ADDRESS_AVAX.toLowerCase()),
  5: new web3.gor.eth.Contract(moonLabsVestingLockerAbi, MOON_VEST_ADDRESS_GOERLI.toLowerCase()),
  97: new web3.bsct.eth.Contract(moonLabsVestingLockerAbi, MOON_VEST_ADDRESS_BSC_TESTNET.toLowerCase()),
};

module.exports = { liquidityLocker, tokenLocker, vestingLocker };

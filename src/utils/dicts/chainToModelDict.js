const createTokenLockSchema = require("../../models/tokenLocks/tokenLock");
const createVestingLockSchema = require("../../models/vestingLocks/vestingLock");
const createLiquidityLockSchema = require("../../models/liquidityLocks/liquidityLock");

const tokenLocks = {
  1: createTokenLockSchema("tokenLocksEth"),
  42161: createTokenLockSchema("tokenLocksArbitrum"),
  56: createTokenLockSchema("tokenLocksBsc"),
  43114: createTokenLockSchema("tokenLocksAvalanche"),
  5: createTokenLockSchema("tokenLocksGoerli"),
  97: createTokenLockSchema("tokenLocksBscTestnet"),
};

const vestingLocks = {
  1: createVestingLockSchema("vestingLocksEth"),
  42161: createVestingLockSchema("vestingLocksArbitrum"),
  56: createVestingLockSchema("vestingLocksBsc"),
  43114: createVestingLockSchema("vestingLocksAvalanche"),
  5: createVestingLockSchema("vestingLocksGoerli"),
  97: createVestingLockSchema("vestingLocksBscTestnet"),
};

const liquidityLocks = {
  1: createLiquidityLockSchema("liquidityLocksEth"),
  8008: createLiquidityLockSchema("liquidityLocksEthOld"),
  42161: createLiquidityLockSchema("liquidityLocksArbitrum"),
  56: createLiquidityLockSchema("liquidityLocksBsc"),
  43114: createLiquidityLockSchema("liquidityLocksAvalanche"),
  5: createLiquidityLockSchema("liquidityLocksGoerli"),
  97: createLiquidityLockSchema("liquidityLocksBscTestnet"),
};

module.exports = { tokenLocks, vestingLocks, liquidityLocks };

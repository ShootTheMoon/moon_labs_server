// Dict imports
const { liquidityLocks: liquidityModels } = require("../utils/dicts/chainToModelDict.js");
const { liquidityLocker: liquidityContracts } = require("../utils/dicts/chainToContracts.js");
const web3Dict = require("../utils/dicts/chainToWeb3Dict.js");
// Abi Imports
const uniswapV2PairAbi = require("../abis/uniswapV2PairAbi.json");

async function getLock(req) {
  try {
    // Desired nonce
    let nonce = req.query.nonce;
    // Desired chain
    let chain = req.query.chain;

    // Get token lock from mongodb
    const liquidityLock = await liquidityModels[chain].findOne({ nonce: nonce });
    // Get liquidity locker contract
    const liquidityLockerContract = liquidityContracts[chain];
    // Get web3 instance
    const web3 = web3Dict[chain];

    if (liquidityLock && liquidityLockerContract && web3) {
      // Create pair contract from token address
      const pairContract = new web3.eth.Contract(uniswapV2PairAbi, liquidityLock.tokenInfo.address);

      // Get all locks with pair address
      const relatedLocks = await liquidityModels[chain].find({ "tokenInfo.address": liquidityLock.tokenInfo.address }, { nonce: 1, "lockInfo.currentAmount": 1 });

      // We need total supply and unlocked to calculate total locked tokens
      const totalSupply = await pairContract.methods.totalSupply().call();
      const unlockedTokens = await liquidityLockerContract.methods.getClaimableTokens(nonce).call();

      let totalLocked = 0n;

      for (let lock of relatedLocks) {
        totalLocked += BigInt((await liquidityLockerContract.methods.getLock(lock.nonce).call())[2]) - BigInt(await liquidityLockerContract.methods.getClaimableTokens(lock.nonce).call());
      }
      // BigInt cannot be returned so must convert to string
      totalLocked = totalLocked.toString();

      return { liquidityLock, unlockedTokens, totalSupply, totalLocked };
    }

    return { err: "Invalid query parameters" };
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

async function getLockHeaders(req) {
  try {
    // Desired chain
    let chain = req.query.chain;
    // Number of records to skip
    let from = req.query.from;
    // Number of records returned
    let limit = req.query.limit;
    // Number of records returned
    let deleted = req.query.deleted;
    // Owner of the lock
    const owner = req.query.owner;
    // Token address of the lock
    const address = req.query.address;

    // Limit the number of queries to 20 documents and no less than 1
    if (limit > 20) limit = 20;
    if (limit < 1) limit = 1;

    if (liquidityModels[chain] && deleted != undefined) {
      const liquidityLocks = await liquidityModels[chain]
        .find(
          { "lockInfo.currentAmount": { $ne: deleted.toLowerCase() == "true" ? "-1" : "0" }, "lockInfo.owner": owner ? { $eq: owner.toLowerCase() } : { $ne: "-1" }, "tokenInfo.address": address ? { $eq: address.toLowerCase() } : { $ne: "-1" } },
          { nonce: 1, chain: 1, dex: 1, token0: 1, token1: 1, tokenInfo: 1, lockInfo: { owner: 1, withdrawalAddress: 1, currentAmount: 1, startDate: 1, endDate: 1, creation: 1 } }
        )
        .sort({ nonce: -1 })
        .skip(from)
        .limit(limit);
      return { liquidityLocks };
    } else {
      return { err: "Invalid query parameters" };
    }
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

async function getLockCount(req) {
  try {
    // Desired chain
    const chain = req.query.chain;
    // Owner of the lock
    const owner = req.query.owner;
    // Token address of the lock
    const address = req.query.address;

    if (liquidityModels[chain]) {
      // Get number of active locks
      const numOfActiveLocks = await liquidityModels[chain].collection.countDocuments({
        "lockInfo.owner": owner ? { $eq: owner.toLowerCase() } : { $ne: "-1" },
        "tokenInfo.address": address ? { $eq: address.toLowerCase() } : { $ne: "-1" },
        "lockInfo.currentAmount": { $gt: "0" },
      });

      // Get number of deleted locks
      const numOfDeletedLocks = await liquidityModels[chain].collection.countDocuments({
        "lockInfo.owner": owner ? { $eq: owner.toLowerCase() } : { $ne: "-1" },
        "tokenInfo.address": address ? { $eq: address.toLowerCase() } : { $ne: "-1" },
        "lockInfo.currentAmount": { $lte: "0" },
      });
      return { numOfActiveLocks, numOfDeletedLocks };
    } else {
      return { err: "Invalid query parameters" };
    }
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

module.exports = { getLock, getLockHeaders, getLockCount };

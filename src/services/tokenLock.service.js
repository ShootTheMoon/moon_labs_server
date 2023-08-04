// Dict imports
const { tokenLocks: tokenModels } = require("../utils/dicts/chainToModelDict.js");
const { tokenLocker: tokenContracts } = require("../utils/dicts/chainToContracts.js");

async function getLock(req) {
  try {
    // Desired nonce
    let nonce = req.query.nonce;
    // Desired chain
    let chain = req.query.chain;
    // Get token locker contract
    const tokenLockerContract = tokenContracts[chain];

    if (tokenModels[chain]) {
      // Get updated number of unlocked tokens
      const unlockedTokens = await tokenLockerContract.methods.getClaimableTokens(nonce).call();

      // Get lock instance from mongodb
      const tokenLock = await tokenModels[chain].findOne({ nonce: nonce });

      return { tokenLock, unlockedTokens };
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
    // Lock withdrawer
    const withdrawer = req.query.withdrawer;
    // Owner of the lock
    const owner = req.query.owner;
    // Token address of the lock
    const address = req.query.address;

    // Limit the number of queries to 20 documents and no less than 1
    if (limit > 20) limit = 20;
    if (limit < 1) limit = 1;

    if (tokenModels[chain]) {
      const tokenLocks = await tokenModels[chain]
        .find(
          {
            "lockInfo.currentAmount": { $ne: deleted.toLowerCase() == "true" ? "-1" : "0" },
            "lockInfo.withdrawalAddress": withdrawer ? { $eq: withdrawer.toLowerCase() } : { $ne: "-1" },
            "lockInfo.owner": owner ? { $eq: owner.toLowerCase() } : { $ne: "-1" },
            "tokenInfo.address": address ? { $eq: address.toLowerCase() } : { $ne: "-1" },
          },
          { nonce: 1, chain: 1, tokenInfo: 1, lockInfo: { owner: 1, withdrawalAddress: 1, currentAmount: 1, startDate: 1, endDate: 1, creation: 1 } }
        )
        .sort({ nonce: -1 })
        .skip(from)
        .limit(limit);
      return { tokenLocks };
    } else {
      return { err: "Data not found :(" };
    }
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}

async function getLockCount(req) {
  try {
    // Desired chain
    let chain = req.query.chain;
    // Lock withdrawer
    const withdrawer = req.query.withdrawer;
    // Owner of the lock
    const owner = req.query.owner;
    // Token address of the lock
    const tokenAddress = req.query.tokenAddress;
    if (tokenModels[chain]) {
      // Get number of active locks
      const numOfActiveLocks = await tokenModels[chain].collection.countDocuments({
        "lockInfo.owner": owner ? { $eq: owner.toLowerCase() } : { $ne: "-1" },
        "lockInfo.withdrawalAddress": withdrawer ? { $eq: withdrawer.toLowerCase() } : { $ne: "-1" },
        "tokenInfo.address": tokenAddress ? { $eq: tokenAddress.toLowerCase() } : { $ne: "-1" },
        "lockInfo.currentAmount": { $gt: "0" },
      });

      // Get number of deleted locks
      const numOfDeletedLocks = await tokenModels[chain].collection.countDocuments({
        "lockInfo.owner": owner ? { $eq: owner.toLowerCase() } : { $ne: "-1" },
        "lockInfo.withdrawalAddress": withdrawer ? { $eq: withdrawer.toLowerCase() } : { $ne: "-1" },
        "tokenInfo.address": tokenAddress ? { $eq: tokenAddress.toLowerCase() } : { $ne: "-1" },
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

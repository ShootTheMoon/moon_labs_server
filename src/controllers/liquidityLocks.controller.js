// Service Imports
const liquidityLocks = require("../services/liquidityLock.service");

// GET
async function get_liquidityLock(req, res, next) {
  try {
    res.json(await liquidityLocks.getLock(req));
  } catch (err) {
    console.error(`Error with liquidity lock controller: ${err.message}`);
    next(err);
  }
}

async function get_liquidityLockHeaders(req, res, next) {
  try {
    res.json(await liquidityLocks.getLockHeaders(req));
  } catch (err) {
    console.error(`Error with liquidity lock headers controller: ${err.message}`);
    next(err);
  }
}

async function get_liquidityLockCount(req, res, next) {
  try {
    res.json(await liquidityLocks.getLockCount(req));
  } catch (err) {
    console.error(`Error with liquidity lock count controller: ${err.message}`);
    next(err);
  }
}

module.exports = { get_liquidityLock, get_liquidityLockHeaders, get_liquidityLockCount };

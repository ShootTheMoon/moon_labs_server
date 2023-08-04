// Service Imports
const vestingLocks = require("../services/vestingLock.service");

// GET
async function get_vestingLock(req, res, next) {
  try {
    res.json(await vestingLocks.getLock(req));
  } catch (err) {
    console.error(`Error with vesting lock controller: ${err.message}`);
    next(err);
  }
}

async function get_vestingLockHeaders(req, res, next) {
  try {
    res.json(await vestingLocks.getLockHeaders(req));
  } catch (err) {
    console.error(`Error with vesting lock headers controller: ${err.message}`);
    next(err);
  }
}

async function get_vestingLockCount(req, res, next) {
  try {
    res.json(await vestingLocks.getLockCount(req));
  } catch (err) {
    console.error(`Error with vesting lock count controller: ${err.message}`);
    next(err);
  }
}

module.exports = { get_vestingLock, get_vestingLockHeaders, get_vestingLockCount };

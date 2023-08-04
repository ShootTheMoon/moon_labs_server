// Service Imports
const tokenLocks = require("../services/tokenLock.service");

// GET
async function get_tokenLock(req, res, next) {
  try {
    res.json(await tokenLocks.getLock(req));
  } catch (err) {
    console.error(`Error with token lock controller: ${err.message}`);
    next(err);
  }
}

async function get_tokenLockHeaders(req, res, next) {
  try {
    res.json(await tokenLocks.getLockHeaders(req));
  } catch (err) {
    console.error(`Error with token lock headers controller: ${err.message}`);
    next(err);
  }
}

async function get_tokenLockCount(req, res, next) {
  try {
    res.json(await tokenLocks.getLockCount(req));
  } catch (err) {
    console.error(`Error with token lock count controller: ${err.message}`);
    next(err);
  }
}

module.exports = { get_tokenLock, get_tokenLockHeaders, get_tokenLockCount };

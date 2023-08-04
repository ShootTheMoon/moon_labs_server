// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_vestingLock, get_vestingLockHeaders, get_vestingLockCount } = require("../controllers/vestingLocks.controller");

// GET
router.get("/vesting-lock", get_vestingLock);

router.get("/vesting-lock-headers", get_vestingLockHeaders);

router.get("/vesting-lock-count", get_vestingLockCount);

module.exports = router;

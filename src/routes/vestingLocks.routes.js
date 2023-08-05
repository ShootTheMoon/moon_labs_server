// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_vestingLock, get_vestingLockHeaders, get_vestingLockCount } = require("../controllers/vestingLocks.controller");

// GET
router.get("/lock", get_vestingLock);

router.get("/lock-headers", get_vestingLockHeaders);

router.get("/lock-count", get_vestingLockCount);

module.exports = router;

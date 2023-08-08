// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_liquidityLock, get_liquidityLockHeaders, get_liquidityLockCount, get_lockedPairData } = require("../controllers/liquidityLocks.controller");

// GET
router.get("/lock", get_liquidityLock);

router.get("/lock-headers", get_liquidityLockHeaders);

router.get("/lock-count", get_liquidityLockCount);

router.get("/locked-pair-data", get_lockedPairData);

module.exports = router;

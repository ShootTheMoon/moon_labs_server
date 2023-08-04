// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_liquidityLock, get_liquidityLockHeaders, get_liquidityLockCount } = require("../controllers/liquidityLocks.controller");

// GET
router.get("/liquidity-lock", get_liquidityLock);

router.get("/liquidity-lock-headers", get_liquidityLockHeaders);

router.get("/liquidity-lock-count", get_liquidityLockCount);


module.exports = router;

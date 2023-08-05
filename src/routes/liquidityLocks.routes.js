// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_liquidityLock, get_liquidityLockHeaders, get_liquidityLockCount } = require("../controllers/liquidityLocks.controller");

// GET
router.get("/lock", get_liquidityLock);

router.get("/lock-headers", get_liquidityLockHeaders);

router.get("/lock-count", get_liquidityLockCount);


module.exports = router;

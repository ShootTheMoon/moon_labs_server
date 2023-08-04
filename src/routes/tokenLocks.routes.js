// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_tokenLock, get_tokenLockHeaders, get_tokenLockCount } = require("../controllers/tokenLocks.controller");

// GET
router.get("/token-lock", get_tokenLock);

router.get("/token-lock-headers", get_tokenLockHeaders);

router.get("/token-lock-count", get_tokenLockCount);

module.exports = router;

// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_whitelistStatus } = require("../controllers/whitelist.controller");

// GET
router.get("/status", get_whitelistStatus);

module.exports = router;

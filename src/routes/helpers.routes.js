// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_mlabPrice, get_validWallet } = require("../controllers/helpers.controller");

// GET
router.get("/mlab-price", get_mlabPrice);
router.get("/valid-wallet", get_validWallet);

module.exports = router;

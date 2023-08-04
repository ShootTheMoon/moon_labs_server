// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_gasPrice, get_chainPrice } = require("../controllers/chain.controller");

// GET
router.get("/chain-price", get_chainPrice);
router.get("/gas-price", get_gasPrice);

module.exports = router;

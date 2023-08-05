// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_addressPayoutData, get_globalPayoutData, get_nftBalance } = require("../controllers/nft.controller");

// GET
router.get("/global-data", get_globalPayoutData);

router.get("/address-data", get_addressPayoutData);

router.get("/balance", get_nftBalance);

module.exports = router;

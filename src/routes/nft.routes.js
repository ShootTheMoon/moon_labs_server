// Library Imports
const express = require("express");
const router = express.Router();
// Controller Imports
const { get_addressPayoutData, get_globalPayoutData, get_nftBalance } = require("../controllers/nft.controller");

// GET
router.get("/nft-global-data", get_globalPayoutData);

router.get("/nft-address-data", get_addressPayoutData);

router.get("/nft-balance", get_nftBalance);

module.exports = router;

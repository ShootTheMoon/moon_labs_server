// Service Imports
const whitelist = require("../services/whitelist.service");
// GET
async function get_whitelistStatus(req, res, next) {
  try {
    res.json(await whitelist.getWhitelistStatus(req));
  } catch (err) {
    console.error(`Error with whitelist status controller: ${err.message}`);
    next(err);
  }
}

module.exports = { get_whitelistStatus };

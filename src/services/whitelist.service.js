// Dict Imports
const { whitelist: whitelistContracts } = require("../utils/dicts/chainToContractsDict");

async function getWhitelistStatus(req) {
  // Targeted chain
  const chain = req.query.chain;
  // Targeted address
  const address = req.query.address;
  try {
    const whitelistContract = whitelistContracts[chain];

    const whitelisted = await whitelistContract.methods.getIsWhitelisted(address, false).call();

    return whitelisted;
  } catch (err) {
    console.log(err);
    return { err: "Err :(" };
  }
}
module.exports = { getWhitelistStatus };

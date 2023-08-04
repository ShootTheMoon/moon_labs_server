const { price, gasPrice } = require("../utils/priceHelpers");

async function get_gasPrice(req, res, next) {
  try {
    res.json([
      { chain: 1, price: gasPrice.eth },
      { chain: 42161, price: gasPrice.arb },
      { chain: 43114, price: gasPrice.avax },
      { chain: 56, price: gasPrice.bsc },
      { chain: 5, price: gasPrice.gor },
      { chain: 97, price: gasPrice.bsct },
    ]);
  } catch (err) {
    console.error(`Error with gas price controller: ${err.message}`);
    next(err);
  }
}

async function get_chainPrice(req, res, next) {
  try {
    res.json([
      { chain: 1, price: price.eth },
      { chain: 42161, price: price.eth },
      { chain: 43114, price: price.avax },
      { chain: 56, price: price.bnb },
      { chain: 5, price: price.eth },
      { chain: 97, price: price.bnb },
    ]);
  } catch (err) {
    console.error(`Error with chain price controller: ${err.message}`);
    next(err);
  }
}

module.exports = { get_gasPrice, get_chainPrice };

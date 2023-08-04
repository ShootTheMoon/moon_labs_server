const checkValidWallet = async (walletAddress, web3) => {
  try {
    return web3.utils.isAddress(walletAddress);
  } catch (err) {
    return err;
  }
};

module.exports = { checkValidWallet };

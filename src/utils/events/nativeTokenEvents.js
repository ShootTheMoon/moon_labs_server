const erc20abi = require("../../abis/erc20abi.json");
const nftPayouts = require("../../models/nativeToken/nftPayouts");
const nftPayoutsInfo = require("../../models/nativeToken/nftPayoutsInfo");

const { MLAB_TOKEN_ADDRESS } = process.env;

const { web3 } = require("../web3Helpers");

const nftPayout = async () => {
  const contract = new web3.eth.eth.Contract(erc20abi, MLAB_TOKEN_ADDRESS.toLowerCase());

  if (!(await nftPayoutsInfo.exists())) {
    nftPayoutsInfo.create({
      totalPayout: "0",
      lastScannedBlock: await web3.eth.eth.getBlockNumber(),
      lastNonce: 0,
    });
  }

  web3.eth.eth.subscribe("newBlockHeaders", async (err, event) => {
    if (event) {
      const payoutInfo = await nftPayoutsInfo.findOne();

      const fromBlock = event.number - payoutInfo.lastScannedBlock > 10000 ? payoutInfo.lastScannedBlock + 10000 : payoutInfo.lastScannedBlock;
      const toBlock = fromBlock == payoutInfo.lastScannedBlock ? false : payoutInfo.lastScannedBlock;

      console.log(`Scanning Block: ${fromBlock} - Token Events`);
      getEvent(fromBlock, toBlock);

      payoutInfo.lastScannedBlock = fromBlock == payoutInfo.lastScannedBlock ? event.number : fromBlock;
      payoutInfo.save();
    }
    if (err) {
      console.log(err);
    }
  });

  const getEvent = async (fromBlock, toBlock) => {
    contract.getPastEvents("DistributeNftPayout", { fromBlock: fromBlock, toBlock: toBlock ? toBlock : "latest" }).then((events) => {
      for (let event of events) {
        handleNftPayouts(event);
      }
    });
  };

  const handleNftPayouts = async (event) => {
    const payoutInfo = await nftPayoutsInfo.findOne();

    const hash = event.transactionHash;
    const blockNumber = event.blockNumber;
    const { timestamp } = await web3.eth.eth.getBlock(blockNumber);

    let lastNonce = 0;
    let totalPayout = 0n;

    for (let i = 0; i < event.returnValues.index.length; i++) {
      const nonce = event.returnValues.index[i];

      if (nonce == 0) continue;

      lastNonce = lastNonce < nonce ? nonce : lastNonce;
      lastNonce = lastNonce <= 500 ? lastNonce : 1;

      const owner = event.returnValues.to[i];
      const payout = BigInt(event.returnValues.payout);

      let nft = await nftPayouts.findOne({ nonce: nonce });
      const found = await nftPayouts.exists({ "payouts.hash": hash });

      if (!nft) {
        nftPayouts.create({
          nonce: nonce,
          payouts: [{ owner: owner.toLowerCase(), amount: payout, time: timestamp, hash: hash }],
        });
        totalPayout += payout;
      } else if (nft && !found) {
        nft.payouts.push({ owner: owner.toLowerCase(), amount: payout, time: timestamp, hash: hash });
        nft.save();
        totalPayout += payout;
      }
    }
    if (totalPayout > 0n) payoutInfo.totalPayout = String(totalPayout + BigInt(payoutInfo.totalPayout));

    if (lastNonce > 0) payoutInfo.lastNonce = lastNonce;

    payoutInfo.save();
  };
};

module.exports = nftPayout;

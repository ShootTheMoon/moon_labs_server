const erc20abi = require("../../abis/erc20abi.json");
const nftPayouts = require("../../models/nativeToken/nftPayouts");
const nftPayoutsInfo = require("../../models/nativeToken/nftPayoutsInfo");

const { MLAB_TOKEN_ADDRESS } = process.env;

const { web3 } = require("../web3Helpers");

let totalPayout = 0n;

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

      totalPayout = BigInt(payoutInfo.totalPayout);

      const fromBlock = payoutInfo.lastScannedBlock;
      const toBlock = event.number - payoutInfo.lastScannedBlock > 5000 ? payoutInfo.lastScannedBlock + 5000 : false;

      console.log(`Scanning Block: ${fromBlock} - Token Events`);
      getEvent(fromBlock, toBlock);

      payoutInfo.lastScannedBlock = toBlock == false ? event.number : toBlock;
      payoutInfo.save();
    }
    if (err) {
      console.log(err);
    }
  });

  const getEvent = async (fromBlock, toBlock) => {
    contract
      .getPastEvents("DistributeNftPayout", {
        fromBlock: fromBlock,
        toBlock: toBlock ? toBlock : "latest",
      })
      .then(async (events) => {
        for (let event of events) {
          await handleNftPayouts(event);
        }
      });
  };

  const handleNftPayouts = async (event) => {
    const payoutInfo = await nftPayoutsInfo.findOne();

    const hash = event.transactionHash;
    const blockNumber = event.blockNumber;
    const { timestamp } = await web3.eth.eth.getBlock(blockNumber);
    // Amount for each nft payout
    const payout = BigInt(event.returnValues.payout);
    let lastNonce = 0;
    for (let i = 0; i < event.returnValues.index.length; i++) {
      await handleNftIndex(i, event, hash, timestamp, payout, lastNonce, payoutInfo);
    }
  };
};

async function handleNftIndex(i, event, hash, timestamp, payout, lastNonce, payoutInfo) {
  const nonce = event.returnValues.index[i];

  if (nonce == 0) return;

  lastNonce = lastNonce > nonce ? lastNonce : nonce;

  const owner = event.returnValues.to[i];

  let nft = await nftPayouts.findOne({ nonce: nonce });
  const found = await nftPayouts.exists({ "payouts.hash": hash });

  if (!nft) {
    nftPayouts.create({
      nonce: nonce,
      payouts: [{ owner: owner.toLowerCase(), amount: payout, time: timestamp, hash: hash }],
    });

    totalPayout += payout;
    payoutInfo.totalPayout = String(totalPayout);
    payoutInfo.lastNonce = lastNonce;
    payoutInfo.save();
  } else if (nft && !found) {
    nft.payouts.push({ owner: owner.toLowerCase(), amount: payout, time: timestamp, hash: hash });
    nft.save();

    totalPayout += payout;
    payoutInfo.totalPayout = String(totalPayout);
    payoutInfo.lastNonce = lastNonce;
    payoutInfo.save();
  }
}
module.exports = nftPayout;

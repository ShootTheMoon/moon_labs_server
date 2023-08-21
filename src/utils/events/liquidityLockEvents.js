// Mongoose Schemas
const liquidityLocksInfo = require("../../models/liquidityLocks/liquidityLocksInfo");

// Utils Imports
const { setListeners, getEvents } = require("../eventHelpers");
const {
  handleLiquidityLockCreation,
  handleLiquidityLockCreationRevert,
  handleLiquidityLockWithdrawal,
  handleLiquidityLockWithdrawalRevert,
  handleLiquidityLockTransfer,
  handleLiquidityLockTransferRevert,
  handleLiquidityLockRelock,
  handleLiquidityLockRelockRevert,
  handleLiquidityLockSplit,
  handleLiquidityLockSplitRevert,
  handleTokensBurn,
  handleTokensBurnRevert,
} = require("../liquidityLockEventHandlers");

// Dict Imports
const { liquidityLocks: liquidityModels } = require("../dicts/chainToModelDict");
const { liquidityLocker: liquidityContracts } = require("../dicts/chainToContractsDict");
const web3Dict = require("../dicts/chainToWeb3Dict");

const eventList = [
  {
    name: "LockCreated",
    creator: handleLiquidityLockCreation,
    reverter: handleLiquidityLockCreationRevert,
  },
  {
    name: "TokensWithdrawn",
    creator: handleLiquidityLockWithdrawal,
    reverter: handleLiquidityLockWithdrawalRevert,
  },
  {
    name: "LockTransferred",
    creator: handleLiquidityLockTransfer,
    reverter: handleLiquidityLockTransferRevert,
  },
  {
    name: "LockRelocked",
    creator: handleLiquidityLockRelock,
    reverter: handleLiquidityLockRelockRevert,
  },
  {
    name: "LockSplit",
    creator: handleLiquidityLockSplit,
    reverter: handleLiquidityLockSplitRevert,
  },
  {
    name: "TokensBurned",
    creator: handleTokensBurn,
    reverter: handleTokensBurnRevert,
  },
];

const liquidityLockEvents = async () => {
  startEvents(1);
  startEvents(42161);
  startEvents(5);
};

const startEvents = async (chain) => {
  const contract = liquidityContracts[chain];
  const web3 = web3Dict[chain];

  if (!(await liquidityLocksInfo.exists({ chain: chain }))) {
    await liquidityLocksInfo.create({
      chain: chain,
      lastScannedBlock: await web3.eth.getBlockNumber(),
    });
  }

  const schema = liquidityModels[chain];

  if (chain != 42161) handleVerificationCheck(web3, chain, contract, schema);
  setListeners(eventList, web3, chain, contract, schema);

  if (chain == 1) {
    const schema = liquidityModels[8008];
    setListeners(eventList, web3, 8008, contract, schema);
  }
};

async function handleVerificationCheck(web3, chain, contract, schema) {
  const blockBuffer = 12;
  web3.eth.subscribe("newBlockHeaders", async (err, event) => {
    if (event) {
      const info = await liquidityLocksInfo.findOne({ chain: chain });

      // We only want to scan blocks that have had 12 blocks of confirmation every 12 blocks
      if (event.number - blockBuffer * 2 > info.lastScannedBlock) {
        const fromBlock = info.lastScannedBlock;
        const toBlock = event.number - info.lastScannedBlock > 5000 ? fromBlock + 5000 : event.number - blockBuffer;

        console.log(`Scanning Block: ${fromBlock} to ${toBlock} - Liquidity Locker (${chain})`);
        getEvents(eventList, fromBlock, toBlock, web3, chain, contract, schema);

        info.lastScannedBlock = toBlock;
        info.save();
      }
    }
    if (err) {
      console.log(err);
    }
  });
}

module.exports = liquidityLockEvents;

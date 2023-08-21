// Mongoose Schemas
const vestingLocksInfo = require("../../models/vestingLocks/vestingLocksInfo");

// Utils Helpers
const { setListeners, getEvents } = require("../eventHelpers");
const { handleVestingLockCreation, handleTokenLockCreationRevert, handleVestingLockWithdrawal, handleVestingLockWithdrawalRevert, handleVestingLockTransfer, handleVestingLockTransferRevert, handleTokensBurn, handleTokensBurnRevert } = require("../vestingLockEventHandlers");

// Dict Imports
const { vestingLocks: vestingModels } = require("../dicts/chainToModelDict");
const { vestingLocker: vestingContracts } = require("../dicts/chainToContractsDict");
const web3Dict = require("../dicts/chainToWeb3Dict");

const eventList = [
  {
    name: "LockCreated",
    creator: handleVestingLockCreation,
    reverter: handleTokenLockCreationRevert,
  },
  {
    name: "TokensWithdrawn",
    creator: handleVestingLockWithdrawal,
    reverter: handleVestingLockWithdrawalRevert,
  },
  {
    name: "LockTransferred",
    creator: handleVestingLockTransfer,
    reverter: handleVestingLockTransferRevert,
  },
  {
    name: "TokensBurned",
    creator: handleTokensBurn,
    reverter: handleTokensBurnRevert,
  },
];

const vestingLockEvents = () => {
  startEvents(1);
  startEvents(42161);
  startEvents(5);
};

const startEvents = async (chain) => {
  const contract = vestingContracts[chain];
  const web3 = web3Dict[chain];

  if (!(await vestingLocksInfo.exists({ chain: chain }))) {
    await vestingLocksInfo.create({
      chain: chain,
      lastScannedBlock: await web3.eth.getBlockNumber(),
    });
  }

  const schema = vestingModels[chain];

  if (chain != 42161) handleVerificationCheck(web3, chain, contract, schema);
  setListeners(eventList, web3, chain, contract, schema);
};

async function handleVerificationCheck(web3, chain, contract, schema) {
  const blockBuffer = 12;
  web3.eth.subscribe("newBlockHeaders", async (err, event) => {
    if (event) {
      const info = await vestingLocksInfo.findOne({ chain: chain });

      // We only want to scan blocks that have had 12 blocks of confirmation every 12 blocks
      if (event.number - blockBuffer * 2 > info.lastScannedBlock) {
        const fromBlock = info.lastScannedBlock;
        const toBlock = event.number - info.lastScannedBlock > 5000 ? fromBlock + 5000 : event.number - blockBuffer;

        console.log(`Scanning Block: ${fromBlock} to ${toBlock} - Vesting Locker (${chain})`);
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

module.exports = vestingLockEvents;

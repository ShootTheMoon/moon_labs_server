// Mongoose Schemas
const tokenLocksInfo = require("../../models/tokenLocks/tokenLocksInfo");

// Utils Imports
const { setListeners, getEvents } = require("../eventHelpers");

const {
  handleTokenLockCreation,
  handleTokenLockCreationRevert,
  handleTokenLockRelock,
  handleTokenLockRelockRevert,
  handleTokenLockSplit,
  handleTokenLockSplitRevert,
  handleTokenLockTransfer,
  handleTokenLockTransferRevert,
  handleTokenLockWithdrawTransfer,
  handleTokenLockWithdrawTransferRevert,
  handleTokenLockWithdrawal,
  handleTokenLockWithdrawalRevert,
  handleTokensBurn,
  handleTokensBurnRevert,
} = require("../tokenLockEventHandlers");

// Dict Imports
const { tokenLocks: tokenModels } = require("../dicts/chainToModelDict");
const { tokenLocker: tokenContracts } = require("../dicts/chainToContractsDict");
const web3Dict = require("../dicts/chainToWeb3Dict");
const blockConf = require("../dicts/chainToBlockConf");

const eventList = [
  {
    name: "LockCreated",
    creator: handleTokenLockCreation,
    reverter: handleTokenLockCreationRevert,
  },
  {
    name: "TokensWithdrawn",
    creator: handleTokenLockWithdrawal,
    reverter: handleTokenLockWithdrawalRevert,
  },
  {
    name: "LockTransferred",
    creator: handleTokenLockTransfer,
    reverter: handleTokenLockTransferRevert,
  },
  {
    name: "WithdrawalTransferred",
    creator: handleTokenLockWithdrawTransfer,
    reverter: handleTokenLockWithdrawTransferRevert,
  },
  {
    name: "LockRelocked",
    creator: handleTokenLockRelock,
    reverter: handleTokenLockRelockRevert,
  },
  {
    name: "LockSplit",
    creator: handleTokenLockSplit,
    reverter: handleTokenLockSplitRevert,
  },
  {
    name: "TokensBurned",
    creator: handleTokensBurn,
    reverter: handleTokensBurnRevert,
  },
];

async function tokenLockEvents() {
  startEvents(1);
  startEvents(56);
  startEvents(42161);
  startEvents(5);
}

async function startEvents(chain) {
  const contract = tokenContracts[chain];
  const web3 = web3Dict[chain];

  if (!(await tokenLocksInfo.exists({ chain: chain }))) {
    await tokenLocksInfo.create({
      chain: chain,
      lastScannedBlock: await web3.eth.getBlockNumber(),
    });
  }

  const schema = tokenModels[chain];

  handleVerificationCheck(web3, chain, contract, schema);
  setListeners(eventList, web3, chain, contract, schema);
}

async function handleVerificationCheck(web3, chain, contract, schema) {
  const blockBuffer = blockConf[chain];
  web3.eth.subscribe("newBlockHeaders", async (err, event) => {
    if (event) {
      const info = await tokenLocksInfo.findOne({ chain: chain });

      // We only want to scan blocks that have had x blocks of confirmation every x blocks
      if (event.number - blockBuffer * 2 > info.lastScannedBlock) {
        const fromBlock = info.lastScannedBlock;
        const toBlock = event.number - info.lastScannedBlock > 5000 ? fromBlock + 5000 : event.number - blockBuffer;

        console.log(`Scanning Block: ${fromBlock} to ${toBlock} - Token Locker (${chain})`);
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

module.exports = tokenLockEvents;

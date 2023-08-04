// Library Imports
const Web3 = require("web3");
const Web3WsProvider = require("web3-providers-ws");

// Global variables
const { QUICKNODE_WSS_ETH, QUICKNODE_WSS_ARBITRUM, QUICKNODE_WSS_GOERLI, QUICKNODE_WSS_AVALANCHE, QUICKNODE_WSS_BSC, QUICKNODE_WSS_BSC_TESTNET } = process.env;

// WSS
const options = {
  timeout: 30000, // ms

  clientConfig: {
    // Useful if requests are large
    maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
    maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 60000, // ms
  },

  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 20000, // ms
    maxAttempts: 50,
    onTimeout: false,
  },
};

let web3_quicknode_eth;
let web3_quicknode_arb;
let web3_quicknode_avalanche;
let web3_quicknode_bsc;
let web3_quicknode_goerli;
let web3_quicknode_bsc_testnet;

try {
  const ws_quicknode_eth = new Web3WsProvider(`${QUICKNODE_WSS_ETH}`, options);
  const ws_quicknode_arb = new Web3WsProvider(`${QUICKNODE_WSS_ARBITRUM}`, options);
  const ws_quicknode_avalanche = new Web3WsProvider(`${QUICKNODE_WSS_AVALANCHE}`, options);
  const ws_quicknode_bsc = new Web3WsProvider(`${QUICKNODE_WSS_BSC}`, options);
  const ws_quicknode_goerli = new Web3WsProvider(`${QUICKNODE_WSS_GOERLI}`, options);
  const ws_quicknode_bsc_testnet = new Web3WsProvider(`${QUICKNODE_WSS_BSC_TESTNET}`, options);

  web3_quicknode_eth = new Web3(ws_quicknode_eth);
  web3_quicknode_arb = new Web3(ws_quicknode_arb);
  web3_quicknode_avalanche = new Web3(ws_quicknode_avalanche);
  web3_quicknode_bsc = new Web3(ws_quicknode_bsc);
  web3_quicknode_goerli = new Web3(ws_quicknode_goerli);
  web3_quicknode_bsc_testnet = new Web3(ws_quicknode_bsc_testnet);
} catch (err) {
  console.log(err);
}

const web3 = { eth: web3_quicknode_eth, arb: web3_quicknode_arb, avax: web3_quicknode_avalanche, gor: web3_quicknode_goerli, bsc: web3_quicknode_bsc, bsct: web3_quicknode_bsc_testnet };

module.exports = { web3 };

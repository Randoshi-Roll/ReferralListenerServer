var express = require('express');
const ethers = require("ethers");
const erc20abi = require("./../abi/erc20.json");
const refmintSDK = require("refmint-sdk")
require('dotenv').config();

var router = express.Router();

// Set RefMint SDK
const refmintClient = new refmintSDK.default.Game({
	apiKey: process.env.DEVELOPER_API_KEY,
	baseUrl: refmintSDK.BaseURLOptions.TESTNET
});

// The URL should be your Infura or Alchemy Websocket URL
// example: wss://eth-goerli.g.alchemy.com/v2/<API_KEY>
// Create the WebSocket Provider
var provider = new ethers.WebSocketProvider(process.env.WSS_URL);

// Create the Contract object. This should use your deployed address and your custom contract's ABI
var contract = new ethers.Contract(
  "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844", // Goerli DAI address
  erc20abi,                                     // ERC20 ABI 
  provider
);

// This enables you to get the specific Filter for your event. In this case, we're trying to listen for all
// ERC20 Transfer events for the Goerli DAI contract (0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844)
// Transfer filter ABI: Transfer(from, to, amount)
let transferEventFilter = contract.filters.Transfer();

// Filters any Transfer events where "from" address is equal to 0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b
// let transferEventFilter = contract.filters.Transfer("0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b");

// Filter any Transfer events where "to" address is equal to 0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b
// let transferEventFilter = contract.filters.Transfer(null, "0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b");

// We start listening for the Transfer Event on the Goerli DAI contract
contract.on(transferEventFilter, async (args) => {
  // console.log(args.args);

  // Transfer(from, to, amount)
  // args.args = [
  //   '0xA0Cc0CC82d945D96D4F481A62C968AfCCea1C54F',
  //   '0x683913B3A32ada4F8100458A3E1675425BdAa7DF',
  //   0n
  // ]
  let wallet_address = args.args[0];
  console.log(`From: ${wallet_address}`);

  refmintClient.click(
    process.env.PROJECT_ID,
    process.env.CAMPAIGN_ID,
    process.env.LINK_ID
  ).then((resp) => {
    //do something...
    console.log("Clicked")
  }).catch(e => {
    console.log(e);
  });

  // You can use the RefMint SDK, or call the RefMint Rest API
  // RefMint SDK (https://docs.refmint.xyz/refmint-sdk/sdk) 
  // github: https://github.com/ReferralOS/refmint-sdk
  // REST API endpoints: https://docs.refmint.xyz/refmint-sdk/sdk/endpoints
  //    - For REST API, x-api-key header required and Developer API Key
  // refmintClient.triggerEvent(
  //   process.env.PROJECT_ID,
  //   process.env.CAMPAIGN_ID,
  //   "Transfer", // Custom Event Name
  //   "TRANSFER", // Custom Event Type
  //   "ERC20",    // Custom Event Group
  //   wallet_address
  // ).then((resp) => {
  //   //do something...
  // }).catch(e => {
  //   console.log(e);
  // });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('start');
});

module.exports = router;

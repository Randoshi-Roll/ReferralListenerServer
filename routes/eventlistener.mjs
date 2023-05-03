// const refmintSDK = require("refmint-sdk")
import erc20abi from "../abi/erc20.js";
import { ethers } from "ethers";
import express from "express";
import { loadSettings, saveLastBlock } from "../modules/settings.mjs";
import { triggerEvent } from "../modules/refmint.mjs";

var router = express.Router();

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

// Load the Settings from Settings from MongoDB database
let settings = await loadSettings();
let nextBlockToProcess = settings.lastBlockProcessed + 1;

// If you want to start listening from latest block, ignore this. Otherwise, 
// process old / missed blocks from the last processed block stored in the settings
if (process.env.START_FROM_LATEST_BLOCK === "false") {
  // Note: Some chains (like Polygon) only have limited history that you can query from RPCs like Infura 
  // or Alchemy. They only allow you to look at history of the last 1000-5000 blocks. If it's too big, contract.
  // queryFilter() will fail.
  let latestBlock = await provider.provider.getBlockNumber();
  if (latestBlock - 2000 > nextBlockToProcess) {
    nextBlockToProcess = latestBlock - 2000;
  }

  console.log(`Processing from block ${nextBlockToProcess}`);
  
  let events = await contract.queryFilter(transferEventFilter, nextBlockToProcess);
  if (events.length > 0) {
    for (let event of events) {
      nextBlockToProcess = event.blockNumber;
      
      // Process the event here, however you want to massage the event
  
      let wallet_address = event.args[0];
      await triggerEvent(wallet_address);
    }
  
    // Set the last processed block
    await saveLastBlock(settings._id, nextBlockToProcess);
  }
}

// We start listening for the Transfer Event on the Goerli DAI contract
contract.on(transferEventFilter, async (args) => {
  // Transfer(from, to, amount)
  // args.args = [
  //   '0xA0Cc0CC82d945D96D4F481A62C968AfCCea1C54F',
  //   '0x683913B3A32ada4F8100458A3E1675425BdAa7DF',
  //   0n
  // ]
  let wallet_address = args.args[0];

  // Process the event here, however you want to massage the event
  
  // Forward the event using the RefMint SDK 
  await triggerEvent(wallet_address);
  
  // Set the last processed block
  settings.lastBlockProcessed = args.log.blockNumber;
  await saveLastBlock(settings._id, args.log.blockNumber);
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('start');
});

// module.exports = router;

export default router;

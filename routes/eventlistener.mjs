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
  process.env.CONTRACT_ADDRESS, // Goerli DAI address
  erc20abi, // ERC20 ABI
  provider
);

// This enables you to get the specific Filter for your event.
let playerJoinedEventFilter = contract.filters.PlayerJoined();

// Load the Settings from Settings from MongoDB database
let settings = await loadSettings();
let nextBlockToProcess = settings.lastBlockProcessed + 1;

// If you want to start listening from latest block, ignore this. Otherwise,
// process old / missed blocks from the last processed block stored in the settings
if (process.env.START_FROM_LATEST_BLOCK === "false") {
  // Note: Some chains (like Polygon) only have limited history that you can query from RPCs like Infura
  // or Alchemy. They only allow you to look at history of the last 1000-5000 blocks. If it's too big, contract.
  // queryFilter() will fail.

  /*   let latestBlock = await provider.provider.getBlockNumber();
  if (latestBlock - 2000 > nextBlockToProcess) {
    nextBlockToProcess = latestBlock - 2000;
  } */

  console.log(`Processing from block ${nextBlockToProcess}`);

  let events = await contract.queryFilter(
    playerJoinedEventFilter,
    nextBlockToProcess
  );
  if (events.length > 0) {
    for (let event of events) {
      nextBlockToProcess = event.blockNumber;

      /**
       * args = [
       *    roomId,
       *    betSize,
       *    roomSize,
       *    player,
       *    affiliateLinkId
       * ]
       */

      const betSize = event.args[1];
      const player = event.args[3];
      const affiliateLinkId = event.args[4];
      await triggerEvent(affiliateLinkId, player, betSize);
    }

    // Set the last processed block
    await saveLastBlock(settings._id, nextBlockToProcess);
  }
}

// We start listening for the Transfer Event on the Goerli DAI contract
contract.on(playerJoinedEventFilter, async (args) => {
  /**
   * args = [
   *    roomId,
   *    betSize,
   *    roomSize,
   *    player,
   *    affiliateLinkId
   * ]
   */
  const betSize = args.args[1];
  const player = args.args[3];
  const affiliateLinkId = args.args[4];

  // Process the event here, however you want to massage the event

  // Forward the event using the RefMint SDK
  await triggerEvent(affiliateLinkId, player, betSize);

  // Set the last processed block
  settings.lastBlockProcessed = args.log.blockNumber;
  await saveLastBlock(settings._id, args.log.blockNumber);
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("start");
});

// module.exports = router;

export default router;

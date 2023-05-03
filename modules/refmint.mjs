// const refmintSDK = require("refmint-sdk")

// Trigger Refmint Event
export async function triggerEvent(wallet_address) {
  // // Set RefMint SDK
  // const refmintClient = new refmintSDK.default.Game({
  // 	apiKey: process.env.DEVELOPER_API_KEY,
  // 	baseUrl: refmintSDK.BaseURLOptions.TESTNET
  // });

  // // You can use the RefMint SDK, or call the RefMint Rest API
  // // RefMint SDK (https://docs.refmint.xyz/refmint-sdk/sdk) 
  // // github: https://github.com/ReferralOS/refmint-sdk
  // // REST API endpoints: https://docs.refmint.xyz/refmint-sdk/sdk/endpoints
  // //    - For REST API, x-api-key header required and Developer API Key
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

  console.log(`Processing Transaction From: ${wallet_address}`);
}
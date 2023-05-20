import Refmint, { BaseURLOptions } from "refmint-sdk";

/**
 * Trigger Refmint Event
 * @param {string} player player joined address
 * @param {BigInt} betSize amout of the bet
 */
export async function triggerEvent(player, betSize) {
  return new Promise((res, rej) => {
    // // Set RefMint SDK
    const refmintClient = new Refmint.default.Game({
      apiKey: process.env.DEVELOPER_API_KEY,
      baseUrl: BaseURLOptions.TESTNET,
    });

    console.log(
      `Start processing Transaction From: ${player} amout ${betSize}`
    );

    // // You can use the RefMint SDK, or call the RefMint Rest API
    // // RefMint SDK (https://docs.refmint.xyz/refmint-sdk/sdk)
    // // github: https://github.com/ReferralOS/refmint-sdk
    // // REST API endpoints: https://docs.refmint.xyz/refmint-sdk/sdk/endpoints
    // //    - For REST API, x-api-key header required and Developer API Key
    refmintClient
      .triggerEvent(
        process.env.PROJECT_ID,
        process.env.CAMPAIGN_ID,
        player,
        "0xc3703065ac2dfaa94373834e8d6914faf67e969e650f780b8f282e014447c06e",
        betSize.toString()
      )
      .then((resp) => {
        console.log("resonse by refserver");
        console.log(resp);
        res();
      })
      .catch((e) => {
        console.log(e);
        rej(e);
      });
  });
}


import db from "../db/connect.mjs";
import { ObjectId } from "mongodb";

// Get Settings Object
export async function loadSettings() {
  // Get DB collection
  let collection = await db.collection("settings");

  let settings = await collection.findOne({});

  if (!settings) {
    settings = {
      lastBlockProcessed: process.env.INIT_BLOCK ? parseInt(process.env.INIT_BLOCK) : 0
    };

    let result = await collection.insertOne(settings);
    if (result.acknowledged) {
      settings._id = result.insertedId;
    }
  }

  return settings;
}

// Update Last Block Setting
export async function saveLastBlock(id, lastBlockProcessed) {
  let collection = await db.collection("settings");

  const query = { _id: new ObjectId(id) };
  const updates = {
    $set: {
      lastBlockProcessed: lastBlockProcessed
    }
  };

  await collection.updateOne(query, updates);
}
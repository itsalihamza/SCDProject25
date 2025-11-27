const { MongoClient } = require('mongodb');
require('dotenv').config();

// Load configuration from environment variables
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'nodevault';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'records';

// Validate required environment variables
if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

let client = null;
let db = null;
let collection = null;

async function connect() {
  if (client && client.topology && client.topology.isConnected()) {
    return collection;
  }

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    console.log('[MongoDB] Connected successfully');
    return collection;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
}

async function disconnect() {
  if (client) {
    await client.close();
    console.log('[MongoDB] Disconnected');
  }
}

// CRUD Operations
async function insertRecord(record) {
  const coll = await connect();
  const result = await coll.insertOne(record);
  return { ...record, _id: result.insertedId };
}

async function findAllRecords() {
  const coll = await connect();
  return await coll.find({}).toArray();
}

async function findRecordById(id) {
  const coll = await connect();
  return await coll.findOne({ id: id });
}

async function updateRecordById(id, updates) {
  const coll = await connect();
  const result = await coll.updateOne(
    { id: id },
    { $set: updates }
  );
  if (result.matchedCount === 0) return null;
  return await findRecordById(id);
}

async function deleteRecordById(id) {
  const coll = await connect();
  const record = await findRecordById(id);
  if (!record) return null;
  await coll.deleteOne({ id: id });
  return record;
}

async function searchRecords(keyword) {
  const coll = await connect();
  const lowerKeyword = keyword.toLowerCase();
  return await coll.find({
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { id: { $regex: keyword } }
    ]
  }).toArray();
}

module.exports = {
  connect,
  disconnect,
  insertRecord,
  findAllRecords,
  findRecordById,
  updateRecordById,
  deleteRecordById,
  searchRecords
};

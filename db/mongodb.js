const { MongoClient } = require('mongodb');

// Hardcoded MongoDB connection string (will be moved to .env in next version)
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'nodevault';
const COLLECTION_NAME = 'records';

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

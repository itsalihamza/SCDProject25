const mongodb = require('./mongodb');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const { exportToFile } = require('../utils/export');
const { createBackup } = require('../utils/backup');
const { calculateStatistics, formatStatistics } = require('../utils/statistics');
const path = require('path');

async function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const newRecord = recordUtils.createRecord(name, value);
  
  await mongodb.insertRecord(newRecord);
  
  // Create automatic backup
  const allData = await mongodb.findAllRecords();
  const backup = createBackup(allData);
  vaultEvents.emit('recordAdded', newRecord);
  vaultEvents.emit('backupCreated', backup);
  
  return newRecord;
}

async function listRecords() {
  return await mongodb.findAllRecords();
}

async function updateRecord(id, newName, newValue) {
  const updates = { name: newName, value: newValue };
  const record = await mongodb.updateRecordById(id, updates);
  if (record) {
    vaultEvents.emit('recordUpdated', record);
  }
  return record;
}

async function deleteRecord(id) {
  const record = await mongodb.deleteRecordById(id);
  if (!record) return null;
  
  // Create automatic backup
  const allData = await mongodb.findAllRecords();
  const backup = createBackup(allData);
  vaultEvents.emit('recordDeleted', record);
  vaultEvents.emit('backupCreated', backup);
  
  return record;
}

async function searchRecords(keyword) {
  return await mongodb.searchRecords(keyword);
}

async function sortRecords(field, order) {
  const data = await mongodb.findAllRecords();
  const sorted = [...data]; // Create a copy to avoid modifying original
  
  sorted.sort((a, b) => {
    let compareA, compareB;
    
    if (field === 'name') {
      compareA = a.name.toLowerCase();
      compareB = b.name.toLowerCase();
    } else if (field === 'date') {
      compareA = a.createdAt || '';
      compareB = b.createdAt || '';
    }
    
    if (order === 'asc') {
      return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
    } else {
      return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
    }
  });
  
  return sorted;
}

async function exportData() {
  const data = await mongodb.findAllRecords();
  const filePath = exportToFile(data);
  return filePath;
}

async function getStatistics() {
  const data = await mongodb.findAllRecords();
  // For MongoDB, we'll use current time as last modified
  const stats = calculateStatistics(data, null);
  return formatStatistics(stats);
}

async function closeConnection() {
  await mongodb.disconnect();
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord, searchRecords, sortRecords, exportData, getStatistics, closeConnection };

const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const { exportToFile } = require('../utils/export');

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = recordUtils.createRecord(name, value);
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  vaultEvents.emit('recordDeleted', record);
  return record;
}

function searchRecords(keyword) {
  const data = fileDB.readDB();
  const lowerKeyword = keyword.toLowerCase();
  return data.filter(record => {
    const nameMatch = record.name.toLowerCase().includes(lowerKeyword);
    const idMatch = record.id.toString().includes(keyword);
    return nameMatch || idMatch;
  });
}

function sortRecords(field, order) {
  const data = fileDB.readDB();
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

function exportData() {
  const data = fileDB.readDB();
  const filePath = exportToFile(data);
  return filePath;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord, searchRecords, sortRecords, exportData };

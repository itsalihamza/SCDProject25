function validateRecord(record) {
  if (!record.name || !record.value) throw new Error('Record must have both name and value.');
  return true;
}

function generateId() {
  return Date.now();
}

function createRecord(name, value) {
  return {
    id: generateId(),
    name,
    value,
    createdAt: new Date().toISOString()
  };
}

module.exports = { validateRecord, generateId, createRecord };

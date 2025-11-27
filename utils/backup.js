const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

function createBackup(data) {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .split('.')[0];
  
  const filename = `backup_${timestamp}.json`;
  const backupPath = path.join(backupDir, filename);
  
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
  
  return { filename, path: backupPath };
}

module.exports = { createBackup };

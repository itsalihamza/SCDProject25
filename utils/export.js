const fs = require('fs');
const path = require('path');

function exportToFile(records, filename = 'export.txt') {
  const exportPath = path.join(__dirname, '..', filename);
  const exportDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  let content = '';
  content += '='.repeat(60) + '\n';
  content += '                  NODEVAULT DATA EXPORT\n';
  content += '='.repeat(60) + '\n';
  content += `Export Date/Time: ${exportDate}\n`;
  content += `Total Records: ${records.length}\n`;
  content += `Filename: ${filename}\n`;
  content += '='.repeat(60) + '\n\n';
  
  if (records.length === 0) {
    content += 'No records to export.\n';
  } else {
    records.forEach((record, index) => {
      const createdDate = record.createdAt 
        ? new Date(record.createdAt).toLocaleString('en-US')
        : 'N/A';
      
      content += `Record #${index + 1}\n`;
      content += '-'.repeat(60) + '\n';
      content += `  ID:          ${record.id}\n`;
      content += `  Name:        ${record.name}\n`;
      content += `  Value:       ${record.value}\n`;
      content += `  Created At:  ${createdDate}\n`;
      content += '\n';
    });
  }
  
  content += '='.repeat(60) + '\n';
  content += 'End of Export\n';
  content += '='.repeat(60) + '\n';
  
  fs.writeFileSync(exportPath, content, 'utf8');
  return exportPath;
}

module.exports = { exportToFile };

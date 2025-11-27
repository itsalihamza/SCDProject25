const fs = require('fs');
const path = require('path');

function calculateStatistics(records, vaultFilePath) {
  const stats = {
    totalRecords: records.length,
    lastModified: 'N/A',
    longestName: 'N/A',
    longestNameLength: 0,
    earliestRecord: 'N/A',
    latestRecord: 'N/A'
  };

  // Get last modified time of vault file
  try {
    const fileStats = fs.statSync(vaultFilePath);
    stats.lastModified = new Date(fileStats.mtime).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    // Keep N/A if file doesn't exist
  }

  if (records.length === 0) {
    return stats;
  }

  // Find longest name
  let longest = records[0].name;
  records.forEach(record => {
    if (record.name.length > longest.length) {
      longest = record.name;
    }
  });
  stats.longestName = longest;
  stats.longestNameLength = longest.length;

  // Find earliest and latest record by creation date
  const recordsWithDates = records.filter(r => r.createdAt);
  
  if (recordsWithDates.length > 0) {
    let earliest = recordsWithDates[0];
    let latest = recordsWithDates[0];

    recordsWithDates.forEach(record => {
      const recordDate = new Date(record.createdAt);
      if (recordDate < new Date(earliest.createdAt)) {
        earliest = record;
      }
      if (recordDate > new Date(latest.createdAt)) {
        latest = record;
      }
    });

    stats.earliestRecord = new Date(earliest.createdAt).toISOString().split('T')[0];
    stats.latestRecord = new Date(latest.createdAt).toISOString().split('T')[0];
  }

  return stats;
}

function formatStatistics(stats) {
  let output = '\n';
  output += 'Vault Statistics:\n';
  output += '-'.repeat(50) + '\n';
  output += `Total Records: ${stats.totalRecords}\n`;
  output += `Last Modified: ${stats.lastModified}\n`;
  output += `Longest Name: ${stats.longestName} (${stats.longestNameLength} characters)\n`;
  output += `Earliest Record: ${stats.earliestRecord}\n`;
  output += `Latest Record: ${stats.latestRecord}\n`;
  output += '-'.repeat(50) + '\n';
  return output;
}

module.exports = { calculateStatistics, formatStatistics };

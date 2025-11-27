const readline = require('readline');
const db = require('./db');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);

  rl.question('Choose option: ', async (ans) => {
    try {
      switch (ans.trim()) {
        case '1':
          rl.question('Enter name: ', (name) => {
            rl.question('Enter value: ', async (value) => {
              await db.addRecord({ name, value });
              console.log('✅ Record added successfully!');
              menu();
            });
          });
          break;

        case '2':
          const records = await db.listRecords();
          if (records.length === 0) console.log('No records found.');
          else records.forEach(r => {
            const date = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'N/A';
            console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${date}`);
          });
          menu();
          break;

        case '3':
          rl.question('Enter record ID to update: ', (id) => {
            rl.question('New name: ', (name) => {
              rl.question('New value: ', async (value) => {
                const updated = await db.updateRecord(Number(id), name, value);
                console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
                menu();
              });
            });
          });
          break;

        case '4':
          rl.question('Enter record ID to delete: ', async (id) => {
            const deleted = await db.deleteRecord(Number(id));
            console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
            menu();
          });
          break;

        case '5':
          rl.question('Enter search keyword: ', async (keyword) => {
            const results = await db.searchRecords(keyword.trim());
            if (results.length === 0) {
              console.log('No records found.');
            } else {
              console.log(`\nFound ${results.length} matching record(s):`);
              results.forEach((r, idx) => {
                const date = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'N/A';
                console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${date}`);
              });
            }
            menu();
          });
          break;

        case '6':
          console.log('\nChoose field to sort by:');
          console.log('1. Name');
          console.log('2. Creation Date');
          rl.question('Enter choice (1 or 2): ', (fieldChoice) => {
            const field = fieldChoice.trim() === '1' ? 'name' : 'date';
            const fieldName = field === 'name' ? 'Name' : 'Creation Date';
            
            console.log('\nChoose order:');
            console.log('1. Ascending');
            console.log('2. Descending');
            rl.question('Enter choice (1 or 2): ', async (orderChoice) => {
              const order = orderChoice.trim() === '1' ? 'asc' : 'desc';
              const orderName = order === 'asc' ? 'Ascending' : 'Descending';
              
              const sorted = await db.sortRecords(field, order);
              console.log(`\nSorted Records (by ${fieldName} - ${orderName}):`);
              if (sorted.length === 0) {
                console.log('No records to sort.');
              } else {
                sorted.forEach((r, idx) => {
                  const date = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'N/A';
                  console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${date}`);
                });
              }
              menu();
            });
          });
          break;

        case '7':
          try {
            const exportPath = await db.exportData();
            console.log('✅ Data exported successfully to export.txt');
          } catch (error) {
            console.log('❌ Export failed:', error.message);
          }
          menu();
          break;

        case '8':
          const statistics = await db.getStatistics();
          console.log(statistics);
          menu();
          break;

        case '9':
          console.log('👋 Exiting NodeVault...');
          await db.closeConnection();
          rl.close();
          break;

        default:
          console.log('Invalid option.');
          menu();
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      menu();
    }
  });
}

menu();

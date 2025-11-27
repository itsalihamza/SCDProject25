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
7. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => {
          const date = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : 'N/A';
          console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${date}`);
        });
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          menu();
        });
        break;

      case '5':
        rl.question('Enter search keyword: ', keyword => {
          const results = db.searchRecords(keyword.trim());
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
        rl.question('Enter choice (1 or 2): ', fieldChoice => {
          const field = fieldChoice.trim() === '1' ? 'name' : 'date';
          const fieldName = field === 'name' ? 'Name' : 'Creation Date';
          
          console.log('\nChoose order:');
          console.log('1. Ascending');
          console.log('2. Descending');
          rl.question('Enter choice (1 or 2): ', orderChoice => {
            const order = orderChoice.trim() === '1' ? 'asc' : 'desc';
            const orderName = order === 'asc' ? 'Ascending' : 'Descending';
            
            const sorted = db.sortRecords(field, order);
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
        console.log('👋 Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();

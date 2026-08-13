const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile('./data/test-data.xlsx');

// Get the first worksheet
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Convert worksheet to JavaScript objects
const data = XLSX.utils.sheet_to_json(worksheet, {
    defval: ''
});

// Display the number of records
console.log(`Total rows: ${data.length}`);

// Display the first record
console.log('First record:');
console.log(data[0]);
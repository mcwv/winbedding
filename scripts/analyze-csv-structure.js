const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const content = fs.readFileSync('bedwinning - AI-Tools.csv', 'utf8');
const records = parse(content, {
    skip_empty_lines: true,
    relax_column_count: true,
    columns: false // Get arrays
});

console.log('Header Row:', records[0]);
console.log('Row 1:', records[1]);
console.log('Row 2:', records[2]);
console.log('Row 3:', records[3]);

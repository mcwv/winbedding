// Check CSV headers
const fs = require('fs');
const path = require('path');

const csv = fs.readFileSync(path.join(process.cwd(), 'bedwinning - AI-Tools.csv'), 'utf-8');
const lines = csv.split('\n');

console.log('HEADER ROW:');
console.log(lines[0]);

console.log('\n\nFIRST DATA ROW:');
console.log(lines[1].substring(0, 500));

console.log('\n\nCOLUMN NAMES:');
const headers = lines[0].split(',');
headers.forEach((h, i) => console.log(`  ${i}: "${h}"`));

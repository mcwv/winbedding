const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('bedwinning - AI-Tools.csv', 'utf8');
console.log('First 50 chars:', JSON.stringify(content.substring(0, 50)));

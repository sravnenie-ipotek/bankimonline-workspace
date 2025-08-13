const fs = require('fs');
const path = require('path');

// Read translation files
const hePath = path.join(__dirname, 'locales/he/translation.json');
const ruPath = path.join(__dirname, 'locales/ru/translation.json');

const he = JSON.parse(fs.readFileSync(hePath, 'utf8'));
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf8'));

const heKeys = Object.keys(he);
const ruKeys = Object.keys(ru);

// Find missing keys
const missingInRu = heKeys.filter(k => !ruKeys.includes(k));
const missingInHe = ruKeys.filter(k => !heKeys.includes(k));

console.log('=== Translation Analysis ===');
console.log(`Total keys in Hebrew: ${heKeys.length}`);
console.log(`Total keys in Russian: ${ruKeys.length}`);
console.log(`Keys in Hebrew but missing in Russian: ${missingInRu.length}`);
console.log(`Keys in Russian but missing in Hebrew: ${missingInHe.length}`);

if (missingInRu.length > 0) {
    console.log('\n=== Missing in Russian (first 10): ===');
    missingInRu.slice(0, 10).forEach(key => {
        console.log(`"${key}": "${he[key]}"`);
    });
}

if (missingInHe.length > 0) {
    console.log('\n=== Missing in Hebrew (first 10): ===');
    missingInHe.slice(0, 10).forEach(key => {
        console.log(`"${key}": "${ru[key]}"`);
    });
}

// Check for empty or problematic translations
console.log('\n=== Quality Check ===');
const emptyHe = heKeys.filter(k => !he[k] || (typeof he[k] === 'string' && he[k].trim() === ''));
const emptyRu = ruKeys.filter(k => !ru[k] || (typeof ru[k] === 'string' && ru[k].trim() === ''));

if (emptyHe.length > 0) {
    console.log(`Empty Hebrew translations: ${emptyHe.length}`);
    console.log(emptyHe.slice(0, 5));
}

if (emptyRu.length > 0) {
    console.log(`Empty Russian translations: ${emptyRu.length}`);
    console.log(emptyRu.slice(0, 5));
}

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

if (missingInRu.length > 0) {
    : ===');
    missingInRu.slice(0, 10).forEach(key => {
        });
}

if (missingInHe.length > 0) {
    : ===');
    missingInHe.slice(0, 10).forEach(key => {
        });
}

// Check for empty or problematic translations
const emptyHe = heKeys.filter(k => !he[k] || (typeof he[k] === 'string' && he[k].trim() === ''));
const emptyRu = ruKeys.filter(k => !ru[k] || (typeof ru[k] === 'string' && ru[k].trim() === ''));

if (emptyHe.length > 0) {
    );
}

if (emptyRu.length > 0) {
    );
}

const fs = require('fs');

// Read the server file
const serverPath = '/Users/michaelmishayev/Projects/bankDev2_standalone/server/server-db.js';
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Find the query line and add debug logging
const queryLine = 'const result = await contentPool.query(`';
const queryIndex = serverContent.indexOf(queryLine);

if (queryIndex === -1) {
    console.error('❌ Could not find query line');
    process.exit(1);
}

// Find the end of the query
const queryEndIndex = serverContent.indexOf('`, [screen]);', queryIndex);

if (queryEndIndex === -1) {
    console.error('❌ Could not find query end');
    process.exit(1);
}

// Insert debug logging before the query
const beforeQuery = serverContent.substring(0, queryIndex);
const afterQuery = serverContent.substring(queryIndex);

const debugCode = `
        console.log(\`🔍 DEBUG: Executing query for screen: "\${screen}"\`);
        console.log(\`   Full query: SELECT ... WHERE screen_location = '\${screen}' AND is_active = true\`);
        `;

serverContent = beforeQuery + debugCode + afterQuery;

// Write back
fs.writeFileSync(serverPath, serverContent);

console.log('✅ Added SQL query debug logging');
console.log('🔄 Restart the server to see the actual query');
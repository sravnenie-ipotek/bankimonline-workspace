const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database connection string
const DATABASE_URL = 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway';

// Create backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFilename = `pre_dropdown_migration_${timestamp}.sql`;
const backupPath = path.join(__dirname, backupFilename);

console.log('🔄 Creating database backup...');
console.log(`📁 Backup file: ${backupPath}`);

// Try different pg_dump approaches
const commands = [
  // Try with --no-sync (PostgreSQL 14+)
  `pg_dump --no-sync "${DATABASE_URL}" > "${backupPath}"`,
  
  // Try with --verbose for more info
  `pg_dump --verbose "${DATABASE_URL}" > "${backupPath}"`,
  
  // Try with specific format
  `pg_dump --format=plain "${DATABASE_URL}" > "${backupPath}"`,
  
  // Try with connection parameters separately
  `pg_dump -h shortline.proxy.rlwy.net -p 33452 -U postgres -d railway > "${backupPath}"`
];

async function tryBackup() {
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    console.log(`\n🔄 Trying command ${i + 1}: ${command.split(' ')[0]}...`);
    
    try {
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.log(`❌ Command ${i + 1} failed:`, error.message);
            reject(error);
          } else {
            console.log(`✅ Backup created successfully!`);
            console.log(`📊 File size: ${fs.statSync(backupPath).size} bytes`);
            resolve();
          }
        });
      });
      return; // Success, exit
    } catch (error) {
      console.log(`⚠️  Command ${i + 1} failed, trying next...`);
    }
  }
  
  console.log('❌ All backup methods failed. Please check your PostgreSQL installation.');
}

// Set PGPASSWORD environment variable
process.env.PGPASSWORD = 'SuFkUevgonaZFXJiJeczFiXYTlICHVJL';

tryBackup().catch(console.error); 
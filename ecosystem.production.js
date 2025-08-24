module.exports = {
  apps: [{
    name: 'bankim-api',
    script: './server/server-db.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'production',
      PORT: 8003
    },
    error_file: '/var/log/pm2/bankim-error.log',
    out_file: '/var/log/pm2/bankim-out.log',
    log_file: '/var/log/pm2/bankim-combined.log',
    time: true,
    merge_logs: true
  }]
};
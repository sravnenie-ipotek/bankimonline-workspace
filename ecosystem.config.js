module.exports = {
  apps: [{
    name: 'bankim-dev-api',
    script: './server/server-db.js',
    cwd: './',
    watch: ['server'],
    ignore_watch: ['node_modules', 'logs', 'uploads', '*.log', '.git', 'mainapp'],
    env: {
      NODE_ENV: 'development',
      PORT: 8003,
      USE_JSONB_DROPDOWNS: true,
      DATABASE_URL: process.env.DATABASE_URL,
      CONTENT_DATABASE_URL: process.env.CONTENT_DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_BANK_SECRET: process.env.JWT_BANK_SECRET
    },
    error_file: './logs/dev-api-error.log',
    out_file: './logs/dev-api-out.log',
    log_file: './logs/dev-api-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DDTHH:mm:ss',
    max_restarts: 5,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }, {
    name: 'bankim-dev-files',
    script: './server/serve.js',
    cwd: './',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    error_file: './logs/dev-files-error.log',
    out_file: './logs/dev-files-out.log',
    time: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
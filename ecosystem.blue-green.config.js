module.exports = {
  apps: [
    {
      name: 'bankimonline-blue',
      script: 'server/server-db.js',
      cwd: '/app/blue',
      env: {
        NODE_ENV: 'production',
        PORT: 8003,
        APP_VERSION: 'blue'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/app/logs/blue-error.log',
      out_file: '/app/logs/blue-out.log',
      log_file: '/app/logs/blue-combined.log'
    },
    {
      name: 'bankimonline-green',
      script: 'server/server-db.js', 
      cwd: '/app/green',
      env: {
        NODE_ENV: 'production',
        PORT: 8004,
        APP_VERSION: 'green'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/app/logs/green-error.log',
      out_file: '/app/logs/green-out.log',
      log_file: '/app/logs/green-combined.log'
    }
  ]
};
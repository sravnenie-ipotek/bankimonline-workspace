module.exports = {
  apps: [
    {
      name: 'bankim-api',
      script: './server/server-db.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 8003
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8003
      },
      error_file: './logs/pm2-api-error.log',
      out_file: './logs/pm2-api-out.log',
      log_file: './logs/pm2-api-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 5000,
      kill_timeout: 5000
    },
    {
      name: 'bankim-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './mainapp',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: './logs/pm2-frontend-error.log',
      out_file: './logs/pm2-frontend-out.log',
      log_file: './logs/pm2-frontend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'https://github.com/MichaelMishaev/bankDev2_standalone.git',
      path: '/var/www/bankim',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && cd mainapp && npm install && npm run build && cd .. && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
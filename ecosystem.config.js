module.exports = {
  apps: [{
    name: 'bankim-api',
    script: './server/server-db.js',
    instances: 1,
    autorestart: true,
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
    env_test: {
      NODE_ENV: 'test',
      PORT: 8003
    }
  }]
};
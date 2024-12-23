module.exports = {
  apps: [
    {
      name: 'debt-manager',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: process.env.PORT || 3000,
        HOST: process.env.HOST || '0.0.0.0',
        NODE_ENV: 'production'
      }
    }
  ]
}
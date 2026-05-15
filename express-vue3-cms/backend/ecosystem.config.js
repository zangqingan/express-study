// PM2 ecosystem configuration
module.exports = {
  apps: [
    {
      name: 'cms-backend',
      script: './dist/bin/www.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
    },
  ],
}

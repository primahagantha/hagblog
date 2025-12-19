// PM2 Ecosystem Configuration for Dewacloud
// Run both backend API and frontend SSR in one Node.js container

module.exports = {
  apps: [
    // Backend API Server
    {
      name: 'hagblog-api',
      script: 'server/dist/index.js',
      cwd: '/home/jelastic/ROOT',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/hagblog-api-error.log',
      out_file: '/var/log/pm2/hagblog-api-out.log',
      merge_logs: true,
      time: true
    },
    
    // Frontend Nuxt SSR Server
    {
      name: 'hagblog-web',
      script: '.output/server/index.mjs',
      cwd: '/home/jelastic/ROOT',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        NUXT_HOST: '0.0.0.0',
        NUXT_PORT: 3000
      },
      error_file: '/var/log/pm2/hagblog-web-error.log',
      out_file: '/var/log/pm2/hagblog-web-out.log',
      merge_logs: true,
      time: true
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'jelastic',
      host: 'your-node-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/hagblog.git',
      path: '/home/jelastic/ROOT',
      'post-deploy': 'npm install && npm run build && cd server && npm install && npm run build && pm2 reload ecosystem.config.cjs --env production'
    }
  }
};

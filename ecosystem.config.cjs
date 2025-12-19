// PM2 Ecosystem Configuration
// Works for both Windows (local) and Linux (Dewacloud)

const isWindows = process.platform === 'win32';
const basePath = isWindows ? 'D:/production/blog' : '/home/jelastic/ROOT';
const logsPath = isWindows ? 'D:/production/blog/logs' : '/home/jelastic/logs';

module.exports = {
  apps: [
    // Backend API Server
    {
      name: 'hagblog-api',
      script: isWindows ? 'dist/index.js' : 'server/dist/index.js',
      cwd: isWindows ? `${basePath}/server` : basePath,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: `${logsPath}/hagblog-api-error.log`,
      out_file: `${logsPath}/hagblog-api-out.log`,
      merge_logs: true,
      time: true
    },
    
    // Frontend Nuxt SSR Server
    {
      name: 'hagblog-web',
      script: '.output/server/index.mjs',
      cwd: basePath,
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
      error_file: `${logsPath}/hagblog-web-error.log`,
      out_file: `${logsPath}/hagblog-web-out.log`,
      merge_logs: true,
      time: true
    }
  ]
};

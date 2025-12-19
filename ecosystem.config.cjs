// PM2 Ecosystem Configuration
// Works for both Windows (local) and Linux (Dewacloud)

const isWindows = process.platform === 'win32';
const basePath = isWindows ? 'D:/production/blog' : '/home/jelastic/ROOT';
const serverPath = `${basePath}/server`;
const logsPath = isWindows ? 'D:/production/blog/logs' : '/home/jelastic/logs';

module.exports = {
  apps: [
    // Backend API Server
    {
      name: 'hagblog-api',
      script: 'dist/index.js',
      cwd: serverPath,  // Always run from server folder so .env is found
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // Force these values to bypass Dewacloud dashboard caching
        DATABASE_URL: 'postgresql://webadmin:CEIdgn54331@node71827-hagblog.user.cloudjkt01.com:5432/hagblog',
        BETTER_AUTH_SECRET: 'rahasianegara00000____15010_aku_cinta_negara_indonesia_tapi_pemerintahsukakorup',
        BETTER_AUTH_URL: 'https://node71826-hagblog.user.cloudjkt01.com',
        FRONTEND_URL: 'https://node71826-hagblog.user.cloudjkt01.com'
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

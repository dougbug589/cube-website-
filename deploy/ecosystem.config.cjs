// PM2 process configuration for the CUBE website + admin on the CUBE server.
//   pm2 start deploy/ecosystem.config.cjs
//   pm2 save && pm2 startup      (start automatically after a reboot)
//
// IMPORTANT: run exactly ONE instance. Content, enquiries and applications are
// stored in data-store/ (a single JSON file) and live updates are tracked per
// process, so cluster mode / multiple instances must not be used.
module.exports = {
  apps: [
    {
      name: 'cube',
      cwd: __dirname + '/..',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 127.0.0.1',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      out_file: 'logs/cube-out.log',
      error_file: 'logs/cube-error.log',
      time: true,
    },
  ],
};

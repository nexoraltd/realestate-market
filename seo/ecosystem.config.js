/**
 * PM2 Ecosystem Config - GSC Optimizer Weekly Cron
 *
 * Runs every Monday at 6:00 AM JST (analyze-only + email report).
 *
 * Setup:
 *   npm install -g pm2
 *   pm2 start seo/ecosystem.config.js
 *   pm2 save
 *
 * Environment variables required:
 *   RESEND_API_KEY      - Resend API key for email delivery
 *   GSC_CREDENTIALS_PATH - (optional) Path to GSC service account JSON
 */

const path = require("path");

module.exports = {
  apps: [
    {
      name: "gsc-optimizer-weekly",
      script: path.resolve(__dirname, "gsc_optimizer.py"),
      interpreter: "python",
      args: "--email",
      cwd: path.resolve(__dirname),
      cron_restart: "0 6 * * 1", // Every Monday at 06:00
      autorestart: false,
      watch: false,
      max_restarts: 0,
      env: {
        RESEND_API_KEY: process.env.RESEND_API_KEY || "",
        GSC_CREDENTIALS_PATH: process.env.GSC_CREDENTIALS_PATH || "",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: path.resolve(__dirname, "logs", "gsc-error.log"),
      out_file: path.resolve(__dirname, "logs", "gsc-out.log"),
      merge_logs: true,
      max_size: "10M",
      retain: 5,
    },
  ],
};

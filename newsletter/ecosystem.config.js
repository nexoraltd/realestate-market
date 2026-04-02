module.exports = {
  apps: [
    {
      name: "realestate-newsletter",
      script: "python",
      args: "send_weekly.py",
      cwd: "C:/Users/ishid/claude-projects/realestate-market/newsletter",
      // 毎週月曜 9:00
      cron_restart: "0 9 * * 1",
      autorestart: false,
      watch: false,
      env: { PYTHONUTF8: "1" },
    },
  ],
};

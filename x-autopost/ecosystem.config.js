module.exports = {
  apps: [
    {
      name: "realestate-morning",
      script: "python",
      args: "post.py morning",
      cwd: "C:/Users/ishid/claude-projects/realestate-market/x-autopost",
      cron_restart: "0 8 * * *",
      autorestart: false,
      watch: false,
      env: { PYTHONUTF8: "1" },
    },
    {
      name: "realestate-noon",
      script: "python",
      args: "post.py noon",
      cwd: "C:/Users/ishid/claude-projects/realestate-market/x-autopost",
      cron_restart: "30 12 * * *",
      autorestart: false,
      watch: false,
      env: { PYTHONUTF8: "1" },
    },
    {
      name: "realestate-night",
      script: "python",
      args: "post.py night",
      cwd: "C:/Users/ishid/claude-projects/realestate-market/x-autopost",
      cron_restart: "0 20 * * *",
      autorestart: false,
      watch: false,
      env: { PYTHONUTF8: "1" },
    },
  ],
};

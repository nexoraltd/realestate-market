module.exports = {
  apps: [
    {
      name: "realestate-newsletter",
      script: "python",
      args: "send_quarterly.py",
      cwd: "C:/Users/ishid/claude-projects/realestate-market/newsletter",
      // 1月・4月・7月・10月の第2月曜 9:00（四半期データ公開後）
      // PM2の cron_restart は day-of-month で第2月曜を正確に指定できないため、
      // 8-14日の範囲で月曜に実行（第2月曜は必ず8-14日に含まれる）
      cron_restart: "0 9 8-14 1,4,7,10 1",
      autorestart: false,
      watch: false,
      env: { PYTHONUTF8: "1" },
    },
  ],
};

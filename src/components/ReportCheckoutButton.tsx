"use client";

import { useState } from "react";

interface Props {
  area: string;
  areaName: string;
  className?: string;
  label?: string;
}

export default function ReportCheckoutButton({
  area,
  areaName,
  className = "inline-block bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 px-8 rounded-xl transition shadow-lg whitespace-nowrap disabled:opacity-60",
  label = "¥980でレポート購入",
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/report-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, areaName }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      alert("チェックアウトの作成に失敗しました");
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "読み込み中..." : label}
    </button>
  );
}

"use client";

import { useState, useEffect } from "react";

interface SubInfo {
  active: boolean;
  plan: string | null;
  customer_id: string | null;
  trial: boolean;
  status?: string;
  current_period_end: string | null;
}

export default function SubscriptionPanel() {
  const [email, setEmail] = useState("");
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // URLパラメータからsession_idがあれば成功メッセージを表示
  const [justSubscribed, setJustSubscribed] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) {
      setJustSubscribed(true);
    }
  }, []);

  async function checkSubscription() {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subscription?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setSub(data);
      setChecked(true);
    } catch {
      setSub(null);
    } finally {
      setLoading(false);
    }
  }

  async function openPortal() {
    if (!sub?.customer_id) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: sub.customer_id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("ポータルを開けませんでした。再度お試しください。");
    } finally {
      setPortalLoading(false);
    }
  }

  const planLabel = sub?.plan === "professional" ? "プロフェッショナル" : sub?.plan === "standard" ? "スタンダード" : "不明";

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {justSubscribed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-700 font-medium">お申し込みありがとうございます！14日間の無料トライアルが開始されました。</p>
        </div>
      )}

      {!checked ? (
        <div>
          <p className="text-sm text-slate-500 mb-3">登録メールアドレスでサブスクリプションを確認</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@example.com"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && checkSubscription()}
            />
            <button
              onClick={checkSubscription}
              disabled={!email || loading}
              className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-5 py-2.5 rounded-lg transition text-sm whitespace-nowrap"
            >
              {loading ? "確認中..." : "確認"}
            </button>
          </div>
        </div>
      ) : sub?.active ? (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {sub.trial ? "トライアル中" : "有効"}
              </span>
              <p className="font-bold text-slate-800">{planLabel}プラン</p>
            </div>
            {sub.current_period_end && (
              <p className="text-xs text-slate-400 mt-1">
                {sub.trial ? "トライアル終了日" : "次回更新日"}: {new Date(sub.current_period_end).toLocaleDateString("ja-JP")}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium transition"
            >
              {portalLoading ? "読み込み中..." : "プラン変更・解約"}
            </button>
            <span className="text-slate-300">|</span>
            <a
              href="mailto:info@next-aura.com"
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition"
            >
              サポートに連絡
            </a>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                フリープラン
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">有料プランに登録すると全機能をご利用いただけます</p>
          </div>
          <a
            href="/register?plan=standard"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-lg transition text-sm"
          >
            有料プランに申し込む
          </a>
        </div>
      )}
    </div>
  );
}

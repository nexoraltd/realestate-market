"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "found" | "not_found" | "error";

interface SubInfo {
  active: boolean;
  plan: string | null;
  customer_id: string | null;
  trial: boolean;
  status?: string;
  current_period_end: string | null;
}

export default function AccountContent() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleCheck() {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/subscription?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setSub(data);
      setStatus(data.active ? "found" : "not_found");
    } catch {
      setStatus("error");
    }
  }

  async function handlePortal() {
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
        const top = window.top || window.self;
        top.location.href = data.url;
      }
    } catch {
      alert("ポータルを開けませんでした。再度お試しください。");
    } finally {
      setPortalLoading(false);
    }
  }

  const planLabel =
    sub?.plan === "professional"
      ? "プロフェッショナル"
      : sub?.plan === "standard"
        ? "スタンダード"
        : "不明";

  return (
    <section className="py-12 bg-slate-50 min-h-[50vh]">
      <div className="max-w-lg mx-auto px-4">
        {/* メール入力フォーム */}
        {status !== "found" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-1">
              アカウント管理
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              登録メールアドレスを入力してください
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              placeholder="info@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none mb-3"
            />

            {status === "error" && (
              <p className="text-xs text-red-500 mb-3">
                エラーが発生しました。再度お試しください。
              </p>
            )}

            {status === "not_found" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                <p className="text-sm text-amber-800 font-medium mb-1">
                  有効なサブスクリプションが見つかりません
                </p>
                <p className="text-xs text-amber-600">
                  <span className="font-medium">{email}</span> に登録はありません。別のメールアドレスをお試しください。
                </p>
              </div>
            )}

            <button
              onClick={handleCheck}
              disabled={!email || status === "loading"}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition"
            >
              {status === "loading" ? "確認中..." : "アカウントを確認"}
            </button>
          </div>
        )}

        {/* サブスクリプション情報 */}
        {status === "found" && sub && (
          <div className="space-y-4">
            {/* ステータスカード */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">サブスクリプション</h2>
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {sub.trial ? "トライアル中" : "有効"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">メールアドレス</span>
                  <span className="font-medium text-slate-800">{email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">プラン</span>
                  <span className="font-medium text-slate-800">{planLabel}プラン</span>
                </div>
                {sub.current_period_end && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      {sub.trial ? "トライアル終了日" : "次回更新日"}
                    </span>
                    <span className="font-medium text-slate-800">
                      {new Date(sub.current_period_end).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* アクションカード */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">アカウント操作</h3>

              <div className="space-y-3">
                {/* プラン変更・解約 → Stripe Customer Portal */}
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3.5 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">
                        {portalLoading ? "読み込み中..." : "プラン変更・お支払い管理"}
                      </p>
                      <p className="text-xs text-slate-500">
                        プラン変更・支払い方法の更新・請求書の確認
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {/* 解約ボタン → 同じくStripe Customer Portal */}
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="w-full flex items-center justify-between bg-red-50 hover:bg-red-100 rounded-xl px-4 py-3.5 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-red-700">
                        {portalLoading ? "読み込み中..." : "サブスクリプションを解約"}
                      </p>
                      <p className="text-xs text-red-500">
                        解約しても{sub.trial ? "トライアル終了日" : "次回更新日"}まで利用可能です
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-red-300 group-hover:text-red-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ダッシュボードへの導線 */}
            <div className="text-center pt-2">
              <Link
                href="/dashboard"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                ← マイページに戻る
              </Link>
              <span className="mx-3 text-slate-300">|</span>
              <button
                onClick={() => {
                  setSub(null);
                  setEmail("");
                  setStatus("idle");
                }}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                別のアカウントで確認
              </button>
            </div>

            {/* サポート */}
            <div className="bg-slate-100 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-2">
                解約・プラン変更でお困りの場合
              </p>
              <a
                href="mailto:info@next-aura.com"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                サポートに連絡する →
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

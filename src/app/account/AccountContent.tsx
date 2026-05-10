"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";

type Step = "login" | "found" | "not_found";

interface SubInfo {
  active: boolean;
  plan: string | null;
  customer_id: string | null;
  trial: boolean;
  status?: string;
  current_period_end: string | null;
}

export default function AccountContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [step, setStep] = useState<Step>("login");
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress || "";

  // Clerk セッションがあれば自動的にサブスクリプション情報を取得
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !email) {
      setStep("login");
      return;
    }
    fetch(`/api/subscription?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.active) {
          setSub(data);
          setStep("found");
        } else {
          setStep("not_found");
        }
      })
      .catch(() => setStep("not_found"));
  }, [isLoaded, isSignedIn, email]);

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

  async function reset() {
    setSub(null);
    setStep("login");
    try {
      await signOut();
    } catch {}
  }

  const planLabel =
    sub?.plan === "professional"
      ? "プロフェッショナル"
      : sub?.plan === "standard"
        ? "スタンダード"
        : "不明";

  // ─── 未ログイン: ログインページへ誘導 ─────────────────────
  if (step === "login") {
    return (
      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              ログインが必要です
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              アカウント情報を表示するにはログインしてください。
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition"
            >
              ログインページへ
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ─── サブスク未検出 ──────────────────────────────────────────
  if (step === "not_found") {
    return (
      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 font-medium mb-1">
                有効なサブスクリプションが見つかりません
              </p>
              <p className="text-xs text-amber-600">
                <span className="font-medium">{email}</span> に有効なプランはありません。別のメールアドレスをお試しください。
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-sm"
              >
                別のアカウントでログイン
              </button>
              <Link
                href="/pricing"
                className="block w-full text-center border border-amber-400 text-amber-600 hover:bg-amber-50 font-bold py-3 rounded-xl transition text-sm"
              >
                プランを見る
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── サブスクリプション情報 ──────────────────────────────────
  return (
    <section className="py-12 bg-slate-50 min-h-[50vh]">
      <div className="max-w-lg mx-auto px-4">
        <div className="space-y-4">
          {/* ステータスカード */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">サブスクリプション</h2>
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {sub?.trial ? "トライアル中" : "有効"}
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
              {sub?.current_period_end && (
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
                    <p className="text-xs text-slate-500">プラン変更・支払い方法の更新・請求書の確認</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

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
                      解約しても{sub?.trial ? "トライアル終了日" : "次回更新日"}まで利用可能です
                    </p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-red-300 group-hover:text-red-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* ナビゲーション */}
          <div className="text-center pt-2">
            <Link href="/dashboard" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              ← マイページに戻る
            </Link>
            <span className="mx-3 text-slate-300">|</span>
            <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-700 font-medium">
              ログアウト
            </button>
          </div>

          {/* サポート */}
          <div className="bg-slate-100 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-2">解約・プラン変更でお困りの場合</p>
            <a href="mailto:info@next-aura.com" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              サポートに連絡する →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

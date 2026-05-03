"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Step = "login" | "sent" | "not_found" | "found";

const SESSION_KEY = "realestate_verified_email";

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
  const [step, setStep] = useState<Step>("login");
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  // マウント時: localStorage に保存された verified email があれば /api/subscription で検証してスキップ
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!saved) return;
    try {
      const { email: savedEmail } = JSON.parse(saved);
      if (!savedEmail) return;
      fetch(`/api/subscription?email=${encodeURIComponent(savedEmail)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.active) {
            setEmail(savedEmail);
            setSub(data);
            setStep("found");
          }
        })
        .catch(() => {});
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  async function handleMagicLink() {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "送信に失敗しました");
      } else {
        setStep("sent");
      }
    } catch {
      setError("通信エラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
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

  function reset() {
    setEmail("");
    setSub(null);
    setStep("login");
    setError("");
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }

  const planLabel =
    sub?.plan === "professional"
      ? "プロフェッショナル"
      : sub?.plan === "standard"
        ? "スタンダード"
        : "不明";

  // ─── ログインフォーム ───────────────────────────────────────
  if (step === "login") {
    return (
      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-1">
              ログイン
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              メールアドレスにログインリンクを送信します
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                placeholder="info@example.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-3">
                {error}
              </div>
            )}

            <button
              onClick={handleMagicLink}
              disabled={!email || loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition mb-4"
            >
              {loading ? "送信中..." : "ログインリンクを送る"}
            </button>

            <div className="text-center">
              <a
                href="/api/auth/google"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M17.64 9.2045c0-.638-.0573-1.2518-.164-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.6151z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.71H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.4141 5.4141 0 0 1 3.6818 9c0-.5973.1023-1.1773.2818-1.71V4.9582H.957A8.9965 8.9965 0 0 0 0 9c0 1.4509.3477 2.8223.957 4.0418l3.007-2.3318z" fill="#FBBC05"/>
                  <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
                </svg>
                Googleでログイン
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── リンク送信済み ──────────────────────────────────────────
  if (step === "sent") {
    return (
      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">メールを送信しました</h2>
            <p className="text-sm text-slate-500 mb-2">
              ログインリンクを <strong>{email}</strong> に送信しました。
            </p>
            <p className="text-xs text-slate-400 mb-6">
              メールが届かない場合は迷惑メールフォルダをご確認ください。リンクの有効期限は15分です。
            </p>
            <button
              onClick={() => { setStep("login"); setError(""); }}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
              ← 戻る
            </button>
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

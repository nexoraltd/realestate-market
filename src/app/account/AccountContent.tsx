"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Step = "login" | "no_password" | "forgot" | "forgot_sent" | "not_found" | "found";

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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>("login");
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

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

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.status === 403 && data.error === "no_password") {
        setStep("no_password");
      } else if (res.status === 401) {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else if (!res.ok) {
        setError(data.error || "ログインに失敗しました");
      } else if (!data.active) {
        setSub(data);
        setStep("not_found");
      } else {
        setSub(data);
        setStep("found");
        // dashboard と共通のセッションに保存
        const planKey = data.basePlan === "professional" || data.plan === "professional"
          ? "professional"
          : "standard";
        try {
          localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ email, plan: planKey })
          );
        } catch {}
      }
    } catch {
      setError("通信エラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    const target = forgotEmail || email;
    if (!target) return;
    setLoading(true);
    setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      });
      setStep("forgot_sent");
    } catch {
      setError("送信に失敗しました。再度お試しください。");
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
    setPassword("");
    setForgotEmail("");
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-1">
              アカウントにログイン
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              登録メールアドレスとパスワードを入力してください
            </p>

            {/* メール */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@example.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            {/* パスワード */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">パスワード</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="パスワードを入力"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-3">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={!email || !password || loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition mb-4"
            >
              {loading ? "確認中..." : "ログイン"}
            </button>

            {/* パスワードを忘れた方 */}
            <div className="text-center">
              <button
                onClick={() => { setForgotEmail(email); setStep("forgot"); setError(""); }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                パスワードを忘れた方はこちら
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── パスワード未設定 ───────────────────────────────────────
  if (step === "no_password") {
    return (
      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">パスワードが未設定です</h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              ご登録時のメールにパスワード設定リンクを送付しています。
              届いていない場合は以下のボタンで再送できます。
            </p>
            <button
              onClick={() => { setForgotEmail(email); handleForgot(); }}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-bold py-3 rounded-xl transition mb-3"
            >
              {loading ? "送信中..." : "パスワード設定メールを再送する"}
            </button>
            <button
              onClick={reset}
              className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium py-2"
            >
              ← ログイン画面に戻る
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ─── パスワードを忘れた ──────────────────────────────────────
  if (step === "forgot") {
    return (
      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">パスワードをリセット</h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              登録メールアドレスにリセットリンクを送ります。
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">メールアドレス</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleForgot()}
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
              onClick={handleForgot}
              disabled={!forgotEmail || loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition mb-3"
            >
              {loading ? "送信中..." : "リセットメールを送信"}
            </button>

            <div className="text-center space-y-2">
              <button
                onClick={() => { setStep("login"); setError(""); }}
                className="block w-full text-sm text-slate-500 hover:text-slate-700 font-medium py-2"
              >
                ← ログイン画面に戻る
              </button>
              <Link href="/contact" className="block text-sm text-amber-600 hover:text-amber-700 font-medium">
                サポートに問い合わせる →
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── リセットメール送信済み ──────────────────────────────────
  if (step === "forgot_sent") {
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
              パスワードリセットのリンクを <strong>{forgotEmail || email}</strong> に送信しました。
            </p>
            <p className="text-xs text-slate-400 mb-6">
              メールが届かない場合は迷惑メールフォルダをご確認ください。リンクの有効期限は24時間です。
            </p>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="block w-full text-sm text-slate-500 hover:text-slate-700 font-medium py-2"
              >
                ← ログイン画面に戻る
              </button>
              <Link
                href="/contact"
                className="block text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                それでも届かない場合はサポートへ →
              </Link>
            </div>
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

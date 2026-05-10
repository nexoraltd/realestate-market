"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs/legacy";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalNotice from "@/components/LegalNotice";

function LoginForm() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        window.location.origin;
      await signIn.create({
        strategy: "email_link",
        identifier: email,
        redirectUrl: `${appUrl}/account`,
      });
      setSent(true);
    } catch {
      setError("メール送信に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!isLoaded) return;
    setError(null);
    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        window.location.origin;
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${appUrl}/sso-callback`,
        redirectUrlComplete: `${appUrl}/account`,
      });
    } catch {
      setError("Googleログインに失敗しました。");
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm">
        確認メールを送信しました。メール内のリンクをクリックしてログインしてください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={!isLoaded}
        className="w-full border border-gray-300 bg-white text-gray-800 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
        Googleでログイン
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-gray-400 text-xs">または</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !isLoaded}
          className="w-full bg-[#4285F4] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#3367D6] disabled:opacity-50"
        >
          {loading ? "送信中..." : "ログインリンクを送信"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />

      <section className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">ログイン</h1>
              <p className="text-slate-400 text-sm">
                メールアドレスにログインリンクを送信します
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
            <p className="text-sm text-gray-500 mt-6 text-center">
              アカウントをお持ちでない方も{" "}
              <Link href="/login" className="text-[#4285F4] font-medium">
                同じメールアドレスで登録できます
              </Link>
            </p>
          </div>
        </div>
      </section>

      <LegalNotice />
      <Footer />
    </>
  );
}

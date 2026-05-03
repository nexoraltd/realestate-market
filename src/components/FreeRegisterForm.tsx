"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  onSuccess?: () => void;
  dark?: boolean;
}

export default function FreeRegisterForm({ onSuccess, dark = true }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "送信に失敗しました");
        return;
      }

      setSent(true);
      onSuccess?.();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = dark
    ? "w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
    : "w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm";

  if (sent) {
    return (
      <div className={`text-center p-6 rounded-xl ${dark ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"}`}>
        <div className="text-2xl mb-2">&#9993;</div>
        <p className={`font-bold ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
          ログインリンクを送信しました
        </p>
        <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {email} のメールをご確認ください。リンクの有効期限は15分です。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Googleで1クリック登録 */}
      <a
        href="/api/auth/google"
        className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-xl border font-semibold text-sm transition ${
          dark
            ? "border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
            : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M17.64 9.2045c0-.638-.0573-1.2518-.164-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.6151z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.71H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.4141 5.4141 0 0 1 3.6818 9c0-.5973.1023-1.1773.2818-1.71V4.9582H.957A8.9965 8.9965 0 0 0 0 9c0 1.4509.3477 2.8223.957 4.0418l3.007-2.3318z" fill="#FBBC05"/>
          <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
        </svg>
        Googleで1クリック登録
      </a>

      <div className="relative my-1">
        <div className={`border-t ${dark ? "border-slate-700" : "border-slate-200"}`} />
        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 text-xs ${dark ? "bg-slate-900 text-slate-500" : "bg-white text-slate-400"}`}>
          または
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold rounded-xl transition text-sm"
        >
          {loading ? "送信中..." : "ログインリンクをメールで受け取る"}
        </button>

        <p className={`text-center text-[11px] ${dark ? "text-slate-500" : "text-slate-500"}`}>
          既にアカウントをお持ちの方も同じメールアドレスで
          <Link href="/login" className="text-amber-500 hover:text-amber-400 ml-1">
            ログイン
          </Link>
          できます
        </p>
      </form>
    </div>
  );
}

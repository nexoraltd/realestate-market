"use client";

import { useState } from "react";
import Link from "next/link";
import { setSession } from "@/hooks/useTier";

interface Props {
  onSuccess?: () => void;
  dark?: boolean;
}

export default function FreeRegisterForm({ onSuccess, dark = true }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登録に失敗しました");
        return;
      }

      // メルマガ同時登録（チェックONの場合）
      if (newsletter) {
        fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => {});
      }

      setSession(email, "free");
      setSuccess(true);
      onSuccess?.();
      // Reload to apply tier change
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = dark
    ? "w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
    : "w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm";

  if (success) {
    return (
      <div className={`text-center p-6 rounded-xl ${dark ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"}`}>
        <div className="text-2xl mb-2">&#10003;</div>
        <p className={`font-bold ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
          登録完了しました
        </p>
        <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>
          ページを更新しています...
        </p>
      </div>
    );
  }

  return (
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
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード（8文字以上）"
          minLength={8}
          required
          className={inputClass}
        />
      </div>

      {/* メルマガ同時登録チェックボックス */}
      <label className={`flex items-start gap-2 cursor-pointer ${dark ? "text-slate-400" : "text-slate-600"}`}>
        <input
          type="checkbox"
          checked={newsletter}
          onChange={(e) => setNewsletter(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-500 accent-amber-500 cursor-pointer"
        />
        <span className="text-xs leading-snug">
          不動産相場レポート（月1回）をメールで受け取る
        </span>
      </label>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold rounded-xl transition text-sm"
      >
        {loading ? "登録中..." : "無料で会員登録する"}
      </button>

      <p className={`text-center text-[11px] ${dark ? "text-slate-500" : "text-slate-500"}`}>
        既にアカウントをお持ちの方は
        <Link href="/account" className="text-amber-500 hover:text-amber-400 ml-1">
          ログイン
        </Link>
      </p>
    </form>
  );
}

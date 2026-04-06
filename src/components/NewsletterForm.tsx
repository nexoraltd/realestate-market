"use client";

import { useState } from "react";

interface NewsletterFormProps {
  dark?: boolean;
}

export default function NewsletterForm({ dark = false }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setErrorMsg(data.error || "エラーが発生しました");
        setStatus("error");
      }
    } catch {
      setErrorMsg("通信エラーが発生しました");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={`rounded-2xl p-6 text-center ${dark ? "bg-slate-800/50 border border-slate-700" : "bg-emerald-50 border border-emerald-200"}`}>
        <svg className="w-8 h-8 mx-auto mb-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className={`font-bold ${dark ? "text-white" : "text-slate-800"}`}>登録完了</p>
        <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>
          確認メールをお送りしました。季刊レポートをお届けします。
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 ${dark ? "bg-slate-800/50 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${dark ? "bg-amber-500/10" : "bg-amber-100"}`}>
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className={`font-bold text-sm ${dark ? "text-white" : "text-slate-800"}`}>
            季刊 不動産相場レポート
          </h3>
          <p className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            四半期ごとの最新相場データ・トレンド分析を無料でお届け
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          required
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm outline-none transition ${
            dark
              ? "bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:border-amber-500"
              : "bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition"
        >
          {status === "loading" ? "..." : "登録"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
      )}
      <p className={`text-[10px] mt-2 ${dark ? "text-slate-600" : "text-slate-400"}`}>
        無料・いつでも解除可能。スパムは送りません。
      </p>
    </div>
  );
}

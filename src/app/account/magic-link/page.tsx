"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setSession } from "@/hooks/sessionStorage";

function MagicLinkContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const email = params.get("email");

  const [status, setStatus] = useState<"waiting" | "verifying" | "success" | "error">(
    token && email ? "verifying" : "waiting"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token || !email) return;
    fetch(
      `/api/auth/magic-link/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErrorMsg(data.error);
          setStatus("error");
        } else {
          const plan = data.plan || "free";
          setSession(email, plan);
          setStatus("success");
          setTimeout(() => router.push("/account"), 1500);
        }
      })
      .catch(() => {
        setErrorMsg("通信エラーが発生しました");
        setStatus("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "waiting") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">メールを確認してください</h1>
        <p className="text-sm text-slate-500 mb-4">
          ログインリンクをメールアドレスに送信しました。<br />
          メール内のリンクをクリックしてログインしてください。
        </p>
        <p className="text-xs text-slate-400">リンクの有効期限は15分です。</p>
      </div>
    );
  }

  if (status === "verifying") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500">認証中...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">ログイン成功</h1>
        <p className="text-sm text-slate-500">アカウントページに移動します...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">リンクが無効です</h1>
      <p className="text-sm text-slate-500 mb-6">
        {errorMsg || "このリンクは期限切れか、既に使用済みです。"}
      </p>
      <a
        href="/account"
        className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition"
      >
        ログインページに戻る
      </a>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <section className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-md mx-auto px-4">
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          </div>
        }>
          <MagicLinkContent />
        </Suspense>
      </div>
    </section>
  );
}

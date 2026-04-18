"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/hooks/useTier";

export default function GoogleSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get("email");
    const plan = searchParams.get("plan") || "free";

    if (email) {
      setSession(email, plan);
    }

    // セッション設定後にdashboardへ
    router.replace("/dashboard");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-300 text-sm">ログイン中...</p>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import GoogleSuccessClient from "./GoogleSuccessClient";

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-300 text-sm">ログイン中...</p>
          </div>
        </div>
      }
    >
      <GoogleSuccessClient />
    </Suspense>
  );
}

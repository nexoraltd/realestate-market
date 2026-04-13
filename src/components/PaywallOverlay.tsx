"use client";

import Link from "next/link";

export default function PaywallOverlay({
  feature,
  children,
}: {
  feature: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="filter blur-sm pointer-events-none select-none w-full overflow-hidden">
        {children}
      </div>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
        <div className="text-center px-4">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <p className="font-bold text-slate-800 mb-1">{feature}</p>
          <p className="text-sm text-slate-500 mb-1">
            スタンダードプラン以上でご利用いただけます
          </p>
          <p className="text-xs text-slate-400 mb-3">¥2,980/月 · 14日間無料トライアル</p>
          <Link
            href="/register?plan=standard&interval=monthly"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2 px-5 rounded-lg transition"
          >
            無料で試す
          </Link>
        </div>
      </div>
    </div>
  );
}

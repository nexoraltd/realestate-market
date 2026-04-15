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
      <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center rounded-xl">
        <div className="text-center px-4 max-w-sm">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <p className="font-bold text-slate-800 text-lg mb-2">{feature}</p>
          <ul className="text-left text-sm text-slate-600 mb-4 space-y-1.5 mx-auto inline-block">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 text-xs">&#10003;</span>
              取引データ全件表示・CSV出力
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 text-xs">&#10003;</span>
              AI査定 無制限（10年予測付き）
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 text-xs">&#10003;</span>
              14日間無料 — カード登録後すぐ解約OK
            </li>
          </ul>
          <Link
            href="/register?plan=standard&interval=monthly"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-amber-500/20 text-base"
          >
            14日間無料で試す →
          </Link>
          <p className="text-xs text-slate-400 mt-2">¥2,980/月 · いつでも解約可能</p>
        </div>
      </div>
    </div>
  );
}

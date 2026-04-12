"use client";

import Link from "next/link";
import type { Tier } from "@/hooks/useTier";

const TIER_ORDER: Record<Tier, number> = {
  guest: 0,
  free: 1,
  standard: 2,
  professional: 3,
};

interface Props {
  currentTier: Tier;
  requiredTier: Tier;
  children: React.ReactNode;
  ctaText?: string;
  ctaHref?: string;
  compact?: boolean;
}

export default function TierGate({
  currentTier,
  requiredTier,
  children,
  ctaText,
  ctaHref,
  compact = false,
}: Props) {
  if (TIER_ORDER[currentTier] >= TIER_ORDER[requiredTier]) {
    return <>{children}</>;
  }

  const isUpgradeToFree = requiredTier === "free";
  const defaultCtaText = isUpgradeToFree
    ? "無料会員登録で見る"
    : "有料プランで全機能を使う";
  const defaultCtaHref = isUpgradeToFree ? "/register?plan=free" : "/pricing";

  return (
    <div className="relative">
      <div className="pointer-events-none select-none" style={{ filter: "blur(6px)" }}>
        {children}
      </div>
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl ${compact ? "p-3" : "p-6"}`}>
        <div className={`w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center ${compact ? "mb-2" : "mb-3"}`}>
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className={`text-white font-bold text-center ${compact ? "text-xs mb-2" : "text-sm mb-3"}`}>
          {isUpgradeToFree ? "無料会員登録で解放" : "有料プランで解放"}
        </p>
        <Link
          href={ctaHref || defaultCtaHref}
          className={`inline-block bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition ${compact ? "text-xs px-4 py-2" : "text-sm px-6 py-2.5"}`}
        >
          {ctaText || defaultCtaText}
        </Link>
        {!isUpgradeToFree && (
          <p className={`text-slate-400 text-center mt-1.5 ${compact ? "text-[10px]" : "text-xs"}`}>
            ¥2,980/月〜 · 14日間無料トライアル
          </p>
        )}
      </div>
    </div>
  );
}

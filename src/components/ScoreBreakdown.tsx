"use client";

interface ScoreFactor {
  score: number;
  label: string;
  weight: number;
}

interface Props {
  breakdown: Record<string, ScoreFactor>;
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function getTextColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "優秀";
  if (score >= 60) return "良好";
  if (score >= 40) return "普通";
  return "要改善";
}

const FACTOR_ICONS: Record<string, string> = {
  priceTrend: "📈",
  stationAccess: "🚉",
  areaDemand: "🏘️",
  priceGap: "💰",
  liquidity: "🔄",
};

const FACTOR_DESCRIPTIONS: Record<string, string> = {
  priceTrend: "過去5年間の㎡単価の上昇・下落傾向",
  stationAccess: "最寄り駅までの徒歩分数による利便性",
  areaDemand: "エリア全体の取引件数（需要の厚さ）",
  priceGap: "エリア中央値と比較した割安度",
  liquidity: "直近1年の取引頻度（売りやすさ）",
};

export default function ScoreBreakdown({ breakdown }: Props) {
  const factors = Object.entries(breakdown).sort(
    ([, a], [, b]) => b.weight - a.weight
  );

  return (
    <div className="space-y-4">
      {factors.map(([key, factor]) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">{FACTOR_ICONS[key] || "📊"}</span>
              <span className="text-xs font-medium text-slate-300">
                {factor.label}
              </span>
              <span className="text-[10px] text-slate-600">
                ({factor.weight}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] ${getTextColor(factor.score)}`}>
                {getScoreLabel(factor.score)}
              </span>
              <span
                className={`text-sm font-bold tabular-nums ${getTextColor(
                  factor.score
                )}`}
              >
                {factor.score}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${getBarColor(
                factor.score
              )}`}
              style={{ width: `${factor.score}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-600 mt-1">
            {FACTOR_DESCRIPTIONS[key] || ""}
          </p>
        </div>
      ))}
    </div>
  );
}

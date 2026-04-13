"use client";

interface Props {
  total: number;
  grade: string;
}

const GRADE_CONFIG: Record<string, { color: string; bgGlow: string; label: string }> = {
  S: { color: "#3b82f6", bgGlow: "shadow-blue-500/20", label: "最高ランク" },
  A: { color: "#10b981", bgGlow: "shadow-emerald-500/20", label: "優良" },
  B: { color: "#f59e0b", bgGlow: "shadow-amber-500/20", label: "良好" },
  C: { color: "#f97316", bgGlow: "shadow-orange-500/20", label: "標準" },
  D: { color: "#ef4444", bgGlow: "shadow-red-500/20", label: "要注意" },
};

export default function AssetScoreGauge({ total, grade }: Props) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG.C;
  // Semi-circle gauge: 180 degrees, score 0-100 maps to angle
  const angle = (total / 100) * 180;
  const radius = 80;
  const cx = 100;
  const cy = 95;

  // Arc path for background (full semi-circle)
  const bgArc = describeArc(cx, cy, radius, 180, 360);
  // Arc path for score
  const scoreArc = describeArc(cx, cy, radius, 180, 180 + angle);

  // Needle endpoint
  const needleAngle = 180 + angle;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleX = cx + (radius - 10) * Math.cos(needleRad);
  const needleY = cy + (radius - 10) * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="#334155"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Score arc */}
        <path
          d={scoreArc}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = 180 + (tick / 100) * 180;
          const rad = (tickAngle * Math.PI) / 180;
          const x1 = cx + (radius + 10) * Math.cos(rad);
          const y1 = cy + (radius + 10) * Math.sin(rad);
          const x2 = cx + (radius + 16) * Math.cos(rad);
          const y2 = cy + (radius + 16) * Math.sin(rad);
          return (
            <g key={tick}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="1.5" />
              <text
                x={cx + (radius + 24) * Math.cos(rad)}
                y={cy + (radius + 24) * Math.sin(rad)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#64748b"
                fontSize="8"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={config.color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4" fill={config.color} />

        {/* Score text */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="800"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="9"
        >
          / 100
        </text>
      </svg>

      {/* Grade badge */}
      <div
        className="mt-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
        style={{
          borderColor: `${config.color}40`,
          backgroundColor: `${config.color}15`,
        }}
      >
        <span
          className="text-xl font-black"
          style={{ color: config.color }}
        >
          {grade}
        </span>
        <span className="text-xs text-slate-400">{config.label}</span>
      </div>
    </div>
  );
}

// Helper: SVG arc path
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}

"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

interface HistoricalPoint {
  year: number;
  avgPricePerSqm: number;
  totalPrice: number;
}

interface ForecastPoint {
  year: number;
  pessimistic: number;
  standard: number;
  optimistic: number;
}

interface Props {
  historicalTrend: HistoricalPoint[];
  forecast: ForecastPoint[];
  annualGrowthRate: { pessimistic: number; standard: number; optimistic: number };
  currentEstimate: number;
}

function formatPrice(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}億`;
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString()}万`;
  return String(value);
}

function formatRate(rate: number): string {
  const pct = (rate * 100).toFixed(1);
  return rate >= 0 ? `+${pct}%` : `${pct}%`;
}

export default function FuturePriceChart({
  historicalTrend,
  forecast,
  annualGrowthRate,
  currentEstimate,
}: Props) {
  const currentYear = new Date().getFullYear();

  // Merge historical + forecast into one dataset
  const data = [
    ...historicalTrend.map((h) => ({
      year: h.year,
      actual: h.totalPrice,
      pessimistic: null as number | null,
      standard: null as number | null,
      optimistic: null as number | null,
    })),
    // Bridge point: current estimate connects actual to forecast
    {
      year: currentYear,
      actual: currentEstimate,
      pessimistic: currentEstimate,
      standard: currentEstimate,
      optimistic: currentEstimate,
    },
    ...forecast.map((f) => ({
      year: f.year,
      actual: null as number | null,
      pessimistic: f.pessimistic,
      standard: f.standard,
      optimistic: f.optimistic,
    })),
  ];

  const allValues = data.flatMap((d) =>
    [d.actual, d.pessimistic, d.standard, d.optimistic].filter(
      (v): v is number => v !== null && v > 0
    )
  );
  const minVal = Math.min(...allValues) * 0.85;
  const maxVal = Math.max(...allValues) * 1.1;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-6 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
        <h2 className="text-lg font-bold text-white">将来価格予測</h2>
        <span className="ml-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
          AI予測
        </span>
      </div>
      <p className="text-slate-500 text-xs mb-6">
        過去5年間の実取引データから線形回帰で10年後まで予測。3シナリオ（楽観・標準・悲観）で表示。
      </p>

      {/* Growth rate badges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "悲観シナリオ",
            rate: annualGrowthRate.pessimistic,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
          },
          {
            label: "標準シナリオ",
            rate: annualGrowthRate.standard,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          },
          {
            label: "楽観シナリオ",
            rate: annualGrowthRate.optimistic,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-3 text-center ${s.bg}`}
          >
            <div className="text-[10px] text-slate-400 mb-1">{s.label}</div>
            <div className={`text-sm font-bold ${s.color}`}>
              年率 {formatRate(s.rate)}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-80" style={{ minWidth: 200, minHeight: 100 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={{ stroke: "#475569" }}
            />
            <YAxis
              tickFormatter={(v) => formatPrice(v)}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              domain={[minVal, maxVal]}
              tickLine={{ stroke: "#475569" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#e2e8f0",
              }}
              formatter={(value, name) => {
                if (value == null) return ["-", String(name)];
                const labels: Record<string, string> = {
                  actual: "実績",
                  optimistic: "楽観",
                  standard: "標準",
                  pessimistic: "悲観",
                };
                return [`${formatPrice(Number(value))}円`, labels[String(name)] || String(name)];
              }}
              labelFormatter={(label) => `${label}年`}
            />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  actual: "実績価格",
                  optimistic: "楽観シナリオ",
                  standard: "標準シナリオ",
                  pessimistic: "悲観シナリオ",
                };
                return labels[value] || value;
              }}
              wrapperStyle={{ fontSize: "11px" }}
            />

            {/* Forecast confidence band (optimistic to pessimistic) */}
            <Area
              type="monotone"
              dataKey="optimistic"
              stroke="none"
              fill="url(#forecastBand)"
              fillOpacity={1}
              legendType="none"
              connectNulls={false}
            />

            {/* Boundary at current year */}
            <ReferenceLine
              x={currentYear}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{
                value: "現在",
                position: "top",
                fill: "#94a3b8",
                fontSize: 10,
              }}
            />

            {/* Historical actual line */}
            <Line
              type="monotone"
              dataKey="actual"
              name="actual"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4, fill: "#f59e0b", stroke: "#1e293b", strokeWidth: 2 }}
              connectNulls={false}
            />

            {/* Forecast lines */}
            <Line
              type="monotone"
              dataKey="optimistic"
              name="optimistic"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="standard"
              name="standard"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="pessimistic"
              name="pessimistic"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 5yr / 10yr summary */}
      {forecast.length >= 10 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            { label: "5年後の予測価格", idx: 4 },
            { label: "10年後の予測価格", idx: 9 },
          ].map(({ label, idx }) => (
            <div
              key={label}
              className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4"
            >
              <div className="text-[10px] text-slate-500 mb-2">{label}（{forecast[idx].year}年）</div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-emerald-400">楽観</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {formatPrice(forecast[idx].optimistic)}円
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-amber-400">標準</span>
                  <span className="text-sm font-bold text-amber-400">
                    {formatPrice(forecast[idx].standard)}円
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-blue-400">悲観</span>
                  <span className="text-sm font-bold text-blue-400">
                    {formatPrice(forecast[idx].pessimistic)}円
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-4 leading-relaxed">
        ※ 過去の取引データに基づく統計的予測であり、将来の価格を保証するものではありません。
        金利動向・人口変動・再開発等の外的要因は考慮されていません。
      </p>
    </div>
  );
}

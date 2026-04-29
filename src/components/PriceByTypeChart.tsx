"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

interface Transaction {
  Type: string;
  TradePrice: string;
}

const TYPE_COLORS: Record<string, string> = {
  "宅地(土地)": "#3b82f6",
  "中古マンション等": "#8b5cf6",
  "宅地(土地と建物)": "#f59e0b",
  "林地": "#10b981",
  "農地": "#84cc16",
};

export default function PriceByTypeChart({ transactions }: { transactions: Transaction[] }) {
  const byType: Record<string, number[]> = {};
  for (const t of transactions) {
    const price = Number(t.TradePrice);
    if (!price || !t.Type) continue;
    if (!byType[t.Type]) byType[t.Type] = [];
    byType[t.Type].push(price);
  }

  const data = Object.entries(byType)
    .map(([type, prices]) => ({
      type,
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length / 10000),
      count: prices.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  if (!data.length) return <p className="text-slate-400 text-sm text-center py-8">データなし</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="type"
          tick={{ fontSize: 11 }}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v: number) => `${v.toLocaleString()}万`}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(value) =>
            typeof value === "number"
              ? [`${value.toLocaleString()}万円`, "平均取引価格"]
              : [String(value), "平均取引価格"]
          }
        />
        <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.type}
              fill={TYPE_COLORS[entry.type] ?? "#64748b"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

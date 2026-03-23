"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Transaction {
  TradePrice: string;
  Type: string;
  Period: string;
}

function formatPrice(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}億`;
  if (value >= 10000) return `${Math.round(value / 10000)}万`;
  return String(value);
}

export default function TrendChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Group by period
  const periodMap: Record<string, { total: number; count: number }> = {};

  transactions.forEach((t) => {
    const price = Number(t.TradePrice);
    if (!price || isNaN(price) || !t.Period) return;
    if (!periodMap[t.Period]) periodMap[t.Period] = { total: 0, count: 0 };
    periodMap[t.Period].total += price;
    periodMap[t.Period].count++;
  });

  const data = Object.entries(periodMap)
    .map(([period, v]) => ({
      period,
      avgPrice: Math.round(v.total / v.count),
      count: v.count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  if (data.length < 2) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        トレンド表示には複数期間のデータが必要です
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => formatPrice(v)} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [
              `${formatPrice(Number(value))}円`,
              "平均取引価格",
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgPrice"
            name="平均取引価格"
            stroke="#2b6cb0"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

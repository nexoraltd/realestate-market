"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Transaction {
  Type: string;
  TradePrice: string;
  Period: string;
  Area: string;
}

function formatPrice(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}億`;
  if (value >= 10000) return `${Math.round(value / 10000)}万`;
  return String(value);
}

export default function PriceChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const typeMap: Record<string, { count: number; totalPrice: number }> = {};

  transactions.forEach((t) => {
    const price = Number(t.TradePrice);
    if (!price || isNaN(price)) return;
    const type = t.Type || "その他";
    if (!typeMap[type]) typeMap[type] = { count: 0, totalPrice: 0 };
    typeMap[type].count++;
    typeMap[type].totalPrice += price;
  });

  const chartData = Object.entries(typeMap)
    .map(([type, v]) => ({
      type,
      avgPrice: Math.round(v.totalPrice / v.count),
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        グラフを表示するデータがありません
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="type"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(v) => formatPrice(v)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [
              `${formatPrice(Number(value))}円`,
              "平均取引価格",
            ]}
            labelFormatter={(label) => `種別: ${label}`}
          />
          <Legend />
          <Bar
            dataKey="avgPrice"
            name="平均取引価格"
            fill="#2b6cb0"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

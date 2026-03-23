"use client";

interface Transaction {
  TradePrice: string;
  Area: string;
  Type: string;
}

function formatYen(n: number): string {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}億円`;
  if (n >= 10000) return `${Math.round(n / 10000).toLocaleString()}万円`;
  return `${n.toLocaleString()}円`;
}

export default function StatsCards({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const prices = transactions
    .map((t) => Number(t.TradePrice))
    .filter((p) => p > 0 && !isNaN(p));

  if (prices.length === 0) return null;

  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
  const max = Math.max(...prices);
  const min = Math.min(...prices);

  const stats = [
    { label: "取引件数", value: `${transactions.length}件`, color: "bg-blue-50 text-blue-700" },
    { label: "平均取引価格", value: formatYen(avg), color: "bg-orange-50 text-orange-700" },
    { label: "中央値", value: formatYen(median), color: "bg-green-50 text-green-700" },
    { label: "最高価格", value: formatYen(max), color: "bg-purple-50 text-purple-700" },
    { label: "最低価格", value: formatYen(min), color: "bg-gray-50 text-gray-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
          <div className="text-xs font-medium mb-1 opacity-80">{s.label}</div>
          <div className="text-lg font-bold">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

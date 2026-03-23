"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PREFECTURES } from "@/lib/prefectures";

interface City {
  id: string;
  name: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2005 + 1 }, (_, i) =>
  String(currentYear - i)
);

export default function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [prefCode, setPrefCode] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [year, setYear] = useState(String(currentYear - 1));
  const [quarter, setQuarter] = useState("1");
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!prefCode) {
      setCities([]);
      setCityCode("");
      return;
    }
    setLoading(true);
    fetch(`/api/cities?area=${prefCode}`)
      .then((r) => r.json())
      .then((data) => {
        setCities(Array.isArray(data) ? data : []);
        setCityCode("");
      })
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [prefCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefCode) return;
    const params = new URLSearchParams({
      area: prefCode,
      year,
      quarter,
      ...(cityCode && { city: cityCode }),
    });
    router.push(`/search?${params.toString()}`);
  };

  const selectClass =
    "w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent outline-none transition";

  return (
    <form onSubmit={handleSubmit} className={compact ? "" : "max-w-2xl mx-auto"}>
      <div className={`grid ${compact ? "grid-cols-2 md:grid-cols-5" : "grid-cols-1 md:grid-cols-2"} gap-3`}>
        <div className={compact ? "" : "md:col-span-1"}>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            都道府県
          </label>
          <select
            value={prefCode}
            onChange={(e) => setPrefCode(e.target.value)}
            className={selectClass}
            required
          >
            <option value="">選択してください</option>
            {PREFECTURES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            市区町村
          </label>
          <select
            value={cityCode}
            onChange={(e) => setCityCode(e.target.value)}
            className={selectClass}
            disabled={!prefCode || loading}
          >
            <option value="">全域</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            年
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={selectClass}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            四半期
          </label>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className={selectClass}
          >
            <option value="1">第1四半期 (1-3月)</option>
            <option value="2">第2四半期 (4-6月)</option>
            <option value="3">第3四半期 (7-9月)</option>
            <option value="4">第4四半期 (10-12月)</option>
          </select>
        </div>

        <div className={compact ? "flex items-end" : "md:col-span-2"}>
          <button
            type="submit"
            className="w-full bg-[#ed8936] hover:bg-orange-500 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-md hover:shadow-lg"
          >
            相場を検索
          </button>
        </div>
      </div>
    </form>
  );
}

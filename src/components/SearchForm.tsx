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
    "w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm";

  const selectClassCompact =
    "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm";

  const sc = compact ? selectClassCompact : selectClass;

  return (
    <form onSubmit={handleSubmit} className={compact ? "" : "max-w-2xl mx-auto"}>
      <div
        className={`grid ${
          compact ? "grid-cols-2 md:grid-cols-5" : "grid-cols-1 md:grid-cols-2"
        } gap-3`}
      >
        <div className={compact ? "" : "md:col-span-1"}>
          <label className={`block text-xs font-medium mb-1 ${compact ? "text-slate-500" : "text-slate-400"}`}>
            都道府県
          </label>
          <select
            value={prefCode}
            onChange={(e) => setPrefCode(e.target.value)}
            className={sc}
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
          <label className={`block text-xs font-medium mb-1 ${compact ? "text-slate-500" : "text-slate-400"}`}>
            市区町村
          </label>
          <select
            value={cityCode}
            onChange={(e) => setCityCode(e.target.value)}
            className={`${sc} ${!prefCode ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={!prefCode || loading}
          >
            <option value="">{!prefCode ? "都道府県を先に選択" : "全域"}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-xs font-medium mb-1 ${compact ? "text-slate-500" : "text-slate-400"}`}>
            年
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={sc}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-xs font-medium mb-1 ${compact ? "text-slate-500" : "text-slate-400"}`}>
            四半期
          </label>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className={sc}
          >
            <option value="1">Q1 (1-3月)</option>
            <option value="2">Q2 (4-6月)</option>
            <option value="3">Q3 (7-9月)</option>
            <option value="4">Q4 (10-12月)</option>
          </select>
        </div>

        <div className={compact ? "flex items-end" : "md:col-span-2"}>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-md hover:shadow-lg text-sm"
          >
            相場を検索
          </button>
        </div>
      </div>
    </form>
  );
}

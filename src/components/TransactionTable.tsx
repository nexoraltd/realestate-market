"use client";

import { useState } from "react";

interface Transaction {
  Type: string;
  Municipality: string;
  DistrictName: string;
  TradePrice: string;
  Area: string;
  UnitPrice: string;
  BuildingYear: string;
  FloorPlan: string;
  Structure: string;
  CityPlanning: string;
  Period: string;
  Use: string;
  TotalFloorArea: string;
  NearestStation?: string;
  TimeToNearestStation?: string;
}

function formatYen(val: string): string {
  const n = Number(val);
  if (!n || isNaN(n)) return val || "-";
  if (n >= 100000000) return `${(n / 100000000).toFixed(2)}億円`;
  if (n >= 10000) return `${Math.round(n / 10000).toLocaleString()}万円`;
  return `${n.toLocaleString()}円`;
}

export default function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const types = Array.from(new Set(transactions.map((t) => t.Type).filter(Boolean)));

  const filtered =
    typeFilter === "all"
      ? transactions
      : transactions.filter((t) => t.Type === typeFilter);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setTypeFilter("all"); setPage(0); }}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            typeFilter === "all"
              ? "bg-[#1a365d] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全て ({transactions.length})
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => { setTypeFilter(type); setPage(0); }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              typeFilter === type
                ? "bg-[#1a365d] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type} ({transactions.filter((t) => t.Type === type).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["種別", "所在地", "取引価格", "面積", "間取り", "築年", "最寄駅", "徒歩", "用途地域", "時期"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            ) : (
              pageData.map((t, i) => {
                const isMasked = i >= 2; // 3件目以降はマスク
                return (
                <tr
                  key={i}
                  className={`border-t border-gray-100 transition ${isMasked ? "" : "hover:bg-blue-50/50"}`}
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                      {t.Type || "-"}
                    </span>
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap ${isMasked ? "blur-[3px] select-none" : ""}`}>
                    {t.Municipality}
                    {t.DistrictName ? ` ${t.DistrictName}` : ""}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap font-semibold text-[#1a365d] ${isMasked ? "blur-[3px] select-none" : ""}`}>
                    {formatYen(t.TradePrice)}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap ${isMasked ? "blur-[3px] select-none" : ""}`}>
                    {t.Area ? `${t.Area}m²` : "-"}
                    {t.TotalFloorArea ? ` (延床${t.TotalFloorArea}m²)` : ""}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{t.FloorPlan || "-"}</td>
                  <td className={`px-3 py-2 whitespace-nowrap ${isMasked ? "blur-[3px] select-none" : ""}`}>{t.BuildingYear || "-"}</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-xs ${isMasked ? "blur-[3px] select-none" : ""}`}>
                    {t.NearestStation || "-"}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-xs ${isMasked ? "blur-[3px] select-none" : ""}`}>
                    {t.TimeToNearestStation ? `${t.TimeToNearestStation}分` : "-"}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-xs ${isMasked ? "blur-[3px] select-none" : ""}`}>
                    {t.CityPlanning || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {t.Period || "-"}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm"
          >
            前へ
          </button>
          <span className="text-sm text-gray-600">
            {page + 1} / {totalPages} ページ
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}

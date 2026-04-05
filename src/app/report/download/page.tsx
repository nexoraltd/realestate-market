"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ReportData {
  areaName: string;
  area: string;
  summary: {
    totalTransactions: number;
    avgPrice: number;
    medianPrice: number;
    minPrice: number;
    maxPrice: number;
  };
  byType: { type: string; count: number; avgPrice: number }[];
  byYear: { year: string; count: number; avgPrice: number }[];
}

function fmtPrice(yen: number): string {
  if (yen >= 100_000_000) return `${(yen / 100_000_000).toFixed(1)}億円`;
  return `${Math.round(yen / 10_000).toLocaleString()}万円`;
}

export default function ReportDownloadPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setError("セッションIDが見つかりません。");
      setStatus("error");
      return;
    }

    fetch(`/api/report-download?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setStatus("error");
        } else {
          setReport(data);
          setStatus("success");
        }
      })
      .catch(() => {
        setError("レポートの取得に失敗しました。");
        setStatus("error");
      });
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {status === "loading" && (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-400">レポートを生成中...</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">{error}</p>
              <a href="/search" className="text-amber-400 hover:underline">検索に戻る</a>
            </div>
          )}

          {status === "success" && report && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-emerald-400 text-xs font-semibold">購入完了</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
                  {report.areaName} 不動産相場レポート
                </h1>
                <p className="text-slate-400 text-sm">過去5年間の取引データ分析</p>
              </div>

              {/* サマリー */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 rounded-full bg-amber-500" />
                  概要
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "取引件数", value: report.summary.totalTransactions.toLocaleString() + "件" },
                    { label: "平均価格", value: fmtPrice(report.summary.avgPrice) },
                    { label: "中央値", value: fmtPrice(report.summary.medianPrice) },
                    { label: "最低価格", value: fmtPrice(report.summary.minPrice) },
                    { label: "最高価格", value: fmtPrice(report.summary.maxPrice) },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-900/50 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 種別別 */}
              {report.byType.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 rounded-full bg-blue-500" />
                    種別別集計
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500 text-xs border-b border-slate-700">
                          <th className="text-left pb-2 pr-4">種別</th>
                          <th className="text-right pb-2 pr-4">件数</th>
                          <th className="text-right pb-2">平均価格</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {report.byType.map((row) => (
                          <tr key={row.type}>
                            <td className="py-2.5 pr-4 text-slate-300">{row.type}</td>
                            <td className="py-2.5 pr-4 text-right text-slate-400">{row.count.toLocaleString()}</td>
                            <td className="py-2.5 text-right font-medium text-white">{fmtPrice(row.avgPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 年度別推移 */}
              {report.byYear.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 rounded-full bg-emerald-500" />
                    年度別推移
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500 text-xs border-b border-slate-700">
                          <th className="text-left pb-2 pr-4">年度</th>
                          <th className="text-right pb-2 pr-4">件数</th>
                          <th className="text-right pb-2">平均価格</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {report.byYear.map((row) => (
                          <tr key={row.year}>
                            <td className="py-2.5 pr-4 text-slate-300">{row.year}年</td>
                            <td className="py-2.5 pr-4 text-right text-slate-400">{row.count.toLocaleString()}</td>
                            <td className="py-2.5 text-right font-medium text-white">{fmtPrice(row.avgPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-600 text-center">
                ※ 国土交通省「不動産情報ライブラリ」のデータに基づく分析です。
              </p>
            </div>
          )}

          {/* アップセル: スタンダードプランへの誘導 */}
          {status === "success" && (
            <div className="mt-10 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-slate-800/70 to-slate-900 p-8 shadow-xl">
              <div className="text-center">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  レポートをご購入いただきありがとうございます
                </p>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  他のエリアも見たい / 継続的に分析したい方へ
                </h3>
                <p className="mb-6 text-sm text-slate-300">
                  スタンダードプラン（¥2,980/月）なら、<strong className="text-amber-300">全エリアのレポートが見放題</strong>。<br className="hidden sm:inline" />
                  CSV一括ダウンロード・無制限検索・価格トレンド分析も使い放題です。<br className="hidden sm:inline" />
                  今なら14日間無料トライアルで、途中解約すれば一切課金されません。
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href="/register?plan=standard&interval=monthly"
                    className="inline-block rounded-xl bg-amber-500 px-10 py-3 text-base font-bold tracking-wide text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-400"
                  >
                    スタンダードを14日間無料で試す
                  </a>
                  <a
                    href="/pricing"
                    className="inline-block rounded-xl border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-amber-500 hover:text-amber-400"
                  >
                    プラン比較を見る
                  </a>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  ¥980 × 3エリア = ¥2,940。スタンダードプランは月¥2,980で全エリア見放題なので、3エリア以上見るなら断然お得です。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

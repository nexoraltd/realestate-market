"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { PlanKey } from "@/lib/planPermissions";

const prefectures: Record<string, string> = {
  "01": "北海道", "02": "青森県", "03": "岩手県", "04": "宮城県", "05": "秋田県",
  "06": "山形県", "07": "福島県", "08": "茨城県", "09": "栃木県", "10": "群馬県",
  "11": "埼玉県", "12": "千葉県", "13": "東京都", "14": "神奈川県", "15": "新潟県",
  "16": "富山県", "17": "石川県", "18": "福井県", "19": "山梨県", "20": "長野県",
  "21": "岐阜県", "22": "静岡県", "23": "愛知県", "24": "三重県", "25": "滋賀県",
  "26": "京都府", "27": "大阪府", "28": "兵庫県", "29": "奈良県", "30": "和歌山県",
  "31": "鳥取県", "32": "島根県", "33": "岡山県", "34": "広島県", "35": "山口県",
  "36": "徳島県", "37": "香川県", "38": "愛媛県", "39": "高知県", "40": "福岡県",
  "41": "佐賀県", "42": "長崎県", "43": "熊本県", "44": "大分県", "45": "宮崎県",
  "46": "鹿児島県", "47": "沖縄県",
};

type ProTab = "api" | "report" | "team";

interface Props {
  planKey: PlanKey;
  email: string;
}

// ============================================================
// Sub-components
// ============================================================

/** API連携パネル */
function ApiPanel({ email }: { email: string }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const fetchKey = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/api-keys?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setApiKey(data.apiKey || null);
    } catch {
      setApiKey(null);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { fetchKey(); }, [fetchKey]);

  async function generateKey() {
    setGenerating(true);
    try {
      const res = await fetchWithAuth("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        setShowKey(true);
      }
    } catch {
      alert("APIキーの生成に失敗しました。");
    } finally {
      setGenerating(false);
    }
  }

  async function revokeKey() {
    if (!confirm("APIキーを無効化しますか？既存の連携が使えなくなります。")) return;
    try {
      await fetchWithAuth("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setApiKey(null);
      setShowKey(false);
    } catch {
      alert("APIキーの無効化に失敗しました。");
    }
  }

  function copyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="text-center py-8 text-sm text-slate-400">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* APIキー管理 */}
      <div className="bg-slate-50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3">APIキー</h3>
        {apiKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 truncate">
                {showKey ? apiKey : "••••••••••••••••••••••••••••••••"}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                title={showKey ? "非表示" : "表示"}
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {showKey ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  )}
                </svg>
              </button>
              <button
                onClick={copyKey}
                className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                title="コピー"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={revokeKey}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition"
            >
              APIキーを無効化
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-3">
              APIキーを発行して外部システムからデータにアクセスできます。
            </p>
            <button
              onClick={generateKey}
              disabled={generating}
              className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-5 rounded-lg transition text-sm"
            >
              {generating ? "生成中..." : "APIキーを発行する"}
            </button>
          </div>
        )}
      </div>

      {/* APIドキュメント */}
      <div className="bg-slate-50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-3">APIエンドポイント</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">GET</span>
              <code className="text-xs text-slate-600 font-mono">/api/public/transactions</code>
            </div>
            <p className="text-xs text-slate-500 mb-2">取引データを取得します。</p>
            <div className="bg-white rounded-lg border border-slate-200 p-3 text-xs font-mono text-slate-600 overflow-x-auto">
              <div className="text-slate-400 mb-1"># リクエスト例</div>
              <div>curl -H &quot;x-api-key: YOUR_API_KEY&quot; \</div>
              <div className="pl-4">&quot;https://realestate-market.vercel.app/api/public/transactions?area=13&amp;year=2025&amp;quarter=1&quot;</div>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700 mb-1">パラメータ</p>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="text-left px-2 py-1.5 font-medium text-slate-600 border-b border-slate-100">パラメータ</th>
                  <th className="text-left px-2 py-1.5 font-medium text-slate-600 border-b border-slate-100">必須</th>
                  <th className="text-left px-2 py-1.5 font-medium text-slate-600 border-b border-slate-100">説明</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="px-2 py-1.5 font-mono text-slate-700 border-b border-slate-50">area</td><td className="px-2 py-1.5 border-b border-slate-50">✅</td><td className="px-2 py-1.5 text-slate-500 border-b border-slate-50">都道府県コード（01〜47）</td></tr>
                <tr><td className="px-2 py-1.5 font-mono text-slate-700 border-b border-slate-50">year</td><td className="px-2 py-1.5 border-b border-slate-50">任意</td><td className="px-2 py-1.5 text-slate-500 border-b border-slate-50">対象年度（デフォルト: 2024）</td></tr>
                <tr><td className="px-2 py-1.5 font-mono text-slate-700 border-b border-slate-50">quarter</td><td className="px-2 py-1.5 border-b border-slate-50">任意</td><td className="px-2 py-1.5 text-slate-500 border-b border-slate-50">四半期（1〜4、デフォルト: 1）</td></tr>
                <tr><td className="px-2 py-1.5 font-mono text-slate-700">city</td><td className="px-2 py-1.5">任意</td><td className="px-2 py-1.5 text-slate-500">市区町村コード</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <strong>レート制限:</strong> 1日あたり100リクエスト。ヘッダーに <code className="bg-amber-100 px-1 rounded">x-api-key</code> を含めてください。
          </div>
        </div>
      </div>
    </div>
  );
}

/** カスタムレポートパネル */
function ReportPanel({ email }: { email: string }) {
  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");
  const [years, setYears] = useState<string[]>(["2024", "2023"]);
  const [yearInput, setYearInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addArea() {
    if (!areaInput || areas.includes(areaInput) || areas.length >= 5) return;
    setAreas([...areas, areaInput]);
    setAreaInput("");
  }

  function addYear() {
    if (!yearInput || years.includes(yearInput) || years.length >= 5) return;
    setYears([...years, yearInput]);
    setYearInput("");
  }

  async function generateReport() {
    if (areas.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, areas, years }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "レポートの生成に失敗しました");
        return;
      }
      const data = await res.json();
      setReport(data);
    } catch {
      setError("レポートの生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(v: number): string {
    if (v >= 100000000) return `${(v / 100000000).toFixed(1)}億`;
    if (v >= 10000) return `${Math.round(v / 10000).toLocaleString()}万`;
    return v.toLocaleString();
  }

  const allYears = Array.from({ length: 20 }, (_, i) => String(2025 - i));

  return (
    <div className="space-y-6">
      {/* レポート条件設定 */}
      <div className="bg-slate-50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">レポート条件</h3>

        {/* エリア選択 */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1">分析エリア（最大5つ）</label>
          <div className="flex gap-2 mb-2">
            <select
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">都道府県を選択</option>
              {Object.entries(prefectures).map(([code, name]) => (
                <option key={code} value={code} disabled={areas.includes(code)}>{name}</option>
              ))}
            </select>
            <button onClick={addArea} disabled={!areaInput || areas.length >= 5} className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 text-white text-sm font-bold px-4 py-2 rounded-lg transition">追加</button>
          </div>
          {areas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {areas.map((code) => (
                <span key={code} className="inline-flex items-center gap-1 bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                  {prefectures[code]}
                  <button onClick={() => setAreas(areas.filter((a) => a !== code))} className="opacity-70 hover:opacity-100">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 年度選択 */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1">分析年度（最大5つ）</label>
          <div className="flex gap-2 mb-2">
            <select
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">年度を選択</option>
              {allYears.map((y) => (
                <option key={y} value={y} disabled={years.includes(y)}>{y}年</option>
              ))}
            </select>
            <button onClick={addYear} disabled={!yearInput || years.length >= 5} className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 text-white text-sm font-bold px-4 py-2 rounded-lg transition">追加</button>
          </div>
          {years.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {years.map((y) => (
                <span key={y} className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                  {y}年
                  <button onClick={() => setYears(years.filter((yr) => yr !== y))} className="opacity-70 hover:opacity-100">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={generateReport}
          disabled={areas.length === 0 || loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              レポート生成中（複数年分のデータを取得しています）...
            </>
          ) : (
            "カスタムレポートを生成"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* レポート結果 */}
      {report && (
        <div className="space-y-6" id="custom-report">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">カスタム分析レポート</h3>
            <button
              onClick={() => window.print()}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.019 48.019 0 018.5 0" />
              </svg>
              印刷 / PDF保存
            </button>
          </div>
          <p className="text-xs text-slate-400">生成日時: {new Date(report.generatedAt).toLocaleString("ja-JP")}</p>

          {/* 総合ランキング */}
          {report.comparison && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 mb-2">💰 平均価格ランキング</p>
                {report.comparison.priceRanking.map((r: { area: string; avgPrice: number }, i: number) => (
                  <div key={r.area} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-slate-700">{i + 1}. {r.area}</span>
                    <span className="font-bold text-slate-800">{formatPrice(r.avgPrice)}円</span>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 mb-2">📊 取引件数ランキング</p>
                {report.comparison.volumeRanking.map((r: { area: string; count: number }, i: number) => (
                  <div key={r.area} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-slate-700">{i + 1}. {r.area}</span>
                    <span className="font-bold text-slate-800">{r.count.toLocaleString()}件</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* エリア別詳細 */}
          {report.areas.map((area: AreaReport) => (
            <div key={area.code} className="bg-white border border-slate-200 rounded-xl p-5">
              <h4 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {area.name}
              </h4>

              {/* サマリーカード */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-800">{area.summary.totalTransactions.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">総取引件数</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-800">{formatPrice(area.summary.avgPrice)}円</p>
                  <p className="text-[10px] text-slate-500">平均価格</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-800">{formatPrice(area.summary.medianPrice)}円</p>
                  <p className="text-[10px] text-slate-500">中央値</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-800">{formatPrice(area.summary.minPrice)}円</p>
                  <p className="text-[10px] text-slate-500">最低価格</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-800">{formatPrice(area.summary.maxPrice)}円</p>
                  <p className="text-[10px] text-slate-500">最高価格</p>
                </div>
              </div>

              {/* 種別別 */}
              {area.byType && area.byType.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-600 mb-2">物件種別の内訳</p>
                  <div className="space-y-1.5">
                    {area.byType.map((t: { type: string; count: number; avgPrice: number }) => (
                      <div key={t.type} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-slate-700">{t.type || "不明"}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-500">{t.count.toLocaleString()}件</span>
                          <span className="font-medium text-slate-800">{formatPrice(t.avgPrice)}円</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 年度別推移 */}
              {area.byYear && area.byYear.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">年度別推移</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="text-left px-3 py-2 font-medium text-slate-600">年度</th>
                          <th className="text-right px-3 py-2 font-medium text-slate-600">取引件数</th>
                          <th className="text-right px-3 py-2 font-medium text-slate-600">平均価格</th>
                        </tr>
                      </thead>
                      <tbody>
                        {area.byYear.map((y: { year: string; count: number; avgPrice: number }, i: number) => (
                          <tr key={y.year} className={i % 2 === 0 ? "" : "bg-slate-50"}>
                            <td className="px-3 py-1.5 text-slate-700">{y.year}年</td>
                            <td className="px-3 py-1.5 text-right text-slate-700">{y.count.toLocaleString()}</td>
                            <td className="px-3 py-1.5 text-right font-medium text-slate-800">{formatPrice(y.avgPrice)}円</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** チームアカウントパネル */
function TeamPanel({ email }: { email: string }) {
  const [members, setMembers] = useState<string[]>([]);
  const [maxMembers, setMaxMembers] = useState(5);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/team?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.members) {
        setMembers(data.members);
        setMaxMembers(data.maxMembers || 5);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  async function addMember() {
    if (!newEmail) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, memberEmail: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "メンバーの追加に失敗しました");
        return;
      }
      setMembers(data.members);
      setNewEmail("");
    } catch {
      setError("メンバーの追加に失敗しました");
    } finally {
      setAdding(false);
    }
  }

  async function removeMember(memberEmail: string) {
    if (!confirm(`${memberEmail} をチームから削除しますか？`)) return;
    try {
      const res = await fetchWithAuth("/api/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, memberEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members);
      }
    } catch {
      alert("削除に失敗しました");
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-sm text-slate-400">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">チームメンバー</h3>
          <span className="text-xs text-slate-500">
            {members.length} / {maxMembers}名
          </span>
        </div>

        {/* メンバー一覧 */}
        <div className="space-y-2 mb-4">
          {/* オーナー */}
          <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{email}</p>
                <p className="text-[10px] text-amber-600 font-bold">オーナー</p>
              </div>
            </div>
          </div>

          {/* メンバー */}
          {members.map((m) => (
            <div key={m} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{m}</p>
                  <p className="text-[10px] text-slate-500">メンバー</p>
                </div>
              </div>
              <button
                onClick={() => removeMember(m)}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition"
              >
                削除
              </button>
            </div>
          ))}

          {members.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">まだメンバーがいません</p>
          )}
        </div>

        {/* メンバー追加 */}
        {members.length < maxMembers && (
          <div>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                placeholder="メンバーのメールアドレス"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                onClick={addMember}
                disabled={!newEmail || adding}
                className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition whitespace-nowrap"
              >
                {adding ? "追加中..." : "招待"}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>チームアカウントについて:</strong> 招待したメンバーは、メールアドレスでダッシュボードにログインすると、オーナーと同じプランの機能を利用できます。データの閲覧・CSV出力は各メンバーが個別に行えます。
      </div>
    </div>
  );
}

// ============================================================
// Types
// ============================================================

interface AreaReport {
  code: string;
  name: string;
  summary: { totalTransactions: number; avgPrice: number; medianPrice: number; minPrice: number; maxPrice: number };
  byType: { type: string; count: number; avgPrice: number }[];
  byYear: { year: string; count: number; avgPrice: number }[];
}

interface ReportData {
  generatedAt: string;
  areas: AreaReport[];
  comparison: {
    priceRanking: { area: string; avgPrice: number }[];
    volumeRanking: { area: string; count: number }[];
  };
}

// ============================================================
// Main component
// ============================================================

export default function ProFeaturesPanel({ planKey, email }: Props) {
  const [activeProTab, setActiveProTab] = useState<ProTab>("api");
  const isPro = planKey === "professional";

  if (!isPro) {
    return (
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">プロフェッショナル限定機能</h2>
        <p className="text-sm text-slate-500 mb-6">
          プロフェッショナルプランにアップグレードすると、以下の高度な機能が利用可能になります。
        </p>

        <div className="space-y-4 mb-8">
          {[
            { icon: "🔗", label: "API連携", desc: "外部システムと連携して取引データをプログラムから取得。社内ツールやBIとの統合が可能。" },
            { icon: "📊", label: "カスタムレポート", desc: "複数エリア×複数年度を横断する詳細分析レポートを自動生成。印刷・PDF保存対応。" },
            { icon: "👥", label: "チームアカウント", desc: "最大5名のメンバーを招待し、同じプランの全機能を共有。" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-lg flex-shrink-0">{f.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-800">{f.label}</h3>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">PRO限定</span>
                </div>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">プロフェッショナルプランにアップグレード</h3>
          <p className="text-sm text-slate-300 mb-4">
            月額9,800円で全機能が利用可能。CSVダウンロード無制限、API連携、カスタムレポート、チームアカウントが使えます。
          </p>
          <Link href="/register?plan=professional" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition text-sm">
            14日間無料で試す
          </Link>
        </div>
      </div>
    );
  }

  const proTabs: { id: ProTab; label: string; icon: string }[] = [
    { id: "api", label: "API連携", icon: "🔗" },
    { id: "report", label: "カスタムレポート", icon: "📊" },
    { id: "team", label: "チームアカウント", icon: "👥" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">プロフェッショナル機能</h2>
      <p className="text-sm text-slate-500 mb-6">API連携・カスタムレポート・チーム管理をご利用いただけます。</p>

      {/* Pro sub-tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {proTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveProTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
              activeProTab === tab.id
                ? "bg-amber-500 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeProTab === "api" && <ApiPanel email={email} />}
      {activeProTab === "report" && <ReportPanel email={email} />}
      {activeProTab === "team" && <TeamPanel email={email} />}
    </div>
  );
}

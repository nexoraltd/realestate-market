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

type ProTab = "report" | "team";

interface Props {
  planKey: PlanKey;
  email: string;
}

// ============================================================
// Sub-components
// ============================================================

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
  const [activeProTab, setActiveProTab] = useState<ProTab>("report");
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
            月額6,800円で全機能が利用可能。CSVダウンロード無制限、カスタムレポート、チームアカウントが使えます。
          </p>
          <Link href="/register?plan=professional" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition text-sm">
            14日間無料で試す
          </Link>
        </div>
      </div>
    );
  }

  const proTabs: { id: ProTab; label: string; icon: string }[] = [
    { id: "report", label: "カスタムレポート", icon: "📊" },
    { id: "team", label: "チームアカウント", icon: "👥" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">プロフェッショナル機能</h2>
      <p className="text-sm text-slate-500 mb-6">カスタムレポート・チーム管理をご利用いただけます。</p>

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

      {activeProTab === "report" && <ReportPanel email={email} />}
      {activeProTab === "team" && <TeamPanel email={email} />}
    </div>
  );
}

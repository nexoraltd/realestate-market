"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import TrendChart from "@/components/TrendChart";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import SubscriptionPanel from "@/components/SubscriptionPanel";
import { getPermissions, type PlanKey } from "@/lib/planPermissions";
import ProFeaturesPanel from "@/components/ProFeaturesPanel";

const SESSION_KEY = "realestate_verified_email";

/** localStorage を優先的に読み、旧 sessionStorage からの移行も行う */
function readSession(): string | null {
  if (typeof window === "undefined") return null;
  const ls = localStorage.getItem(SESSION_KEY);
  if (ls) return ls;
  // 旧 sessionStorage からマイグレーション
  const ss = sessionStorage.getItem(SESSION_KEY);
  if (ss) {
    localStorage.setItem(SESSION_KEY, ss);
    sessionStorage.removeItem(SESSION_KEY);
    return ss;
  }
  return null;
}

function writeSession(value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, value);
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

type AuthState = "idle" | "checking" | "active" | "inactive" | "sent" | "error";

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

type Tab = "search" | "csv" | "trend" | "compare" | "pro";

export default function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>("search");

  // Subscription gate state
  const [gateEmail, setGateEmail] = useState("");
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [planLabel, setPlanLabel] = useState<string>("");
  const [planKey, setPlanKey] = useState<PlanKey>("free");

  // CSV tab state (must be before any conditional return to respect Rules of Hooks)
  const [csvArea, setCsvArea] = useState("");
  const [csvYear, setCsvYear] = useState("2024");
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvUsed, setCsvUsed] = useState<number>(0);
  const [csvLimit, setCsvLimit] = useState<number>(100);
  const [csvUsageLoading, setCsvUsageLoading] = useState(false);

  // Trend tab state
  const [trendArea, setTrendArea] = useState("");
  const [trendType, setTrendType] = useState("all");
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendData, setTrendData] = useState<{ TradePrice: string; Type: string; Period: string }[] | null>(null);

  // Compare tab state
  const [compareAreas, setCompareAreas] = useState<string[]>([]);
  const [compareToggle, setCompareToggle] = useState("");
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState<Record<string, { TradePrice: string; Type: string; Period: string }[]> | null>(null);

  const perms = getPermissions(planKey);

  /** CSV使用状況を取得 */
  const fetchCsvUsage = useCallback(async (email: string) => {
    setCsvUsageLoading(true);
    try {
      const res = await fetchWithAuth(`/api/csv-usage?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setCsvUsed(data.used ?? 0);
        setCsvLimit(data.limit ?? 100);
      }
    } catch {
      // サイレントフェイル — 使用状況が取得できなくても操作は可能
    } finally {
      setCsvUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = readSession();
    if (saved) {
      try {
        const { email, plan } = JSON.parse(saved);
        // 楽観的に即座にUIを復元（体感速度優先）
        setVerifiedEmail(email);
        const key: PlanKey = plan === "professional" ? "professional" : plan === "standard" ? "standard" : "free";
        setPlanKey(key);
        setPlanLabel(key === "professional" ? "プロフェッショナル" : key === "standard" ? "スタンダード" : "無料");
        setAuthState("active");
        fetchCsvUsage(email);

        // バックグラウンドでサブスク有効性を再検証。失効していたらログアウト
        fetch(`/api/subscription?email=${encodeURIComponent(email)}`)
          .then((r) => r.json())
          .then((data) => {
            if (!data.active) {
              clearSession();
              setVerifiedEmail(null);
              setAuthState("idle");
            } else {
              const currentKey: PlanKey = (data.basePlan === "professional" || data.plan === "professional")
                ? "professional"
                : (data.basePlan === "standard" || data.plan === "standard")
                ? "standard"
                : "free";
              if (currentKey !== key) {
                setPlanKey(currentKey);
                setPlanLabel(currentKey === "professional" ? "プロフェッショナル" : currentKey === "standard" ? "スタンダード" : "無料");
                writeSession(JSON.stringify({ email, plan: currentKey }));
              }
            }
          })
          .catch(() => {
            // 通信エラー時はキャッシュのまま継続
          });
        return;
      } catch {
        clearSession();
      }
    }

    // Stripeチェックアウト完了後: session_idからメール自動取得→自動認証
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      setAuthState("checking");
      fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.email) {
            // サブスクリプション状態を確認
            return fetch(`/api/subscription?email=${encodeURIComponent(data.email)}`)
              .then((r) => r.json())
              .then((subData) => {
                if (subData.active) {
                  const resolvedPlan = subData.plan || data.plan || "free";
                  const key: PlanKey = resolvedPlan === "professional" ? "professional" : resolvedPlan === "standard" ? "standard" : "free";
                  const label = key === "professional" ? "プロフェッショナル" : key === "standard" ? "スタンダード" : "無料";
                  writeSession(JSON.stringify({ email: data.email, plan: key }));
                  setVerifiedEmail(data.email);
                  setPlanKey(key);
                  setPlanLabel(label);
                  setAuthState("active");
                  fetchCsvUsage(data.email);
                } else {
                  // Stripeで決済完了直後はまだサブスクリプションが反映されていない場合がある
                  // その場合はセッション情報だけで認証する
                  const resolvedPlan = data.plan || "free";
                  const key: PlanKey = resolvedPlan === "professional" ? "professional" : resolvedPlan === "standard" ? "standard" : "free";
                  const label = key === "professional" ? "プロフェッショナル" : key === "standard" ? "スタンダード" : "無料";
                  writeSession(JSON.stringify({ email: data.email, plan: key }));
                  setVerifiedEmail(data.email);
                  setPlanKey(key);
                  setPlanLabel(label);
                  setAuthState("active");
                  fetchCsvUsage(data.email);
                }
              });
          } else {
            setAuthState("idle");
          }
        })
        .catch(() => {
          setAuthState("idle");
        });
    }
  }, [fetchCsvUsage]);

  async function handleGateMagicLink() {
    if (!gateEmail) return;
    setAuthState("checking");
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: gateEmail }),
      });
      if (!res.ok) {
        setAuthState("error");
        return;
      }
      setAuthState("sent");
    } catch {
      setAuthState("error");
    }
  }

  function handleLogout() {
    clearSession();
    setVerifiedEmail(null);
    setGateEmail("");
    setAuthState("idle");
    setPlanKey("free");
  }

  // Show gate if not verified
  if (authState !== "active") {
    return (
      <section className="py-16 bg-slate-50 min-h-[60vh] flex items-start justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          {authState === "inactive" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 text-center mb-2">有料プランが未登録です</h2>
              <p className="text-sm text-slate-500 text-center mb-6">
                <span className="font-medium text-slate-700">{gateEmail}</span> には有効なサブスクリプションが見つかりませんでした。
              </p>
              <Link
                href="/register?plan=standard"
                className="block text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition mb-3"
              >
                14日間無料で申し込む
              </Link>
              <button
                onClick={() => setAuthState("idle")}
                className="block w-full text-center text-sm text-slate-500 hover:text-slate-700 py-2 transition"
              >
                別のメールで確認する
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 無料登録CTA（メイン） */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="text-center mb-4">
                  <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3">無料・登録1分</span>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">まずは無料会員で始める</h2>
                  <p className="text-sm text-slate-500">クレジットカード不要。メールだけで今すぐ使える。</p>
                </div>
                <ul className="space-y-2 mb-5">
                  {[
                    "AI査定 月1回（10年予測＋資産性スコア内訳）",
                    "相場検索 月3回（取引事例20件まで）",
                    "いつでも有料プランにアップグレード可",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?plan=free"
                  className="block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition mb-3"
                >
                  無料で今すぐ登録する →
                </Link>
                <Link
                  href="/register?plan=standard"
                  className="block text-center text-sm text-amber-600 hover:text-amber-700 font-medium py-2 border border-amber-200 rounded-xl hover:bg-amber-50 transition"
                >
                  14日間無料でプレミアム機能を試す
                </Link>
              </div>

              {/* ログインフォーム（既存会員） */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <p className="text-xs font-semibold text-slate-500 text-center mb-4">すでに会員の方はこちら</p>

                {authState === "sent" ? (
                  <div className="text-center py-2">
                    <p className="text-sm font-bold text-emerald-600 mb-1">メールを送信しました</p>
                    <p className="text-xs text-slate-500">{gateEmail} のメールボックスをご確認ください。</p>
                    <button onClick={() => setAuthState("idle")} className="mt-3 text-xs text-slate-400 hover:text-slate-600">← 戻る</button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <input
                        type="email"
                        value={gateEmail}
                        onChange={(e) => setGateEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGateMagicLink()}
                        placeholder="メールアドレス"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>

                    {authState === "error" && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-3">
                        送信に失敗しました。再度お試しください。
                      </div>
                    )}

                    <button
                      onClick={handleGateMagicLink}
                      disabled={!gateEmail || authState === "checking"}
                      className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition"
                    >
                      {authState === "checking" ? "送信中..." : "ログインリンクを送る"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  const years = Array.from({ length: 20 }, (_, i) => String(2024 - i));

  async function handleCsvDownload() {
    if (!csvArea) return;

    // スタンダードプランの制限チェック（フロントエンド側の先行チェック）
    if (csvLimit !== -1 && csvUsed >= csvLimit) {
      alert(`今月のCSVダウンロード上限（${csvLimit}件）に達しました。\nプロフェッショナルプランにアップグレードすると無制限にダウンロードできます。`);
      return;
    }

    setCsvLoading(true);
    try {
      const emailParam = verifiedEmail ? `&email=${encodeURIComponent(verifiedEmail)}` : "";
      const res = await fetchWithAuth(`/api/csv?area=${csvArea}&year=${csvYear}${emailParam}`);

      if (res.status === 429) {
        const data = await res.json();
        alert(data.message || "CSVダウンロード上限に達しました。");
        setCsvUsed(data.used ?? csvUsed);
        return;
      }

      if (!res.ok) throw new Error("ダウンロード失敗");

      // レスポンスヘッダーから使用状況を更新
      const usedHeader = res.headers.get("X-Csv-Downloads-Used");
      if (usedHeader) setCsvUsed(Number(usedHeader));

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `realestate_${prefectures[csvArea]}_${csvYear}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("CSVのダウンロードに失敗しました。再度お試しください。");
    } finally {
      setCsvLoading(false);
    }
  }

  async function handleTrendSearch() {
    if (!trendArea) return;
    setTrendLoading(true);
    setTrendData(null);
    try {
      const emailParam = verifiedEmail ? `&email=${encodeURIComponent(verifiedEmail)}` : "";
      const res = await fetchWithAuth(`/api/trend?area=${trendArea}&type=${trendType}${emailParam}`);
      if (!res.ok) throw new Error("取得失敗");
      const data = await res.json();
      setTrendData(data);
    } catch {
      alert("トレンドデータの取得に失敗しました。再度お試しください。");
    } finally {
      setTrendLoading(false);
    }
  }

  function addCompareArea() {
    if (compareToggle && !compareAreas.includes(compareToggle) && compareAreas.length < 5) {
      setCompareAreas([...compareAreas, compareToggle]);
      setCompareToggle("");
    }
  }

  function removeCompareArea(code: string) {
    setCompareAreas(compareAreas.filter((a) => a !== code));
    if (compareData) {
      const next = { ...compareData };
      delete next[code];
      setCompareData(Object.keys(next).length > 0 ? next : null);
    }
  }

  async function handleCompareReport() {
    if (compareAreas.length < 2) return;
    setCompareLoading(true);
    setCompareData(null);
    try {
      const results = await Promise.all(
        compareAreas.map(async (area) => {
          const emailParam = verifiedEmail ? `&email=${encodeURIComponent(verifiedEmail)}` : "";
          const res = await fetchWithAuth(`/api/trend?area=${area}&type=all${emailParam}`);
          if (!res.ok) throw new Error("取得失敗");
          const data = await res.json();
          return { area, data };
        })
      );
      const map: Record<string, { TradePrice: string; Type: string; Period: string }[]> = {};
      results.forEach(({ area, data }) => { map[area] = data; });
      setCompareData(map);
    } catch {
      alert("比較データの取得に失敗しました。再度お試しください。");
    } finally {
      setCompareLoading(false);
    }
  }

  // Build combined chart data for compare
  function buildCompareChartData() {
    if (!compareData) return [];
    const periodSet = new Set<string>();
    const areaAverages: Record<string, Record<string, { total: number; count: number }>> = {};

    compareAreas.forEach((area) => {
      areaAverages[area] = {};
      (compareData[area] || []).forEach((t) => {
        const price = Number(t.TradePrice);
        if (!price || !t.Period) return;
        periodSet.add(t.Period);
        if (!areaAverages[area][t.Period]) areaAverages[area][t.Period] = { total: 0, count: 0 };
        areaAverages[area][t.Period].total += price;
        areaAverages[area][t.Period].count++;
      });
    });

    return Array.from(periodSet).sort().map((period) => {
      const row: Record<string, string | number> = { period };
      compareAreas.forEach((area) => {
        const d = areaAverages[area][period];
        row[prefectures[area]] = d ? Math.round(d.total / d.count) : 0;
      });
      return row;
    });
  }

  function formatPrice(v: number): string {
    if (v >= 100000000) return `${(v / 100000000).toFixed(1)}億`;
    if (v >= 10000) return `${Math.round(v / 10000)}万`;
    return String(v);
  }

  const CHART_COLORS = ["#2b6cb0", "#c05621", "#276749", "#6b46c1", "#b7791f"];

  // タブ定義（プロ限定機能タブはスタンダードユーザーにも表示）
  const tabDefs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: "search",
      label: "詳細データ検索",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
    {
      id: "csv",
      label: "CSVダウンロード",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
    {
      id: "trend",
      label: "トレンド分析",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
    {
      id: "compare",
      label: "エリア比較レポート",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      ),
    },
    {
      id: "pro",
      label: "プロ限定機能",
      badge: planKey === "professional" ? undefined : "PRO",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      ),
    },
  ];

  /** CSV残り件数の表示テキスト */
  const csvRemainingText = csvLimit === -1
    ? "無制限"
    : csvUsageLoading
      ? "確認中..."
      : `残り ${Math.max(0, csvLimit - csvUsed)}/${csvLimit} 件`;

  const csvLimitReached = csvLimit !== -1 && csvUsed >= csvLimit;

  return (
    <section className="py-8 md:py-12 bg-slate-50 min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4">
        {/* User info bar */}
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {planLabel}プラン
            </span>
            <span className="text-sm text-slate-600">{verifiedEmail}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/account" className="text-xs text-amber-600 hover:text-amber-700 font-medium transition">
              アカウント管理
            </Link>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-slate-600 transition">
              ログアウト
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {tabDefs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 text-[10px] font-extrabold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-md leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          {/* 詳細データ検索 */}
          {activeTab === "search" && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">詳細データ検索</h2>
              <p className="text-sm text-slate-500 mb-6">
                全国の取引データを詳細条件で検索できます。築年数・駅距離・面積などの絞り込みが可能です。
              </p>
              <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <p className="text-sm font-medium text-slate-700 mb-3">エリア・期間を選択して検索</p>
                <SearchForm />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-slate-800">無制限</p>
                  <p className="text-xs text-slate-500 mt-1">取引事例表示数</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-slate-800">20年分</p>
                  <p className="text-xs text-slate-500 mt-1">データ蓄積期間</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-slate-800">47</p>
                  <p className="text-xs text-slate-500 mt-1">全都道府県対応</p>
                </div>
              </div>
            </div>
          )}

          {/* CSVダウンロード */}
          {activeTab === "csv" && (
            planKey === "free" ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">スタンダードプラン以上で利用できます</h3>
                <p className="text-sm text-slate-500 mb-6">CSVダウンロードはスタンダードプラン（月2,980円）からご利用いただけます。月100件まで（プロフェッショナルは無制限）。</p>
                <Link href="/pricing" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition text-sm">プランをアップグレード →</Link>
              </div>
            ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-800">CSVダウンロード</h2>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                  csvLimit === -1
                    ? "bg-emerald-50 text-emerald-700"
                    : csvLimitReached
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-700"
                }`}>
                  {csvRemainingText}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                取引データをCSV形式でダウンロードし、Excel等で自由に分析できます。
              </p>

              {/* スタンダードプランの制限表示 */}
              {csvLimit !== -1 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>今月の使用状況</span>
                    <span>{csvUsed} / {csvLimit} 件</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        csvLimitReached ? "bg-red-500" : csvUsed / csvLimit > 0.8 ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(100, (csvUsed / csvLimit) * 100)}%` }}
                    />
                  </div>
                  {csvLimitReached && (
                    <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-sm font-bold text-red-700 mb-1">今月の上限に達しました</p>
                      <p className="text-xs text-red-600 mb-3">
                        スタンダードプランでは月{csvLimit}件までのCSVダウンロードが可能です。
                        プロフェッショナルプランにアップグレードすると無制限にダウンロードできます。
                      </p>
                      <Link
                        href="/register?plan=professional"
                        className="inline-block text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        プロフェッショナルにアップグレード
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">都道府県</label>
                  <select
                    value={csvArea}
                    onChange={(e) => setCsvArea(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    <option value="">選択してください</option>
                    {Object.entries(prefectures).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">対象年度</label>
                  <select
                    value={csvYear}
                    onChange={(e) => setCsvYear(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}年</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCsvDownload}
                  disabled={!csvArea || csvLoading || csvLimitReached}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {csvLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      データ取得中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      CSVをダウンロード
                    </>
                  )}
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                選択した都道府県・年度の全4四半期データをまとめてダウンロードします。Excelで開く際は文字コードUTF-8（BOM付き）を選択してください。
              </div>
            </div>
            )
          )}

          {/* トレンド分析 */}
          {activeTab === "trend" && (
            planKey === "free" ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">スタンダードプラン以上で利用できます</h3>
                <p className="text-sm text-slate-500 mb-6">トレンド分析はスタンダードプラン（月2,980円）からご利用いただけます。2年分のデータ（プロフェッショナルは20年分）を可視化できます。</p>
                <Link href="/pricing" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition text-sm">プランをアップグレード →</Link>
              </div>
            ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">トレンド分析</h2>
              <p className="text-sm text-slate-500 mb-6">
                エリアごとの価格推移をグラフで確認。売り時・買い時の判断に活用できます。
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">分析対象エリア</label>
                  <select
                    value={trendArea}
                    onChange={(e) => setTrendArea(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    <option value="">選択してください</option>
                    {Object.entries(prefectures).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">物件種別</label>
                  <select
                    value={trendType}
                    onChange={(e) => setTrendType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    <option value="all">全種別</option>
                    <option value="mansion">中古マンション等</option>
                    <option value="house">宅地（土地と建物）</option>
                    <option value="land">宅地（土地）</option>
                    <option value="forest">林地</option>
                  </select>
                </div>
                <button
                  onClick={handleTrendSearch}
                  disabled={!trendArea || trendLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {trendLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      データ取得中（約10秒かかります）...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                      トレンドを表示
                    </>
                  )}
                </button>
              </div>

              {trendData && trendData.length > 0 ? (
                <TrendChart transactions={trendData} />
              ) : trendData && trendData.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-8 text-center text-sm text-slate-400">
                  データが見つかりませんでした
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">エリアを選択するとトレンドグラフが表示されます</p>
                </div>
              )}
            </div>
            )
          )}

          {/* エリア比較レポート */}
          {activeTab === "compare" && (
            planKey === "free" ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">スタンダードプラン以上で利用できます</h3>
                <p className="text-sm text-slate-500 mb-6">エリア比較レポートはスタンダードプラン（月2,980円）からご利用いただけます。複数エリアの相場を一覧で比較できます。</p>
                <Link href="/pricing" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition text-sm">プランをアップグレード →</Link>
              </div>
            ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">エリア比較レポート</h2>
              <p className="text-sm text-slate-500 mb-6">
                複数エリアの相場・トレンドを比較するレポートを生成します。
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    比較エリアを追加（最大5つ）
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={compareToggle}
                      onChange={(e) => setCompareToggle(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      <option value="">都道府県を選択</option>
                      {Object.entries(prefectures).map(([code, name]) => (
                        <option key={code} value={code} disabled={compareAreas.includes(code)}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addCompareArea}
                      disabled={!compareToggle || compareAreas.length >= 5}
                      className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-5 py-2.5 rounded-lg transition text-sm"
                    >
                      追加
                    </button>
                  </div>
                </div>

                {compareAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {compareAreas.map((code, i) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: CHART_COLORS[i] }}
                      >
                        {prefectures[code]}
                        <button
                          onClick={() => removeCompareArea(code)}
                          className="opacity-70 hover:opacity-100 transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleCompareReport}
                  disabled={compareAreas.length < 2 || compareLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                >
                  {compareLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      データ取得中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                      </svg>
                      比較レポートを生成
                    </>
                  )}
                </button>
              </div>

              {compareData ? (
                <div className="space-y-6">
                  {/* 平均価格サマリーカード */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {compareAreas.map((code, i) => {
                      const rows = compareData[code] || [];
                      const prices = rows.map((r) => Number(r.TradePrice)).filter((p) => p > 0);
                      const avg = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
                      return (
                        <div key={code} className="bg-slate-50 rounded-xl p-4 border-l-4" style={{ borderColor: CHART_COLORS[i] }}>
                          <p className="text-xs text-slate-500 mb-1">{prefectures[code]}</p>
                          <p className="text-xl font-extrabold text-slate-800">{formatPrice(avg)}円</p>
                          <p className="text-xs text-slate-400 mt-1">直近5年間平均取引価格</p>
                          <p className="text-xs text-slate-400">{prices.length.toLocaleString()}件のデータ</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* 比較チャート */}
                  {(() => {
                    const chartData = buildCompareChartData();
                    if (chartData.length < 2) return null;
                    // Dynamic import workaround — render inline recharts
                    return (
                      <div>
                        <p className="text-sm font-bold text-slate-700 mb-3">四半期別 平均取引価格推移</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="text-left px-3 py-2 rounded-tl-lg font-medium text-slate-600">時期</th>
                                {compareAreas.map((code, i) => (
                                  <th key={code} className="text-right px-3 py-2 font-medium" style={{ color: CHART_COLORS[i] }}>
                                    {prefectures[code]}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {chartData.slice(-20).map((row, idx) => (
                                <tr key={String(row.period)} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                  <td className="px-3 py-1.5 text-slate-600">{row.period}</td>
                                  {compareAreas.map((code) => (
                                    <td key={code} className="px-3 py-1.5 text-right text-slate-800 font-medium">
                                      {row[prefectures[code]] ? formatPrice(Number(row[prefectures[code]])) + "円" : "-"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">2つ以上のエリアを選択してレポートを生成してください</p>
                </div>
              )}
            </div>
            )
          )}

          {/* プロ限定機能 */}
          {activeTab === "pro" && verifiedEmail && (
            <ProFeaturesPanel planKey={planKey} email={verifiedEmail} />
          )}
        </div>

      </div>
    </section>
  );
}

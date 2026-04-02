"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ---------- types ---------- */
interface AmortizationYear {
  year: number;
  principal: number;
  interest: number;
  balance: number;
}

/* ---------- metadata (exported via generateMetadata for client pages isn't possible,
   so we use a head component approach with next/head — but in App Router we use metadata
   export from a separate layout or inline <head>). We'll add JSON-LD inline. ---------- */

const META = {
  title: "住宅ローンシミュレーター｜月々の返済額を無料計算｜不動産相場ナビ",
  description:
    "住宅ローンの月々返済額・総返済額・利息を無料でシミュレーション。変動金利・固定金利の比較、返済比率の確認も可能。不動産購入の資金計画にお役立てください。",
  canonical: "https://market.next-aura.com/tools/loan-simulator",
};

const LOAN_TERMS = [10, 15, 20, 25, 30, 35] as const;

/* ---------- helpers ---------- */

function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
}

function buildAmortization(principal: number, annualRate: number, years: number): AmortizationYear[] {
  if (principal <= 0 || years <= 0) return [];
  const monthlyRate = annualRate / 100 / 12;
  const monthly = calcMonthlyPayment(principal, annualRate, years);
  const result: AmortizationYear[] = [];
  let balance = principal;

  for (let y = 1; y <= years; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let m = 0; m < 12; m++) {
      const interest = balance * monthlyRate;
      const princ = monthly - interest;
      yearInterest += interest;
      yearPrincipal += princ;
      balance -= princ;
    }
    result.push({
      year: y,
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.max(0, Math.round(balance)),
    });
  }
  return result;
}

function fmtMan(yen: number): string {
  if (yen >= 100_000_000) {
    const oku = yen / 100_000_000;
    return oku % 1 === 0 ? `${oku}億円` : `${oku.toFixed(2)}億円`;
  }
  const man = yen / 10_000;
  return `${man.toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万円`;
}

function fmtYen(yen: number): string {
  return `${Math.round(yen).toLocaleString("ja-JP")}円`;
}

/* ---------- component ---------- */

export default function LoanSimulatorPage() {
  // inputs
  const [propertyPrice, setPropertyPrice] = useState<string>("40000000");
  const [downPayment, setDownPayment] = useState<string>("5000000");
  const [loanTerm, setLoanTerm] = useState<number>(35);
  const [interestRate, setInterestRate] = useState<string>("0.5");
  const [rateType, setRateType] = useState<"variable" | "fixed">("variable");
  const [annualIncome, setAnnualIncome] = useState<string>("");
  const [currentRent, setCurrentRent] = useState<string>("");

  // derived
  const principal = Math.max(0, (Number(propertyPrice) || 0) - (Number(downPayment) || 0));
  const rate = Number(interestRate) || 0;

  const { monthly, totalPayment, totalInterest, amortization } = useMemo(() => {
    const m = calcMonthlyPayment(principal, rate, loanTerm);
    const total = m * loanTerm * 12;
    const interest = total - principal;
    const amor = buildAmortization(principal, rate, loanTerm);
    return { monthly: m, totalPayment: total, totalInterest: interest, amortization: amor };
  }, [principal, rate, loanTerm]);

  const paymentRatio = useMemo(() => {
    const income = Number(annualIncome) || 0;
    if (income <= 0 || monthly <= 0) return null;
    return ((monthly * 12) / income) * 100;
  }, [annualIncome, monthly]);

  const rentDiff = useMemo(() => {
    const rent = Number(currentRent) || 0;
    if (rent <= 0 || monthly <= 0) return null;
    return monthly - rent;
  }, [currentRent, monthly]);

  // chart max for scaling
  const chartMaxPayment = useMemo(() => {
    if (amortization.length === 0) return 1;
    return Math.max(...amortization.map((a) => a.principal + a.interest));
  }, [amortization]);

  const sc = "w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm";
  const label = "block text-xs font-medium mb-1 text-slate-400";

  const hasResult = principal > 0 && rate >= 0 && loanTerm > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "住宅ローンシミュレーター",
    description: META.description,
    url: META.canonical,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    provider: {
      "@type": "Organization",
      name: "不動産相場ナビ",
      url: "https://market.next-aura.com",
    },
  };

  return (
    <>
      <head>
        <title>{META.title}</title>
        <meta name="description" content={META.description} />
        <link rel="canonical" href={META.canonical} />
        <meta property="og:title" content={META.title} />
        <meta property="og:description" content={META.description} />
        <meta property="og:url" content={META.canonical} />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <Header />

      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-amber-400 text-xs font-semibold">住宅ローン計算（無料）</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
              住宅ローン<span className="text-amber-400">シミュレーター</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              物件価格・頭金・金利・借入期間を入力するだけで、月々の返済額や総返済額をリアルタイムで計算。家賃との比較や返済比率の確認も可能です。
            </p>
          </div>

          {/* Form */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 rounded-full bg-amber-500" />
              <h2 className="text-lg font-bold">ローン条件を入力</h2>
            </div>

            <div className="space-y-6">
              {/* Property price & down payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={label}>物件価格（円）</label>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                    placeholder="例: 40000000"
                    className={sc}
                  />
                  {Number(propertyPrice) > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{fmtMan(Number(propertyPrice))}</p>
                  )}
                </div>
                <div>
                  <label className={label}>頭金（円）</label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    placeholder="例: 5000000"
                    className={sc}
                  />
                  {Number(downPayment) > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{fmtMan(Number(downPayment))}</p>
                  )}
                </div>
              </div>

              {/* Loan amount display */}
              {principal > 0 && (
                <div className="bg-slate-700/30 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-slate-400">借入額</span>
                  <span className="text-lg font-bold text-amber-400">{fmtMan(principal)}</span>
                </div>
              )}

              {/* Interest rate & type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={label}>金利（年利 %）</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="例: 0.5"
                    className={sc}
                  />
                </div>
                <div>
                  <label className={label}>金利タイプ</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "variable" as const, label: "変動金利" },
                      { value: "fixed" as const, label: "固定金利" },
                    ]).map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          setRateType(t.value);
                          if (t.value === "variable" && (Number(interestRate) > 1)) {
                            setInterestRate("0.5");
                          } else if (t.value === "fixed" && (Number(interestRate) < 1)) {
                            setInterestRate("1.8");
                          }
                        }}
                        className={`py-2.5 px-2 rounded-lg border text-center transition font-medium text-sm ${
                          rateType === t.value
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-slate-600 bg-slate-800/30 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loan term */}
              <div>
                <label className={label}>借入期間</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {LOAN_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLoanTerm(term)}
                      className={`py-2.5 rounded-lg border text-center transition font-medium text-sm ${
                        loanTerm === term
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-slate-600 bg-slate-800/30 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      {term}年
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual income (optional) */}
              <div>
                <label className={label}>年収（円・任意）<span className="text-slate-600 ml-1">返済比率の計算に使用</span></label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  placeholder="例: 6000000"
                  className={sc}
                />
                {Number(annualIncome) > 0 && (
                  <p className="text-xs text-slate-500 mt-1">{fmtMan(Number(annualIncome))}</p>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {hasResult && (
            <div className="space-y-6">
              {/* Main result cards */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 rounded-full bg-amber-500" />
                  <h2 className="text-lg font-bold">シミュレーション結果</h2>
                  <span className="ml-auto text-xs text-slate-500">
                    {rateType === "variable" ? "変動金利" : "固定金利"} {rate}% / {loanTerm}年
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "月々の返済額", value: fmtYen(monthly), color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                    { label: "総返済額", value: fmtMan(totalPayment), color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { label: "利息総額", value: fmtMan(totalInterest), color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl border p-4 text-center ${item.bg}`}>
                      <div className="text-xs text-slate-400 mb-2">{item.label}</div>
                      <div className={`text-lg md:text-2xl font-extrabold ${item.color}`}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Payment ratio */}
                {paymentRatio !== null && (
                  <div className="bg-slate-700/30 rounded-xl px-4 py-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">返済比率（年収に対する年間返済額の割合）</span>
                      <span className={`text-lg font-bold ${paymentRatio <= 25 ? "text-emerald-400" : paymentRatio <= 35 ? "text-amber-400" : "text-red-400"}`}>
                        {paymentRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          paymentRatio <= 25
                            ? "bg-emerald-500"
                            : paymentRatio <= 35
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(paymentRatio, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0%</span>
                      <span className="text-emerald-400">安全圏 ~25%</span>
                      <span className="text-amber-400">注意 ~35%</span>
                      <span className="text-red-400">危険 35%~</span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 leading-relaxed">
                  ※ 元利均等返済方式での概算です。{rateType === "variable" ? "変動金利は将来の金利変動により実際の返済額が変わる可能性があります。" : "固定金利は借入期間中、金利が変わりません。"}諸費用（手数料・保証料・保険料等）は含まれていません。
                </p>
              </div>

              {/* Amortization chart */}
              {amortization.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-6 rounded-full bg-amber-500" />
                    <h2 className="text-lg font-bold">年別返済内訳</h2>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-amber-500" />
                      <span className="text-slate-400">元金</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-blue-500" />
                      <span className="text-slate-400">利息</span>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-2">
                    {amortization.map((a) => {
                      const total = a.principal + a.interest;
                      const principalPct = (a.principal / chartMaxPayment) * 100;
                      const interestPct = (a.interest / chartMaxPayment) * 100;
                      return (
                        <div key={a.year} className="flex items-center gap-2 group">
                          <span className="text-xs text-slate-500 w-8 text-right shrink-0">{a.year}年</span>
                          <div className="flex-1 flex h-5 rounded overflow-hidden bg-slate-700/30">
                            <div
                              className="bg-amber-500/80 transition-all duration-300"
                              style={{ width: `${principalPct}%` }}
                              title={`元金: ${fmtMan(a.principal)}`}
                            />
                            <div
                              className="bg-blue-500/80 transition-all duration-300"
                              style={{ width: `${interestPct}%` }}
                              title={`利息: ${fmtMan(a.interest)}`}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-20 text-right shrink-0 hidden md:block">
                            {fmtMan(total)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary row */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">残高（最終年）</span>
                      <span className="font-bold text-white">{fmtYen(amortization[amortization.length - 1]?.balance ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">利息の割合</span>
                      <span className="font-bold text-blue-400">
                        {totalPayment > 0 ? ((totalInterest / totalPayment) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rent comparison */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 rounded-full bg-amber-500" />
                  <h2 className="text-lg font-bold">今の家賃と比較</h2>
                </div>

                <div className="mb-4">
                  <label className={label}>現在の家賃（月額・円）</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={currentRent}
                    onChange={(e) => setCurrentRent(e.target.value)}
                    placeholder="例: 120000"
                    className={sc}
                  />
                  {Number(currentRent) > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{fmtYen(Number(currentRent))} / 月</p>
                  )}
                </div>

                {rentDiff !== null && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-slate-700/30 border-slate-600/50 p-4 text-center">
                      <div className="text-xs text-slate-400 mb-2">現在の家賃</div>
                      <div className="text-xl font-extrabold text-slate-300">{fmtYen(Number(currentRent))}</div>
                      <div className="text-xs text-slate-500 mt-1">/ 月</div>
                    </div>
                    <div className="rounded-xl border bg-amber-500/10 border-amber-500/20 p-4 text-center">
                      <div className="text-xs text-slate-400 mb-2">ローン返済額</div>
                      <div className="text-xl font-extrabold text-amber-400">{fmtYen(monthly)}</div>
                      <div className="text-xs text-slate-500 mt-1">/ 月</div>
                    </div>
                    <div className={`rounded-xl border p-4 text-center ${
                      rentDiff <= 0
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    }`}>
                      <div className="text-xs text-slate-400 mb-2">差額</div>
                      <div className={`text-xl font-extrabold ${rentDiff <= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {rentDiff <= 0 ? "-" : "+"}{fmtYen(Math.abs(rentDiff))}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {rentDiff <= 0 ? "家賃より安い" : "家賃より高い"}
                      </div>
                    </div>
                  </div>
                )}

                {rentDiff !== null && (
                  <div className="mt-4 bg-slate-700/30 rounded-xl px-4 py-3">
                    <p className="text-sm text-slate-300">
                      {rentDiff <= 0 ? (
                        <>
                          現在の家賃より<span className="font-bold text-emerald-400">月額{fmtYen(Math.abs(rentDiff))}</span>お得です。
                          {loanTerm}年間の家賃総額<span className="font-bold text-slate-200">（{fmtMan(Number(currentRent) * 12 * loanTerm)}）</span>と比較すると、
                          住宅購入は資産形成の観点からも有利と言えます。
                        </>
                      ) : (
                        <>
                          現在の家賃より<span className="font-bold text-red-400">月額{fmtYen(rentDiff)}</span>増加します。
                          ただし住宅ローンの返済は資産形成につながります。{loanTerm}年間の家賃総額は
                          <span className="font-bold text-slate-200">{fmtMan(Number(currentRent) * 12 * loanTerm)}</span>ですが、
                          住宅は返済完了後も資産として残ります。
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/estimate"
                  className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl p-4 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">物件の適正価格を確認</div>
                    <div className="text-xs text-emerald-200">AI査定で相場をチェック</div>
                  </div>
                  <svg className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl p-4 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-400/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">プロ向けデータ分析</div>
                    <div className="text-xs text-amber-800">詳細な相場レポートを取得</div>
                  </div>
                  <svg className="w-5 h-5 text-amber-700 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Disclaimer */}
              <div className="text-center text-xs text-slate-500 py-4 leading-relaxed">
                <p>
                  本シミュレーションは概算値であり、実際のローン契約とは異なる場合があります。<br />
                  詳細な返済計画は金融機関にご相談ください。
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

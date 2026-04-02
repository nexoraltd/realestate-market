'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PropertyTaxCalculator() {
  // --- 入力 state ---
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [assessedValue, setAssessedValue] = useState<string>('');
  const [landArea, setLandArea] = useState<string>('');
  const [buildingType, setBuildingType] = useState<'residential' | 'commercial'>('residential');
  const [isNew, setIsNew] = useState<boolean>(true);
  const [buildingAge, setBuildingAge] = useState<string>('');
  const [isApartment, setIsApartment] = useState<boolean>(false);

  // 購入価格から概算
  const handleEstimateFromPrice = () => {
    const price = parseFloat(purchasePrice);
    if (!isNaN(price) && price > 0) {
      setAssessedValue(String(Math.round(price * 0.7)));
    }
  };

  // --- 計算 ---
  const result = useMemo(() => {
    const assessed = parseFloat(assessedValue);
    const land = parseFloat(landArea);

    if (isNaN(assessed) || assessed <= 0) return null;

    const landAreaVal = isNaN(land) || land <= 0 ? 0 : land;

    // 固定資産税（標準税率 1.4%）
    let propertyTaxBase = assessed;
    // 都市計画税（上限 0.3%）
    let cityPlanTaxBase = assessed;

    // 住宅用地の特例（住宅のみ）
    let landSpecialApplied = false;
    let landReduction = 0;

    if (buildingType === 'residential' && landAreaVal > 0) {
      landSpecialApplied = true;
      if (landAreaVal <= 200) {
        // 小規模住宅用地: 固定資産税 1/6, 都市計画税 1/3
        const reducedProperty = assessed * (1 / 6);
        const reducedCity = assessed * (1 / 3);
        landReduction = assessed - reducedProperty;
        propertyTaxBase = reducedProperty;
        cityPlanTaxBase = reducedCity;
      } else {
        // 200m²以下部分: 1/6, 超過部分: 1/3
        const ratio200 = 200 / landAreaVal;
        const ratioOver = 1 - ratio200;
        const reducedProperty = assessed * ratio200 * (1 / 6) + assessed * ratioOver * (1 / 3);
        const reducedCity = assessed * ratio200 * (1 / 3) + assessed * ratioOver * (2 / 3);
        landReduction = assessed - reducedProperty;
        propertyTaxBase = reducedProperty;
        cityPlanTaxBase = reducedCity;
      }
    }

    let propertyTax = propertyTaxBase * 0.014;
    let cityPlanTax = cityPlanTaxBase * 0.003;

    // 新築住宅の減額特例
    let newBuildingReduction = 0;
    const age = parseFloat(buildingAge);
    const effectiveAge = isNew ? 0 : (isNaN(age) ? 999 : age);

    if (buildingType === 'residential') {
      const reductionYears = isApartment ? 5 : 3;
      if (effectiveAge < reductionYears) {
        newBuildingReduction = propertyTax * 0.5;
        propertyTax = propertyTax * 0.5;
      }
    }

    // 特例適用前
    const beforeSpecial = assessed * 0.014 + assessed * 0.003;

    const totalAnnual = Math.round(propertyTax + cityPlanTax);
    const totalMonthly = Math.round(totalAnnual / 12);
    const savings = Math.round(beforeSpecial - totalAnnual);

    return {
      propertyTax: Math.round(propertyTax),
      cityPlanTax: Math.round(cityPlanTax),
      totalAnnual,
      totalMonthly,
      beforeSpecial: Math.round(beforeSpecial),
      savings,
      landSpecialApplied,
      landReduction: Math.round(landReduction),
      newBuildingReduction: Math.round(newBuildingReduction),
    };
  }, [assessedValue, landArea, buildingType, isNew, buildingAge, isApartment]);

  const formatYen = (n: number) =>
    n.toLocaleString('ja-JP');

  return (
    <>
      <head>
        <title>固定資産税シミュレーター｜年間の税額を無料計算｜不動産相場ナビ</title>
        <meta
          name="description"
          content="固定資産税・都市計画税の年間税額を無料でシミュレーション。住宅用地の特例や新築減額も自動計算。不動産購入・保有コストの把握にお役立てください。"
        />
        <link rel="canonical" href="https://market.next-aura.com/tools/property-tax" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: '固定資産税シミュレーター',
              description:
                '固定資産税・都市計画税の年間税額を無料でシミュレーション。住宅用地の特例や新築減額も自動計算。',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'JPY',
              },
              url: 'https://market.next-aura.com/tools/property-tax',
            }),
          }}
        />
      </head>

      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-12 text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            固定資産税シミュレーター
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            固定資産税・都市計画税の年間税額を無料で計算。住宅用地の特例や新築減額にも対応しています。
          </p>
        </section>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
          {/* 購入価格から概算 */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">購入価格から概算</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1 text-slate-400">
                  購入価格（万円）
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="例: 3000"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleEstimateFromPrice}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-medium transition-colors whitespace-nowrap"
              >
                評価額を自動入力
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ※ 購入価格の約70%を固定資産税評価額として自動入力します
            </p>
          </div>

          {/* 入力フォーム */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold mb-2">税額シミュレーション</h2>

            {/* 固定資産税評価額 */}
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-400">
                固定資産税評価額（万円）
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={assessedValue}
                onChange={(e) => setAssessedValue(e.target.value)}
                placeholder="例: 2100"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                購入価格の約70%が目安です
              </p>
            </div>

            {/* 土地面積 */}
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-400">
                土地面積（m²）
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                placeholder="例: 150"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                住宅用地の特例計算に使用します（任意）
              </p>
            </div>

            {/* 建物の種類 */}
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-400">
                建物の種類
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setBuildingType('residential')}
                  className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                    buildingType === 'residential'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  住宅用
                </button>
                <button
                  onClick={() => setBuildingType('commercial')}
                  className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                    buildingType === 'commercial'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  商業用
                </button>
              </div>
            </div>

            {/* 新築/中古 */}
            {buildingType === 'residential' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-400">
                    新築 / 中古
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsNew(true)}
                      className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                        isNew
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      新築
                    </button>
                    <button
                      onClick={() => setIsNew(false)}
                      className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                        !isNew
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      中古
                    </button>
                  </div>
                </div>

                {/* マンション/戸建 */}
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-400">
                    建物タイプ
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsApartment(false)}
                      className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                        !isApartment
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      戸建て
                    </button>
                    <button
                      onClick={() => setIsApartment(true)}
                      className={`flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                        isApartment
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      マンション
                    </button>
                  </div>
                </div>

                {/* 築年数（中古時） */}
                {!isNew && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-400">
                      築年数（年）
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={buildingAge}
                      onChange={(e) => setBuildingAge(e.target.value)}
                      placeholder="例: 10"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      新築減額の適用判定に使用します
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 計算結果 */}
          {result && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold">計算結果</h2>

              {/* メイン結果 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-5 rounded-xl bg-slate-700/30">
                  <p className="text-slate-300 text-sm mb-1">年間合計</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {formatYen(result.totalAnnual)}
                    <span className="text-base font-normal text-slate-400 ml-1">
                      万円
                    </span>
                  </p>
                </div>
                <div className="text-center p-5 rounded-xl bg-slate-700/30">
                  <p className="text-slate-300 text-sm mb-1">月額換算</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {formatYen(result.totalMonthly)}
                    <span className="text-base font-normal text-slate-400 ml-1">
                      万円
                    </span>
                  </p>
                </div>
              </div>

              {/* 内訳テーブル */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-300">内訳</h3>
                <div className="divide-y divide-slate-700/50">
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">固定資産税（税率 1.4%）</span>
                    <span className="text-white font-medium">
                      {formatYen(result.propertyTax)} 万円
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">都市計画税（税率 0.3%）</span>
                    <span className="text-white font-medium">
                      {formatYen(result.cityPlanTax)} 万円
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-600">
                    <span className="text-slate-300 font-medium">合計</span>
                    <span className="text-amber-400 font-bold">
                      {formatYen(result.totalAnnual)} 万円/年
                    </span>
                  </div>
                </div>
              </div>

              {/* 特例による差額 */}
              {result.savings > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-sm text-emerald-400 font-medium mb-1">
                    特例適用による軽減額
                  </p>
                  <p className="text-2xl font-bold text-emerald-400">
                    -{formatYen(result.savings)}
                    <span className="text-sm font-normal ml-1">万円/年</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    特例なしの場合: {formatYen(result.beforeSpecial)} 万円/年
                  </p>
                  <ul className="text-xs text-slate-400 mt-2 space-y-1">
                    {result.landSpecialApplied && (
                      <li>
                        ・住宅用地の特例適用（軽減額: {formatYen(result.landReduction)} 万円相当）
                      </li>
                    )}
                    {result.newBuildingReduction > 0 && (
                      <li>
                        ・新築住宅の減額特例適用（固定資産税 1/2、
                        {isApartment ? '5年間' : '3年間'}）
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 特例の解説 */}
          <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 text-sm text-slate-400 space-y-3">
            <h3 className="text-amber-400 font-medium text-base">
              固定資産税の特例について
            </h3>
            <div>
              <p className="font-medium text-slate-300 mb-1">住宅用地の特例</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  小規模住宅用地（200m²以下の部分）：固定資産税の課税標準が
                  <span className="text-amber-400">1/6</span>に軽減
                </li>
                <li>
                  一般住宅用地（200m²超の部分）：固定資産税の課税標準が
                  <span className="text-amber-400">1/3</span>に軽減
                </li>
                <li>
                  都市計画税も同様にそれぞれ1/3、2/3に軽減されます
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-300 mb-1">新築住宅の減額特例</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  一戸建て：新築後<span className="text-amber-400">3年間</span>
                  、固定資産税が1/2に減額
                </li>
                <li>
                  マンション等（3階建以上の耐火構造）：新築後
                  <span className="text-amber-400">5年間</span>、固定資産税が1/2に減額
                </li>
              </ul>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ※ 本シミュレーションは概算です。実際の税額は自治体の評価額や条例により異なる場合があります。
            </p>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/estimate"
              className="block text-center px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <p className="text-lg font-bold text-white">物件の適正価格を確認</p>
              <p className="text-sm text-emerald-200 mt-1">
                AIが相場データから適正価格を査定
              </p>
            </Link>
            <Link
              href="/pricing"
              className="block text-center px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 transition-colors"
            >
              <p className="text-lg font-bold text-black">プロ向けデータ分析</p>
              <p className="text-sm text-amber-900 mt-1">
                詳細な市場データとトレンド分析
              </p>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

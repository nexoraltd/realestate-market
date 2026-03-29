// 狙い目の土地分析スクリプト
// reinfolib APIから土地取引データを取得し、割安エリアを特定する

const API_BASE = 'https://www.reinfolib.mlit.go.jp/ex-api/external';
const API_KEY = '358076db69594cbbb9b279f88f23e41a';

async function fetchAPI(endpoint, params) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { 'Ocp-Apim-Subscription-Key': API_KEY }
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function getTransactions(year, quarter, area) {
  const data = await fetchAPI('XIT001', { year, quarter, area });
  return data.data || [];
}

const TARGET_AREAS = [
  { code: '08', name: '茨城県' },
  { code: '09', name: '栃木県' },
  { code: '10', name: '群馬県' },
  { code: '11', name: '埼玉県' },
  { code: '12', name: '千葉県' },
  { code: '13', name: '東京都' },
  { code: '14', name: '神奈川県' },
  { code: '23', name: '愛知県' },
  { code: '26', name: '京都府' },
  { code: '27', name: '大阪府' },
  { code: '28', name: '兵庫県' },
  { code: '40', name: '福岡県' },
];

// 直近データ + 1年前データ（トレンド比較用）
const RECENT = [
  { year: '2025', quarter: '3' },
  { year: '2025', quarter: '2' },
];
const PAST = [
  { year: '2024', quarter: '3' },
  { year: '2024', quarter: '2' },
];

async function fetchAll(periods) {
  const all = [];
  for (const period of periods) {
    const promises = TARGET_AREAS.map(async (area) => {
      try {
        const txs = await getTransactions(period.year, period.quarter, area.code);
        return txs.filter(tx => tx.Type === '宅地(土地)' && tx.Region === '住宅地');
      } catch (e) {
        return [];
      }
    });
    const results = await Promise.all(promises);
    results.forEach(txs => all.push(...txs));
  }
  return all;
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function aggregate(transactions) {
  const stats = {};
  for (const tx of transactions) {
    const price = parseInt(tx.TradePrice);
    const area = parseFloat(tx.Area);
    if (!price || !area || area < 30) continue; // 30㎡未満は除外

    const key = `${tx.Prefecture}${tx.Municipality}`;
    if (!stats[key]) {
      stats[key] = {
        prefecture: tx.Prefecture,
        municipality: tx.Municipality,
        pricesPerTsubo: [],
        areas: [],
        totalPrices: [],
        districts: new Set(),
        cityPlannings: {},
        purposes: {},
        roads: [],
      };
    }
    const tsuboPrice = (price / area) * 3.30579;
    stats[key].pricesPerTsubo.push(tsuboPrice);
    stats[key].areas.push(area);
    stats[key].totalPrices.push(price);
    if (tx.DistrictName) stats[key].districts.add(tx.DistrictName);
    if (tx.CityPlanning) {
      stats[key].cityPlannings[tx.CityPlanning] = (stats[key].cityPlannings[tx.CityPlanning] || 0) + 1;
    }
    if (tx.Breadth) stats[key].roads.push(parseFloat(tx.Breadth));
  }
  return stats;
}

async function main() {
  console.log('=== 狙い目の土地分析 ===\n');
  console.log('国土交通省 不動産情報ライブラリから住宅地の土地取引データを取得中...\n');

  // 直近と1年前を並行取得
  const [recentTxs, pastTxs] = await Promise.all([fetchAll(RECENT), fetchAll(PAST)]);
  console.log(`直近(2025年): ${recentTxs.length}件 / 前年(2024年): ${pastTxs.length}件\n`);

  const recentStats = aggregate(recentTxs);
  const pastStats = aggregate(pastTxs);

  // 各エリアの統計を計算
  const results = [];
  for (const [key, s] of Object.entries(recentStats)) {
    if (s.pricesPerTsubo.length < 3) continue; // 3件未満は除外

    const medPrice = median(s.pricesPerTsubo);
    const avgArea = s.areas.reduce((a, b) => a + b, 0) / s.areas.length;
    const avgRoad = s.roads.length ? s.roads.reduce((a, b) => a + b, 0) / s.roads.length : 0;
    const topPlanning = Object.entries(s.cityPlannings).sort((a, b) => b[1] - a[1])[0];

    // 前年比トレンド
    let yoyChange = null;
    if (pastStats[key] && pastStats[key].pricesPerTsubo.length >= 3) {
      const pastMed = median(pastStats[key].pricesPerTsubo);
      yoyChange = ((medPrice - pastMed) / pastMed) * 100;
    }

    results.push({
      key,
      prefecture: s.prefecture,
      municipality: s.municipality,
      medianTsubo: medPrice,
      avgArea,
      avgRoad,
      txCount: s.pricesPerTsubo.length,
      topDistricts: [...s.districts].slice(0, 5),
      mainZoning: topPlanning ? topPlanning[0] : '不明',
      yoyChange,
      medianTotal: median(s.totalPrices),
    });
  }

  // ===== 1. 全体の狙い目ランキング =====
  // 坪単価が安い×取引活発×前道幅員が広い
  const maxPrice = Math.max(...results.map(r => r.medianTsubo));
  const maxRoad = Math.max(...results.filter(r => r.avgRoad > 0).map(r => r.avgRoad));

  results.forEach(r => {
    const affordability = 1 - (r.medianTsubo / maxPrice);
    const roadScore = r.avgRoad > 0 ? r.avgRoad / maxRoad : 0.3;
    const volumeScore = Math.min(r.txCount / 30, 1);
    // 前年比で上がりすぎてないエリアにボーナス（まだ上がり切ってない）
    let trendScore = 0.5;
    if (r.yoyChange !== null) {
      if (r.yoyChange >= 0 && r.yoyChange <= 10) trendScore = 0.9; // 緩やかな上昇 = Good
      else if (r.yoyChange < 0) trendScore = 0.7; // 下落 = まあまあ（底値の可能性）
      else trendScore = 0.3; // 急騰 = もう遅い可能性
    }
    r.score = (affordability * 35 + roadScore * 15 + volumeScore * 15 + trendScore * 35);
  });

  results.sort((a, b) => b.score - a.score);

  const fmt = (n) => Math.round(n / 10000).toLocaleString();
  const fmtTotal = (n) => (n / 10000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 狙い目エリア総合ランキング TOP 25（住宅地の土地取引）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (let i = 0; i < Math.min(25, results.length); i++) {
    const r = results[i];
    const trend = r.yoyChange !== null
      ? (r.yoyChange >= 0 ? `+${r.yoyChange.toFixed(1)}%` : `${r.yoyChange.toFixed(1)}%`)
      : 'N/A';
    const trendIcon = r.yoyChange !== null
      ? (r.yoyChange > 5 ? '📈' : r.yoyChange > 0 ? '↗️' : r.yoyChange > -5 ? '→' : '📉')
      : '?';

    console.log(`${String(i + 1).padStart(2)}. ${r.prefecture}${r.municipality}  [スコア: ${r.score.toFixed(1)}]`);
    console.log(`    坪単価: ${fmt(r.medianTsubo)}万円/坪 | 総額中央値: ${fmtTotal(r.medianTotal)}万円`);
    console.log(`    前年比: ${trend} ${trendIcon} | 面積: ${Math.round(r.avgArea)}㎡ | 前道: ${r.avgRoad.toFixed(1)}m | 件数: ${r.txCount}`);
    console.log(`    用途地域: ${r.mainZoning}`);
    console.log(`    地区: ${r.topDistricts.join(', ')}`);
    console.log('');
  }

  // ===== 2. 東京近郊の割安エリア =====
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏠 東京近郊（埼玉・千葉・神奈川・茨城）坪単価が安い順 TOP 15');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const suburban = results
    .filter(r => ['埼玉県', '千葉県', '神奈川県', '茨城県', '栃木県', '群馬県'].includes(r.prefecture))
    .sort((a, b) => a.medianTsubo - b.medianTsubo)
    .slice(0, 15);

  for (let i = 0; i < suburban.length; i++) {
    const r = suburban[i];
    const trend = r.yoyChange !== null ? `${r.yoyChange >= 0 ? '+' : ''}${r.yoyChange.toFixed(1)}%` : 'N/A';
    console.log(`${String(i + 1).padStart(2)}. ${r.prefecture}${r.municipality}`);
    console.log(`    坪単価: ${fmt(r.medianTsubo)}万円/坪 | 総額: ${fmtTotal(r.medianTotal)}万円 | 前年比: ${trend} | ${r.txCount}件`);
    console.log(`    地区: ${r.topDistricts.join(', ')}`);
    console.log('');
  }

  // ===== 3. 上昇トレンドのエリア =====
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 前年比で上昇中のエリア（まだ割安なもの）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const rising = results
    .filter(r => r.yoyChange !== null && r.yoyChange > 0 && r.yoyChange <= 15 && r.medianTsubo / 10000 < 50)
    .sort((a, b) => b.yoyChange - a.yoyChange)
    .slice(0, 15);

  for (let i = 0; i < rising.length; i++) {
    const r = rising[i];
    console.log(`${String(i + 1).padStart(2)}. ${r.prefecture}${r.municipality}  +${r.yoyChange.toFixed(1)}%`);
    console.log(`    坪単価: ${fmt(r.medianTsubo)}万円/坪 | 総額: ${fmtTotal(r.medianTotal)}万円 | ${r.txCount}件`);
    console.log(`    地区: ${r.topDistricts.join(', ')}`);
    console.log('');
  }

  // ===== 4. 投資利回り視点（安い土地＋広い） =====
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 投資向き（総額1,500万円以下・100㎡以上）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const investment = results
    .filter(r => r.medianTotal <= 15000000 && r.avgArea >= 100)
    .sort((a, b) => a.medianTotal - b.medianTotal)
    .slice(0, 15);

  for (let i = 0; i < investment.length; i++) {
    const r = investment[i];
    const trend = r.yoyChange !== null ? `${r.yoyChange >= 0 ? '+' : ''}${r.yoyChange.toFixed(1)}%` : 'N/A';
    console.log(`${String(i + 1).padStart(2)}. ${r.prefecture}${r.municipality}`);
    console.log(`    総額: ${fmtTotal(r.medianTotal)}万円 | 坪単価: ${fmt(r.medianTsubo)}万円/坪 | 面積: ${Math.round(r.avgArea)}㎡`);
    console.log(`    前年比: ${trend} | ${r.txCount}件 | 地区: ${r.topDistricts.slice(0, 3).join(', ')}`);
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  注意');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('- データソース: 国土交通省 不動産情報ライブラリ（実取引価格）');
  console.log('- 対象: 住宅地の「宅地(土地)」取引のみ（建物付き除外）');
  console.log('- 直近: 2025年Q2-Q3 / 前年: 2024年Q2-Q3');
  console.log('- 3件以上の取引があるエリアのみ表示');
  console.log('- 投資判断は現地調査・ハザードマップ・都市計画の確認が必要');
}

main().catch(console.error);

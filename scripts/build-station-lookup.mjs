#!/usr/bin/env node
// node --env-file=.env.local scripts/build-station-lookup.mjs
// Fetches station→district data from REINFOLIB in-api and upserts to Supabase station_lookup

import { createClient } from "@supabase/supabase-js";

const IN_API_KEY = "6da659233e9c4d3b9daaedfb22c750d9";
const IN_API_BASE = "https://www.reinfolib.mlit.go.jp/in-api";
const HEADERS = { "Ocp-Apim-Subscription-Key": IN_API_KEY };
const BATCH_SIZE = 500;
const DELAY_MS = 200; // be polite to the server

const PREFECTURES = [
  "01","02","03","04","05","06","07","08","09","10",
  "11","12","13","14","15","16","17","18","19","20",
  "21","22","23","24","25","26","27","28","29","30",
  "31","32","33","34","35","36","37","38","39","40",
  "41","42","43","44","45","46","47",
];

// Max pages per prefecture (20 records/page → 2000 records per pref)
const MAX_PAGES = {
  "13": 150, // Tokyo
  "27": 80,  // Osaka
  "14": 80,  // Kanagawa
  "23": 60,  // Aichi
  "11": 50,  // Saitama
  "12": 50,  // Chiba
  "26": 40,  // Kyoto
  "28": 40,  // Hyogo
  "40": 40,  // Fukuoka
};
const DEFAULT_MAX_PAGES = 200;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(prefCode, page) {
  const url =
    `${IN_API_BASE}/api-aur/aur/realEstatePricesResult` +
    `?language=ja&page=${page}&areaCondition=address&prefecture=${prefCode}` +
    `&transactionPrice=true&closedPrice=true&kind=residential` +
    `&seasonFrom=20231&seasonTo=20254`;
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status} for pref=${prefCode} page=${page}`);
  return r.json();
}

async function collectPrefecture(prefCode) {
  // Map: `${city_code}|${district}` → { station, time, count }
  const districtMap = new Map();
  const maxPages = MAX_PAGES[prefCode] ?? DEFAULT_MAX_PAGES;

  for (let page = 1; page <= maxPages; page++) {
    let data;
    try {
      data = await fetchPage(prefCode, page);
    } catch (e) {
      console.warn(`  skip page ${page}: ${e.message}`);
      break;
    }

    const items = data.data || [];
    if (items.length === 0) break;

    let newEntries = 0;
    for (const item of items) {
      const cityCode = item.city_code;
      const district = item.district_name_ja;
      const station = item.station_name_ja;
      const time =
        typeof item.distance_from_nearest_station === "number"
          ? item.distance_from_nearest_station
          : null;

      if (!cityCode || !district || !station) continue;

      const key = `${cityCode}|${district}`;
      if (!districtMap.has(key)) {
        districtMap.set(key, new Map());
        newEntries++;
      }
      const stMap = districtMap.get(key);
      if (!stMap.has(station)) stMap.set(station, { count: 0, minTime: Infinity });
      const entry = stMap.get(station);
      entry.count++;
      if (time !== null && time < entry.minTime) entry.minTime = time;
    }

    process.stdout.write(`\r  pref=${prefCode} page=${page}/${maxPages} districts=${districtMap.size} new=${newEntries}    `);

    await sleep(DELAY_MS);
  }
  console.log();

  // Build result rows
  const rows = [];
  for (const [key, stMap] of districtMap) {
    const [cityCode, district] = key.split("|");
    let bestStation = null;
    let bestCount = -1;
    let bestTime = null;
    for (const [station, { count, minTime }] of stMap) {
      if (count > bestCount || (count === bestCount && minTime < (bestTime ?? Infinity))) {
        bestStation = station;
        bestCount = count;
        bestTime = minTime === Infinity ? null : minTime;
      }
    }
    rows.push({
      municipality_code: cityCode,
      district_name: district,
      nearest_station: bestStation,
      time_to_station: bestTime,
    });
  }
  return rows;
}

async function upsertBatch(rows) {
  const { error } = await supabase
    .from("station_lookup")
    .upsert(rows, { onConflict: "municipality_code,district_name" });
  if (error) throw error;
}

async function main() {
  const prefFilter = process.argv[2]; // optional: single pref code
  const prefs = prefFilter ? [prefFilter] : PREFECTURES;

  console.log(`${prefs.length}都道府県を処理中...`);
  let totalUpserted = 0;

  for (const pref of prefs) {
    console.log(`\n都道府県 ${pref} を収集中...`);
    const rows = await collectPrefecture(pref);
    console.log(`  ${rows.length}地区をupsert中...`);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      await upsertBatch(rows.slice(i, i + BATCH_SIZE));
    }
    totalUpserted += rows.length;
    console.log(`  完了 (累計: ${totalUpserted}地区)`);
  }

  console.log(`\n全完了: ${totalUpserted}地区をupsert`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

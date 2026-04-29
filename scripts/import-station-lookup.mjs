#!/usr/bin/env node
// Usage: node --env-file=.env.local scripts/import-station-lookup.mjs <csv-file-or-dir>
// MLIT REINFOLIB CSV (UTF-16 LE, comma-delimited) → Supabase station_lookup
//
// Download CSVs from: https://www.reinfolib.mlit.go.jp/
// Table (不動産取引価格情報) → 都道府県を選択 → CSVダウンロード

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const BATCH_SIZE = 500;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseCsv(filePath) {
  const buf = fs.readFileSync(filePath);
  const isBom = buf[0] === 0xff && buf[1] === 0xfe;
  const text = isBom ? buf.slice(2).toString("utf16le") : buf.toString("utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  const colIdx = (name) => headers.findIndex((h) => h === name);
  const codeCol = colIdx("市区町村コード");
  const distCol = colIdx("地区名");
  const stationCol = colIdx("最寄駅：名称");
  const timeCol = colIdx("最寄駅：距離（分）");

  if (codeCol === -1 || distCol === -1 || stationCol === -1) {
    console.error("必要なカラムが見つかりません。ヘッダー:", headers.slice(0, 10));
    return [];
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const code = cols[codeCol];
    const dist = cols[distCol];
    const station = cols[stationCol];
    const time = parseInt(cols[timeCol], 10);
    if (code && dist && station) {
      rows.push({ code, dist, station, time: isNaN(time) ? null : time });
    }
  }
  return rows;
}

function buildLookup(rows) {
  // (code, dist) → Map<station, {count, minTime}>
  const map = new Map();
  for (const { code, dist, station, time } of rows) {
    const key = `${code}|${dist}`;
    if (!map.has(key)) map.set(key, new Map());
    const stMap = map.get(key);
    if (!stMap.has(station)) stMap.set(station, { count: 0, minTime: Infinity });
    const entry = stMap.get(station);
    entry.count++;
    if (time !== null && time < entry.minTime) entry.minTime = time;
  }

  const result = [];
  for (const [key, stMap] of map) {
    const [code, dist] = key.split("|");
    // Pick station with highest count; break ties by shortest time
    let best = null;
    let bestCount = -1;
    let bestTime = Infinity;
    for (const [station, { count, minTime }] of stMap) {
      if (count > bestCount || (count === bestCount && minTime < bestTime)) {
        best = station;
        bestCount = count;
        bestTime = minTime === Infinity ? null : minTime;
      }
    }
    result.push({
      municipality_code: code,
      district_name: dist,
      nearest_station: best,
      time_to_station: bestTime === Infinity ? null : bestTime,
    });
  }
  return result;
}

async function upsertBatch(rows) {
  const { error } = await supabase
    .from("station_lookup")
    .upsert(rows, { onConflict: "municipality_code,district_name" });
  if (error) throw error;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: node --env-file=.env.local scripts/import-station-lookup.mjs <csv-file-or-dir>");
    process.exit(1);
  }

  const stat = fs.statSync(arg);
  const files = stat.isDirectory()
    ? fs.readdirSync(arg).filter((f) => f.endsWith(".csv")).map((f) => path.join(arg, f))
    : [arg];

  console.log(`${files.length}ファイルを処理中...`);

  const allRows = [];
  for (const f of files) {
    console.log(`  解析中: ${path.basename(f)}`);
    allRows.push(...parseCsv(f));
  }

  console.log(`総レコード数: ${allRows.length}`);
  const lookup = buildLookup(allRows);
  console.log(`ユニーク地区数: ${lookup.length}`);

  let upserted = 0;
  for (let i = 0; i < lookup.length; i += BATCH_SIZE) {
    await upsertBatch(lookup.slice(i, i + BATCH_SIZE));
    upserted += Math.min(BATCH_SIZE, lookup.length - i);
    process.stdout.write(`\r  upsert: ${upserted}/${lookup.length}`);
  }
  console.log("\n完了");
}

main().catch((e) => { console.error(e); process.exit(1); });

import { NextRequest, NextResponse } from "next/server";
import { getTransactions, Transaction } from "@/lib/api";
import { checkApiAuth } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

function toCSV(rows: Transaction[]): string {
  if (rows.length === 0) return "";

  const headers = [
    "取引時期", "種別", "都道府県", "市区町村", "地区名",
    "取引価格(円)", "坪単価(円)", "面積(㎡)", "建築年",
    "構造", "用途", "最寄り駅", "駅距離(分)",
    "間取り", "土地の形状", "容積率", "建蔽率",
  ];

  const escape = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;

  const dataRows = rows.map((r) =>
    [
      escape(r.Period),
      escape(r.Type),
      escape(r.Prefecture),
      escape(r.Municipality),
      escape(r.DistrictName),
      escape(r.TradePrice),
      escape(r.UnitPrice),
      escape(r.Area),
      escape(r.BuildingYear),
      escape(r.Structure),
      escape(r.Use),
      escape(r.NearestStation),
      escape(r.TimeToNearestStation),
      escape(r.FloorPlan),
      escape(r.LandShape),
      escape(r.FloorAreaRatio),
      escape(r.CoverageRatio),
    ].join(",")
  );

  return "\uFEFF" + [headers.join(","), ...dataRows].join("\r\n");
}

export async function GET(req: NextRequest) {
  const authError = checkApiAuth(req);
  if (authError) return authError;

  const params = req.nextUrl.searchParams;
  const area = params.get("area");
  const year = params.get("year") || "2024";

  if (!area) {
    return NextResponse.json({ error: "area is required" }, { status: 400 });
  }

  const quarters = ["1", "2", "3", "4"];
  const allRows: Transaction[] = [];

  await Promise.all(
    quarters.map(async (quarter) => {
      try {
        const rows = await getTransactions({ year, quarter, area });
        allRows.push(...rows);
      } catch {
        // 一部の四半期でデータなしの場合はスキップ
      }
    })
  );

  const csv = toCSV(allRows);
  const filename = `realestate_${area}_${year}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/api";
import { checkApiAuth } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authError = checkApiAuth(req);
  if (authError) return authError;

  const params = req.nextUrl.searchParams;
  const area = params.get("area");
  const type = params.get("type") || "all";

  if (!area) {
    return NextResponse.json({ error: "area is required" }, { status: 400 });
  }

  // 直近5年分を取得
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const quarters = ["1", "2", "3", "4"];

  const TYPE_MAP: Record<string, string> = {
    mansion: "中古マンション等",
    house: "宅地(土地と建物)",
    land: "宅地(土地)",
    forest: "林地",
  };

  const allRows: { TradePrice: string; Type: string; Period: string }[] = [];

  await Promise.all(
    years.flatMap((year) =>
      quarters.map(async (quarter) => {
        try {
          const rows = await getTransactions({ year, quarter, area });
          allRows.push(
            ...rows.map((r) => ({
              TradePrice: r.TradePrice,
              Type: r.Type,
              Period: r.Period,
            }))
          );
        } catch {
          // skip
        }
      })
    )
  );

  const filtered =
    type === "all"
      ? allRows
      : allRows.filter((r) => r.Type === TYPE_MAP[type]);

  return NextResponse.json(filtered);
}

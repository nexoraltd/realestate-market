import { NextResponse } from "next/server";
import { getLatestAvailablePeriod } from "@/lib/latestPeriod.server";

export const revalidate = 21600;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const period = await getLatestAvailablePeriod();
    return NextResponse.json(period, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Latest transaction period is unavailable" },
      { status: 503 }
    );
  }
}

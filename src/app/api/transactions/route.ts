import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/api";
import { checkApiAuth } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  const authError = checkApiAuth(request);
  if (authError) return authError;

  const params = request.nextUrl.searchParams;
  const year = params.get("year");
  const quarter = params.get("quarter");
  const area = params.get("area");
  const city = params.get("city");

  if (!year || !quarter) {
    return NextResponse.json(
      { error: "year and quarter are required" },
      { status: 400 }
    );
  }
  if (!area && !city) {
    return NextResponse.json(
      { error: "area or city is required" },
      { status: 400 }
    );
  }

  try {
    const transactions = await getTransactions({
      year,
      quarter,
      area: area || undefined,
      city: city || undefined,
    });
    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCities } from "@/lib/api";

export async function GET(request: NextRequest) {
  const area = request.nextUrl.searchParams.get("area");
  if (!area) {
    return NextResponse.json({ error: "area is required" }, { status: 400 });
  }

  try {
    const cities = await getCities(area);
    return NextResponse.json(cities);
  } catch {
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}

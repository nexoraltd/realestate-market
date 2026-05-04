import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE.name, "", {
    ...SESSION_COOKIE.options,
    maxAge: 0,
  });
  return res;
}

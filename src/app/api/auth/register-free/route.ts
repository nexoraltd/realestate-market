import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deprecated: legacy email/password registration.
 * Registration is now handled by Clerk via the /login page (Magic Link + Google).
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "登録方法が変更されました。/login ページからメールリンクまたはGoogleで登録してください。",
    },
    { status: 410 }
  );
}

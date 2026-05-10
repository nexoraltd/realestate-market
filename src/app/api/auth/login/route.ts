import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deprecated: legacy password login.
 * Auth is now handled by Clerk via the /login page (Magic Link + Google).
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "ログイン方法が変更されました。/login ページからメールリンクまたはGoogleでサインインしてください。",
    },
    { status: 410 }
  );
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deprecated: legacy Stripe-metadata magic link.
 * Magic links are now sent by Clerk from the /login page.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "ログイン方法が変更されました。/login ページからメールリンクを送信してください。",
    },
    { status: 410 }
  );
}

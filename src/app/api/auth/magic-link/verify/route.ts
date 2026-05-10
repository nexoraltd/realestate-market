import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deprecated: Clerk handles magic-link verification client-side.
 */
export async function GET() {
  return NextResponse.json(
    {
      error:
        "ログインリンクの検証方法が変更されました。/login ページから再度メールリンクを送信してください。",
    },
    { status: 410 }
  );
}

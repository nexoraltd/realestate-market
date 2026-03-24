import { NextRequest, NextResponse } from "next/server";

/**
 * 内部APIシークレットキーによる認証チェック
 *
 * フロントエンドからのリクエストには必ず
 * `x-internal-secret: <INTERNAL_API_SECRET>` ヘッダーを付与すること。
 *
 * 直接URLを叩くだけでは 401 が返る。
 */
export function checkApiAuth(req: NextRequest): NextResponse | null {
  const secret = process.env.INTERNAL_API_SECRET;

  // 環境変数が設定されていない場合はログを出して通過（開発環境向け）
  if (!secret) {
    console.warn("[apiAuth] INTERNAL_API_SECRET is not set. Skipping auth check.");
    return null;
  }

  const provided = req.headers.get("x-internal-secret");

  if (!provided || provided !== secret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null; // 認証OK
}

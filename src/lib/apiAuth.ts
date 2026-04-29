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

  // 環境変数が未設定なら通過（開発環境向け）
  if (!secret) {
    return null;
  }

  const provided = req.headers.get("x-internal-secret");

  // シークレットが一致すれば通過
  if (provided && provided === secret) {
    return null;
  }

  // 同一オリジンからのリクエストは許可（ブラウザのfetch呼び出し）
  const host = req.headers.get("host") || "";
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  if ((origin && origin.includes(host)) || (referer && referer.includes(host))) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * 内部APIシークレットキーを付与したfetch関数
 *
 * フロントエンドからAPIを叩く際に必ずこれを使うこと。
 * NEXT_PUBLIC_INTERNAL_API_SECRET 環境変数が設定されていれば認証ヘッダーを付与する。
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const secret = process.env.NEXT_PUBLIC_INTERNAL_API_SECRET;

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (secret) {
    headers["x-internal-secret"] = secret;
  }

  return fetch(input, { ...init, headers });
}

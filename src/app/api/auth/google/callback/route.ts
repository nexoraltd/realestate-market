import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

/** Base64url decode (JWT payload) — no external library needed */
function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT format");
  // Base64url → Base64 → decode
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const json = Buffer.from(padded, "base64").toString("utf-8");
  return JSON.parse(json);
}

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://market.next-aura.com";
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/register?error=google_cancelled`);
  }

  // 1. Googleのtoken endpointにcodeを渡してid_tokenを取得
  let idToken: string;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[google/callback] token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${baseUrl}/register?error=google_token`);
    }

    const tokenData = (await tokenRes.json()) as { id_token?: string };
    if (!tokenData.id_token) {
      return NextResponse.redirect(`${baseUrl}/register?error=google_no_token`);
    }
    idToken = tokenData.id_token;
  } catch (err) {
    console.error("[google/callback] token fetch error:", err);
    return NextResponse.redirect(`${baseUrl}/register?error=google_token`);
  }

  // 2. id_tokenをdecodeしてemailを取得
  let email: string;
  try {
    const payload = decodeJwtPayload(idToken);
    if (typeof payload.email !== "string" || !payload.email) {
      return NextResponse.redirect(`${baseUrl}/register?error=google_no_email`);
    }
    email = payload.email;
  } catch (err) {
    console.error("[google/callback] JWT decode error:", err);
    return NextResponse.redirect(`${baseUrl}/register?error=google_decode`);
  }

  // 3. Stripe顧客を検索/作成
  let plan = "free";
  try {
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
      apiVersion: "2026-02-25.clover",
    });

    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      // 既存顧客: planを取得
      plan = existing.data[0].metadata?.plan || "free";
    } else {
      // 新規顧客: Googleログイン由来フラグをセット
      await stripe.customers.create({
        email,
        metadata: {
          plan: "free",
          registered_at: new Date().toISOString(),
          auth_provider: "google",
        },
      });
    }
  } catch (err) {
    console.error("[google/callback] Stripe error:", err);
    // Stripe失敗でも認証は通す（freeとして扱う）
  }

  // 4. google-successページにリダイレクト（クエリパラメータでemail+planを渡す）
  const successParams = new URLSearchParams({ email, plan });
  return NextResponse.redirect(`${baseUrl}/auth/google-success?${successParams.toString()}`);
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { encodeSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Base64url decode (JWT payload) — no external library needed */
function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT format");
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const json = Buffer.from(padded, "base64").toString("utf-8");
  return JSON.parse(json) as Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://market.next-aura.com";
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/register?error=google_cancelled`);
  }

  // 1. Exchange code for id_token
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

  // 2. Extract email from id_token
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

  // 3. Check Supabase for existing user
  let plan = "free";
  let customerId: string | undefined;

  const { data: dbUser } = await supabaseAdmin
    .from("realestate_users")
    .select("plan, stripe_customer_id")
    .eq("email", email)
    .single();

  if (dbUser) {
    plan = dbUser.plan;
    customerId = dbUser.stripe_customer_id ?? undefined;
  } else {
    // New user — check Stripe for any existing customer
    try {
      const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
        apiVersion: "2026-02-25.clover",
      });
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        plan = existing.data[0].metadata?.plan || "free";
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: {
            plan: "free",
            registered_at: new Date().toISOString(),
            auth_provider: "google",
          },
        });
        customerId = customer.id;
      }
    } catch (err) {
      console.error("[google/callback] Stripe error (non-fatal):", err);
    }
  }

  // 4. Upsert into Supabase
  try {
    await supabaseAdmin
      .from("realestate_users")
      .upsert(
        { email, plan, ...(customerId ? { stripe_customer_id: customerId } : {}) },
        { onConflict: "email" }
      );
  } catch (e) {
    console.error("[google/callback] Supabase upsert error:", e);
  }

  // 5. Set session cookie and redirect
  const successParams = new URLSearchParams({ email, plan });
  const response = NextResponse.redirect(
    `${baseUrl}/auth/google-success?${successParams.toString()}`
  );
  response.cookies.set(
    SESSION_COOKIE.name,
    encodeSession({ email, plan }),
    SESSION_COOKIE.options
  );
  return response;
}

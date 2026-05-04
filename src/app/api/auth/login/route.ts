import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { encodeSession, SESSION_COOKIE } from "@/lib/session";
import { STRIPE_PRICE_IDS } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * Supabase lookup first; falls back to Stripe for unmigrated users (lazy migration).
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードを入力してください" },
        { status: 400 }
      );
    }

    // 1. Look up user in Supabase
    const { data: dbUser } = await supabaseAdmin
      .from("realestate_users")
      .select("id, password_hash, plan, stripe_customer_id, current_period_end")
      .eq("email", email)
      .single();

    if (dbUser?.password_hash) {
      // Supabase user found — verify password
      const valid = await bcrypt.compare(password, dbUser.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: "メールアドレスまたはパスワードが正しくありません" },
          { status: 401 }
        );
      }

      const res = NextResponse.json({
        active: true,
        plan: dbUser.plan,
        customer_id: dbUser.stripe_customer_id ?? null,
        trial: false,
        current_period_end: dbUser.current_period_end ?? null,
      });
      res.cookies.set(
        SESSION_COOKIE.name,
        encodeSession({ email, plan: dbUser.plan }),
        SESSION_COOKIE.options
      );
      return res;
    }

    // 2. Fallback: Stripe lookup for unmigrated users (lazy migration)
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
      apiVersion: "2026-02-25.clover",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    const customer = customers.data[0];
    const passwordHash = customer.metadata?.password_hash;

    if (!passwordHash) {
      return NextResponse.json({ error: "no_password" }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    // Determine plan from Stripe subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });
    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    let plan = "free";
    let periodEnd: string | null = null;

    if (activeSub) {
      const priceId = activeSub.items.data[0]?.price?.id;
      const metaPlan = activeSub.metadata?.plan;
      if (metaPlan) {
        plan = metaPlan;
      } else if (priceId) {
        const entry = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId);
        if (entry) plan = entry[0];
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pe = (activeSub as any).current_period_end as number | null;
      if (pe) periodEnd = new Date(pe * 1000).toISOString();
    }

    // Lazy migrate: upsert this user into Supabase
    await supabaseAdmin.from("realestate_users").upsert(
      {
        email,
        password_hash: passwordHash,
        plan,
        stripe_customer_id: customer.id,
        current_period_end: periodEnd,
      },
      { onConflict: "email" }
    );

    const res = NextResponse.json({
      active: true,
      plan,
      customer_id: customer.id,
      trial: activeSub?.status === "trialing",
      current_period_end: periodEnd,
    });
    res.cookies.set(
      SESSION_COOKIE.name,
      encodeSession({ email, plan }),
      SESSION_COOKIE.options
    );
    return res;
  } catch (err) {
    console.error("[auth/login] error:", err);
    return NextResponse.json({ error: "ログインに失敗しました" }, { status: 500 });
  }
}

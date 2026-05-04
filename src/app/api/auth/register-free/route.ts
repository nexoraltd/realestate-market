import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { encodeSession, SESSION_COOKIE } from "@/lib/session";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードを入力してください" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上で入力してください" },
        { status: 400 }
      );
    }

    // Check if already registered in Supabase
    const { data: existing } = await supabaseAdmin
      .from("realestate_users")
      .select("id, password_hash")
      .eq("email", email)
      .single();

    if (existing?.password_hash) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています。ログインしてください。" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 12);

    // Upsert into Supabase (email may already exist without password, e.g. from OAuth)
    await supabaseAdmin.from("realestate_users").upsert(
      { email, password_hash: hash, plan: "free" },
      { onConflict: "email" }
    );

    // Also create/link Stripe customer for future billing
    let customerId: string | undefined;
    try {
      const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
        apiVersion: "2026-02-25.clover",
      });
      const stripeExisting = await stripe.customers.list({ email, limit: 1 });
      if (stripeExisting.data.length > 0) {
        customerId = stripeExisting.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: { plan: "free", registered_at: new Date().toISOString() },
        });
        customerId = customer.id;
      }
      if (customerId) {
        await supabaseAdmin
          .from("realestate_users")
          .update({ stripe_customer_id: customerId })
          .eq("email", email);
      }
    } catch (stripeErr) {
      console.error("[register-free] Stripe error (non-fatal):", stripeErr);
    }

    await sendWelcomeEmail(email).catch((e) =>
      console.error("[register-free] welcome email error:", e)
    );

    const res = NextResponse.json({
      success: true,
      plan: "free",
      customer_id: customerId ?? null,
    });
    res.cookies.set(
      SESSION_COOKIE.name,
      encodeSession({ email, plan: "free" }),
      SESSION_COOKIE.options
    );
    return res;
  } catch (err) {
    console.error("[auth/register-free] error:", err);
    return NextResponse.json(
      { error: "登録に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
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

    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
      apiVersion: "2026-02-25.clover",
    });

    // Check if customer already exists
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      const customer = existing.data[0];
      if (customer.metadata?.password_hash) {
        return NextResponse.json(
          { error: "このメールアドレスは既に登録されています。ログインしてください。" },
          { status: 409 }
        );
      }
      // Customer exists but no password (e.g. from newsletter) — set password
      const hash = await bcrypt.hash(password, 12);
      await stripe.customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          password_hash: hash,
          plan: customer.metadata?.plan || "free",
          registered_at: customer.metadata?.registered_at || new Date().toISOString(),
        },
      });
      await sendWelcomeEmail(email).catch((e) =>
        console.error("[register-free] welcome email error:", e)
      );
      return NextResponse.json({
        success: true,
        plan: "free",
        customer_id: customer.id,
      });
    }

    // Create new Stripe customer
    const hash = await bcrypt.hash(password, 12);
    const customer = await stripe.customers.create({
      email,
      metadata: {
        password_hash: hash,
        plan: "free",
        registered_at: new Date().toISOString(),
      },
    });

    await sendWelcomeEmail(email).catch((e) =>
      console.error("[register-free] welcome email error:", e)
    );

    return NextResponse.json({
      success: true,
      plan: "free",
      customer_id: customer.id,
    });
  } catch (err) {
    console.error("[auth/register-free] error:", err);
    return NextResponse.json(
      { error: "登録に失敗しました。しばらくしてからお試しください。" },
      { status: 500 }
    );
  }
}


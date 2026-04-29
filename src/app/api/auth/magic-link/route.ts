import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendMagicLinkEmail, sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスを入力してください" },
        { status: 400 }
      );
    }

    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
      apiVersion: "2026-02-25.clover",
    });

    const existing = await stripe.customers.list({ email, limit: 1 });
    let customer = existing.data[0];
    let isNew = false;

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        metadata: {
          plan: "free",
          registered_at: new Date().toISOString(),
        },
      });
      isNew = true;
    }

    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await stripe.customers.update(customer.id, {
      metadata: {
        ...customer.metadata,
        magic_token: token,
        magic_token_exp: expiry,
      },
    });

    await sendMagicLinkEmail(email, token);
    if (isNew) {
      await sendWelcomeEmail(email).catch(() => {});
    }

    return NextResponse.json({ success: true, isNew });
  } catch (err) {
    console.error("[auth/magic-link] error:", err);
    return NextResponse.json({ error: "処理に失敗しました" }, { status: 500 });
  }
}

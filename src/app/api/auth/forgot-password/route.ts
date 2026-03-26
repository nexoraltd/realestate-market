import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 * パスワードリセットリンクをメール送信する。
 * メールが存在しなくても 200 を返す（メールアドレス列挙防止）。
 */
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

    const customers = await stripe.customers.list({ email, limit: 1 });

    // メールが存在しない場合も成功を返す（セキュリティ対策）
    if (customers.data.length === 0) {
      return NextResponse.json({ success: true });
    }

    const customer = customers.data[0];

    // アクティブなサブスクリプションを確認
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });
    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );
    if (!activeSub) {
      return NextResponse.json({ success: true });
    }

    // リセットトークンを生成（24時間有効）
    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await stripe.customers.update(customer.id, {
      metadata: {
        reset_token: token,
        reset_token_exp: expiry,
      },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/forgot-password] error:", err);
    return NextResponse.json({ error: "処理に失敗しました" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

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
        },
      });
      await sendWelcomeEmail(email);
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
      },
    });

    await sendWelcomeEmail(email);

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

async function sendWelcomeEmail(email: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "不動産相場ナビ <noreply@next-aura.com>",
      to: email,
      subject: "無料会員登録が完了しました",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0f172a;">無料会員登録が完了しました</h2>
          <p style="color: #475569;">不動産相場ナビにご登録いただきありがとうございます。</p>
          <p style="color: #475569;">無料会員では以下の機能がご利用いただけます：</p>
          <ul style="color: #475569;">
            <li>AI査定 月1回（推定価格 + 10年後まで将来予測 + 資産性スコア5因子内訳）</li>
            <li>相場検索 月3回</li>
          </ul>
          <a href="https://market.next-aura.com/estimate" style="display: inline-block; background: #f59e0b; color: #0f172a; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            AI査定を試す
          </a>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">不動産相場ナビ｜ネクソラ不動産</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[register-free] welcome email error:", err);
  }
}

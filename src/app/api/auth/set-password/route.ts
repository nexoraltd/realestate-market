import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/set-password
 * Body: { email: string, token: string, password: string }
 * トークンを検証してパスワードを設定する（初回設定・リセット共用）。
 */
export async function POST(req: NextRequest) {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上で設定してください" },
        { status: 400 }
      );
    }

    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
      apiVersion: "2026-02-25.clover",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ error: "無効なリクエストです" }, { status: 400 });
    }

    const customer = customers.data[0];
    const { reset_token, reset_token_exp } = customer.metadata || {};

    if (!reset_token || reset_token !== token) {
      return NextResponse.json(
        { error: "無効または期限切れのリンクです" },
        { status: 400 }
      );
    }

    if (reset_token_exp && new Date(reset_token_exp) < new Date()) {
      return NextResponse.json(
        { error: "リンクの有効期限が切れています。再度パスワードリセットを行ってください" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 12);

    await stripe.customers.update(customer.id, {
      metadata: {
        password_hash: hash,
        reset_token: "",
        reset_token_exp: "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/set-password] error:", err);
    return NextResponse.json(
      { error: "パスワードの設定に失敗しました" },
      { status: 500 }
    );
  }
}

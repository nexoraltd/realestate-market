import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { STRIPE_PRICE_IDS } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 * メールアドレス + パスワードで認証し、サブスクリプション情報を返す。
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
      // パスワード未設定（旧ユーザーまたは設定メール未対応）
      return NextResponse.json({ error: "no_password" }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    // サブスクリプション情報を取得
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 5,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      // No active subscription — return as free member
      return NextResponse.json({
        active: true,
        plan: "free",
        customer_id: customer.id,
        trial: false,
        current_period_end: null,
      });
    }

    const priceId = activeSub.items.data[0]?.price?.id;
    let plan = activeSub.metadata?.plan || null;
    if (!plan && priceId) {
      const entry = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId);
      if (entry) plan = entry[0];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodEnd = (activeSub as any).current_period_end as number | null;

    return NextResponse.json({
      active: true,
      plan,
      customer_id: customer.id,
      trial: activeSub.status === "trialing",
      status: activeSub.status,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
    });
  } catch (err) {
    console.error("[auth/login] error:", err);
    return NextResponse.json({ error: "ログインに失敗しました" }, { status: 500 });
  }
}

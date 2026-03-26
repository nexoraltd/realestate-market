import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
import { checkApiAuth } from "@/lib/apiAuth";
import { STRIPE_PRICE_IDS } from "@/lib/plans";

export const dynamic = "force-dynamic";

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
  apiVersion: "2026-02-25.clover",
});

/**
 * 顧客がアクティブなプロフェッショナルプランを持っているか確認
 */
async function hasActiveProfessionalPlan(
  customerId: string
): Promise<boolean> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });

  return subscriptions.data.some((sub) =>
    sub.items.data.some(
      (item) => item.price.id === STRIPE_PRICE_IDS.professional
    )
  );
}

/**
 * メールアドレスからStripe顧客を検索
 */
async function findCustomerByEmail(
  email: string
): Promise<Stripe.Customer | null> {
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return null;
  const customer = customers.data[0];
  if (customer.deleted) return null;
  return customer as Stripe.Customer;
}

/**
 * GET /api/api-keys?email=xxx
 * 既存のAPIキーを取得
 */
export async function GET(request: NextRequest) {
  const authError = checkApiAuth(request);
  if (authError) return authError;

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }

  try {
    const customer = await findCustomerByEmail(email);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const hasPro = await hasActiveProfessionalPlan(customer.id);
    if (!hasPro) {
      return NextResponse.json(
        { error: "Professional plan required" },
        { status: 403 }
      );
    }

    const apiKey = customer.metadata?.api_key || null;
    return NextResponse.json({ apiKey });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve API key" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/api-keys
 * 新しいAPIキーを生成して保存
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  const authError = checkApiAuth(request);
  if (authError) return authError;

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email } = body;
  if (!email) {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }

  try {
    const customer = await findCustomerByEmail(email);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const hasPro = await hasActiveProfessionalPlan(customer.id);
    if (!hasPro) {
      return NextResponse.json(
        { error: "Professional plan required" },
        { status: 403 }
      );
    }

    const apiKey = `rm_${crypto.randomUUID().replace(/-/g, "")}`;

    await stripe.customers.update(customer.id, {
      metadata: { ...customer.metadata, api_key: apiKey },
    });

    return NextResponse.json({ apiKey });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate API key" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/api-keys
 * APIキーを削除
 * Body: { email: string }
 */
export async function DELETE(request: NextRequest) {
  const authError = checkApiAuth(request);
  if (authError) return authError;

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email } = body;
  if (!email) {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }

  try {
    const customer = await findCustomerByEmail(email);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const hasPro = await hasActiveProfessionalPlan(customer.id);
    if (!hasPro) {
      return NextResponse.json(
        { error: "Professional plan required" },
        { status: 403 }
      );
    }

    // メタデータからapi_keyを削除（空文字で上書き = Stripeが削除扱い）
    await stripe.customers.update(customer.id, {
      metadata: { ...customer.metadata, api_key: "" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}

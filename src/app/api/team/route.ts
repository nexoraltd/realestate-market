import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS } from "@/lib/plans";
import { checkApiAuth } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const MAX_TEAM_MEMBERS = 5;

function getStripe() {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

/** プロフェッショナルプランか判定 */
async function isProfessional(stripe: Stripe, email: string): Promise<{ ok: boolean; customerId?: string }> {
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return { ok: false };

  const customer = customers.data[0];
  const subs = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 5 });
  const active = subs.data.find((s) => s.status === "active" || s.status === "trialing");
  if (!active) return { ok: false };

  const priceId = active.items.data[0]?.price?.id;
  if (priceId === STRIPE_PRICE_IDS.professional || active.metadata?.plan === "professional") {
    return { ok: true, customerId: customer.id };
  }
  return { ok: false };
}

/** メタデータからチームメンバー配列を取得 */
function getTeamMembers(metadata: Record<string, string>): string[] {
  const raw = metadata.team_members || "";
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * GET /api/team?email=xxx
 * チームメンバー一覧を取得
 */
export async function GET(req: NextRequest) {
  const authError = checkApiAuth(req);
  if (authError) return authError;

  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const { ok, customerId } = await isProfessional(stripe, email);
    if (!ok || !customerId) {
      return NextResponse.json({ error: "プロフェッショナルプラン限定の機能です" }, { status: 403 });
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return NextResponse.json({ error: "顧客が見つかりません" }, { status: 404 });
    }

    const members = getTeamMembers(customer.metadata);
    return NextResponse.json({
      members,
      maxMembers: MAX_TEAM_MEMBERS,
      remaining: MAX_TEAM_MEMBERS - members.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[team] GET error:", message);
    return NextResponse.json({ error: "チーム情報の取得に失敗しました" }, { status: 500 });
  }
}

/**
 * POST /api/team
 * チームメンバーを追加
 * Body: { email: "owner@...", memberEmail: "new@..." }
 */
export async function POST(req: NextRequest) {
  const authError = checkApiAuth(req);
  if (authError) return authError;

  try {
    const { email, memberEmail } = await req.json();
    if (!email || !memberEmail) {
      return NextResponse.json({ error: "email と memberEmail が必要です" }, { status: 400 });
    }

    // メールアドレスの簡易バリデーション
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) {
      return NextResponse.json({ error: "無効なメールアドレスです" }, { status: 400 });
    }

    const stripe = getStripe();
    const { ok, customerId } = await isProfessional(stripe, email);
    if (!ok || !customerId) {
      return NextResponse.json({ error: "プロフェッショナルプラン限定の機能です" }, { status: 403 });
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return NextResponse.json({ error: "顧客が見つかりません" }, { status: 404 });
    }

    const members = getTeamMembers(customer.metadata);

    // 重複チェック
    if (members.includes(memberEmail.toLowerCase())) {
      return NextResponse.json({ error: "このメンバーは既に追加されています" }, { status: 409 });
    }

    // 上限チェック
    if (members.length >= MAX_TEAM_MEMBERS) {
      return NextResponse.json({ error: `チームメンバーの上限（${MAX_TEAM_MEMBERS}名）に達しています` }, { status: 429 });
    }

    // オーナー自身は追加不可
    if (memberEmail.toLowerCase() === email.toLowerCase()) {
      return NextResponse.json({ error: "自分自身をメンバーに追加することはできません" }, { status: 400 });
    }

    const updated = [...members, memberEmail.toLowerCase()];
    await stripe.customers.update(customerId, {
      metadata: { team_members: JSON.stringify(updated) },
    });

    return NextResponse.json({
      members: updated,
      maxMembers: MAX_TEAM_MEMBERS,
      remaining: MAX_TEAM_MEMBERS - updated.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[team] POST error:", message);
    return NextResponse.json({ error: "メンバーの追加に失敗しました" }, { status: 500 });
  }
}

/**
 * DELETE /api/team
 * チームメンバーを削除
 * Body: { email: "owner@...", memberEmail: "remove@..." }
 */
export async function DELETE(req: NextRequest) {
  const authError = checkApiAuth(req);
  if (authError) return authError;

  try {
    const { email, memberEmail } = await req.json();
    if (!email || !memberEmail) {
      return NextResponse.json({ error: "email と memberEmail が必要です" }, { status: 400 });
    }

    const stripe = getStripe();
    const { ok, customerId } = await isProfessional(stripe, email);
    if (!ok || !customerId) {
      return NextResponse.json({ error: "プロフェッショナルプラン限定の機能です" }, { status: 403 });
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return NextResponse.json({ error: "顧客が見つかりません" }, { status: 404 });
    }

    const members = getTeamMembers(customer.metadata);
    const updated = members.filter((m) => m !== memberEmail.toLowerCase());

    await stripe.customers.update(customerId, {
      metadata: { team_members: JSON.stringify(updated) },
    });

    return NextResponse.json({
      members: updated,
      maxMembers: MAX_TEAM_MEMBERS,
      remaining: MAX_TEAM_MEMBERS - updated.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[team] DELETE error:", message);
    return NextResponse.json({ error: "メンバーの削除に失敗しました" }, { status: 500 });
  }
}

#!/usr/bin/env node
// 指定メールのユーザーに「プロフェッショナル(月額)」サブスクを無償(100% OFFクーポン)で付与する
// 使い方: node scripts/grant-pro-comp.mjs <email>

import Stripe from "stripe";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local を読み込む
const envPath = resolve(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf8");
const envMap = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      let v = l.slice(idx + 1).trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      return [l.slice(0, idx).trim(), v.replace(/\\n/g, "")];
    })
);

const key = (envMap.STRIPE_SECRET_KEY || "").trim();
if (!key) throw new Error("STRIPE_SECRET_KEY not found in .env.local");

const email = process.argv[2];
if (!email) throw new Error("usage: node scripts/grant-pro-comp.mjs <email>");

const PRO_MONTHLY_PRICE = "price_1TF4pnRoGbypKtRL5GKebMrj";
const COUPON_ID = "COMP_FOREVER_100"; // 無償付与用の共通クーポン

const stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });

(async () => {
  console.log(`[grant] mode=${key.startsWith("sk_live") ? "LIVE" : "TEST"} email=${email}`);

  // 1) クーポン確保 (なければ作成)
  let coupon;
  try {
    coupon = await stripe.coupons.retrieve(COUPON_ID);
    console.log(`[grant] coupon reused: ${coupon.id}`);
  } catch {
    coupon = await stripe.coupons.create({
      id: COUPON_ID,
      percent_off: 100,
      duration: "forever",
      name: "Comp (100% off forever)",
    });
    console.log(`[grant] coupon created: ${coupon.id}`);
  }

  // 2) 顧客検索 or 作成
  const existing = await stripe.customers.list({ email, limit: 1 });
  let customer;
  if (existing.data.length > 0) {
    customer = existing.data[0];
    console.log(`[grant] customer found: ${customer.id}`);
  } else {
    customer = await stripe.customers.create({
      email,
      description: "Comped pro account",
    });
    console.log(`[grant] customer created: ${customer.id}`);
  }

  // 3) 既存アクティブサブスクのチェック
  const subs = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 10 });
  const active = subs.data.find((s) => s.status === "active" || s.status === "trialing");
  if (active) {
    console.log(`[grant] already has active subscription: ${active.id} (status=${active.status})`);
    console.log(`[grant] aborting to avoid duplicate.`);
    return;
  }

  // 4) サブスク作成 (100% OFFクーポン適用 → 決済不要)
  const sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: PRO_MONTHLY_PRICE }],
    discounts: [{ coupon: coupon.id }],
    metadata: { plan: "professional", comp: "true", granted_by: "boss" },
  });

  console.log(`[grant] subscription created: ${sub.id}`);
  console.log(`[grant] status=${sub.status} price=${PRO_MONTHLY_PRICE}`);
  console.log(`[grant] DONE`);
})().catch((e) => {
  console.error("[grant] ERROR:", e.message);
  process.exit(1);
});

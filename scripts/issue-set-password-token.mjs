#!/usr/bin/env node
// 指定メールのStripe顧客に reset_token をセットし、set-password URLを表示する
// 使い方: node scripts/issue-set-password-token.mjs <email>

import Stripe from "stripe";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(__dirname, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    let v = l.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    return [l.slice(0, i).trim(), v.replace(/\\n/g, "")];
  })
);

const key = (env.STRIPE_SECRET_KEY || "").trim();
const SITE_URL = env.NEXT_PUBLIC_SITE_URL || "https://market.next-aura.com";
const email = process.argv[2];
if (!email) throw new Error("usage: node scripts/issue-set-password-token.mjs <email>");

const stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });

(async () => {
  const list = await stripe.customers.list({ email, limit: 1 });
  if (list.data.length === 0) throw new Error(`customer not found: ${email}`);
  const customer = list.data[0];

  const token = randomUUID();
  const exp = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await stripe.customers.update(customer.id, {
    metadata: { reset_token: token, reset_token_exp: exp },
  });

  const url = `${SITE_URL}/account/set-password?email=${encodeURIComponent(email)}&token=${token}`;
  console.log(`[token] customer=${customer.id}`);
  console.log(`[token] expires=${exp}`);
  console.log(`[token] URL:`);
  console.log(url);
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});

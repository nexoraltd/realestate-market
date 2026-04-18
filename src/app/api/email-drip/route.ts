import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkApiAuth } from "@/lib/apiAuth";
import {
  sendDripDay3Email,
  sendDripDay5Email,
  sendDripDay7Email,
} from "@/lib/email";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(isoDate: string): number {
  const registered = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - registered) / DAY_MS);
}

export async function GET(req: NextRequest) {
  const authError = checkApiAuth(req);
  if (authError) return authError;

  const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
    apiVersion: "2026-02-25.clover",
  });

  const results = {
    processed: 0,
    day3_sent: 0,
    day5_sent: 0,
    day7_sent: 0,
    errors: 0,
  };

  let startingAfter: string | undefined;

  while (true) {
    const params: Stripe.CustomerListParams = { limit: 100 };
    if (startingAfter) params.starting_after = startingAfter;

    const page = await stripe.customers.list(params);

    for (const customer of page.data) {
      const meta = customer.metadata ?? {};

      // 対象: 無料プランかつ registered_at がある
      if (meta.plan !== "free" || !meta.registered_at) continue;

      const email = customer.email;
      if (!email) continue;

      results.processed++;
      const days = daysSince(meta.registered_at);

      try {
        // Day3: 登録3日後（2日以上3日以下の範囲で送信）
        if (days >= 3 && !meta.drip_day3_sent) {
          await sendDripDay3Email(email);
          await stripe.customers.update(customer.id, {
            metadata: { ...meta, drip_day3_sent: new Date().toISOString() },
          });
          results.day3_sent++;
        }

        // Day5: 登録5日後
        if (days >= 5 && !meta.drip_day5_sent) {
          await sendDripDay5Email(email);
          await stripe.customers.update(customer.id, {
            metadata: { ...meta, drip_day5_sent: new Date().toISOString() },
          });
          results.day5_sent++;
        }

        // Day7: 登録7日後
        if (days >= 7 && !meta.drip_day7_sent) {
          await sendDripDay7Email(email);
          await stripe.customers.update(customer.id, {
            metadata: { ...meta, drip_day7_sent: new Date().toISOString() },
          });
          results.day7_sent++;
        }
      } catch (err) {
        console.error(`[email-drip] error for ${email}:`, err);
        results.errors++;
      }
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1].id;
  }

  return NextResponse.json({ ok: true, ...results });
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendCheckoutCompleteEmail,
  sendCancellationEmail,
  sendCancellationToCustomerEmail,
  sendPaymentFailedEmail,
  sendPaymentFailedToCustomerEmail,
  sendSetPasswordEmail,
  sendTrialEndingEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

function planFromSub(sub: Stripe.Subscription): string {
  const meta = sub.metadata?.plan;
  if (meta) return meta;
  return "standard";
}

export async function POST(req: NextRequest) {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  const stripe = new Stripe(key, {
    apiVersion: "2026-02-25.clover",
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "署名がありません" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] 署名検証失敗:", err);
    return NextResponse.json({ error: "署名が無効です" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email;
      const customerId = session.customer as string | null;
      const plan = session.metadata?.plan || "standard";
      console.log(`[webhook] チェックアウト完了: ${session.id} customer=${email} plan=${plan}`);

      // Sync plan to Supabase
      if (email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = session.subscription ? await stripe.subscriptions.retrieve(session.subscription as string) : null;
        const periodEnd = sub
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? new Date(((sub as any).current_period_end as number) * 1000).toISOString()
          : null;

        try {
          await supabaseAdmin
            .from("realestate_users")
            .upsert(
              {
                email,
                plan,
                ...(customerId ? { stripe_customer_id: customerId } : {}),
                ...(periodEnd ? { current_period_end: periodEnd } : {}),
              },
              { onConflict: "email" }
            );
        } catch (e) {
          console.error("[webhook] Supabase upsert error:", e);
        }

        try {
          await sendCheckoutCompleteEmail(email, plan);
        } catch (e) {
          console.error("[webhook] メール送信失敗:", e);
        }

        if (customerId) {
          try {
            const token = crypto.randomUUID();
            const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            await stripe.customers.update(customerId, {
              metadata: { reset_token: token, reset_token_exp: expiry },
            });
            await sendSetPasswordEmail(email, token);
          } catch (e) {
            console.error("[webhook] パスワード設定メール送信失敗:", e);
          }
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const plan = planFromSub(sub);
      const isActive = sub.status === "active" || sub.status === "trialing";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodEnd = (sub as any).current_period_end as number | null;

      try {
        await supabaseAdmin
          .from("realestate_users")
          .update({
            plan: isActive ? plan : "free",
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
          })
          .eq("stripe_customer_id", customerId);
      } catch (e) {
        console.error("[webhook] Supabase update error:", e);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      console.log(`[webhook] サブスクリプション解約: ${sub.id}`);

      // Reset plan to free in Supabase
      try {
        await supabaseAdmin
          .from("realestate_users")
          .update({ plan: "free", current_period_end: null })
          .eq("stripe_customer_id", customerId);
      } catch (e) {
        console.error("[webhook] Supabase update error:", e);
      }

      try {
        await sendCancellationEmail(sub.id);
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email) {
          await sendCancellationToCustomerEmail(customer.email);
        }
      } catch (e) {
        console.error("[webhook] 解約通知メール送信失敗:", e);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`[webhook] 支払い失敗: ${invoice.id}`);
      try {
        await sendPaymentFailedEmail(invoice.id);
        if (invoice.customer_email) {
          await sendPaymentFailedToCustomerEmail(invoice.customer_email);
        }
      } catch (e) {
        console.error("[webhook] 支払い失敗通知メール送信失敗:", e);
      }
      break;
    }

    case "customer.subscription.trial_will_end": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[webhook] トライアル終了予告: ${sub.id}`);
      try {
        const customerId = sub.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer.deleted && customer.email && sub.trial_end) {
          const trialEndDate = new Date(sub.trial_end * 1000).toLocaleDateString("ja-JP");
          const plan = sub.items.data[0]?.price?.lookup_key || "standard";
          await sendTrialEndingEmail(customer.email, plan, trialEndDate);
        }
      } catch (e) {
        console.error("[webhook] トライアル終了予告メール送信失敗:", e);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

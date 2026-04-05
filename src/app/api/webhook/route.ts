import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
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
      console.log(
        `[webhook] チェックアウト完了: ${session.id} customer=${email} plan=${plan}`
      );
      if (email) {
        try {
          await sendCheckoutCompleteEmail(email, plan);
        } catch (e) {
          console.error("[webhook] メール送信失敗:", e);
        }

        // パスワード設定リンクを生成・送信
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
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[webhook] サブスクリプション解約: ${sub.id}`);
      try {
        await sendCancellationEmail(sub.id);
        // 顧客にも解約完了メールを送信
        const customerId = sub.customer as string;
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
        // 顧客にも支払い失敗を通知
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

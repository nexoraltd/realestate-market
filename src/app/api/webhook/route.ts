import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  sendCheckoutCompleteEmail,
  sendCancellationEmail,
  sendPaymentFailedEmail,
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
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[webhook] サブスクリプション解約: ${sub.id}`);
      try {
        await sendCancellationEmail(sub.id);
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
      } catch (e) {
        console.error("[webhook] 支払い失敗通知メール送信失敗:", e);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

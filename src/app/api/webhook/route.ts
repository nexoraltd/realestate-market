import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
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
      console.log(`[webhook] チェックアウト完了: ${session.id} customer=${session.customer_email} plan=${session.metadata?.plan}`);
      // TODO: DBにサブスクリプション状態を保存
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[webhook] サブスクリプション解約: ${sub.id}`);
      // TODO: DBのサブスクリプション状態を更新
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`[webhook] 支払い失敗: ${invoice.id}`);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

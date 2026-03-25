import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

const FROM = "ネクソラ不動産 <noreply@next-aura.com>";
const ADMIN_EMAIL = "info@next-aura.com";

/** 新規申し込み完了 → 顧客 + 管理者に通知 */
export async function sendCheckoutCompleteEmail(
  customerEmail: string,
  plan: string
) {
  const planLabel =
    plan === "professional" ? "プロフェッショナル" : "スタンダード";

  await Promise.all([
    // 顧客向け
    getResend().emails.send({
      from: FROM,
      to: customerEmail,
      subject: `【ネクソラ不動産】${planLabel}プランへのお申し込みありがとうございます`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#1e293b">お申し込みありがとうございます</h2>
          <p>${planLabel}プラン（14日間無料トライアル付き）のお申し込みを承りました。</p>
          <p>ダッシュボードからデータツールをご利用いただけます。</p>
          <a href="https://realestate-market.vercel.app/dashboard"
             style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
            ダッシュボードを開く
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">
            ご不明な点がございましたら info@next-aura.com までお気軽にご連絡ください。
          </p>
        </div>
      `,
    }),
    // 管理者向け
    getResend().emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `【新規申込】${customerEmail} - ${planLabel}プラン`,
      html: `<p>新規サブスクリプション申込がありました。</p>
             <ul><li>メール: ${customerEmail}</li><li>プラン: ${planLabel}</li></ul>`,
    }),
  ]);
}

/** サブスクリプション解約 → 管理者に通知 */
export async function sendCancellationEmail(subscriptionId: string) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `【解約通知】サブスクリプション ${subscriptionId}`,
    html: `<p>サブスクリプションが解約されました。</p><p>ID: ${subscriptionId}</p>`,
  });
}

/** 支払い失敗 → 管理者に通知 */
export async function sendPaymentFailedEmail(invoiceId: string) {
  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `【支払い失敗】Invoice ${invoiceId}`,
    html: `<p>支払いが失敗しました。</p><p>Invoice ID: ${invoiceId}</p>`,
  });
}

/** お問い合わせフォーム → 管理者に通知 + 顧客に自動返信 */
export async function sendContactEmail(params: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  plan?: string;
  formType?: string;
  message?: string;
}) {
  const { name, email, phone, company, plan, formType, message } = params;

  await Promise.all([
    // 管理者向け
    getResend().emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `【お問い合わせ】${name}様 - ${formType || "一般"}`,
      replyTo: email,
      html: `
        <div style="font-family:sans-serif;max-width:560px">
          <h3>お問い合わせ内容</h3>
          <table style="border-collapse:collapse">
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">種別</td><td>${formType || "-"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">お名前</td><td>${name}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">メール</td><td>${email}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">電話</td><td>${phone || "-"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">会社名</td><td>${company || "-"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">プラン</td><td>${plan || "-"}</td></tr>
          </table>
          <div style="background:#f8fafc;padding:12px;border-radius:8px;margin-top:12px">
            <p style="white-space:pre-wrap">${message || "(本文なし)"}</p>
          </div>
        </div>
      `,
    }),
    // 顧客向け自動返信
    getResend().emails.send({
      from: FROM,
      to: email,
      subject: "【ネクソラ不動産】お問い合わせを受け付けました",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#1e293b">${name}様</h2>
          <p>お問い合わせいただきありがとうございます。</p>
          <p>担当者より2営業日以内にご連絡いたします。</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">
            ネクソラ不動産 | info@next-aura.com
          </p>
        </div>
      `,
    }),
  ]);
}

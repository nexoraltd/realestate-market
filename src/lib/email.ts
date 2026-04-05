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
          <a href="https://market.next-aura.com/dashboard"
             style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
            ダッシュボードを開く
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
          <p style="color:#94a3b8;font-size:12px">
            プラン変更・解約は
            <a href="https://market.next-aura.com/account" style="color:#f59e0b">アカウント管理ページ</a>
            からいつでも行えます。
          </p>
          <p style="color:#94a3b8;font-size:12px;margin-top:8px">
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

const SITE_URL = "https://market.next-aura.com";

/** 初回パスワード設定メール → 新規登録者に送信 */
export async function sendSetPasswordEmail(customerEmail: string, token: string) {
  const url = `${SITE_URL}/account/set-password?email=${encodeURIComponent(customerEmail)}&token=${token}`;

  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】パスワードを設定してください",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">パスワードを設定してください</h2>
        <p>ご登録ありがとうございます。アカウントを安全にご利用いただくため、パスワードを設定してください。</p>
        <p style="margin:24px 0">
          <a href="${url}"
             style="display:inline-block;background:#1e293b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
            パスワードを設定する
          </a>
        </p>
        <p style="color:#94a3b8;font-size:13px">このリンクは送信から24時間有効です。</p>
        <p style="color:#94a3b8;font-size:13px">
          リンクが機能しない場合は以下のURLをブラウザに貼り付けてください：<br/>
          <span style="word-break:break-all">${url}</span>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">
          このメールに心当たりがない場合は無視してください。
          ご不明な点は <a href="mailto:info@next-aura.com" style="color:#f59e0b">info@next-aura.com</a> までお問い合わせください。
        </p>
      </div>
    `,
  });
}

/** パスワードリセットメール */
export async function sendPasswordResetEmail(customerEmail: string, token: string) {
  const url = `${SITE_URL}/account/set-password?email=${encodeURIComponent(customerEmail)}&token=${token}`;

  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】パスワードリセットのご案内",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">パスワードリセット</h2>
        <p>パスワードリセットのリクエストを受け付けました。以下のボタンから新しいパスワードを設定してください。</p>
        <p style="margin:24px 0">
          <a href="${url}"
             style="display:inline-block;background:#1e293b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
            新しいパスワードを設定する
          </a>
        </p>
        <p style="color:#94a3b8;font-size:13px">このリンクは送信から24時間有効です。</p>
        <p style="color:#94a3b8;font-size:13px">
          リンクが機能しない場合は以下のURLをブラウザに貼り付けてください：<br/>
          <span style="word-break:break-all">${url}</span>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">
          このリクエストに心当たりがない場合はこのメールを無視してください。パスワードは変更されません。
          ご不明な点は <a href="mailto:info@next-aura.com" style="color:#f59e0b">info@next-aura.com</a> までお問い合わせください。
        </p>
      </div>
    `,
  });
}

/** トライアル期限リマインド → 顧客に通知 (Stripe trial_will_end イベントから呼ばれる) */
export async function sendTrialEndingEmail(customerEmail: string, plan: string, trialEndDate: string) {
  const planLabel = plan === "professional" ? "プロフェッショナル" : "スタンダード";

  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: `【ネクソラ不動産】無料トライアルが${trialEndDate}に終了します`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">無料トライアルまもなく終了</h2>
        <p>${planLabel}プランの無料トライアルが <strong>${trialEndDate}</strong> に終了します。</p>
        <p>トライアル終了後は自動的に有料プラン（${planLabel}）に移行します。</p>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px"><strong>このまま継続いただくと：</strong></p>
          <ul style="margin:8px 0 0;padding-left:20px;font-size:14px;color:#475569">
            <li>500万件超の実取引データに無制限アクセス</li>
            <li>CSVダウンロード・トレンド分析を継続利用</li>
            <li>エリア比較で投資判断をサポート</li>
          </ul>
        </div>
        <p>解約をご希望の場合は、トライアル終了前にアカウント管理ページから手続きできます。</p>
        <div style="margin-top:20px">
          <a href="https://market.next-aura.com/dashboard"
             style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:8px">
            ダッシュボードを確認
          </a>
          <a href="https://market.next-aura.com/account"
             style="display:inline-block;background:#e2e8f0;color:#475569;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            アカウント管理
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">
          ご不明な点がございましたら info@next-aura.com までお気軽にご連絡ください。
        </p>
      </div>
    `,
  });
}

/** 支払い失敗 → 顧客に通知 */
export async function sendPaymentFailedToCustomerEmail(customerEmail: string) {
  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】お支払いに問題が発生しました",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">お支払いの更新をお願いします</h2>
        <p>サブスクリプションの更新にお支払いが確認できませんでした。</p>
        <p>お支払い情報を更新いただくことで、引き続きサービスをご利用いただけます。</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#991b1b">
            お支払いが確認できない場合、データアクセスが制限される可能性があります。
          </p>
        </div>
        <a href="https://market.next-aura.com/account"
           style="display:inline-block;background:#1e293b;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
          お支払い情報を更新する
        </a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">
          ご不明な点がございましたら info@next-aura.com までお気軽にご連絡ください。
        </p>
      </div>
    `,
  });
}

/** 解約完了 → 顧客に通知 */
export async function sendCancellationToCustomerEmail(customerEmail: string) {
  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】解約手続きが完了しました",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">解約手続きが完了しました</h2>
        <p>サブスクリプションの解約を承りました。ご利用いただきありがとうございました。</p>
        <p>現在の請求期間の終了まではサービスをご利用いただけます。</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px"><strong>引き続き無料でご利用いただけるサービス：</strong></p>
          <ul style="margin:8px 0 0;padding-left:20px;font-size:14px;color:#475569">
            <li>AI不動産査定</li>
            <li>基本的な相場検索</li>
            <li>ブログ記事・週刊メルマガ</li>
          </ul>
        </div>
        <p style="font-size:14px">再度ご利用をご検討の際は、いつでもプランにお申し込みいただけます。</p>
        <a href="https://market.next-aura.com/pricing"
           style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
          プランを確認する
        </a>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">
          ご不明な点がございましたら info@next-aura.com までお気軽にご連絡ください。
        </p>
      </div>
    `,
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

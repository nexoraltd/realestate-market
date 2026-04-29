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

const UNSUBSCRIBE_BASE = `${SITE_URL}/api/newsletter-unsubscribe`;

function unsubscribeFooter(email: string) {
  const url = `${UNSUBSCRIBE_BASE}?email=${encodeURIComponent(email)}`;
  return `
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
    <p style="color:#94a3b8;font-size:11px;text-align:center">
      このメールの配信を停止するには
      <a href="${url}" style="color:#94a3b8">こちら</a>
      をクリックしてください。<br/>
      ネクソラ不動産｜<a href="mailto:info@next-aura.com" style="color:#94a3b8">info@next-aura.com</a>
    </p>
  `;
}

/** マジックリンク認証メール */
export async function sendMagicLinkEmail(customerEmail: string, token: string) {
  const url = `${SITE_URL}/account/magic-link?email=${encodeURIComponent(customerEmail)}&token=${token}`;

  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】ログインリンク",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">ログインリンク</h2>
        <p style="color:#475569">以下のボタンをクリックしてログインしてください。</p>
        <p style="margin:24px 0">
          <a href="${url}"
             style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:bold;padding:14px 28px;border-radius:8px;text-decoration:none">
            ログインする
          </a>
        </p>
        <p style="color:#94a3b8;font-size:13px">このリンクは15分間有効です。</p>
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

/** 無料会員ウェルカムメール Day1 */
export async function sendWelcomeEmail(customerEmail: string) {
  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】無料会員登録が完了しました",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">無料会員登録が完了しました</h2>
        <p style="color:#475569">不動産相場ナビにご登録いただきありがとうございます。</p>
        <p style="color:#475569">無料会員では以下の機能がご利用いただけます：</p>
        <ul style="color:#475569;line-height:1.8">
          <li>AI査定 月1回（推定価格 + 10年後まで将来予測 + 資産性スコア5因子内訳）</li>
          <li>相場検索 月3回</li>
        </ul>
        <a href="${SITE_URL}/estimate"
           style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
          AI査定を試す
        </a>
        ${unsubscribeFooter(customerEmail)}
      </div>
    `,
  });
}

/** ドリップDay3 — 相場検索の使い方・おすすめ検索エリア */
export async function sendDripDay3Email(customerEmail: string) {
  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】相場検索の使い方とおすすめエリア3選",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">相場検索を使いこなすヒント</h2>
        <p style="color:#475569">ご登録から3日が経ちました。相場検索をもっと活用するための使い方をご紹介します。</p>

        <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;margin:20px 0;border-radius:0 8px 8px 0">
          <p style="margin:0;font-weight:bold;color:#92400e">相場検索のポイント</p>
          <ul style="margin:8px 0 0;padding-left:20px;font-size:14px;color:#475569;line-height:1.8">
            <li>駅名・エリア名・市区町村名で検索できます</li>
            <li>築年数・専有面積で絞り込むと精度が上がります</li>
            <li>「㎡単価」で異なる広さの物件を公平に比較できます</li>
          </ul>
        </div>

        <p style="font-weight:bold;color:#1e293b;margin-top:24px">注目エリア3選（2024年）</p>
        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:12px">
          <div style="background:#f8fafc;padding:12px 16px;border-bottom:1px solid #e2e8f0">
            <strong style="color:#1e293b">1. 東京都・中野区</strong>
          </div>
          <p style="margin:0;padding:12px 16px;font-size:14px;color:#475569">再開発が進む中野駅周辺。価格上昇トレンドが続いており、利回りも安定しています。</p>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:12px">
          <div style="background:#f8fafc;padding:12px 16px;border-bottom:1px solid #e2e8f0">
            <strong style="color:#1e293b">2. 神奈川県・川崎市</strong>
          </div>
          <p style="margin:0;padding:12px 16px;font-size:14px;color:#475569">都心アクセス良好で割安感が残る川崎区・幸区エリア。成約価格の上昇が顕著です。</p>
        </div>
        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:12px">
          <div style="background:#f8fafc;padding:12px 16px;border-bottom:1px solid #e2e8f0">
            <strong style="color:#1e293b">3. 大阪府・北区・福島区</strong>
          </div>
          <p style="margin:0;padding:12px 16px;font-size:14px;color:#475569">大阪万博の影響で注目度が高まるエリア。外国人投資家の流入も見られます。</p>
        </div>

        <a href="${SITE_URL}/dashboard"
           style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px">
          相場を検索してみる
        </a>
        ${unsubscribeFooter(customerEmail)}
      </div>
    `,
  });
}

/** ドリップDay5 — 無料プランの限界・有料CTA */
export async function sendDripDay5Email(customerEmail: string) {
  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】無料プランではここまで。あと一歩でプロが使うデータに",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b">無料プランの限界を超えてみませんか？</h2>
        <p style="color:#475569">相場検索を月3回以上ご利用になりたい方へ、有料プランの違いをご説明します。</p>

        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:20px 0">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center">
            <div style="padding:12px;background:#f8fafc;font-size:12px;font-weight:bold;color:#94a3b8;border-bottom:1px solid #e2e8f0">機能</div>
            <div style="padding:12px;background:#f8fafc;font-size:12px;font-weight:bold;color:#94a3b8;border-bottom:1px solid #e2e8f0;border-left:1px solid #e2e8f0">無料</div>
            <div style="padding:12px;background:#fffbeb;font-size:12px;font-weight:bold;color:#92400e;border-bottom:1px solid #e2e8f0;border-left:1px solid #e2e8f0">有料</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center">
            <div style="padding:10px 12px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9">相場検索</div>
            <div style="padding:10px 12px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;border-left:1px solid #e2e8f0">月3回</div>
            <div style="padding:10px 12px;font-size:13px;font-weight:bold;color:#d97706;border-bottom:1px solid #f1f5f9;border-left:1px solid #e2e8f0">無制限</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center">
            <div style="padding:10px 12px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9">AI査定</div>
            <div style="padding:10px 12px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;border-left:1px solid #e2e8f0">月1回</div>
            <div style="padding:10px 12px;font-size:13px;font-weight:bold;color:#d97706;border-bottom:1px solid #f1f5f9;border-left:1px solid #e2e8f0">無制限</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center">
            <div style="padding:10px 12px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9">CSVダウンロード</div>
            <div style="padding:10px 12px;font-size:13px;color:#cbd5e1;border-bottom:1px solid #f1f5f9;border-left:1px solid #e2e8f0">✕</div>
            <div style="padding:10px 12px;font-size:13px;font-weight:bold;color:#d97706;border-bottom:1px solid #f1f5f9;border-left:1px solid #e2e8f0">✓</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center">
            <div style="padding:10px 12px;font-size:13px;color:#475569">トレンド分析</div>
            <div style="padding:10px 12px;font-size:13px;color:#cbd5e1;border-left:1px solid #e2e8f0">✕</div>
            <div style="padding:10px 12px;font-size:13px;font-weight:bold;color:#d97706;border-left:1px solid #e2e8f0">✓</div>
          </div>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#92400e">
            <strong>今なら14日間無料トライアル付き。</strong>
            クレジットカード登録不要ではじめられます。
          </p>
        </div>

        <a href="${SITE_URL}/pricing"
           style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:bold;padding:14px 32px;border-radius:8px;text-decoration:none;margin-top:8px">
          プランを見る
        </a>
        ${unsubscribeFooter(customerEmail)}
      </div>
    `,
  });
}

/** ドリップDay7 — 14日無料トライアル最後のご案内 */
export async function sendDripDay7Email(customerEmail: string) {
  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: "【ネクソラ不動産】14日間無料トライアル開始の最後のご案内",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#1e293b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="color:#fbbf24;font-size:13px;margin:0 0 8px;font-weight:bold;letter-spacing:0.05em">LIMITED OFFER</p>
          <h2 style="color:#fff;margin:0 0 8px;font-size:22px">14日間 完全無料トライアル</h2>
          <p style="color:#94a3b8;margin:0;font-size:14px">カード登録不要・いつでも解約OK</p>
        </div>

        <p style="color:#475569">無料会員にご登録いただいてから7日が経ちました。</p>
        <p style="color:#475569">今週末も相場チェックにお役立てください。そして、より深く分析したい方には<strong>14日間の無料トライアル</strong>を強くおすすめします。</p>

        <div style="margin:24px 0">
          <p style="font-weight:bold;color:#1e293b;margin-bottom:12px">トライアルで体験できること</p>
          <div style="display:flex;align-items:flex-start;margin-bottom:12px">
            <span style="color:#f59e0b;font-size:18px;margin-right:12px;line-height:1.4">▶</span>
            <div>
              <p style="margin:0;font-weight:bold;color:#1e293b;font-size:14px">500万件超の実取引データ</p>
              <p style="margin:4px 0 0;font-size:13px;color:#64748b">全国の実際の売買・賃貸データに無制限アクセス</p>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;margin-bottom:12px">
            <span style="color:#f59e0b;font-size:18px;margin-right:12px;line-height:1.4">▶</span>
            <div>
              <p style="margin:0;font-weight:bold;color:#1e293b;font-size:14px">CSVダウンロード & トレンドグラフ</p>
              <p style="margin:4px 0 0;font-size:13px;color:#64748b">Excelで加工したり、価格推移を可視化できます</p>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start">
            <span style="color:#f59e0b;font-size:18px;margin-right:12px;line-height:1.4">▶</span>
            <div>
              <p style="margin:0;font-weight:bold;color:#1e293b;font-size:14px">AI査定 無制限</p>
              <p style="margin:4px 0 0;font-size:13px;color:#64748b">複数物件をまとめて査定・比較できます</p>
            </div>
          </div>
        </div>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:14px;color:#166534">
            トライアル期間中に気に入らなければ、<strong>費用は一切かかりません。</strong>
            解約も1クリックで完了します。
          </p>
        </div>

        <div style="text-align:center;margin-top:24px">
          <a href="${SITE_URL}/pricing"
             style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:bold;padding:16px 40px;border-radius:8px;text-decoration:none;font-size:16px">
            14日間無料で始める →
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:12px">クレジットカード登録不要</p>
        </div>

        ${unsubscribeFooter(customerEmail)}
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

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const FROM = "ネクソラ不動産 <noreply@next-aura.com>";
const ADMIN_EMAIL = "info@next-aura.com";

/**
 * POST /api/newsletter
 * メルマガ登録（メールアドレス収集 + ウェルカムメール + 管理者通知）
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "正しいメールアドレスを入力してください" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);

    await Promise.all([
      // ウェルカムメール
      resend.emails.send({
        from: FROM,
        to: email,
        subject: "【不動産相場ナビ】週刊相場レポートのご登録ありがとうございます",
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#1e293b">ご登録ありがとうございます</h2>
            <p>不動産相場ナビの週刊相場レポートにご登録いただきました。</p>
            <p>毎週、エリア別の相場動向や注目データをお届けします。</p>
            <a href="https://market.next-aura.com/search"
               style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
              相場データを見る
            </a>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
            <p style="color:#94a3b8;font-size:12px">
              配信停止をご希望の場合は info@next-aura.com までご連絡ください。
            </p>
          </div>
        `,
      }),
      // 管理者通知
      resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `【メルマガ登録】${email}`,
        html: `<p>新規メルマガ登録: ${email}</p><p>登録日時: ${new Date().toISOString()}</p>`,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[newsletter] error:", message);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}

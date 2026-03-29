import { sendContactEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, area, budget, message, source_page } = body

    // バリデーション
    if (!name || !name.trim()) {
      return Response.json({ error: 'お名前を入力してください' }, { status: 400 })
    }
    if (!email || !email.trim()) {
      return Response.json({ error: 'メールアドレスを入力してください' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: '正しいメールアドレスを入力してください' }, { status: 400 })
    }

    // メール送信（既存のsendContactEmail関数を利用）
    await sendContactEmail({
      name,
      email,
      phone: phone || undefined,
      formType: source_page ? `LP問い合わせ（${source_page}）` : 'LP問い合わせ',
      message: [
        area ? `希望エリア: ${area}` : '',
        budget ? `予算: ${budget}` : '',
        message || '',
      ].filter(Boolean).join('\n'),
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('[api/contact] Error:', error)
    return Response.json(
      { error: '送信に失敗しました。お手数ですが info@next-aura.com まで直接ご連絡ください。' },
      { status: 500 }
    )
  }
}

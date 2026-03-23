"use server";

export interface ContactFormState {
  success: boolean;
  message: string;
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;
  const plan = formData.get("plan") as string;
  const formType = formData.get("formType") as string;
  const message = formData.get("message") as string;

  // バリデーション
  if (!name || !name.trim()) {
    return { success: false, message: "お名前を入力してください" };
  }
  if (!email || !email.trim()) {
    return { success: false, message: "メールアドレスを入力してください" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "正しいメールアドレスを入力してください" };
  }

  // TODO: Resend/SendGrid等のメール送信サービスと連携
  console.log("=== お問い合わせ受信 ===");
  console.log({
    formType,
    name,
    email,
    phone,
    company,
    plan,
    message,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    message: "送信が完了しました。担当者から2営業日以内にご連絡いたします。",
  };
}

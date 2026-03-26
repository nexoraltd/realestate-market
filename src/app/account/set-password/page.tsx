import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SetPasswordForm from "@/components/SetPasswordForm";
import Link from "next/link";
import type { Metadata } from "next";
import Stripe from "stripe";

export const metadata: Metadata = {
  title: "パスワード設定 | 不動産相場ナビ",
  description: "アカウントのパスワードを設定・リセットします。",
};

export const dynamic = "force-dynamic";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  // トークン・メールがない場合
  if (!token || !email) {
    return (
      <>
        <Header />
        <PageShell>
          <InvalidState
            title="無効なリンクです"
            message="パスワード設定リンクが正しくありません。メールに記載のURLをそのままクリックしてください。"
          />
        </PageShell>
        <Footer />
      </>
    );
  }

  // トークンをStripeで検証
  let tokenValid = false;
  let tokenExpired = false;

  try {
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || "").trim(), {
      apiVersion: "2026-02-25.clover",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      const { reset_token, reset_token_exp } = customer.metadata || {};

      if (reset_token && reset_token === token) {
        if (reset_token_exp && new Date(reset_token_exp) < new Date()) {
          tokenExpired = true;
        } else {
          tokenValid = true;
        }
      }
    }
  } catch (err) {
    console.error("[set-password page] error:", err);
  }

  if (tokenExpired) {
    return (
      <>
        <Header />
        <PageShell>
          <InvalidState
            title="リンクの有効期限が切れています"
            message="パスワード設定リンクの有効期限（24時間）が切れています。アカウントページから再度リセットメールを送信してください。"
            showResetLink
          />
        </PageShell>
        <Footer />
      </>
    );
  }

  if (!tokenValid) {
    return (
      <>
        <Header />
        <PageShell>
          <InvalidState
            title="無効なリンクです"
            message="このリンクはすでに使用済みか、無効です。アカウントページから再度リセットメールを送信してください。"
            showResetLink
          />
        </PageShell>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <section className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            パスワードを設定
          </h1>
          <p className="text-slate-400 text-base">
            アカウントにログインするためのパスワードを設定してください。
          </p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <SetPasswordForm email={email} token={token} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <section className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            パスワードを設定
          </h1>
        </div>
      </section>
      <section className="py-12 bg-slate-50 min-h-[50vh]">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}

function InvalidState({
  title,
  message,
  showResetLink = false,
}: {
  title: string;
  message: string;
  showResetLink?: boolean;
}) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      <div className="space-y-3">
        {showResetLink && (
          <Link
            href="/account"
            className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            アカウントページへ
          </Link>
        )}
        <Link
          href="/contact"
          className="block w-full border border-slate-200 hover:border-slate-300 text-slate-600 font-medium py-3 rounded-xl transition text-sm"
        >
          サポートに問い合わせる
        </Link>
      </div>
    </div>
  );
}

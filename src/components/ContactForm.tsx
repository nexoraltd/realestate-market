"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";

interface ContactFormProps {
  showPlanSelect?: boolean;
  defaultPlan?: string;
  showPhone?: boolean;
  showCompany?: boolean;
  formType: "register" | "contact";
}

const initialState: ContactFormState = {
  success: false,
  message: "",
};

export default function ContactForm({
  showPlanSelect = false,
  defaultPlan = "",
  showPhone = true,
  showCompany = false,
  formType,
}: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">送信完了</h3>
        <p className="text-slate-600 mb-1">{state.message}</p>
        <p className="text-sm text-slate-500">
          確認メールを <strong>{}</strong> にお送りしました。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="formType" value={formType} />

      {/* 名前 */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="山田 太郎"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-sm"
        />
      </div>

      {/* メール */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="info@example.com"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-sm"
        />
      </div>

      {/* 電話番号 */}
      {showPhone && (
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
            電話番号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="090-1234-5678"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-sm"
          />
        </div>
      )}

      {/* 会社名 */}
      {showCompany && (
        <div>
          <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-1.5">
            会社名
          </label>
          <input
            type="text"
            id="company"
            name="company"
            placeholder="株式会社○○不動産"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-sm"
          />
        </div>
      )}

      {/* プラン選択 */}
      {showPlanSelect && (
        <div>
          <label htmlFor="plan" className="block text-sm font-semibold text-slate-700 mb-1.5">
            ご希望のプラン
          </label>
          <select
            id="plan"
            name="plan"
            defaultValue={defaultPlan}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-sm bg-white"
          >
            <option value="">選択してください</option>
            <option value="standard">スタンダード（¥2,980/月）</option>
            <option value="professional">プロフェッショナル（¥6,800/月）</option>
          </select>
        </div>
      )}

      {/* メッセージ */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
          {formType === "register" ? "ご質問・ご要望" : "お問い合わせ内容"}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={
            formType === "register"
              ? "ご利用予定の用途や、ご質問がありましたらお書きください"
              : "お問い合わせ内容をご記入ください"
          }
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-sm resize-none"
        />
      </div>

      {/* エラーメッセージ */}
      {state.message && !state.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {state.message}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg hover:shadow-xl text-base"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            送信中...
          </span>
        ) : formType === "register" ? (
          "申し込む"
        ) : (
          "送信する"
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">
        送信いただいた情報は、お問い合わせ対応のみに利用いたします。
      </p>
    </form>
  );
}

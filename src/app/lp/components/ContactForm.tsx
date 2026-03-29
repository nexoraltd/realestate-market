'use client'

import { useState } from 'react'

interface ContactFormProps {
  sourcePage: string
}

export default function ContactForm({ sourcePage }: ContactFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    budget: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return

    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source_page: sourcePage }),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', phone: '', area: '', budget: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-slate-800/50 border border-amber-500/30 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">&#9670;</div>
        <h3 className="text-xl text-amber-400 font-bold mb-2">送信完了</h3>
        <p className="text-slate-300 text-sm">
          お問い合わせありがとうございます。<br />
          担当者より2営業日以内にご連絡いたします。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-amber-500/30 rounded-2xl p-6 md:p-8 space-y-4">
      <h3 className="text-xl text-amber-400 font-bold text-center mb-2">無料相談フォーム</h3>
      <p className="text-slate-400 text-sm text-center mb-4">不動産のプロが、お客様のご要望に合わせてご提案します</p>

      <div>
        <label className="block text-amber-400 text-xs font-bold mb-1 tracking-widest">
          お名前 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
          placeholder="山田 太郎"
          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition"
        />
      </div>

      <div>
        <label className="block text-amber-400 text-xs font-bold mb-1 tracking-widest">
          メールアドレス <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          required
          placeholder="example@email.com"
          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition"
        />
      </div>

      <div>
        <label className="block text-amber-400 text-xs font-bold mb-1 tracking-widest">電話番号</label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          placeholder="090-1234-5678"
          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition"
        />
      </div>

      <div>
        <label className="block text-amber-400 text-xs font-bold mb-1 tracking-widest">希望エリア</label>
        <input
          type="text"
          value={form.area}
          onChange={e => set('area', e.target.value)}
          placeholder="東京都港区、横浜市など"
          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition"
        />
      </div>

      <div>
        <label className="block text-amber-400 text-xs font-bold mb-1 tracking-widest">予算</label>
        <select
          value={form.budget}
          onChange={e => set('budget', e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition appearance-none"
          style={{ colorScheme: 'dark' }}
        >
          <option value="">選択してください</option>
          <option value="~3000万円">〜3,000万円</option>
          <option value="3000~5000万円">3,000〜5,000万円</option>
          <option value="5000~7000万円">5,000〜7,000万円</option>
          <option value="7000万円~1億円">7,000万円〜1億円</option>
          <option value="1億円~">1億円〜</option>
          <option value="賃貸希望">賃貸希望</option>
        </select>
      </div>

      <div>
        <label className="block text-amber-400 text-xs font-bold mb-1 tracking-widest">相談内容</label>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value)}
          rows={3}
          placeholder="気になることやご希望をお聞かせください"
          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!form.name || !form.email || status === 'sending'}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl text-base tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? '送信中...' : '無料相談を申し込む'}
      </button>

      {status === 'error' && (
        <p className="text-red-400 text-sm text-center">送信に失敗しました。もう一度お試しください。</p>
      )}

      <p className="text-slate-600 text-xs text-center">
        ※ 個人情報は不動産相談の目的にのみ使用します
      </p>
    </form>
  )
}

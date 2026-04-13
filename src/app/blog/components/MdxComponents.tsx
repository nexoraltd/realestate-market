import Link from 'next/link'

/* -- CTA: サイト内機能への誘導 -- */
export function AppCTA({
  text = '不動産相場を調べる',
  href = '/',
}: {
  text?: string
  href?: string
}) {
  return (
    <div className="my-8 flex justify-center">
      <Link
        href={href}
        className="inline-block rounded-xl bg-amber-500 px-8 py-3 text-lg font-bold tracking-wide text-white shadow-lg transition hover:bg-amber-600 hover:shadow-xl"
      >
        {text}
      </Link>
    </div>
  )
}

/* -- CTA: 引っ越し日カレンダーへの誘導 -- */
export function MovingDateCTA({
  text = '引っ越しに良い日を調べる',
}: {
  text?: string
}) {
  return (
    <div className="my-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
      <p className="mb-3 text-lg font-bold text-amber-300">
        引っ越しに良い日をチェック
      </p>
      <p className="mb-4 text-sm text-slate-400">
        大安・一粒万倍日・天赦日など、引っ越しや契約に適した日をカレンダーで確認
      </p>
      <Link
        href="/lp/moving-date"
        className="inline-block rounded-xl bg-amber-500 px-8 py-3 text-base font-bold tracking-wide text-slate-900 transition hover:bg-amber-600"
      >
        {text}
      </Link>
    </div>
  )
}

/* -- CTA: 有料プラン直リン（/register?plan=standard） -- */
export function PlanCTA({
  text = 'スタンダード（¥2,980/月）を14日間無料で試す',
  reason = '500万件超の実取引データ・CSV一括ダウンロード・価格トレンド分析が使い放題',
}: {
  text?: string
  reason?: string
}) {
  return (
    <div className="my-10 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-slate-800/60 p-6 text-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-400">
        14日間 無料トライアル
      </p>
      <p className="mb-3 text-lg font-bold text-white">
        データで判断したい方へ
      </p>
      <p className="mb-5 text-sm text-slate-300">{reason}</p>
      <Link
        href="/register?plan=standard&interval=monthly"
        className="inline-block rounded-xl bg-amber-500 px-8 py-3 text-base font-bold tracking-wide text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
      >
        {text}
      </Link>
      <p className="mt-3 text-xs text-slate-500">
        ※トライアル中の解約で一切課金されません
      </p>
    </div>
  )
}


/* -- CTA: お問い合わせ誘導 -- */
export function ConsultCTA({
  text = '無料で相談する',
}: {
  text?: string
}) {
  return (
    <div className="my-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-center">
      <p className="mb-2 text-lg font-bold text-amber-400">
        不動産の売却・購入でお悩みの方へ
      </p>
      <p className="mb-4 text-sm text-slate-400">
        相場データに基づいた適正価格でのお取引をサポートします
      </p>
      <a
        href="mailto:info@next-aura.com"
        className="inline-block rounded-xl bg-amber-500 px-8 py-3 text-base font-bold tracking-wide text-white transition hover:bg-amber-600"
      >
        {text}
      </a>
    </div>
  )
}

/* -- 補足ボックス -- */
export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm leading-relaxed">
      {children}
    </div>
  )
}

/* -- MDXで使うHTML要素のスタイル定義 -- */
export const mdxComponents = {
  AppCTA,
  MovingDateCTA,
  ConsultCTA,
  PlanCTA,
  InfoBox,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-12 mb-4 border-l-4 border-amber-500 pl-4 text-2xl font-bold text-amber-400"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-8 mb-3 text-xl font-bold text-slate-100"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-4 leading-relaxed text-slate-300" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 ml-6 list-disc space-y-2 text-slate-300" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="my-4 ml-6 list-decimal space-y-2 text-slate-300"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-amber-300" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-amber-400 underline underline-offset-4 transition-colors hover:text-amber-300"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-6 border-l-4 border-amber-500/40 pl-4 italic text-slate-400"
      {...props}
    />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto">
      <table
        className="w-full border-collapse text-sm text-slate-300"
        {...props}
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="border-b border-slate-600" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border border-slate-600 bg-slate-700/50 px-4 py-2 text-left font-bold text-amber-400"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-slate-700 px-4 py-2" {...props} />
  ),
}

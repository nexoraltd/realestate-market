import Link from 'next/link'

export default function LpFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-slate-800/50 text-center space-y-4">
      <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-amber-400 transition-colors">不動産相場ナビ トップ</Link>
        <Link href="/lp/moving-date" className="hover:text-amber-400 transition-colors">引っ越しに良い日カレンダー</Link>
        <Link href="/blog" className="hover:text-amber-400 transition-colors">コラム・記事</Link>
      </div>
      <p className="text-slate-600 text-xs tracking-wider">
        不動産相場ナビ by ネクソラ不動産 &copy; {new Date().getFullYear()}
      </p>
    </footer>
  )
}

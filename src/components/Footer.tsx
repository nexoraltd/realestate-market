import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12L12 3L21 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 10V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="font-bold">不動産相場ナビ</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              ネクソラ不動産が運営する不動産相場データベース。売却・購入のご相談もお気軽にどうぞ。
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3 text-slate-300">サービス</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/search" className="hover:text-white transition">相場検索</Link></li>
              <li><Link href="/sell" className="hover:text-white transition">売りたい方</Link></li>
              <li><Link href="/buy" className="hover:text-white transition">買いたい方</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">料金プラン</Link></li>
              <li><Link href="/account" className="hover:text-white transition">アカウント管理・解約</Link></li>
              <li><a href="mailto:info@next-aura.com" className="hover:text-white transition">お問い合わせ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3 text-slate-300">お役立ちツール</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/estimate" className="hover:text-white transition">AI不動産査定</Link></li>
              <li><Link href="/tools/loan-simulator" className="hover:text-white transition">住宅ローンシミュレーター</Link></li>
              <li><Link href="/tools/property-tax" className="hover:text-white transition">固定資産税計算機</Link></li>
              <li><Link href="/lp/moving-date" className="hover:text-white transition">引っ越しに良い日カレンダー</Link></li>
              <li><Link href="/blog" className="hover:text-white transition">コラム・記事</Link></li>
            </ul>
          </div>

          <div id="contact">
            <h4 className="font-bold text-sm mb-3 text-slate-300">無料査定のご相談</h4>
            <p className="text-sm text-slate-400 mb-3">
              売却をご検討の方はお気軽に
            </p>
            <a
              href="mailto:info@next-aura.com"
              className="inline-block bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg text-sm font-bold transition"
            >
              メールで相談する
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Nexora合同会社 All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}

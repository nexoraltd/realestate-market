export default function Footer() {
  return (
    <footer className="bg-[#1a365d] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">不動産相場ナビ</h3>
            <p className="text-sm text-blue-200">
              国土交通省の公的データに基づく
              <br />
              不動産取引価格情報サービス
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">データ出典</h4>
            <p className="text-sm text-blue-200">
              国土交通省 不動産情報ライブラリ
              <br />
              不動産取引価格情報・地価公示データ
            </p>
          </div>
          <div id="contact">
            <h4 className="font-bold mb-2">無料査定のご相談</h4>
            <p className="text-sm text-blue-200 mb-2">
              売却をご検討の方はお気軽にご連絡ください
            </p>
            <a
              href="tel:0120000000"
              className="inline-block bg-[#ed8936] hover:bg-orange-500 px-4 py-2 rounded-lg text-sm font-bold transition"
            >
              0120-000-000
            </a>
          </div>
        </div>
        <div className="border-t border-blue-800 mt-6 pt-4 text-center text-xs text-blue-300">
          &copy; {new Date().getFullYear()} 不動産相場ナビ All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

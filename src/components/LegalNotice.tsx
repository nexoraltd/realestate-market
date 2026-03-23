export default function LegalNotice() {
  return (
    <div className="bg-gray-50 border-t border-gray-200 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            <span className="font-semibold">出典：</span>
            国土交通省 不動産情報ライブラリ（
            <a
              href="https://www.reinfolib.mlit.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              https://www.reinfolib.mlit.go.jp/
            </a>
            ）のAPI機能を利用して取得したデータを加工して作成
          </p>
          <p>
            このサービスは不動産情報ライブラリのAPI機能を使用していますが、サービス独自の加工・集計を行っており、提供情報の最新性、正確性、完全性等が保証されたものではありません。
          </p>
          <p>
            掲載データは過去の取引事例であり、将来の価格を保証するものではありません。不動産の売買に際しては、必ず専門家にご相談ください。
          </p>
        </div>
      </div>
    </div>
  );
}

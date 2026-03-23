import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "不動産相場ナビ | エリアの取引価格・地価がすぐわかる | ネクソラ不動産",
  description:
    "不動産取引価格・相場情報を市区町村レベルで検索。売却・購入の参考に、エリアの相場を無料でチェック。ネクソラ不動産運営。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        {/* iframe埋め込み時：親に高さを通知して二重スクロールバーを防止 */}
        <Script
          id="iframe-resize"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.self === window.top) return;
                document.documentElement.classList.add('in-iframe');
                var lastHeight = 0;
                function sendHeight() {
                  // 一時的にhtmlの高さを0にして真のコンテンツ高さを測定
                  var doc = document.documentElement;
                  doc.style.height = '0';
                  var h = doc.scrollHeight;
                  doc.style.height = '';
                  if (h !== lastHeight) {
                    lastHeight = h;
                    window.parent.postMessage({ type: 'resize-iframe', height: h }, '*');
                  }
                }
                sendHeight();
                new ResizeObserver(sendHeight).observe(document.body);
                new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
                window.addEventListener('load', sendHeight);
                setInterval(sendHeight, 300);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

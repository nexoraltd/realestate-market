import type { Metadata } from "next";
import IframeResizer from "@/components/IframeResizer";
import "./globals.css";

export const metadata: Metadata = {
  title: "不動産相場ナビ | エリアの取引価格・地価がすぐわかる | ネクソラ不動産",
  description:
    "不動産取引価格・相場情報を市区町村レベルで検索。売却・購入の参考に、エリアの相場を無料でチェック。ネクソラ不動産運営。",
};

const iframeScript = `
(function() {
  if (window.self === window.top) return;
  document.documentElement.classList.add('in-iframe');
  var lastHeight = 0;
  function sendHeight() {
    var doc = document.documentElement;
    var body = document.body;
    if (!body) return;
    var origDocH = doc.style.height;
    var origBodyH = body.style.height;
    var origBodyMin = body.style.minHeight;
    doc.style.height = '0';
    body.style.height = '0';
    body.style.minHeight = '0';
    var h = body.scrollHeight;
    doc.style.height = origDocH;
    body.style.height = origBodyH;
    body.style.minHeight = origBodyMin;
    if (h > 0 && h !== lastHeight) {
      lastHeight = h;
      window.parent.postMessage({ type: 'resize-iframe', height: h }, '*');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      sendHeight();
      new ResizeObserver(sendHeight).observe(document.body);
      new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
      setInterval(sendHeight, 300);
    });
  } else {
    sendHeight();
    new ResizeObserver(sendHeight).observe(document.body);
    new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
    setInterval(sendHeight, 300);
  }
  window.addEventListener('load', sendHeight);
})();
`;

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
        <script dangerouslySetInnerHTML={{ __html: iframeScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <IframeResizer />
      </body>
    </html>
  );
}

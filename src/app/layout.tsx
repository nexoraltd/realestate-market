import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "不動産相場ナビ | エリアの取引価格・地価がすぐわかる | ネクソラ不動産",
  description:
    "不動産取引価格・相場情報を市区町村レベルで検索。売却・購入の参考に、エリアの相場を無料でチェック。ネクソラ不動産運営。",
  icons: {
    icon: "/favicon.svg",
  },
};

const iframeScript = `
(function() {
  if (window.self === window.top) return;
  document.documentElement.classList.add('in-iframe');
  var lastHeight = 0;
  var measuring = false;
  function getContentHeight() {
    var body = document.body;
    if (!body || !body.children.length) return 0;
    var maxBottom = 0;
    for (var i = 0; i < body.children.length; i++) {
      var rect = body.children[i].getBoundingClientRect();
      var bottom = rect.bottom;
      if (bottom > maxBottom) maxBottom = bottom;
    }
    var bodyStyle = getComputedStyle(body);
    var marginBottom = parseInt(bodyStyle.marginBottom) || 0;
    var paddingBottom = parseInt(bodyStyle.paddingBottom) || 0;
    return Math.ceil(maxBottom + marginBottom + paddingBottom);
  }
  function sendHeight() {
    if (measuring) return;
    measuring = true;
    var h = getContentHeight();
    measuring = false;
    if (h > 0 && h !== lastHeight) {
      lastHeight = h;
      window.parent.postMessage({ type: 'resize-iframe', height: h }, '*');
    }
  }
  function setup() {
    sendHeight();
    new ResizeObserver(sendHeight).observe(document.body);
    new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true });
    setInterval(sendHeight, 500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
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
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

const GA_ID = 'G-1DEZ6SPVF8'
const BASE_URL = 'https://market.next-aura.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "不動産相場ナビ | データで不動産の常識を覆す | ネクソラ不動産",
  description:
    "500万件の実取引データで不動産の真実を可視化。業界の常識ではなく数字で判断する、新しい不動産情報サービス。全47都道府県・20年分のデータを無料で検索。",
  keywords: ['不動産相場', '不動産データ', '不動産取引価格', '地価', 'マンション相場', '不動産分析', 'データ分析', '不動産投資', '売却相場', '購入相場'],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: '不動産相場ナビ',
    title: '不動産相場ナビ | データで不動産の常識を覆す',
    description: '500万件の実取引データが映す不動産の真実。業界の空気ではなく数字で判断する、新しい不動産情報サービス。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '不動産相場ナビ — データで不動産の常識を覆す',
      },
    ],
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産相場ナビ | データで不動産の常識を覆す',
    description: '500万件の実取引データが映す不動産の真実。業界の空気ではなく数字で判断。',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'hOV40fQ8hsaEnL0TM0GPzUW-HR9QwhUCBRVgS4P9O_w',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: BASE_URL,
    types: {
      'application/rss+xml': `${BASE_URL}/rss.xml`,
    },
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '不動産相場ナビ',
  url: 'https://market.next-aura.com',
  description: '不動産取引価格・相場情報を市区町村レベルで検索。500万件以上の取引データ・20年分・全47都道府県対応。',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: '無料プラン',
      price: '0',
      priceCurrency: 'JPY',
      description: '基本的な相場検索を無料で利用できます',
    },
    {
      '@type': 'Offer',
      name: 'スタンダードプラン',
      price: '980',
      priceCurrency: 'JPY',
      billingIncrement: 'P1M',
      description: '詳細データ・CSVダウンロード・トレンド分析が利用できます',
    },
  ],
  provider: {
    '@type': 'Organization',
    name: 'ネクソラ不動産',
    url: 'https://market.next-aura.com',
  },
  inLanguage: 'ja',
  isAccessibleForFree: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <script dangerouslySetInnerHTML={{ __html: iframeScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');` }} />
      </body>
    </html>
  );
}

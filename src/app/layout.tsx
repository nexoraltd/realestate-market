import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = 'G-1DEZ6SPVF8'
const BASE_URL = 'https://realestate-market.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "不動産相場ナビ | エリアの取引価格・地価がすぐわかる | ネクソラ不動産",
  description:
    "不動産取引価格・相場情報を市区町村レベルで検索。売却・購入の参考に、エリアの相場を無料でチェック。500万件以上の取引データ・20年分・全47都道府県対応。ネクソラ不動産運営。",
  keywords: ['不動産相場', '不動産取引価格', '地価', '土地価格', '不動産検索', 'マンション相場', '一戸建て相場', '土地相場', '売却相場', '購入相場', '不動産データ'],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: '不動産相場ナビ',
    title: '不動産相場ナビ | マップで見る不動産取引価格データベース',
    description: '500万件以上の不動産取引データをマップで検索。売りたい方も買いたい方も、エリアの相場を無料でチェック。全47都道府県・20年分対応。',
    images: [
      {
        url: '/api/og-default',
        width: 1200,
        height: 630,
        alt: '不動産相場ナビ — マップで見る不動産取引価格データベース',
      },
    ],
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産相場ナビ | マップで見る不動産取引価格データベース',
    description: '500万件以上の不動産取引データをマップで検索。エリアの相場を無料でチェック。',
    images: ['/api/og-default'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
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
  url: 'https://realestate-market.vercel.app',
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
    url: 'https://realestate-market.vercel.app',
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
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
      </body>
    </html>
  );
}

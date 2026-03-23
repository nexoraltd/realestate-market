import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "不動産相場ナビ | エリアの取引価格・地価がすぐわかる",
  description:
    "国土交通省の公的データに基づく不動産取引価格・地価公示情報。売却・購入の参考に、エリアの相場を無料でチェック。",
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
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

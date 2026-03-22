import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "おどるーむ - 日本全国の社交ダンス教室・スタジオ検索",
    template: "%s | おどるーむ",
  },
  description:
    "日本全国の社交ダンス教室・スタジオを都道府県から探せます。ワルツ、タンゴ、ルンバなど様々な種目に対応した教室情報を掲載。",
  keywords: ["社交ダンス", "ダンス教室", "ダンススタジオ", "ワルツ", "タンゴ", "ルンバ"],
  openGraph: {
    siteName: "おどるーむ",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased bg-gray-50 flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

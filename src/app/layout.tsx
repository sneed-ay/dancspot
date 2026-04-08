import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiffProvider from "@/components/LiffProvider";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DancSpot — 社交ダンス総合情報",
    template: "%s | DancSpot",
  },
  description:
    "社交ダンスの総合情報サイト。教室検索、イベント情報、お相手募集など、社交ダンスに関するすべての情報が見つかるプラットフォームです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <LiffProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LiffProvider>
      </body>
    </html>
  );
}

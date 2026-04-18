import { Metadata } from "next";
import Link from "next/link";
import { studios } from "@/data/studios";

export const metadata: Metadata = {
  title: "DancSpot — 社交ダンス総合情報",
  description:
    "社交ダンスに関するすべてが見つかる総合プラットフォーム。教室検索、掲示板、大会情報、お相手募集など。",
};

const features = [
  {
    title: "教室検索",
    description:
      "全国の社交ダンス教室を検索できます。体験レッスン、団体レッスン、教室の雰囲気など、お好みの条件で探せる教室が見つかります。",
    href: "/search",
  },
  {
    title: "掲示板",
    description:
      "ダンスに関する情報交換、お相手募集、練習仲間探しなど、様々なトピックで気軽に話し合えるコミュニティ掲示板です。",
    href: "/board",
  },
  {
    title: "大会情報",
    description:
      "全国の社交ダンス大会・競技会の開催情報をまとめてチェック。エントリー情報や結果もまとめて確認できます。",
    href: "/events",
  },
  {
    title: "お相手募集",
    description:
      "ダンスパートナーを探している方、パートナーを募集している方をマッチングします。あなたにピッタリのダンスパートナーが見つかるかもしれません。",
    href: "/board/partner",
  },
];

const prefectures = [
  { name: "東京都", count: studios.filter((s) => s.prefectureName === "東京都").length },
  { name: "神奈川県", count: studios.filter((s) => s.prefectureName === "神奈川県").length },
  { name: "大阪府", count: studios.filter((s) => s.prefectureName === "大阪府").length },
  { name: "埼玉県", count: studios.filter((s) => s.prefectureName === "埼玉県").length },
  { name: "千葉県", count: studios.filter((s) => s.prefectureName === "千葉県").length },
  { name: "愛知県", count: studios.filter((s) => s.prefectureName === "愛知県").length },
  { name: "福岡県", count: studios.filter((s) => s.prefectureName === "福岡県").length },
  { name: "北海道", count: studios.filter((s) => s.prefectureName === "北海道").length },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              社交ダンスのすべてが、
              <br />
              <span className="text-amber-400">ここに。</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-stone-300 leading-relaxed max-w-lg">
              教室検索、パートナー募集、大会情報、コミュニティ。社交ダンスを楽しむための総合プラットフォーム。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                教室を探す
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/board/partner"
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors backdrop-blur-sm border border-white/10"
              >
                パートナーを探す
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 tracking-tight">
              サービス
            </h2>
            <p className="mt-3 text-stone-500 text-sm">
              社交ダンスをもっと楽しむための機能を揃えています
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group block p-6 bg-white rounded-xl border border-stone-200/80 card-hover"
              >
                <h3 className="text-lg font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                  {feature.description}
                </p>
                <span className="inline-flex items-center mt-4 text-xs font-medium text-amber-600 group-hover:text-amber-700">
                  詳しく見る
                  <svg className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Studios by Prefecture */}
      <section className="py-16 sm:py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 tracking-tight">
              エリアから探す
            </h2>
            <p className="mt-3 text-stone-500 text-sm">
              全国 {studios.length} 件以上の教室情報を掲載中
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {prefectures.map((pref) => (
              <Link
                key={pref.name}
                href={`/prefecture/${encodeURIComponent(pref.name)}`}
                className="group flex items-center justify-between p-4 bg-white rounded-lg border border-stone-200/80 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">
                  {pref.name}
                </span>
                <span className="text-xs text-stone-400 tabular-nums">
                  {pref.count}件
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/search"
              className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              すべてのエリアを見る
              <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Ad slot - currently inviting advertisers */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-stone-900 rounded-2xl p-8 sm:p-12 text-center">
            <p className="text-xs text-stone-500 uppercase tracking-widest mb-3">
              広告枠 / Advertisement
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              広告を載せませんか？
            </h2>
            <p className="mt-3 text-stone-400 text-sm max-w-md mx-auto">
              DancSpotは社交ダンス愛好家が集まる総合プラットフォームです。教室・イベント・商品・サービスの告知にぜひご活用ください。
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center mt-6 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

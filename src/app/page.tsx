import { Metadata } from "next";
import Link from "next/link";
import { studios } from "@/data/studios";

export const metadata: Metadata = {
  title: "おどるーむ ～社交ダンス総合情報サイト～",
  description:
    "社交ダンスに関するすべてが見つかる総合プラットフォーム。教室検索、お相手募集、ドレスレンタル、イベント情報、バイト募集、練習場探しまで。",
};

const services = [
  {
    name: "教室検索",
    desc: "全国の社交ダンス教室を都道府県から探せます",
    href: "/search",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    active: true,
    stat: `${studios.length}件掲載中`,
  },
  {
    name: "お相手募集",
    desc: "練習相手やパートナーを探せる掲示板",
    href: "#",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    soon: true,
  },
  {
    name: "ドレスレンタル",
    desc: "ドレスの貸し借り・売買ができるマーケット",
    href: "#",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    soon: true,
  },
  {
    name: "イベント",
    desc: "全国のダンスパーティー・競技会情報を掲載",
    href: "#",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    soon: true,
  },
  {
    name: "バイト募集",
    desc: "ダンス関連のアルバイト・仕事情報",
    href: "#",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    soon: true,
  },
  {
    name: "練習場探し",
    desc: "空き時間のあるスタジオ・練習場を検索",
    href: "#",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    soon: true,
  },
];

export default function TopPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-700 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="h-px w-10 bg-amber-400 opacity-80" />
            <span className="text-amber-400 text-xs font-semibold tracking-[0.25em] uppercase">
              Social Dance Platform
            </span>
            <div className="h-px w-10 bg-amber-400 opacity-80" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            おどるーむ
          </h1>
          <p className="text-violet-300 text-sm tracking-[0.2em] font-light mb-8">
            ～社交ダンス総合情報サイト～
          </p>
          <p className="text-violet-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            教室検索、お相手探し、ドレスレンタル、イベント情報まで。
            社交ダンスに関するすべてが見つかるプラットフォーム。
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 sm:h-16">
            <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">サービス一覧</h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-amber-400 opacity-70" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              <div className="h-px w-16 bg-amber-400 opacity-70" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <Link
                key={svc.name}
                href={svc.href}
                className={`group relative bg-white rounded-2xl border p-7 transition-all duration-300 ${
                  svc.active
                    ? "border-violet-200 shadow-md hover:shadow-xl hover:-translate-y-1.5"
                    : "border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 opacity-90 hover:opacity-100"
                }`}
              >
                {svc.soon && (
                  <span className="absolute top-4 right-4 text-[10px] bg-amber-400/90 text-violet-950 font-bold px-2 py-0.5 rounded-full">
                    準備中
                  </span>
                )}
                {svc.active && svc.stat && (
                  <span className="absolute top-4 right-4 text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">
                    {svc.stat}
                  </span>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
                  svc.active
                    ? "bg-violet-100 text-violet-600 group-hover:bg-violet-200"
                    : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                }`}>
                  {svc.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{svc.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{svc.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ad / Sponsor Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">広告掲載・スポンサー募集</h2>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-amber-400 opacity-70" />
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <div className="h-px w-16 bg-amber-400 opacity-70" />
          </div>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            おどるーむは社交ダンス愛好家が集まるプラットフォームです。
            ダンスシューズ・衣装メーカー、教室運営者、イベント主催者の皆様、
            広告掲載やスポンサーシップについてお気軽にお問い合わせください。
          </p>
          <div className="inline-flex items-center gap-2 bg-violet-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-violet-800 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            お問い合わせはこちら
          </div>
        </div>
      </section>

      {/* Contact / Request Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">お問い合わせ・ご要望</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16 bg-amber-400 opacity-70" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              <div className="h-px w-16 bg-amber-400 opacity-70" />
            </div>
            <p className="text-gray-500 text-sm">
              サービスへのご要望、教室情報の修正依頼、その他お問い合わせはこちらから
            </p>
          </div>

          <form className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">お名前</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">カテゴリ</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-700">
                <option>お問い合わせ</option>
                <option>教室情報の修正依頼</option>
                <option>新規教室の掲載依頼</option>
                <option>広告掲載について</option>
                <option>サービスへのご要望</option>
                <option>その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">メッセージ</label>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                placeholder="お問い合わせ内容をご記入ください..."
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-violet-700 text-white px-8 py-3 rounded-xl font-medium hover:bg-violet-800 transition-colors"
              >
                送信する
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

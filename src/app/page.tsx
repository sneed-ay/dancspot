import { Metadata } from "next";
import PrefectureGrid from "@/components/PrefectureGrid";
import { regions } from "@/data/prefectures";

export const metadata: Metadata = {
  title: "おどるーむ - 日本全国の社交ダンス教室・スタジオ検索",
  description:
    "日本全国の社交ダンス教室・スタジオを都道府県から探せます。ワルツ、タンゴ、ルンバなど様々な種目に対応した教室情報を掲載。",
};

const DANCE_STYLES = [
  "ワルツ", "タンゴ", "フォックストロット", "クイックステップ", "ヴィエニーズワルツ",
  "ルンバ", "チャチャチャ", "サンバ", "パソドブレ", "ジャイブ",
];

const FEATURES = [
  {
    title: "かんたん検索",
    desc: "都道府県から近くの教室をすぐに見つけられます。",
    icon: (
      <svg className="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: "充実した情報",
    desc: "営業時間、料金、ダンス種目など詳細情報を掲載。",
    icon: (
      <svg className="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: "初心者歓迎",
    desc: "体験レッスンのある教室も多数掲載しています。",
    icon: (
      <svg className="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative min-h-[72vh] flex items-center bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white overflow-hidden">

        {/* Background glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-700 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute top-10 right-1/3 w-48 h-48 bg-fuchsia-700 rounded-full opacity-10 blur-2xl" />
        </div>

        {/* Decorative dots */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-[15%] w-1 h-1 bg-white rounded-full opacity-20" />
          <div className="absolute top-16 left-[32%] w-1.5 h-1.5 bg-white rounded-full opacity-25" />
          <div className="absolute top-6 left-[62%] w-1 h-1 bg-white rounded-full opacity-15" />
          <div className="absolute top-28 left-[78%] w-1 h-1 bg-white rounded-full opacity-20" />
          <div className="absolute top-44 left-[8%] w-1 h-1 bg-white rounded-full opacity-20" />
          <div className="absolute top-[48%] left-[4%] w-1.5 h-1.5 bg-white rounded-full opacity-15" />
          <div className="absolute bottom-24 left-[22%] w-1 h-1 bg-white rounded-full opacity-20" />
          {/* Gold accent dots */}
          <div className="absolute top-20 right-[14%] w-2 h-2 bg-amber-400 rounded-full opacity-60" />
          <div className="absolute top-[58%] right-[7%] w-1.5 h-1.5 bg-amber-300 rounded-full opacity-40" />
          <div className="absolute bottom-20 right-[28%] w-1 h-1 bg-amber-400 rounded-full opacity-50" />
        </div>

        {/* Main content */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-20">

            {/* Left: Text */}
            <div className="flex-1 text-center md:text-left">
              {/* Gold label */}
              <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                <div className="h-px w-10 bg-amber-400 opacity-80" />
                <span className="text-amber-400 text-xs font-semibold tracking-[0.25em] uppercase">
                  Social Dance
                </span>
                <div className="h-px w-10 bg-amber-400 opacity-80" />
              </div>

              <h1 className="mb-8 tracking-tight">
                <span className="block text-6xl sm:text-7xl lg:text-8xl font-bold leading-none mb-4">
                  おどるーむ
                </span>
                <span className="block text-sm sm:text-base text-violet-300 tracking-[0.2em] font-light">
                  ～社交ダンス総合情報サイト～
                </span>
              </h1>

              <p className="text-violet-200 text-base sm:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed mb-10">
                日本全国の社交ダンス教室・スタジオを都道府県から検索できます。
                あなたの街のダンス教室を見つけましょう。
              </p>

              {/* Stats */}
              <div className="flex items-center gap-10 justify-center md:justify-start">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-amber-400">47</div>
                  <div className="text-xs text-violet-400 mt-0.5">都道府県対応</div>
                </div>
                <div className="w-px h-10 bg-violet-700" />
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-amber-400">10</div>
                  <div className="text-xs text-violet-400 mt-0.5">種目対応</div>
                </div>
              </div>
            </div>

            {/* Right: Dance silhouette SVG */}
            <div className="hidden md:block flex-shrink-0 w-64 h-80 relative animate-float">
              {/* Outer decorative rings */}
              <div className="absolute inset-0 -m-10 border border-white/5 rounded-full pointer-events-none" />
              <div className="absolute inset-0 -m-20 border border-amber-400/10 rounded-full pointer-events-none" />

              <svg viewBox="0 0 220 270" fill="none" className="w-full h-full opacity-75">
                {/* === MALE DANCER === */}
                {/* Head */}
                <circle cx="80" cy="38" r="16" fill="white" />
                {/* Torso */}
                <line x1="80" y1="54" x2="80" y2="118" stroke="white" strokeWidth="10" strokeLinecap="round" />
                {/* Left arm raised — leading frame */}
                <path d="M73 78 C62 70 51 62 42 55" stroke="white" strokeWidth="7" strokeLinecap="round" />
                {/* Right arm toward partner */}
                <path d="M87 82 C100 87 112 91 122 93" stroke="white" strokeWidth="7" strokeLinecap="round" />
                {/* Left leg */}
                <path d="M74 118 C68 138 62 158 56 176" stroke="white" strokeWidth="8" strokeLinecap="round" />
                {/* Right leg */}
                <path d="M86 118 C92 138 98 158 103 176" stroke="white" strokeWidth="8" strokeLinecap="round" />
                {/* Left foot */}
                <path d="M54 176 C48 180 40 182 34 181" stroke="white" strokeWidth="5" strokeLinecap="round" />
                {/* Right foot */}
                <path d="M105 176 C111 180 118 182 124 181" stroke="white" strokeWidth="5" strokeLinecap="round" />

                {/* === FEMALE DANCER === */}
                {/* Head */}
                <circle cx="152" cy="38" r="13" fill="white" />
                {/* Hair bun */}
                <circle cx="152" cy="25" r="8" fill="white" opacity="0.7" />
                {/* Torso */}
                <line x1="152" y1="51" x2="152" y2="108" stroke="white" strokeWidth="7" strokeLinecap="round" />
                {/* Left arm to partner shoulder */}
                <path d="M146 74 C136 80 127 85 122 88" stroke="white" strokeWidth="5" strokeLinecap="round" />
                {/* Right arm raised elegantly */}
                <path d="M158 67 C167 58 176 52 185 46" stroke="white" strokeWidth="5" strokeLinecap="round" />
                {/* Flowing dress */}
                <path d="M140 108 Q118 148 108 188 L196 188 Q186 148 164 108 Z" fill="white" opacity="0.72" />
                {/* Dress hem curve */}
                <path d="M108 188 Q152 200 196 188" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>

          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 sm:h-16">
            <path
              d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,60 L0,60 Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* ── Dance Styles Banner ── */}
      <section className="py-6 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {DANCE_STYLES.map((style) => (
              <span
                key={style}
                className="bg-white border border-violet-200 text-violet-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full shadow-sm hover:border-violet-400 hover:bg-violet-50 transition-colors duration-150 cursor-default"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prefecture Grid ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              都道府県から探す
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-amber-400 opacity-70" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              <div className="h-px w-16 bg-amber-400 opacity-70" />
            </div>
          </div>
          <PrefectureGrid regions={regions} />
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              おどるーむの特徴
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-amber-400 opacity-70" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              <div className="h-px w-16 bg-amber-400 opacity-70" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 bg-violet-50 group-hover:bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors duration-300">
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

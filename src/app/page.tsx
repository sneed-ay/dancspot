import { Metadata } from "next";
import PrefectureGrid from "@/components/PrefectureGrid";
import { regions } from "@/data/prefectures";

export const metadata: Metadata = {
  title: "おどるーむ - 日本全国の社交ダンス教室・スタジオ検索",
  description:
    "日本全国の社交ダンス教室・スタジオを都道府県から探せます。ワルツ、タンゴ、ルンバなど様々な種目に対応した教室情報を掲載。",
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-700 to-violet-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            社交ダンス教室を探す
          </h1>
          <p className="text-violet-200 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            日本全国の社交ダンス教室・スタジオを都道府県から検索できます。
            あなたの街のダンス教室を見つけましょう。
          </p>
        </div>
      </section>

      {/* Dance Styles Banner */}
      <section className="bg-violet-50 border-y border-violet-100 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 text-sm text-violet-700 font-medium">
            {["ワルツ", "タンゴ", "フォックストロット", "クイックステップ", "ヴィエニーズワルツ", "ルンバ", "チャチャチャ", "サンバ", "パソドブレ", "ジャイブ"].map((style) => (
              <span key={style} className="bg-white border border-violet-200 rounded-full px-3 py-1">
                {style}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Prefecture Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            都道府県から探す
          </h2>
          <PrefectureGrid regions={regions} />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-8 text-center">おどるーむの特徴</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">かんたん検索</h3>
              <p className="text-sm text-gray-600">都道府県から近くの教室をすぐに見つけられます。</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">充実した情報</h3>
              <p className="text-sm text-gray-600">営業時間、料金、ダンス種目など詳細情報を掲載。</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">初心者歓迎</h3>
              <p className="text-sm text-gray-600">体験レッスンのある教室も多数掲載しています。</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

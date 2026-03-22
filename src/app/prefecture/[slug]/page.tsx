import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import StudioCard from "@/components/StudioCard";
import { allPrefectures, getPrefectureBySlug } from "@/data/prefectures";
import { getStudiosByPrefecture } from "@/data/studios";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return allPrefectures.map((pref) => ({ slug: pref.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const prefecture = getPrefectureBySlug(params.slug);
  if (!prefecture) {
    return { title: "Not Found" };
  }
  return {
    title: `${prefecture.name}の社交ダンス教室一覧 | おどるーむ`,
    description: `${prefecture.name}の社交ダンス教室・スタジオを探せます。ワルツ、タンゴ、ルンバなど様々な種目に対応した教室情報を掲載。`,
  };
}

export default function PrefecturePage({ params }: Props) {
  const prefecture = getPrefectureBySlug(params.slug);
  if (!prefecture) {
    notFound();
  }

  const studios = getStudiosByPrefecture(params.slug);

  return (
    <>
      {/* Breadcrumb + Header */}
      <section className="bg-gradient-to-r from-violet-700 to-violet-800 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="text-violet-300 text-sm mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white transition-colors">トップ</Link>
            <span>/</span>
            <span className="text-white">{prefecture.name}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {prefecture.name}の社交ダンス教室
          </h1>
          <p className="text-violet-200 mt-2 text-sm">
            {studios.length > 0
              ? `${studios.length}件の教室が見つかりました`
              : "現在掲載中の教室はありません"}
          </p>
        </div>
      </section>

      {/* Studio List */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {studios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {studios.map((studio) => (
                <StudioCard key={studio.id} studio={studio} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">掲載中の教室はまだありません</p>
              <p className="text-gray-400 text-sm mt-2">情報収集中です。しばらくお待ちください。</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 bg-violet-700 text-white px-6 py-2.5 rounded-lg hover:bg-violet-800 transition-colors text-sm font-medium"
              >
                トップへ戻る
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

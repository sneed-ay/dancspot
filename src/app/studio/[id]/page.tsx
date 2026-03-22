import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { studios, getStudioById } from "@/data/studios";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return studios.map((studio) => ({ id: studio.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const studio = getStudioById(params.id);
  if (!studio) {
    return { title: "Not Found" };
  }
  return {
    title: `${studio.name} | おどるーむ`,
    description:
      studio.description ||
      `${studio.prefectureName}${studio.city}の社交ダンス教室「${studio.name}」の詳細情報。`,
  };
}

export default function StudioPage({ params }: Props) {
  const studio = getStudioById(params.id);
  if (!studio) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-r from-violet-700 to-violet-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-violet-300 text-sm mb-3 flex items-center gap-1 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">トップ</Link>
            <span>/</span>
            <Link
              href={`/prefecture/${studio.prefecture}`}
              className="hover:text-white transition-colors"
            >
              {studio.prefectureName}
            </Link>
            <span>/</span>
            <span className="text-white">{studio.name}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold">{studio.name}</h1>
          <p className="text-violet-200 mt-1 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {studio.prefectureName}{studio.city}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {studio.description && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-3">教室について</h2>
                  <p className="text-gray-700 leading-relaxed">{studio.description}</p>
                </div>
              )}

              {/* Staff */}
              {studio.staff && studio.staff.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 mb-4">
                    スタッフ（{studio.staff.length}名）
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {studio.staff.map((member, i) => (
                      <div key={i} className="text-center">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-violet-100"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-2 border-2 border-violet-100">
                            <svg className="w-8 h-8 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        {member.role && (
                          <p className="text-xs text-violet-500">{member.role}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Types */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4">レッスン形式</h2>
                <div className="flex flex-wrap gap-2">
                  {studio.lessonTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-block bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {type}レッスン
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Contact / Details Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4">基本情報</h2>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">住所</dt>
                    <dd className="text-gray-700">{studio.address}</dd>
                  </div>
                  {studio.phone && (
                    <div>
                      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">電話番号</dt>
                      <dd>
                        <a
                          href={`tel:${studio.phone}`}
                          className="text-violet-700 hover:text-violet-800 font-medium"
                        >
                          {studio.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {studio.hours && (
                    <div>
                      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">営業時間</dt>
                      <dd className="text-gray-700">{studio.hours}</dd>
                    </div>
                  )}
                  {studio.priceRange && (
                    <div>
                      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">料金</dt>
                      <dd className="text-gray-700 font-semibold">{studio.priceRange}</dd>
                    </div>
                  )}
                  {studio.website && (
                    <div>
                      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ウェブサイト</dt>
                      <dd>
                        <a
                          href={studio.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-700 hover:text-violet-800 break-all"
                        >
                          {studio.website}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Map Link */}
              {studio.googleMapsUrl ? (
                <a
                  href={studio.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-violet-700 text-white px-4 py-3 rounded-lg hover:bg-violet-800 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Googleマップで見る
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studio.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-violet-700 text-white px-4 py-3 rounded-lg hover:bg-violet-800 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Googleマップで見る
                </a>
              )}

              <Link
                href={`/prefecture/${studio.prefecture}`}
                className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                {studio.prefectureName}の教室一覧へ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

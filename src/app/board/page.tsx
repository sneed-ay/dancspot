import Link from "next/link";

const categories = [
  {
    id: "partner",
    label: "お相手募集",
    description: "ダンスパーティーや競技会のパートナーを探せます",
    icon: "🤝",
    href: "/board/partner",
  },
  {
    id: "dress",
    label: "ドレスレンタル",
    description: "競技用ドレス・衣装のレンタル・売買情報",
    icon: "👗",
    href: "/board/dress",
    soon: true,
  },
  {
    id: "job",
    label: "バイト募集",
    description: "ダンス教室・スタジオのアルバイト情報",
    icon: "💼",
    href: "/board/job",
    soon: true,
  },
  {
    id: "general",
    label: "雑談",
    description: "社交ダンスに関する雑談・情報交換",
    icon: "💬",
    href: "/board/general",
  },
];

export default function BoardPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
          📝 掲示板 📝
        </h1>
        <p className="text-gray-600 mt-2">
          お相手募集・ドレスレンタル・バイト募集・雑談など、自由に投稿できる掲示板です
        </p>
        <Link
          href="/board/inbox"
          className="inline-block mt-4 bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium"
        >
          📩 受信トレイ
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) =>
          cat.soon ? (
            <div
              key={cat.id}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60 cursor-default"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    {cat.label}
                    <span className="text-[10px] bg-amber-400/90 text-violet-950 font-bold px-2 py-0.5 rounded-full">
                      準備中
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={cat.id}
              href={cat.href}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-violet-300 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {cat.label}
                  </h2>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </div>
              </div>
            </Link>
          )
        )}
      </div>
    </main>
  );
}

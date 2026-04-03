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
  },
  {
    id: "job",
    label: "バイト募集",
    description: "ダンス教室・スタジオのアルバイト情報",
    icon: "💼",
    href: "/board/job",
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">掲示板</h1>
        <p className="text-gray-600">
          お相手募集・ドレスレンタル・バイト募集・雑談など、自由に投稿できる掲示板です。
          カテゴリーを選んでください。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200"
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
        ))}
      </div>
    </main>
  );
}

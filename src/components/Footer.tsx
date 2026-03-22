import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="text-xl font-bold text-white hover:text-violet-400 transition-colors">
              おどるーむ
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              日本全国の社交ダンス教室・スタジオを探せるディレクトリサイト。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">エリア</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/prefecture/tokyo" className="hover:text-violet-400 transition-colors">東京都</Link></li>
              <li><Link href="/prefecture/osaka" className="hover:text-violet-400 transition-colors">大阪府</Link></li>
              <li><Link href="/prefecture/kanagawa" className="hover:text-violet-400 transition-colors">神奈川県</Link></li>
              <li><Link href="/prefecture/aichi" className="hover:text-violet-400 transition-colors">愛知県</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">ダンス種目</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">ワルツ / タンゴ</li>
              <li className="text-gray-400">フォックストロット</li>
              <li className="text-gray-400">ルンバ / チャチャチャ</li>
              <li className="text-gray-400">サンバ / ジャイブ</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {currentYear} おどるーむ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

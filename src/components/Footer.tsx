import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/" className="text-xl font-bold text-white hover:text-violet-400 transition-colors">
            ダンスポット
          </Link>
          <p className="mt-3 text-sm text-gray-400 max-w-lg leading-relaxed">
            社交ダンスに関するすべてが見つかる総合プラットフォーム。
            教室検索、お相手募集、ドレスレンタル、イベント情報、バイト募集、練習場探しまで。
            ダンサーの「困った」を解決します。
          </p>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {currentYear} ダンスポット. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

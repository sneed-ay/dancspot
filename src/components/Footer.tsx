import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-1">
            <span className="text-lg font-semibold tracking-tight text-white">
              DancSpot
            </span>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              社交ダンスに関するすべてが見つかる総合プラットフォーム
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-4">サービス</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/search" className="text-sm hover:text-white transition-colors">
                  教室検索
                </Link>
              </li>
              <li>
                <Link href="/board" className="text-sm hover:text-white transition-colors">
                  掲示板
                </Link>
              </li>
              <li>
                <Link href="/board/partner" className="text-sm hover:text-white transition-colors">
                  お相手募集
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-4">情報</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/events" className="text-sm hover:text-white transition-colors">
                  大会情報
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-4">その他</h3>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-stone-500">プライバシーポリシー</span></li>
              <li><span className="text-sm text-stone-500">利用規約</span></li>
              <li>
                <Link href="mailto:info@sneed.jp" className="text-sm hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8">
          <p className="text-xs text-stone-600 text-center">
            © {currentYear} DancSpot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Gold accent bar */}
            <span className="w-0.5 h-6 bg-amber-400 rounded-full opacity-80" />
            <span className="flex flex-col leading-tight">
              <span className="text-2xl font-bold text-violet-700 tracking-tight group-hover:text-violet-800 transition-colors">
                おどるーむ
              </span>
              <span className="text-[10px] text-violet-400 tracking-wider">
                ～社交ダンス総合情報サイト～
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-violet-700 transition-colors">
              トップ
            </Link>
            <Link href="/prefecture/tokyo" className="hover:text-violet-700 transition-colors">
              東京
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

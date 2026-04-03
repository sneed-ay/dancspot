import Link from "next/link";

const services = [
  { name: "教室検索", href: "/search", active: true },
  { name: "掲示板", href: "/board", active: true },
  { name: "大会情報", href: "/events", active: true },
  { name: "練習場", href: "#", soon: true },
  { name: "ダンスサロン", href: "#", soon: true },
  { name: "サークル", href: "#", soon: true },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50">
      {/* Main header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-0.5 h-6 bg-amber-400 rounded-full opacity-80" />
              <span className="flex flex-col leading-tight">
                <span className="text-2xl font-bold text-violet-700 tracking-tight group-hover:text-violet-800 transition-colors">
                  ダンスポット
                </span>
                <span className="text-[10px] text-violet-400 tracking-wider">
                  ～社交ダンス総合情報サイト～
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Service nav bar */}
      <div className="bg-violet-950 border-b border-violet-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-1 py-1">
            {services.map((svc) => (
              <Link
                key={svc.name}
                href={svc.href}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  svc.active
                    ? "bg-violet-700 text-white"
                    : "text-violet-300 hover:text-white hover:bg-violet-800/50"
                }`}
              >
                {svc.name}
                {svc.soon && (
                  <span className="text-[10px] bg-amber-400/90 text-violet-950 font-bold px-1.5 py-0.5 rounded-full leading-none">
                    準備中
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

const services = [
  { name: "教室検索", href: "/search", active: true },
  { name: "掲示板", href: "/board", active: true },
  { name: "大会情報", href: "/events", active: true },
  { name: "お相手募集", href: "/board/partner", active: true },
  { name: "練習場", href: "#", soon: true },
  { name: "ダンスサロン", href: "#", soon: true },
];

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-lg font-semibold tracking-tight text-stone-800 group-hover:text-amber-700 transition-colors">
              DancSpot
            </span>
          </Link>
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {services.map((service) => (
              <Link
                key={service.name}
                href={service.active ? service.href : "#"}
                className={`text-[13px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
                  service.active
                    ? "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    : "text-stone-300 cursor-default"
                }`}
              >
                {service.name}
                {service.soon && (
                  <span className="ml-1 text-[10px] text-amber-500 font-normal">準備中</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

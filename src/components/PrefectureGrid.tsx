import Link from "next/link";
import { Region } from "@/types";

interface PrefectureGridProps {
  regions: Region[];
}

export default function PrefectureGrid({ regions }: PrefectureGridProps) {
  return (
    <div className="space-y-8">
      {regions.map((region) => (
        <div key={region.name}>
          <h2 className="text-sm font-bold text-violet-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-400 rounded-full flex-shrink-0" />
            {region.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {region.prefectures.map((pref) => (
              <Link
                key={pref.slug}
                href={`/prefecture/${pref.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 hover:scale-[1.04] transition-all duration-150 shadow-sm"
              >
                {pref.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

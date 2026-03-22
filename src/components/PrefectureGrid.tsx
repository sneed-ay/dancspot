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
          <h2 className="text-lg font-bold text-gray-700 mb-3 pb-2 border-b border-gray-200">
            {region.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {region.prefectures.map((pref) => (
              <Link
                key={pref.slug}
                href={`/prefecture/${pref.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-all duration-150 shadow-sm"
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

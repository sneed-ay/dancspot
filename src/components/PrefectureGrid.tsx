"use client";

import { useState } from "react";
import Link from "next/link";
import { Region } from "@/types";

interface PrefectureGridProps {
  regions: Region[];
}

const REGION_GROUPS = [
  { label: "北海道・東北", regions: ["北海道", "東北"] },
  { label: "関東", regions: ["関東"] },
  { label: "中部", regions: ["中部"] },
  { label: "近畿", regions: ["近畿"] },
  { label: "中国・四国", regions: ["中国", "四国"] },
  { label: "九州・沖縄", regions: ["九州・沖縄"] },
];

export default function PrefectureGrid({ regions }: PrefectureGridProps) {
  const [activeTab, setActiveTab] = useState(0);

  const activePrefectures = regions
    .filter((r) => REGION_GROUPS[activeTab].regions.includes(r.name))
    .flatMap((r) => r.prefectures);

  return (
    <div>
      {/* Region tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {REGION_GROUPS.map((group, i) => (
          <button
            key={group.label}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === i
                ? "bg-violet-700 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Prefecture buttons */}
      <div className="flex flex-wrap gap-2">
        {activePrefectures.map((pref) => (
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
  );
}

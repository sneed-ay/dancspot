import Link from "next/link";
import { Studio } from "@/types";

interface StudioCardProps {
  studio: Studio;
}

export default function StudioCard({ studio }: StudioCardProps) {
  return (
    <Link href={`/studio/${studio.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-200 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-violet-700 transition-colors leading-tight">
            {studio.name}
          </h3>
        </div>

        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {studio.prefectureName}{studio.city}
        </p>

        {studio.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            {studio.description}
          </p>
        )}

        <div className="mt-auto space-y-2">
          {studio.danceStyles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {studio.danceStyles.slice(0, 4).map((style) => (
                <span
                  key={style}
                  className="inline-block text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium"
                >
                  {style}
                </span>
              ))}
              {studio.danceStyles.length > 4 && (
                <span className="inline-block text-xs text-gray-400 px-1 py-0.5">
                  +{studio.danceStyles.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {studio.lessonTypes.map((type) => (
              <span
                key={type}
                className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {type}レッスン
              </span>
            ))}
          </div>

          {studio.priceRange && (
            <p className="text-sm font-semibold text-gray-800">{studio.priceRange}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

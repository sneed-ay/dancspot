"use client";

import { useState, useMemo } from "react";
import { events } from "@/data/events";
import type { DanceEvent } from "@/types";

const YEARS = [2026, 2027];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const orgColors: Record<string, { bg: string; text: string; border: string }> = {
  JBDF: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300" },
  JDC: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300" },
  JCF: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  JDSF: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
};

const orgEmoji: Record<string, string> = {
  JBDF: "🏆",
  JDC: "⭐",
  JCF: "💎",
  JDSF: "🎯",
};

export default function EventsPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = events.filter((e: DanceEvent) => e.year === selectedYear);
    if (selectedMonth !== null) {
      list = list.filter((e: DanceEvent) => e.month === selectedMonth);
    }
    return list.sort((a: DanceEvent, b: DanceEvent) => a.date.localeCompare(b.date));
  }, [selectedYear, selectedMonth]);

  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    events
      .filter((e: DanceEvent) => e.year === selectedYear)
      .forEach((e: DanceEvent) => {
        counts[e.month] = (counts[e.month] || 0) + 1;
      });
    return counts;
  }, [selectedYear]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            💃 イベント情報 🕺
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            JBDF・JDC・JCF・JDSFの大会情報をまとめてチェック
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {YEARS.map((year) => (
            <button
              key={year}
              onClick={() => { setSelectedYear(year); setSelectedMonth(null); }}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shadow-sm ${
                selectedYear === year
                  ? "bg-violet-600 text-white shadow-violet-200 shadow-lg scale-105"
                  : "bg-white text-violet-600 border-2 border-violet-200 hover:border-violet-400 hover:shadow-md"
              }`}
            >
              {year}年
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedMonth(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedMonth === null
                ? "bg-pink-500 text-white shadow-md"
                : "bg-white text-pink-500 border border-pink-200 hover:bg-pink-50"
            }`}
          >
            全て
          </button>
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedMonth === m
                  ? "bg-pink-500 text-white shadow-md"
                  : monthCounts[m]
                  ? "bg-white text-pink-500 border border-pink-200 hover:bg-pink-50"
                  : "bg-gray-100 text-gray-300 border border-gray-200 cursor-default"
              }`}
              disabled={!monthCounts[m]}
            >
              {m}月
              {monthCounts[m] ? ` (${monthCounts[m]})` : ""}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">💭</p>
              <p className="text-gray-400 text-lg">まだイベントが登録されていません</p>
            </div>
          ) : (
            filtered.map((event: DanceEvent) => {
              const colors = orgColors[event.organizer];
              const emoji = orgEmoji[event.organizer];
              const dateObj = new Date(event.date + "T00:00:00");
              const monthDay = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
              const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
              const dayOfWeek = dayNames[dateObj.getDay()];

              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-2xl border-2 ${colors.border} shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden`}
                >
                  <div className="flex">
                    <div className={`flex-shrink-0 w-20 sm:w-24 ${colors.bg} flex flex-col items-center justify-center p-3 border-r ${colors.border}`}>
                      <span className={`text-2xl sm:text-3xl font-black ${colors.text}`}>{monthDay}</span>
                      <span className={`text-xs font-bold ${colors.text} opacity-70`}>({dayOfWeek})</span>
                      {event.dateEnd && (
                        <span className={`text-[10px] mt-1 ${colors.text} opacity-60`}>
                          ~{new Date(event.dateEnd + "T00:00:00").getDate()}日
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg">{emoji}</span>
                        <div>
                          <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-tight">
                            {event.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                              {event.organizer}
                            </span>
                            {event.category && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                                {event.category}
                              </span>
                            )}
                            {event.level && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {event.level}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </span>
                        {event.entryDeadline && (
                          <span className="flex items-center gap-1 text-orange-500 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            締切: {event.entryDeadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-10 p-4 bg-white/70 backdrop-blur rounded-2xl border border-gray-200">
          <p className="text-xs text-gray-400 font-medium mb-2">主催団体</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(orgColors).map(([org, colors]) => (
              <span key={org} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                {orgEmoji[org]} {org}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

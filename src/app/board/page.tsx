"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const CATEGORIES = [
  { id: "all", label: "すべて" },
  { id: "partner", label: "お相手募集" },
  { id: "dress", label: "ドレスレンタル" },
  { id: "job", label: "バイト募集" },
  { id: "general", label: "雑談" },
];

const CATEGORY_LABELS: Record<string, string> = {
  partner: "お相手募集",
  dress: "ドレスレンタル",
  job: "バイト募集",
  general: "雑談",
};

const CATEGORY_COLORS: Record<string, string> = {
  partner: "bg-pink-100 text-pink-700",
  dress: "bg-sky-100 text-sky-700",
  job: "bg-emerald-100 text-emerald-700",
  general: "bg-violet-100 text-violet-700",
};

interface Thread {
  id: string;
  category: string;
  title: string;
  author: string;
  createdAt: string;
  replies: { number: number; createdAt: string }[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BoardPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState("partner");
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formContent, setFormContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/board/threads?category=${activeCategory}`);
    const data = await res.json();
    setThreads(data);
    setLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;
    setSubmitting(true);

    await fetch("/api/board/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: formCategory,
        title: formTitle,
        author: formAuthor,
        content: formContent,
      }),
    });

    setFormTitle("");
    setFormAuthor("");
    setFormContent("");
    setShowForm(false);
    setSubmitting(false);
    fetchThreads();
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">掲示板</h1>
          <p className="text-violet-300 text-sm">
            お相手募集・ドレスレンタル・バイト募集・雑談など、自由に投稿できます
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-violet-700 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* New Thread Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-800 transition-colors"
          >
            {showForm ? "キャンセル" : "新規スレッド作成"}
          </button>
        </div>

        {/* New Thread Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-violet-200 p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">新規スレッド作成</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ <span className="text-red-500">*</span></label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="partner">お相手募集</option>
                  <option value="dress">ドレスレンタル</option>
                  <option value="job">バイト募集</option>
                  <option value="general">雑談</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名前（空欄で「名無しのダンサー」）</label>
                <input
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="名無しのダンサー"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">スレッドタイトル <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="スレッドのタイトルを入力"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">本文 <span className="text-red-500">*</span></label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder="本文を入力..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-800 transition-colors disabled:opacity-50"
              >
                {submitting ? "投稿中..." : "スレッドを立てる"}
              </button>
            </div>
          </form>
        )}

        {/* Thread List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">読み込み中...</div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-2">まだスレッドがありません</p>
            <p className="text-gray-300 text-sm">最初のスレッドを立ててみましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/board/${thread.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[thread.category] || "bg-gray-100 text-gray-600"}`}>
                        {CATEGORY_LABELS[thread.category] || thread.category}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(thread.createdAt)}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{thread.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{thread.author}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        {thread.replies.length}
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

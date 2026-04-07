"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Thread {
  id: string;
  category: string;
  title: string;
  author: string;
  createdAt: string;
  content?: string;
  replies?: number;
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
}

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

interface BoardCategoryPageProps {
  category: string;
  categoryLabel: string;
}

export default function BoardCategoryPage({
  category,
  categoryLabel,
}: BoardCategoryPageProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [liffReady, setLiffReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch(`/api/board/threads?category=${category}`);
      const data = await res.json();
      if (data.threads) setThreads(data.threads);
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    const init = async () => {
      try {
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId: "2009689686-RlIuQaLI" });
        setLiffReady(true);
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setUser({
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          });
          fetch("/api/auth/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lineUserId: profile.userId,
              lineDisplayName: profile.displayName,
              linePictureUrl: profile.pictureUrl || null,
              page: `/board/${category}`,
            }),
          }).catch(console.error);
        }
      } catch (error) {
        console.error("LIFF init error:", error);
        setLiffReady(true);
      }
    };
    init();
    fetchThreads();
  }, [fetchThreads, category]);

  const handleLogin = async () => {
    try {
      const liff = (await import("@line/liff")).default;
      liff.login();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formTitle.trim() || !formContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/board/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: formTitle.trim(),
          author: user.displayName,
          content: formContent.trim(),
          lineUserId: user.userId,
          lineDisplayName: user.displayName,
          linePictureUrl: user.pictureUrl || null,
        }),
      });
      if (res.ok) {
        setFormTitle("");
        setFormContent("");
        setShowForm(false);
        fetchThreads();
      }
    } catch (error) {
      console.error("Failed to create thread:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${MM}/${dd} ${HH}:${mm}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/board" className="text-blue-600 hover:underline text-sm">
            ← 掲示板に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{categoryLabel}</h1>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition"
            >
              {showForm ? "閉じる" : "スレッドを立てる"}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-[#06C755] text-white px-6 py-2 rounded-lg hover:bg-[#05b54c] transition text-sm font-medium"
            >
              LINEでログイン
            </button>
          )}
        </div>
      </div>

      {showForm && user && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6"
        >
          <div className="text-sm font-bold text-gray-700 mb-3">新規スレッド作成</div>
          <div className="space-y-3">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="スレッドタイトル"
              maxLength={100}
            />
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder=">>1 の内容"
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
            >
              {submitting ? "作成中..." : "スレッドを立てる"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-8">読み込み中...</p>
      ) : threads.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>まだスレッドがありません</p>
          <p className="text-sm mt-1">最初のスレッドを立ててみましょう</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-xs text-gray-500 flex">
            <span className="w-16 shrink-0">レス</span>
            <span className="flex-1">スレッド名</span>
            <span className="w-28 text-right shrink-0">最終投稿</span>
          </div>
          {threads.map((thread, index) => (
            <Link
              key={thread.id}
              href={`/board/${thread.id}`}
              className={`flex items-center px-4 py-2.5 hover:bg-blue-50 transition text-sm ${
                index < threads.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <span className="w-16 shrink-0 text-center text-xs font-mono text-gray-500">
                {(thread.replies || 0) + 1}
              </span>
              <span className="flex-1 min-w-0">
                <span className="font-bold text-blue-800 truncate block">
                  {thread.title}
                </span>
              </span>
              <span className="w-28 text-right shrink-0 text-xs text-gray-400">
                {formatDate(thread.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

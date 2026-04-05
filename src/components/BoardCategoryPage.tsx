"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { initLiff, isLoggedIn, login, getProfile } from "@/lib/liff";

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

export default function BoardCategoryPage({ category, categoryLabel }: BoardCategoryPageProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [liffReady, setLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
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
        await initLiff();
        setLiffReady(true);
        if (isLoggedIn()) {
          const profile = await getProfile();
          setUser({
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          });
          // Log login to Supabase
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
        setLiffError("LINEの初期化に失敗しました");
      }
    };
    init();
    fetchThreads();
  }, [fetchThreads]);

  const handleLogin = () => {
    login();
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
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
  };

  if (liffError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-500 text-lg">{liffError}</p>
          <p className="text-gray-500 mt-2">LINEアプリから開いてください</p>
        </div>
      </div>
    );
  }

  if (!liffReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{categoryLabel}</h1>
          <p className="text-gray-500 text-sm mt-1">スレッド一覧</p>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                {user.pictureUrl && (
                  <img src={user.pictureUrl} alt="" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-gray-700">{user.displayName}</span>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium"
              >
                {showForm ? "閉じる" : "新規スレッド"}
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-[#06C755] text-white px-6 py-2 rounded-lg hover:bg-[#05b54c] transition text-sm font-medium flex items-center gap-2"
            >
              LINEでログイン
            </button>
          )}
        </div>
      </div>

      {showForm && user && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">新規スレッド作成</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="スレッドのタイトル"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容 <span className="text-red-500">*</span></label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                required
                rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="スレッドの内容を書いてください"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50"
            >
              {submitting ? "作成中..." : "スレッドを作成"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-8">読み込み中...</p>
      ) : threads.length === 0 ? (
        <p className="text-center text-gray-500 py-8">まだスレッドがありません</p>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/board/${thread.id}`}
              className="block bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{thread.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {thread.linePictureUrl && (
                      <img src={thread.linePictureUrl} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-xs text-gray-500">
                      {"名無しさん"} ・ {formatDate(thread.createdAt)}
                    </span>
                    {thread.replies !== undefined && thread.replies > 0 && (
                      <span className="text-xs text-blue-500">返信 {thread.replies}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

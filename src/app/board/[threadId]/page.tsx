"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { initLiff, isLoggedIn, login, getProfile } from "@/lib/liff";

interface Reply {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
}

interface Thread {
  id: string;
  category: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  replies: number;
  replyList?: Reply[];
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
}

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  partner: "お相手募集",
  dress: "ドレスレンタル",
  job: "バイト募集",
  general: "雑談",
};

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liffReady, setLiffReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/board/threads/${threadId}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      if (data.thread) setThread(data.thread);
    } catch (error) {
      console.error("Failed to fetch thread:", error);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

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
              page: `/board/${threadId}`,
            }),
          }).catch(console.error);
        }
      } catch (error) {
        console.error("LIFF init error:", error);
      }
    };
    init();
    fetchThread();
  }, [fetchThread]);

  const handleLogin = () => {
    login();
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/board/threads/${threadId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: user.displayName,
          content: replyContent.trim(),
          lineUserId: user.userId,
          lineDisplayName: user.displayName,
          linePictureUrl: user.pictureUrl || null,
        }),
      });
      if (res.ok) {
        setReplyContent("");
        fetchThread();
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (notFound || !thread) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">スレッドが見つかりません</p>
          <Link href="/board" className="text-blue-500 hover:underline mt-4 inline-block">← 掛示板に戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/board`} className="text-blue-500 hover:underline text-sm mb-4 inline-block">
        ← 掛示板に戻る
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
            {CATEGORY_LABELS[thread.category] || thread.category}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">{thread.title}</h1>
        <div className="flex items-center gap-2 mb-4">
          {thread.linePictureUrl && (
            <img src={thread.linePictureUrl} alt="" className="w-6 h-6 rounded-full" />
          )}
          <span className="text-sm text-gray-500">
            {thread.lineDisplayName || thread.author} ・ {formatDate(thread.createdAt)}
          </span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{thread.content}</p>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">返信 ({thread.replyList?.length || 0})</h2>

      {thread.replyList && thread.replyList.length > 0 && (
        <div className="space-y-3 mb-6">
          {thread.replyList.map((reply) => (
            <div key={reply.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-2 mb-2">
                {reply.linePictureUrl && (
                  <img src={reply.linePictureUrl} alt="" className="w-6 h-6 rounded-full" />
                )}
                <span className="text-sm text-gray-500">
                  {reply.lineDisplayName || reply.author} ・ {formatDate(reply.createdAt)}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {liffReady && user ? (
        <form onSubmit={handleReply} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            {user.pictureUrl && (
              <img src={user.pictureUrl} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-gray-700">{user.displayName}</span>
          </div>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            placeholder="返信を書く..."
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "送信中..." : "返信する"}
          </button>
        </form>
      ) : liffReady ? (
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <p className="text-gray-500 mb-3">返信するにはLINEログインが必要です</p>
          <button
            onClick={handleLogin}
            className="bg-[#06C755] text-white px-6 py-2 rounded-lg hover:bg-[#05b54c] transition text-sm font-medium"
          >
            LINEでログイン
          </button>
        </div>
      ) : null}
    </div>
  );
}

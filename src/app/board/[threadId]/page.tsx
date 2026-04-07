"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

const MAX_REPLIES = 1000;

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
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchThread = useCallback(async () => {
    try {
      const [threadRes, repliesRes] = await Promise.all([
        fetch(`/api/board/threads/${threadId}?t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/board/threads/${threadId}/replies?t=${Date.now()}`, { cache: "no-store" }),
      ]);
      if (threadRes.status === 404) {
        setNotFound(true);
        return;
      }
      const threadData = await threadRes.json();
      const repliesData = await repliesRes.json();
      if (threadData.thread) {
        const merged = {
          ...threadData.thread,
          replyList: (repliesData.replies || []).map((r) => ({
              id: r.id,
              threadId: r.thread_id || r.threadId,
              author: r.line_display_name || r.lineDisplayName || r.author || "",
              content: r.content || "",
              createdAt: r.created_at || r.createdAt,
              lineUserId: r.line_user_id || r.lineUserId || "",
              lineDisplayName: r.line_display_name || r.lineDisplayName || "",
              linePictureUrl: r.line_picture_url || r.linePictureUrl || null,
            })),
          replies: (repliesData.replies || []).length,
        };
        setThread(merged);
      }
    } catch (err) {
      console.error("Failed to fetch thread:", err);
    }
  }, [threadId]);;

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
              page: `/board/${threadId}`,
            }),
          }).catch(console.error);
        }
      } catch (error) {
        console.error("LIFF init error:", error);
        setLiffReady(true);
      }
    };
    init();
    fetchThread().finally(() => setLoading(false));
  }, [fetchThread, threadId]);

  const handleLogin = async () => {
    try {
      const liff = (await import("@line/liff")).default;
      liff.login();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;
    if (thread && (thread.replyList?.length || 0) >= MAX_REPLIES) {
      alert("このスレッドは1000件に達したため、これ以上書き込めません。");
      return;
    }
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
        const newReply = {
          id: crypto.randomUUID(),
          threadId: threadId as string,
          author: user.displayName,
          content: replyContent.trim(),
          createdAt: new Date().toISOString(),
          lineUserId: user.userId,
          lineDisplayName: user.displayName,
          linePictureUrl: user.pictureUrl || null,
        };
        setThread((prev) => prev ? {
          ...prev,
          replyList: [...(prev.replyList || []), newReply],
          replies: (prev.replies || 0) + 1,
        } : prev);
        setReplyContent("");
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        setTimeout(() => fetchThread(), 2000);
      } else {
        const data = await res.json();
        if (data.error) alert(data.error);
      }
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    const day = dayNames[d.getDay()];
    const HH = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}/${MM}/${dd}(${day}) ${HH}:${mm}:${ss}`;
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
          <Link href="/board/general" className="text-blue-500 hover:underline mt-4 inline-block">
            ← スレッド一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const totalPosts = 1 + (thread.replyList?.length || 0);
  const isFull = (thread.replyList?.length || 0) >= MAX_REPLIES;
  const backHref = thread.category ? `/board/${thread.category}` : "/board/general";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-4">
        <Link href={backHref} className="text-blue-600 hover:underline text-sm">
          ← スレッド一覧に戻る
        </Link>
      </div>

      <div className="bg-red-700 text-white px-4 py-2 rounded-t-lg font-bold text-lg">
        {thread.title}
      </div>

      <div className="bg-gray-200 px-4 py-1 text-xs text-gray-600 flex justify-between items-center border-x border-gray-300">
        <span>{totalPosts} / {MAX_REPLIES}</span>
        <span className="text-gray-400">
          {CATEGORY_LABELS[thread.category] || thread.category}
        </span>
      </div>

      <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg">
        <div className="px-4 py-3 border-b border-gray-200" id="post-1">
          <div className="text-sm mb-1">
            <span className="font-bold text-green-700">1</span>
            <span className="text-gray-500 ml-2">：</span>
            <span className="font-bold text-green-700">名無しさん</span>
            <span className="text-gray-500 ml-2">：</span>
            <span className="text-gray-500 text-xs">{formatDate(thread.createdAt)}</span>
          </div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap pl-2">{thread.content}</div>
        </div>

        {thread.replyList && thread.replyList.map((reply, index) => {
          const num = index + 2;
          return (
            <div
              key={reply.id}
              className={`px-4 py-3 ${num < totalPosts ? "border-b border-gray-200" : ""}`}
              id={`post-${num}`}
            >
              <div className="text-sm mb-1">
                <span className="font-bold text-green-700">{num}</span>
                <span className="text-gray-500 ml-2">：</span>
                <span className="font-bold text-green-700">名無しさん</span>
                <span className="text-gray-500 ml-2">：</span>
                <span className="text-gray-500 text-xs">{formatDate(reply.createdAt)}</span>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap pl-2">{reply.content}</div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="mt-6">
        {isFull ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-bold text-sm">
              このスレッドは{MAX_REPLIES}件に達しました。新規スレッドを立ててください。
            </p>
          </div>
        ) : liffReady && user ? (
          <form onSubmit={handleReply} className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="text-sm font-bold text-gray-700 mb-2">書き込み</div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400"
              placeholder="ここに書き込んでください..."
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {totalPosts} / {MAX_REPLIES}
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gray-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {submitting ? "書き込み中..." : "書き込む"}
              </button>
            </div>
          </form>
        ) : liffReady ? (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-center">
            <p className="text-gray-500 text-sm mb-3">書き込むにはLINEログインが必要です</p>
            <button
              onClick={handleLogin}
              className="bg-[#06C755] text-white px-6 py-2 rounded-lg hover:bg-[#05b54c] transition text-sm font-medium"
            >
              LINEでログイン
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}


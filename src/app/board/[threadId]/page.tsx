"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

interface Reply {
  number: number;
  author: string;
  content: string;
  createdAt: string;
}

interface Thread {
  id: string;
  category: string;
  title: string;
  author: string;
  createdAt: string;
  replies: Reply[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchThread = async () => {
    const res = await fetch(`/api/board/threads/${threadId}`);
    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setThread(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);

    await fetch(`/api/board/threads/${threadId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: replyAuthor,
        content: replyContent,
      }),
    });

    setReplyContent("");
    setSubmitting(false);
    fetchThread();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
        読み込み中...
      </div>
    );
  }

  if (notFound || !thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">スレッドが見つかりません</p>
        <Link href="/board" className="text-violet-700 hover:underline text-sm">
          掲示板に戻る
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/board" className="inline-flex items-center gap-1 text-violet-300 hover:text-white text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            掲示板に戻る
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[thread.category] || "bg-gray-100 text-gray-600"}`}>
              {CATEGORY_LABELS[thread.category] || thread.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{thread.title}</h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Replies */}
        <div className="space-y-4 mb-10">
          {thread.replies.map((reply) => (
            <div
              key={reply.number}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="font-bold text-violet-700">{reply.number}</span>
                <span className="font-medium text-gray-700">{reply.author}</span>
                <span className="text-gray-400 text-xs">{formatDate(reply.createdAt)}</span>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleReply} className="bg-white rounded-2xl border border-violet-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">返信する</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名前（空欄で「名無しのダンサー」）
              </label>
              <input
                type="text"
                value={replyAuthor}
                onChange={(e) => setReplyAuthor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="名無しのダンサー"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                本文 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                placeholder="返信を入力..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "投稿中..." : "書き込む"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

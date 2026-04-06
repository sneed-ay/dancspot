"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { initLiff, isLoggedIn, login, getProfile } from "@/lib/liff";

interface Conversation {
  id: string;
  threadId: string;
  isPoster: boolean;
  partnerLabel: string;
  threadTitle: string;
  threadDanceType: string;
  applicationNickname: string;
  applicationStatus: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [liffReady, setLiffReady] = useState(false);

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
        }
      } catch (error) {
        console.error("LIFF init error:", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/board/conversations?lineUserId=${user.userId}`);
        const data = await res.json();
        if (data.conversations) setConversations(data.conversations);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (!liffReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-500 text-lg mb-4">メッセージを見るにはログインが必要です</p>
          <button
            onClick={() => login()}
            className="bg-[#06C755] text-white px-6 py-3 rounded-lg hover:bg-[#05b54c] transition font-medium"
          >
            LINEでログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">メッセージ</h1>
        <Link href="/board" className="text-blue-500 hover:underline text-sm">
          ← 掲示板に戻る
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">読み込み中...</p>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">メッセージはまだありません</p>
          <p className="text-gray-400 text-sm mt-2">お相手募集に応募するとメッセージが始まります</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/board/chat/${conv.id}`}
              className="block bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                      {conv.partnerLabel}
                    </span>
                    {conv.threadDanceType && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                        {conv.threadDanceType}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 truncate">
                    {conv.threadTitle || conv.applicationNickname || "お相手募集"}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                  )}
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-xs text-gray-400">{formatDate(conv.lastMessageAt)}</p>
                  {conv.messageCount > 0 && (
                    <span className="text-xs text-blue-500">{conv.messageCount}件</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

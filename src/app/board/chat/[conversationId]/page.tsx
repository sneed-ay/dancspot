'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProfile, isLoggedIn, login, initLiff } from '@/lib/liff';

interface Message {
  id: string;
  content: string;
  senderLineUserId: string;
  senderLabel: string;
  isMe: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState('');
  const [otherLabel, setOtherLabel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const init = async () => {
      try {
        await initLiff();
        if (!isLoggedIn()) {
          login();
          return;
        }
        const profile = await getProfile();
        if (profile?.userId) {
          setMyUserId(profile.userId);
        }
      } catch (err) {
        console.error('LIFF init error:', err);
        setError('LINEの初期化に失敗しました');
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!myUserId) return;
    try {
      const res = await fetch(`/api/board/messages?conversationId=${conversationId}&lineUserId=${myUserId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'メッセージの取得に失敗しました');
        return;
      }
      const data = await res.json();
      setMessages(data.messages || []);
      if (data.messages?.length > 0) {
        const firstOther = data.messages.find((m: Message) => !m.isMe);
        if (firstOther) setOtherLabel(firstOther.senderLabel);
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [conversationId, myUserId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/board/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderLineUserId: myUserId,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDateKey = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP');
  };

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => router.push('/board/inbox')} className="text-blue-600 underline">
          受信トレイに戻る
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-lg mx-auto p-4 text-center text-gray-500">読み込み中...</div>;
  }

  let lastDateKey = '';

  return (
    <div className="max-w-lg mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/board/inbox')} className="text-gray-600 hover:text-gray-900">
          ← 戻る
        </button>
        <h1 className="font-bold text-lg">{otherLabel || 'チャット'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-sky-50">
        {messages.map((msg) => {
          const dateKey = getDateKey(msg.createdAt);
          let showDate = false;
          if (dateKey !== lastDateKey) {
            showDate = true;
            lastDateKey = dateKey;
          }
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-3">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${msg.isMe ? 'order-1' : ''}`}>
                  {!msg.isMe && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">{msg.senderLabel}</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      msg.isMe
                        ? 'bg-green-400 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${msg.isMe ? 'text-right mr-1' : 'ml-1'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-white border-t px-4 py-3 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-400"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:bg-green-600"
        >
          ▶
        </button>
      </form>
    </div>
  );
}

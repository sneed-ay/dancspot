'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import Link from 'next/link';

interface PartnerPost {
  id: string;
  nickname: string;
  content: string;
  danceType: string;
  area: string;
  role: string;
  createdAt: string;
  lineUserId: string;
  lineDisplayName: string;
  linePictureUrl: string | null;
}

interface Reply {
  id: string;
  author: string;
  content: string;
  lineUserId: string;
  lineDisplayName: string;
  linePictureUrl: string | null;
  createdAt: string;
}

interface GeneralThread {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  lineUserId: string;
  lineDisplayName: string;
  linePictureUrl: string | null;
  replyCount: number;
  replies: Reply[];
}

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string>('');
  const [partnerPosts, setPartnerPosts] = useState<PartnerPost[]>([]);
  const [generalThreads, setGeneralThreads] = useState<GeneralThread[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [deletingId, setDeletingId] = useState<string>('');
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [resetting, setResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAuthed(!!data.authenticated);
        setSessionEmail(data.email || '');
      } else {
        setAuthed(false);
      }
    } catch {
      setAuthed(false);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/admin/posts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPartnerPosts(data.partnerPosts || []);
        setGeneralThreads(data.generalThreads || []);
      } else if (res.status === 401) {
        setAuthed(false);
      }
    } catch {
      // ignore
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchPosts();
  }, [authed, fetchPosts]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmail('');
        setPassword('');
        await checkSession();
      } else {
        setLoginError(data.error || 'ログインに失敗しました');
      }
    } catch {
      setLoginError('通信エラーが発生しました');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthed(false);
    setSessionEmail('');
    setPartnerPosts([]);
    setGeneralThreads([]);
  };

  const handleDeleteOne = async (type: 'partner' | 'thread', id: string, label: string) => {
    const ok = window.confirm(
      '「' + label + '」を削除しますか？\n\n' +
      (type === 'partner'
        ? '関連する応募・会話・メッセージも全て削除されます。'
        : '関連する返信も全て削除されます。') +
      '\n\nこの操作は取り消せません。'
    );
    if (!ok) return;
    setDeletingId(id);
    setStatusMsg('');
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('✅ 削除成功: ' + JSON.stringify(data.deleted));
        await fetchPosts();
      } else {
        setStatusMsg('❌ エラー: ' + (data.error || res.status));
      }
    } catch {
      setStatusMsg('❌ 通信エラー');
    } finally {
      setDeletingId('');
    }
  };

  const handleResetAll = async () => {
    const ok = window.confirm(
      '本当に掲示板の全データを削除しますか？\n\n削除対象:\n- messages\n- conversations\n- applications\n- partner_posts\n- board_replies\n- board_threads\n\nこの操作は取り消せません。'
    );
    if (!ok) return;
    setResetting(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/admin/reset-board', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('✅ 全件削除成功: ' + JSON.stringify(data.deleted));
        await fetchPosts();
      } else {
        setStatusMsg('❌ エラー: ' + (data.error || res.status));
      }
    } catch {
      setStatusMsg('❌ 通信エラー');
    } finally {
      setResetting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ja-JP', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">管理者ログイン</h1>
          <p className="text-sm text-gray-500 mb-6">メールアドレスとパスワードを入力してください。</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="admin@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button type="submit" disabled={loggingIn} className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50">{loggingIn ? 'ログイン中...' : 'ログイン'}</button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">トップに戻る</Link>
          </div>
        </div>
      </div>
    );
  }

  const renderAvatar = (url: string | null, name: string) => {
    if (url) {
      return <img src={url} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />;
    }
    const initial = (name || '?').charAt(0).toUpperCase();
    return <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 flex-shrink-0">{initial}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">管理者ページ</h1>
            <p className="text-sm text-gray-500 mt-1">ログイン中: {sessionEmail}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchPosts} className="text-sm text-blue-500 hover:underline">再読み込み</button>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">ログアウト</button>
            <Link href="/" className="text-sm text-blue-500 hover:underline">トップ</Link>
          </div>
        </div>

        {statusMsg && (
          <div className="bg-white border rounded-lg p-3 text-sm text-gray-700 mb-4 whitespace-pre-wrap break-all">{statusMsg}</div>
        )}

        {/* Partner posts */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">お相手募集 ({partnerPosts.length})</h2>
          {loadingPosts ? (
            <p className="text-gray-500 text-sm">読み込み中...</p>
          ) : partnerPosts.length === 0 ? (
            <p className="text-gray-500 text-sm">投稿はありません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {partnerPosts.map((p) => (
                <li key={p.id} className="py-3 flex items-start gap-3">
                  {renderAvatar(p.linePictureUrl, p.lineDisplayName || p.nickname)}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm mb-1">
                      <span className="font-medium text-gray-900">{p.nickname || '無名'}</span>
                      {p.lineDisplayName && (
                        <span className="text-xs text-gray-500">(LINE: {p.lineDisplayName})</span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {p.danceType && <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">{p.danceType}</span>}
                      {p.area && <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded">{p.area}</span>}
                      {p.role && <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">{p.role}</span>}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 whitespace-pre-wrap">{p.content}</p>
                    <p className="text-xs text-gray-400 mt-1 break-all">LINE User ID: {p.lineUserId || '(なし)'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteOne('partner', p.id, p.nickname || 'this post')}
                    disabled={deletingId === p.id}
                    className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 flex-shrink-0"
                  >
                    {deletingId === p.id ? '削除中...' : '削除'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* General threads */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">雑談・その他のスレッド ({generalThreads.length})</h2>
          {loadingPosts ? (
            <p className="text-gray-500 text-sm">読み込み中...</p>
          ) : generalThreads.length === 0 ? (
            <p className="text-gray-500 text-sm">スレッドはありません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {generalThreads.map((t) => (
                <li key={t.id} className="py-3">
                  <div className="flex items-start gap-3">
                    {renderAvatar(t.linePictureUrl, t.lineDisplayName || t.title)}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm mb-1">
                        <span className="font-medium text-gray-900">{t.title || '(無題)'}</span>
                        {t.lineDisplayName && (
                          <span className="text-xs text-gray-500">(LINE: {t.lineDisplayName})</span>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(t.createdAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {t.category && <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{t.category}</span>}
                        <button
                          onClick={() => setExpandedThreads((p) => ({ ...p, [t.id]: !p[t.id] }))}
                          className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
                        >
                          {expandedThreads[t.id] ? '↓' : '→'} 返信 {t.replyCount}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 whitespace-pre-wrap">{t.content}</p>
                      <p className="text-xs text-gray-400 mt-1 break-all">LINE User ID: {t.lineUserId || '(なし)'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteOne('thread', t.id, t.title || 'this thread')}
                      disabled={deletingId === t.id}
                      className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 flex-shrink-0"
                    >
                      {deletingId === t.id ? '削除中...' : '削除'}
                    </button>
                  </div>
                  {expandedThreads[t.id] && t.replies.length > 0 && (
                    <ul className="mt-3 ml-12 pl-4 border-l-2 border-amber-100 space-y-3">
                      {t.replies.map((r) => (
                        <li key={r.id} className="flex items-start gap-2">
                          {renderAvatar(r.linePictureUrl, r.lineDisplayName || r.author)}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs mb-0.5">
                              <span className="font-medium text-gray-800">{r.author || '名無しさん'}</span>
                              {r.lineDisplayName && r.lineDisplayName !== r.author && (
                                <span className="text-xs text-gray-500">(LINE: {r.lineDisplayName})</span>
                              )}
                              <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.content}</p>
                            <p className="text-xs text-gray-400 mt-0.5 break-all">LINE User ID: {r.lineUserId || '(なし)'}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {expandedThreads[t.id] && t.replies.length === 0 && (
                    <p className="mt-2 ml-12 text-xs text-gray-400">返信はありません</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Danger zone: bulk delete */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-6">
          <h2 className="text-lg font-bold text-red-600 mb-2">⚠️ 危険な操作</h2>
          <p className="text-sm text-gray-600 mb-4">
            掲示板の<strong>全データ</strong>を削除します。<strong>取り消せません。</strong>
          </p>
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium text-gray-900">掲示板の全データを削除</p>
                <p className="text-xs text-gray-500 mt-1">
                  messages / conversations / applications / partner_posts / board_replies / board_threads
                </p>
              </div>
              <button
                onClick={handleResetAll}
                disabled={resetting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
              >
                {resetting ? '削除中...' : '全件削除'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

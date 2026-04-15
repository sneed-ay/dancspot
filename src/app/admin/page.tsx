'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';

interface BoardStats {
  posts: number;
  conversations: number;
}

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string>('');
  const [stats, setStats] = useState<BoardStats | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<string>('');

  const checkSession = async () => {
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
  };

  useEffect(() => {
    checkSession();
  }, []);

  const refreshStats = async () => {
    try {
      const postsRes = await fetch('/api/posts').then((r) => r.json());
      setStats({
        posts: postsRes.posts?.length ?? 0,
        conversations: 0,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (authed) refreshStats();
  }, [authed]);

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
    setStats(null);
  };

  const handleReset = async () => {
    const ok = window.confirm(
      '本当に掲示板の全データを削除しますか？\n\n削除対象:\n- messages全件\n- conversations全件\n- applications全件\n- partner_posts全件\n\nこの操作は取り消せません。'
    );
    if (!ok) return;
    setResetting(true);
    setResetResult('');
    try {
      const res = await fetch('/api/admin/reset-board', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setResetResult('✅ 削除成功: ' + JSON.stringify(data.deleted));
        await refreshStats();
      } else {
        setResetResult('❌ エラー: ' + (data.error || res.status));
      }
    } catch {
      setResetResult('❌ 通信エラー');
    } finally {
      setResetting(false);
    }
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50"
            >
              {loggingIn ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
              トップに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">管理者ページ</h1>
            <p className="text-sm text-gray-500 mt-1">ログイン中: {sessionEmail}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">
              ログアウト
            </button>
            <Link href="/" className="text-sm text-blue-500 hover:underline">
              トップ
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">現在の掲示板データ</h2>
            <button onClick={refreshStats} className="text-sm text-blue-500 hover:underline">
              再読み込み
            </button>
          </div>
          {stats ? (
            <div className="text-sm">
              <p className="text-gray-500">投稿数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.posts}</p>
            </div>
          ) : (
            <p className="text-gray-500">読み込み中...</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-6">
          <h2 className="text-lg font-bold text-red-600 mb-2">⚠️ 危険な操作</h2>
          <p className="text-sm text-gray-600 mb-4">
            以下の操作は<strong>取り消せません</strong>。テスト用としてのみ使用してください。
          </p>
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">掲示板の全データを削除</p>
                <p className="text-xs text-gray-500 mt-1">
                  messages / conversations / applications / partner_posts を全件削除
                </p>
              </div>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
              >
                {resetting ? '削除中...' : '全件削除'}
              </button>
            </div>
            {resetResult && (
              <p className="text-sm mt-3 text-gray-700 whitespace-pre-wrap break-all">{resetResult}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initLiff, isLoggedIn, login, getProfile } from '@/lib/liff';
import { isAdmin } from '@/lib/admin';

interface BoardStats {
  posts: number;
  applications: number;
  conversations: number;
}

export default function AdminPage() {
  const [liffReady, setLiffReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [stats, setStats] = useState<BoardStats | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        await initLiff();
        setLiffReady(true);
        if (isLoggedIn()) {
          const profile = await getProfile();
          setUserId(profile.userId);
          setDisplayName(profile.displayName);
        }
      } catch (err) {
        console.error('LIFF init error:', err);
        setError('LINEの初期化に失敗しました');
      }
    };
    init();
  }, []);

  const refreshStats = async () => {
    try {
      const [postsRes, convsRes] = await Promise.all([
        fetch('/api/posts').then((r) => r.json()),
        userId
          ? fetch('/api/board/conversations?lineUserId=' + userId).then((r) => r.json())
          : Promise.resolve({ conversations: [] }),
      ]);
      setStats({
        posts: postsRes.posts?.length ?? 0,
        applications: 0, // not directly fetchable here
        conversations: convsRes.conversations?.length ?? 0,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (userId && isAdmin(userId)) refreshStats();
  }, [userId]);

  const handleReset = async () => {
    if (!userId) return;
    const ok = window.confirm(
      '本当に掲示板の全データを削除しますか？\n\n削除対象:\n- messages全件\n- conversations全件\n- applications全件\n- partner_posts全件\n\nこの操作は取り消せません。'
    );
    if (!ok) return;
    setResetting(true);
    setResetResult('');
    try {
      const res = await fetch('/api/admin/reset-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineUserId: userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetResult('✅ 削除成功: ' + JSON.stringify(data.deleted));
        await refreshStats();
      } else {
        setResetResult('❌ エラー: ' + (data.error || res.status));
      }
    } catch (err) {
      setResetResult('❌ 通信エラー');
    } finally {
      setResetting(false);
    }
  };

  if (!liffReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">管理者ページ</h1>
          <p className="text-gray-500 mb-6">まずLINEでログインしてください</p>
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

  if (!isAdmin(userId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">アクセス拒否</h1>
          <p className="text-gray-600 mb-2">このページは管理者専用です。</p>
          <p className="text-xs text-gray-400 mb-6">ログイン中: {displayName}</p>
          <Link href="/" className="text-blue-500 hover:underline text-sm">
            トップに戻る
          </Link>
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
            <p className="text-sm text-gray-500 mt-1">ログイン中: {displayName} ({userId.substring(0, 10)}...)</p>
          </div>
          <Link href="/" className="text-blue-500 hover:underline text-sm">
            トップに戻る
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">現在の掲示板データ</h2>
            <button onClick={refreshStats} className="text-sm text-blue-500 hover:underline">
              再読み込み
            </button>
          </div>
          {stats ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">投稿数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.posts}</p>
              </div>
              <div>
                <p className="text-gray-500">自分の会話数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversations}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">読み込み中...</p>
          )}
        </div>

        {/* Danger zone */}
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

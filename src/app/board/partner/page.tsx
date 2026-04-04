'use client';

import { useState, useEffect, useCallback } from 'react';
import { initLiff, isLoggedIn, login, getProfile, isInClient } from '@/lib/liff';

interface Post {
  id: string;
  title: string;
  content: string;
  dance_type: string;
  area: string;
  role: string;
  level: string;
  nickname: string;
  line_user_id: string;
  line_display_name: string;
  line_picture_url: string | null;
  created_at: string;
}

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

const DANCE_TYPES = ['サルサ', 'バチャータ', 'キゾンバ', 'メレンゲ', 'レゲトン', 'ズーク', 'その他'];
const AREAS = ['東京', '大阪', '名古屋', '福岡', '札幌', '仙台', '横浜', '京都', '神戸', 'その他'];
const ROLES = ['リーダー', 'フォロワー', 'どちらでも'];
const LEVELS = ['初心者', '初中級', '中級', '中上級', '上級'];

export default function PartnerBoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liffReady, setLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [danceType, setDanceType] = useState('');
  const [area, setArea] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('');

  // Initialize LIFF
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
        console.error('LIFF init error:', error);
        setLiffError('LIFFの初期化に失敗しました。LINEアプリから開いてください。');
      }
    };
    init();
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLogin = () => {
    login();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !content || !danceType || !area || !role) {
      alert('すべての必須項目を入力してください');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUserId: user.userId,
          lineDisplayName: user.displayName,
          linePictureUrl: user.pictureUrl || null,
          title,
          content,
          danceType,
          area,
          role,
          level: level || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setTitle('');
        setContent('');
        setDanceType('');
        setArea('');
        setRole('');
        setLevel('');
        fetchPosts();
      } else {
        const err = await res.json();
        alert(err.error || '投稿に失敗しました');
      }
    } catch (error) {
      console.error('Post creation failed:', error);
      alert('投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    if (!confirm('この投稿を削除しますか？')) return;

    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, lineUserId: user.userId }),
      });

      if (res.ok) {
        fetchPosts();
      } else {
        const err = await res.json();
        alert(err.error === 'Not authorized' ? 'この投稿を削除する権限がありません' : '削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('削除に失敗しました');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // LIFF error state
  if (liffError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-500 text-lg">{liffError}</p>
          <p className="text-gray-500 mt-2">このページはLINEアプリから開いてください</p>
        </div>
      </div>
    );
  }

  // Loading LIFF
  if (!liffReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">お相手募集掲示板</h1>
            <p className="text-gray-600 mt-1">ダンスパートナーを見つけよう</p>
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
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {showForm ? '閉じる' : '新規投稿'}
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEでログイン
              </button>
            )}
          </div>
        </div>

        {showForm && user && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">新規投稿</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" placeholder="募集タイトル" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 h-24" placeholder="詳細を記入してください" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル *</label>
                <select value={danceType} onChange={(e) => setDanceType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" required>
                  <option value="">選択してください</option>
                  {DANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">エリア *</label>
                <select value={area} onChange={(e) => setArea(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" required>
                  <option value="">選択してください</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ロール *</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" required>
                  <option value="">選択してください</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2">
                  <option value="">選択してください</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
              {submitting ? '投稿中...' : '投稿する'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">まだ投稿がありません</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full">{post.dance_type}</span>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{post.area}</span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{post.role}</span>
                      {post.level && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">{post.level}</span>}
                    </div>
                    <p className="text-gray-700 mt-3 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        {post.line_picture_url && (
                          <img src={post.line_picture_url} alt="" className="w-5 h-5 rounded-full" />
                        )}
                        <span>{post.line_display_name || post.nickname}</span>
                      </div>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  {user && user.userId === post.line_user_id && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-gray-400 hover:text-red-500 ml-4 text-sm transition-colors"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

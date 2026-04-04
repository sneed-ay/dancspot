'use client';

import { useState, useEffect, useCallback } from 'react';
import { initLiff, isLoggedIn, login, getProfile } from '@/lib/liff';

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
          fetch('/api/auth/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lineUserId: profile.userId,
              lineDisplayName: profile.displayName,
              linePictureUrl: profile.pictureUrl || null,
              page: '/board/partner',
            }),
          }).catch(console.error);
        }
      } catch (error) {
        console.error('LIFF init error:', error);
        setLiffError('LINEの初期化に失敗しました');
      }
    };
    init();
    fetchPosts();
  }, [fetchPosts]);

  const handleLogin = () => {
    login();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
          level,
        }),
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        setDanceType('');
        setArea('');
        setRole('');
        setLevel('');
        setShowForm(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user || !confirm('この投稿を削除しますか？')) return;
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, lineUserId: user.userId }),
      });
      if (res.ok) fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">お相手募集</h1>
            <p className="text-gray-500 text-sm mt-1">ダンスパートナーを探そう</p>
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
                  {showForm ? '閉じる' : '新規投稿'}
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
            <h2 className="text-lg font-bold mb-4">新規投稿</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="例: 土曜の夜にサルサ踊りませんか？" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容 <span className="text-red-500">*</span></label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="詳細を書いてください" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ダンスの種類 <span className="text-red-500">*</span></label>
                  <select value={danceType} onChange={(e) => setDanceType(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {DANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">エリア <span className="text-red-500">*</span></label>
                  <select value={area} onChange={(e) => setArea(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ロール <span className="text-red-500">*</span></label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50">
                {submitting ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-8">読み込み中...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">まだ投稿がありません</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {post.line_picture_url && (
                      <img src={post.line_picture_url} alt="" className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{post.title}</h3>
                      <p className="text-xs text-gray-500">
                        {post.line_display_name || post.nickname} ・ {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  {user && user.userId === post.line_user_id && (
                    <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-600 text-xs">
                      削除
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{post.dance_type}</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">{post.area}</span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">{post.role}</span>
                  {post.level && (
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs">{post.level}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}'use client';

import { useState, useEffect, useCallback } from 'react';
import { initLiff, isLoggedIn, login, getProfile } from '@/lib/liff';

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
        setLiffError('LINEの初期化に失敗しました');
      }
    };
    init();
    fetchPosts();
  }, [fetchPosts]);

  const handleLogin = () => {
    login();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
          level,
        }),
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        setDanceType('');
        setArea('');
        setRole('');
        setLevel('');
        setShowForm(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user || !confirm('この投稿を削除しますか？')) return;
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, lineUserId: user.userId }),
      });
      if (res.ok) fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">お相手募集</h1>
            <p className="text-gray-500 text-sm mt-1">ダンスパートナーを探そう</p>
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
                  {showForm ? '閉じる' : '新規投稿'}
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
            <h2 className="text-lg font-bold mb-4">新規投稿</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="例: 土曜の夜にサルサ踊りませんか？" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容 <span className="text-red-500">*</span></label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="詳細を書いてください" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ダンスの種類 <span className="text-red-500">*</span></label>
                  <select value={danceType} onChange={(e) => setDanceType(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {DANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">エリア <span className="text-red-500">*</span></label>
                  <select value={area} onChange={(e) => setArea(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ロール <span className="text-red-500">*</span></label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50">
                {submitting ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-center text-gray-500 py-8">読み込み中...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">まだ投稿がありません</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {post.line_picture_url && (
                      <img src={post.line_picture_url} alt="" className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{post.title}</h3>
                      <p className="text-xs text-gray-500">
                        {post.line_display_name || post.nickname} ・ {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  {user && user.userId === post.line_user_id && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      削除
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{post.dance_type}</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">{post.area}</span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">{post.role}</span>
                  {post.level && (
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs">{post.level}</span>
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

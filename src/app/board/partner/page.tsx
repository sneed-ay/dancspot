'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  dance_type: string;
  area: string;
  role: string;
  level: string;
  created_at: string;
  users: {
    display_name: string;
    picture_url: string | null;
    line_user_id: string;
  };
}

const DANCE_TYPES = [
  'ワルツ', 'タンゴ', 'スローフォックストロット', 'クイックステップ', 'ヴェニーズワルツ',
  'チャチャチャ', 'サンバ', 'ルンバ', 'パソドブレ', 'ジャイブ',
  'スタンダード全般', 'ラテン全般', '10ダンス',
];

const AREAS = [
  '北海道', '東北', '関東', '東京', '中部', '近畿', '中国', '四国', '九州・沖縄', 'その他',
];

const ROLES = [
  { value: 'leader', label: 'リーダー' },
  { value: 'follower', label: 'パートナー' },
  { value: 'both', label: 'どちらでも' },
];

const LEVELS = [
  { value: 'beginner', label: '初心者' },
  { value: 'intermediate', label: '中級者' },
  { value: 'advanced', label: '上級者' },
  { value: 'professional', label: 'プロ' },
];

const AGE_RANGES = ['20代', '30代', '40代', '50代', '60代以上'];

export default function PartnerBoardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liffReady, setLiffReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [danceType, setDanceType] = useState('');
  const [area, setArea] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('beginner');

  // Apply modal state
  const [applyingTo, setApplyingTo] = useState<Post | null>(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyNickname, setApplyNickname] = useState('');
  const [applyDanceType, setApplyDanceType] = useState('');
  const [applyArea, setApplyArea] = useState('');
  const [applyRole, setApplyRole] = useState('');
  const [applyLevel, setApplyLevel] = useState('beginner');
  const [applyAge, setApplyAge] = useState('');
  const [applyMessage, setApplyMessage] = useState('');

  // Initialize LIFF
  useEffect(() => {
    const init = async () => {
      try {        const liffModule = await import('@line/liff');
        const liff = liffModule.default;

        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        setLiffReady(true);

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          const userProfile: UserProfile = {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl || null,
          };
          setUser(userProfile);

          // Register user in our database
          await fetch('/api/auth/line', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userProfile),
          });
        }
      } catch (err) {
        console.error('LIFF init error:', err);
        setError('LIFFの初期化に失敗しました');
      }
    };

    init();
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLogin = async () => {
    const liffModule = await import('@line/liff');
    liffModule.default.login();
  };

  const handleLogout = async () => {
    const liffModule = await import('@line/liff');
    liffModule.default.logout();
    window.location.reload();
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
        setLevel('beginner');
        setShowForm(false);
        await fetchPosts();
      } else {
        const data = await res.json();
        setError(data.error || '投稿に失敗しました');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('投稿に失敗しました');    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user || !confirm('この投稿を削除しますか？')) return;

    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          lineUserId: user.userId,
        }),
      });

      if (res.ok) {
        await fetchPosts();
      } else {
        const data = await res.json();
        setError(data.error || '削除に失敗しました');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('削除に失敗しました');
    }
  };

  const openApplyForm = async (post: Post) => {
    if (!user) {
      handleLogin();
      return;
    }
    setApplyingTo(post);
    setApplyNickname(user.displayName || '');
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !applyingTo) return;

    setApplySubmitting(true);
    try {
      const res = await fetch('/api/board/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: applyingTo.id,
          applicantLineUserId: user.userId,
          applicantDisplayName: user.displayName,
          applicantPictureUrl: user.pictureUrl,
          nickname: applyNickname,
          danceType: applyDanceType,
          area: applyArea,
          role: applyRole,
          level: applyLevel,
          ageRange: applyAge,
          message: applyMessage,
        }),
      });

      if (res.ok) {
        setApplyingTo(null);
        setApplyNickname('');
        setApplyDanceType('');
        setApplyArea('');
        setApplyRole('');
        setApplyLevel('beginner');
        setApplyAge('');
        setApplyMessage('');
        setSuccessMsg('応募を送信しました！相手からの返信をお待ちください。');
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        const data = await res.json();
        setError(data.error || '応募に失敗しました');
      }
    } catch (err) {
      console.error('Apply error:', err);
      setError('応募に失敗しました');
    } finally {
      setApplySubmitting(false);
    }
  };

  const getRoleLabel = (value: string) => {
    return ROLES.find(r => r.value === value)?.label || value;
  };

  const getLevelLabel = (value: string) => {
    return LEVELS.find(l => l.value === value)?.label || value;
  };

  const formatDate = (dateStr: string) => {    const d = new Date(dateStr);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">お相手募集掲示板</h1>
          <p className="text-pink-100 text-sm">
            社交ダンスのリーダー・パートナーを探している方のための掲示板です
          </p>

          {/* Auth section */}
          <div className="mt-4 flex items-center gap-3">
            {user ? (
              <>
                {user.pictureUrl && (
                  <img
                    src={user.pictureUrl}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                )}
                <span className="text-sm">{user.displayName} でログイン中</span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
                >
                  ログアウト
                </button>
              </>
            ) : liffReady ? (
              <button
                onClick={handleLogin}
                className="bg-[#06C755] hover:bg-[#05b34c] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEでログイン
              </button>
            ) : (
              <span className="text-sm text-pink-200">読み込み中...</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-green-500 hover:text-green-700">
              ✕
            </button>
          </div>
        )}

        {/* New post button */}
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition shadow-lg"
          >            + 新しい募集を投稿する
          </button>
        )}

        {/* Post form */}
        {showForm && user && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-800">新しい募集を投稿</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例: 東京でスタンダードのパートナー募集"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    種目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={danceType}
                    onChange={e => setDanceType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {DANCE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地域 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {AREAS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    募集役割 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    {LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  詳細 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="自己紹介、希望する条件、練習場所・時間帯など"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50"
                >
                  {submitting ? '投稿中...' : '投稿する'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!user && liffReady && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            投稿するにはLINEログインが必要です。上のボタンからログインしてください。
          </div>
        )}

        {/* Posts list */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
            読み込み中...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">まだ投稿がありません</p>
            <p className="text-sm">最初の募集を投稿してみましょう！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {post.users.picture_url ? (
                      <img
                        src={post.users.picture_url}
                        alt={post.users.display_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {post.users.display_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{post.users.display_name}</p>                      <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
                    </div>
                  </div>

                  {user && user.userId === post.users.line_user_id && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-gray-400 hover:text-red-500 text-sm transition"
                      title="削除"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    {post.dance_type}
                  </span>
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {post.area}
                  </span>
                  <span className="inline-block bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full">
                    {getRoleLabel(post.role)}募集
                  </span>
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    {getLevelLabel(post.level)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm whitespace-pre-wrap mb-3">{post.content}</p>

                {/* Apply button - visible to everyone except the poster */}
                {(!user || user.userId !== post.users.line_user_id) && (
                  <button
                    onClick={() => openApplyForm(post)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                  >
                    応募する
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply modal */}
      {applyingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">応募フォーム</h2>
            <p className="text-sm text-gray-500 mb-4">
              「{applyingTo.title}」への応募
            </p>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ニックネーム <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={applyNickname}
                  onChange={e => setApplyNickname(e.target.value)}
                  placeholder="相手に表示される名前"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    種目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={applyDanceType}
                    onChange={e => setApplyDanceType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {DANCE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地域 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={applyArea}
                    onChange={e => setApplyArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {AREAS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">                    役割 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={applyRole}
                    onChange={e => setApplyRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">選択してください</option>
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">レベル</label>
                  <select
                    value={applyLevel}
                    onChange={e => setApplyLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年代</label>
                <select
                  value={applyAge}
                  onChange={e => setApplyAge(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">選択してください</option>
                  {AGE_RANGES.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={applyMessage}
                  onChange={e => setApplyMessage(e.target.value)}
                  placeholder="自己紹介やアピールポイントなど"
                  rows={4}                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={applySubmitting}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {applySubmitting ? '送信中...' : '応募を送信'}
                </button>
                <button
                  type="button"
                  onClick={() => setApplyingTo(null)}
                  className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
  age_range: string | null;
  height: string | null;
  pro_am: string | null;
  dance_experience: string | null;
  direction: string | null;
  practice_frequency: string | null;
  practice_location: string | null;
  smoking: string | null;
  marital_status: string | null;
  std_org: string | null;
  std_level: string | null;
  latin_org: string | null;
  latin_level: string | null;
}

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

const DANCE_TYPES = [
  'スタンダード',
  'ラテン',
  '10ダンス(スタンダード寄り)',
  '10ダンス(ラテン寄り)',
  '10ダンス',
];

const AREAS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

const ROLES = ['リーダー募集', 'パートナー募集', 'どちらでも'];

const PRO_AM_OPTIONS = ['アマチュア', 'プロ志望', 'プロ'];

const AGE_RANGES = ['10代', '20代前半', '20代後半', '30代前半', '30代後半', '40代前半', '40代後半', '50代', '60代以上'];

const DANCE_EXPERIENCES = ['未経験', '半年未満', '1年', '2年', '3年', '4年', '5年', '6〜10年', '11〜15年', '15年以上'];

const DIRECTIONS = ['競技志向', '練習相手', 'デモ', 'パーティー', 'サークル', '趣味'];

const PRACTICE_FREQUENCIES = ['週1回', '週2回', '週3回', '週4回以上', '月2〜3回', '月1回', '相談して決めたい'];

const SMOKING_OPTIONS = ['吸わない', '吸う', 'やめた'];

const MARITAL_OPTIONS = ['独身', '既婚', '非公開'];

const ORGS = ['JBDF', 'JDC', 'JCF', 'JDSF'];

const LEVELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function PartnerBoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liffReady, setLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [danceType, setDanceType] = useState('');
  const [area, setArea] = useState('');
  const [role, setRole] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [height, setHeight] = useState('');
  const [proAm, setProAm] = useState('');
  const [danceExperience, setDanceExperience] = useState('');
  const [direction, setDirection] = useState('');
  const [practiceFrequency, setPracticeFrequency] = useState('');
  const [practiceLocation, setPracticeLocation] = useState('');
  const [smoking, setSmoking] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [stdOrg, setStdOrg] = useState('');
  const [stdLevel, setStdLevel] = useState('');
  const [latinOrg, setLatinOrg] = useState('');
  const [latinLevel, setLatinLevel] = useState('');

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
          setNickname(profile.displayName);
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

  const handleHeightChange = (value: string) => {
    const filtered = value.replace(/[^0-9]/g, '');
    setHeight(filtered);
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
          nickname,
          content,
          danceType,
          area,
          role,
          ageRange,
          height: height ? height + 'cm' : '',
          proAm,
          danceExperience,
          direction,
          practiceFrequency,
          practiceLocation,
          smoking,
          maritalStatus,
          stdOrg,
          stdLevel,
          latinOrg,
          latinLevel,
        }),
      });
      if (res.ok) {
        setContent('');
        setDanceType('');
        setArea('');
        setRole('');
        setAgeRange('');
        setHeight('');
        setProAm('');
        setDanceExperience('');
        setDirection('');
        setPracticeFrequency('');
        setPracticeLocation('');
        setSmoking('');
        setMaritalStatus('');
        setStdOrg('');
        setStdLevel('');
        setLatinOrg('');
        setLatinLevel('');
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
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatLevel = (org: string | null, level: string | null) => {
    if (!org && !level) return null;
    if (org && level) return `${org} ${level}級`;
    if (org) return org;
    return `${level}級`;
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
            <h2 className="text-lg font-bold mb-4">お相手募集 登録フォーム</h2>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ニックネーム <span className="text-red-500">*</span>
                </label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="表示名を入力してください" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  募集対象 <span className="text-red-500">*</span>
                </label>
                <select value={role} onChange={(e) => setRole(e.target.value)} required
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">選択してください</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プロ/アマ
                </label>
                <select value={proAm} onChange={(e) => setProAm(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">選択してください</option>
                  {PRO_AM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ダンスの種類 <span className="text-red-500">*</span>
                  </label>
                  <select value={danceType} onChange={(e) => setDanceType(e.target.value)} required
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {DANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地域 <span className="text-red-500">*</span>
                  </label>
                  <select value={area} onChange={(e) => setArea(e.target.value)} required
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年代</label>
                  <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">身長 (cm)</label>
                  <input type="text" inputMode="numeric" value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="例: 170" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ダンス歴</label>
                  <select value={danceExperience} onChange={(e) => setDanceExperience(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {DANCE_EXPERIENCES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">方向性</label>
                  <select value={direction} onChange={(e) => setDirection(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-bold text-gray-700 mb-3">持ち級</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">スタンダード</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={stdOrg} onChange={(e) => setStdOrg(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm">
                        <option value="">団体を選択</option>
                        {ORGS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select value={stdLevel} onChange={(e) => setStdLevel(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm">
                        <option value="">級を選択</option>
                        {LEVELS.map((l) => <option key={l} value={l}>{l}級</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ラテン</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={latinOrg} onChange={(e) => setLatinOrg(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm">
                        <option value="">団体を選択</option>
                        {ORGS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select value={latinLevel} onChange={(e) => setLatinLevel(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm">
                        <option value="">級を選択</option>
                        {LEVELS.map((l) => <option key={l} value={l}>{l}級</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">希望練習頻度</label>
                  <select value={practiceFrequency} onChange={(e) => setPracticeFrequency(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {PRACTICE_FREQUENCIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">希望練習場所</label>
                  <input type="text" value={practiceLocation} onChange={(e) => setPracticeLocation(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="例: 都内のスタジオ" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">煙草</label>
                  <select value={smoking} onChange={(e) => setSmoking(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {SMOKING_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">独身/既婚</label>
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="">選択してください</option>
                    {MARITAL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  自己PR・メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={5}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="自己紹介やお相手への希望などを書いてください" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50">
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
                      <h3 className="font-bold text-gray-900">
                        {post.nickname || post.line_display_name}
                      </h3>
                      <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  {user && user.userId === post.line_user_id && (
                    <button onClick={() => handleDelete(post.id)}
                      className="text-red-400 hover:text-red-600 text-xs">
                      削除
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">{post.role}</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{post.dance_type}</span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">{post.area}</span>
                  {post.pro_am && (
                    <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">{post.pro_am}</span>
                  )}
                  {post.direction && (
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">{post.direction}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mb-3 text-sm">
                  {post.age_range && (
                    <div><span className="text-gray-500">年代:</span> <span className="text-gray-800">{post.age_range}</span></div>
                  )}
                  {post.height && (
                       <div><span className="text-gray-500">身長:</span> <span className="text-gray-800">{post.height}</span></div>
                  )}
                  {post.dance_experience && (
                    <div><span className="text-gray-500">ダンス歴:</span> <span className="text-gray-800">{post.dance_experience}</span></div>
                  )}
                  {formatLevel(post.std_org, post.std_level) && (
                    <div><span className="text-gray-500">スタンダード級:</span> <span className="text-gray-800">{formatLevel(post.std_org, post.std_level)}</span></div>
                  )}
                  {formatLevel(post.latin_org, post.latin_level) && (
                    <div><span className="text-gray-500">ラテン級:</span> <span className="text-gray-800">{formatLevel(post.latin_org, post.latin_level)}</span></div>
                  )}
                  {post.practice_frequency && (
                    <div><span className="text-gray-500">練習頻度:</span> <span className="text-gray-800">{post.practice_frequency}</span></div>
                  )}
                  {post.practice_location && (
                    <div><span className="text-gray-500">練習場所:</span> <span className="text-gray-800">{post.practice_location}</span></div>
                  )}
                  {post.smoking && (
                    <div><span className="text-gray-500">煙草:</span> <span className="text-gray-800">{post.smoking}</span></div>
                  )}
                  {post.marital_status && (
                    <div><span className="text-gray-500">独身/既婚:</span> <span className="text-gray-800">{post.marital_status}</span></div>
                  )}
                </div>

                <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

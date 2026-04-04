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

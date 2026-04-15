// POST /api/admin/login - verify email/password and set signed session cookie
import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCredentials,
  createSessionToken,
  ADMIN_COOKIE_NAME,
  cookieOptions,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください' },
        { status: 400 }
      );
    }

    if (!verifyCredentials(email, password)) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが違います' },
        { status: 401 }
      );
    }

    const token = createSessionToken(email);
    const response = NextResponse.json({ success: true, email });
    response.cookies.set(ADMIN_COOKIE_NAME, token, cookieOptions());
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

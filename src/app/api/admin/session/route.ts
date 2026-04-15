// GET /api/admin/session - check current admin session status
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, email: session.email });
}

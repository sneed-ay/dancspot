// Admin authentication helpers (email/password + signed session cookie)
// Credentials are read from environment variables:
//   ADMIN_EMAIL
//   ADMIN_PASSWORD
//   ADMIN_SESSION_SECRET  (min 32 random chars; used to sign session tokens)
//
// Sessions are stateless signed tokens stored in an HttpOnly cookie.
// Format: <base64url(payload)>.<hex(hmac-sha256)>

import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getConfig() {
  return {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
    secret: process.env.ADMIN_SESSION_SECRET || '',
  };
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function verifyCredentials(email: string, password: string): boolean {
  const cfg = getConfig();
  if (!cfg.email || !cfg.password || !cfg.secret) return false;
  return constantTimeEquals(email, cfg.email) && constantTimeEquals(password, cfg.password);
}

export function createSessionToken(email: string): string {
  const { secret } = getConfig();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_DURATION_MS });
  const encoded = Buffer.from(payload).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('hex');
  return encoded + '.' + signature;
}

export function verifySessionToken(token: string | undefined | null): { email: string } | null {
  if (!token) return null;
  const { secret } = getConfig();
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  const expected = createHmac('sha256', secret).update(encoded).digest('hex');
  if (!constantTimeEquals(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    if (typeof payload.email !== 'string') return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  };
}

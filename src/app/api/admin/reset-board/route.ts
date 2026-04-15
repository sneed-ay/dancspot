// Admin API: reset bulletin board data
// Usage: POST /api/admin/reset-board
// Requires a valid admin session cookie (set via POST /api/admin/login).
// Deletes all messages, conversations, applications, and partner_posts.

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const results: Record<string, number | string> = {};

    const deletions = [
      ['messages', 'sender_line_user_id'],
      ['conversations', 'thread_id'],
      ['applications', 'thread_id'],
      ['partner_posts', 'id'],
    ] as const;

    for (const [table, notNullCol] of deletions) {
      const { error, count } = await supabase
        .from(table)
        .delete({ count: 'exact' })
        .not(notNullCol, 'is', null);
      if (error) {
        console.error('Error deleting ' + table + ':', error);
        results[table] = 'error: ' + error.message;
      } else {
        results[table] = count ?? 0;
      }
    }

    return NextResponse.json({ success: true, deleted: results });
  } catch (error) {
    console.error('Admin reset-board error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

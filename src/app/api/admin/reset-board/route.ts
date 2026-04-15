// Admin API: reset bulletin board data
// Usage: POST /api/admin/reset-board with JSON body { lineUserId }
// Requires the caller's LINE user ID to be on the admin whitelist.
// Deletes all messages, conversations, applications, and partner_posts.

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const lineUserId: string | undefined = body.lineUserId;

    if (!isAdmin(lineUserId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceSupabase();

    // Delete in dependency order (child tables first)
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

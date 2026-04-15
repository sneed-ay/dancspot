// Admin API for listing and deleting bulletin board posts.
// - GET  /api/admin/posts  -> list all partner_posts and board_threads with LINE info
// - DELETE /api/admin/posts -> delete a specific post (cascades related data)
//   body: { type: 'partner' | 'thread', id: string }
// Both require a valid admin session cookie.

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  // Fetch partner posts
  const { data: partnerData, error: partnerErr } = await supabase
    .from('partner_posts')
    .select(
      'id, nickname, content, dance_type, area, role, created_at, line_user_id, line_display_name, line_picture_url'
    )
    .order('created_at', { ascending: false });

  if (partnerErr) {
    console.error('Error fetching partner posts:', partnerErr);
    return NextResponse.json({ error: 'Failed to fetch partner posts' }, { status: 500 });
  }

  // Fetch board threads (雑談 etc.)
  const { data: threadData, error: threadErr } = await supabase
    .from('board_threads')
    .select(
      'id, nickname, content, dance_type, created_at, line_user_id, line_display_name, line_picture_url, board_replies(count)'
    )
    .order('created_at', { ascending: false });

  if (threadErr) {
    console.error('Error fetching board threads:', threadErr);
    return NextResponse.json({ error: 'Failed to fetch board threads' }, { status: 500 });
  }

  type ThreadRow = {
    id: string;
    nickname: string | null;
    content: string | null;
    dance_type: string | null;
    created_at: string;
    line_user_id: string | null;
    line_display_name: string | null;
    line_picture_url: string | null;
    board_replies?: Array<{ count: number }>;
  };

  const generalThreads = (threadData as ThreadRow[] | null || []).map((t) => ({
    id: t.id,
    title: t.nickname || '',
    content: t.content || '',
    category: t.dance_type || '',
    createdAt: t.created_at,
    lineUserId: t.line_user_id || '',
    lineDisplayName: t.line_display_name || '',
    linePictureUrl: t.line_picture_url || null,
    replyCount: t.board_replies && t.board_replies.length > 0 ? t.board_replies[0].count : 0,
  }));

  const partnerPosts = (partnerData || []).map((p) => ({
    id: p.id,
    nickname: p.nickname || '',
    content: p.content || '',
    danceType: p.dance_type || '',
    area: p.area || '',
    role: p.role || '',
    createdAt: p.created_at,
    lineUserId: p.line_user_id || '',
    lineDisplayName: p.line_display_name || '',
    linePictureUrl: p.line_picture_url || null,
  }));

  return NextResponse.json({ partnerPosts, generalThreads });
}

export async function DELETE(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { type?: string; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type, id } = body;
  if (!id || (type !== 'partner' && type !== 'thread')) {
    return NextResponse.json(
      { error: "type must be 'partner' or 'thread' and id is required" },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();
  const deleted: Record<string, number | string> = {};

  if (type === 'partner') {
    // Find related conversation IDs for message cleanup
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .eq('thread_id', id);
    const convIds = (convs || []).map((c) => c.id);

    if (convIds.length > 0) {
      const { count: msgCount, error: msgErr } = await supabase
        .from('messages')
        .delete({ count: 'exact' })
        .in('conversation_id', convIds);
      deleted.messages = msgErr ? 'error: ' + msgErr.message : msgCount ?? 0;
    } else {
      deleted.messages = 0;
    }

    const { count: convCount, error: convErr } = await supabase
      .from('conversations')
      .delete({ count: 'exact' })
      .eq('thread_id', id);
    deleted.conversations = convErr ? 'error: ' + convErr.message : convCount ?? 0;

    const { count: appCount, error: appErr } = await supabase
      .from('applications')
      .delete({ count: 'exact' })
      .eq('thread_id', id);
    deleted.applications = appErr ? 'error: ' + appErr.message : appCount ?? 0;

    const { count: postCount, error: postErr } = await supabase
      .from('partner_posts')
      .delete({ count: 'exact' })
      .eq('id', id);
    deleted.partner_posts = postErr ? 'error: ' + postErr.message : postCount ?? 0;

    if (postErr || appErr || convErr) {
      return NextResponse.json({ success: false, deleted }, { status: 500 });
    }
    return NextResponse.json({ success: true, deleted });
  }

  // type === 'thread'
  const { count: replyCount, error: replyErr } = await supabase
    .from('board_replies')
    .delete({ count: 'exact' })
    .eq('thread_id', id);
  deleted.board_replies = replyErr ? 'error: ' + replyErr.message : replyCount ?? 0;

  const { count: threadCount, error: threadErr } = await supabase
    .from('board_threads')
    .delete({ count: 'exact' })
    .eq('id', id);
  deleted.board_threads = threadErr ? 'error: ' + threadErr.message : threadCount ?? 0;

  if (threadErr) {
    return NextResponse.json({ success: false, deleted }, { status: 500 });
  }
  return NextResponse.json({ success: true, deleted });
}

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// GET: Get conversations for a user (inbox)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lineUserId = searchParams.get('lineUserId');

    if (!lineUserId) {
      return NextResponse.json({ error: 'lineUserId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Get all conversations where user is poster or applicant
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        thread_id,
        poster_line_user_id,
        applicant_line_user_id,
        created_at,
        applications (
          id,
          nickname,
          dance_type,
          message,
          status,
          created_at
        ),
        partner_posts (
          nickname,
          dance_type,
          line_user_id
        )
      `)
      .or(`poster_line_user_id.eq.${lineUserId},applicant_line_user_id.eq.${lineUserId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Get latest message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      (data || []).map(async (conv) => {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at, sender_line_user_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);

        const isPoster = conv.poster_line_user_id === lineUserId;

        return {
          id: conv.id,
          threadId: conv.thread_id,
          isPoster,
          partnerLabel: isPoster ? 'お相手' : '募集者',
          threadTitle: conv.partner_posts?.nickname || '',
          threadDanceType: conv.partner_posts?.dance_type || '',
          applicationNickname: conv.applications?.nickname || '',
          applicationStatus: conv.applications?.status || 'pending',
          lastMessage: lastMsg?.content || '',
          lastMessageAt: lastMsg?.created_at || conv.created_at,
          messageCount: count || 0,
          createdAt: conv.created_at,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithLastMessage });
  } catch (error) {
    console.error('Conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

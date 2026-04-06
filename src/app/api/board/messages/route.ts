import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// GET: Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const lineUserId = searchParams.get('lineUserId');

    if (!conversationId || !lineUserId) {
      return NextResponse.json({ error: 'conversationId and lineUserId are required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Verify user is part of this conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, poster_line_user_id, applicant_line_user_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conv.poster_line_user_id !== lineUserId && conv.applicant_line_user_id !== lineUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    const isPoster = conv.poster_line_user_id === lineUserId;

    return NextResponse.json({
      messages: (messages || []).map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.created_at,
        isMe: m.sender_line_user_id === lineUserId,
        senderLabel: m.sender_line_user_id === conv.poster_line_user_id ? '募集者' : 'お相手',
      })),
      isPoster,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderLineUserId, content } = body;

    if (!conversationId || !senderLineUserId || !content) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Verify sender is part of conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, poster_line_user_id, applicant_line_user_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conv.poster_line_user_id !== senderLineUserId && conv.applicant_line_user_id !== senderLineUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_line_user_id: senderLineUserId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Send LINE notification to the other person
    try {
      const recipientId = senderLineUserId === conv.poster_line_user_id
        ? conv.applicant_line_user_id
        : conv.poster_line_user_id;
      const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (channelAccessToken && recipientId) {
        await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + channelAccessToken,
          },
          body: JSON.stringify({
            to: recipientId,
            messages: [{
              type: 'text',
              text: '新しいメッセージが届きました。\nhttps://www.dancspot.com/board/inbox',
            }],
          }),
        });
      }
    } catch (lineError) {
      console.error('LINE notification error:', lineError);
    }

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.created_at,
        isMe: true,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

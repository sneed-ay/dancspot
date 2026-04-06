import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// POST /api/board/applications - Submit an application to a partner post
export async function POST(request: NextRequest) {
  try {
    const {
      threadId,
      applicantLineUserId,
      applicantDisplayName,
      applicantPictureUrl,
      nickname,
      danceType,
      area,
      role,
      level,
      ageRange,
      message,
    } = await request.json();

    if (!threadId || !applicantLineUserId || !nickname || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get the post to find the poster's LINE user ID
    const { data: post, error: postError } = await supabase
      .from('partner_posts')
      .select('id, user_id, users!inner(line_user_id, display_name)')
      .eq('id', threadId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const posterLineUserId = (post.users as unknown as { line_user_id: string }).line_user_id;

    // Prevent self-application
    if (posterLineUserId === applicantLineUserId) {
      return NextResponse.json({ error: '自分の投稿には応募できません' }, { status: 400 });
    }

    // Check for duplicate application
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('thread_id', threadId)
      .eq('applicant_line_user_id', applicantLineUserId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'すでにこの投稿に応募済みです' }, { status: 409 });
    }

    // Create the application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        thread_id: threadId,
        applicant_line_user_id: applicantLineUserId,
        applicant_display_name: applicantDisplayName,
        applicant_picture_url: applicantPictureUrl,
        nickname,
        dance_type: danceType,
        area,
        role,
        level,
        age_range: ageRange,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (appError) {
      console.error('Error creating application:', appError);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    // Create a conversation between poster and applicant    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        application_id: application.id,
        thread_id: threadId,
        poster_line_user_id: posterLineUserId,
        applicant_line_user_id: applicantLineUserId,
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    // Send the initial message in the conversation
    const roleLabel = role === 'leader' ? 'リーダー' : role === 'follower' ? 'パートナー' : 'どちらでも';
    const levelLabel = level === 'beginner' ? '初心者' : level === 'intermediate' ? '中級者' : level === 'advanced' ? '上級者' : 'プロ';
    const introMessage = `【応募】${nickname}さんからの応募です\n\n種目: ${danceType || '未設定'}\n地域: ${area || '未設定'}\n役割: ${roleLabel}\nレベル: ${levelLabel}\n年代: ${ageRange || '未設定'}\n\nメッセージ:\n${message}`;

    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_line_user_id: applicantLineUserId,
        content: introMessage,
      });

    // Send LINE push notification to the poster
    try {
      const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
      if (channelAccessToken) {
        await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${channelAccessToken}`,
          },
          body: JSON.stringify({
            to: posterLineUserId,
            messages: [
              {
                type: 'text',
                text: `お相手募集に新しい応募がありました！\n\n${nickname}さんからの応募です。\nサイトで確認してください。\n\nhttps://www.dancspot.com/board/inbox`,
              },
            ],
          }),
        });
      }
    } catch (pushErr) {
      console.error('LINE push notification error:', pushErr);
      // Don't fail the request if push notification fails
    }

    return NextResponse.json({ application, conversation }, { status: 201 });
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/board/applications - Fetch applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');    const lineUserId = searchParams.get('lineUserId');

    const supabase = getServiceSupabase();

    if (threadId) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
      }
      return NextResponse.json({ applications: data });
    }

    if (lineUserId) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('applicant_line_user_id', lineUserId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
      }
      return NextResponse.json({ applications: data });
    }

    return NextResponse.json({ error: 'threadId or lineUserId required' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

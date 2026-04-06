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
      return NextResponse.json({ error: '\u81EA\u5206\u306E\u6295\u7A3F\u306B\u306F\u5FDC\u52DF\u3067\u304D\u307E\u305B\u3093' }, { status: 400 });
    }

    // Check for duplicate application
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('thread_id', threadId)
      .eq('applicant_line_user_id', applicantLineUserId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '\u3059\u3067\u306B\u3053\u306E\u6295\u7A3F\u306B\u5FDC\u52DF\u6E08\u307F\u3067\u3059' }, { status: 409 });
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

    // Create a conversation between poster and applicant
    const { data: conversation, error: convError } = await supabase
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
    const roleLabel = role === 'leader' ? '\u30EA\u30FC\u30C0\u30FC' : role === 'follower' ? '\u30D1\u30FC\u30C8\u30CA\u30FC' : '\u3069\u3061\u3089\u3067\u3082';
    const levelLabel = level === 'beginner' ? '\u521D\u5FC3\u8005' : level === 'intermediate' ? '\u4E2D\u7D1A\u8005' : level === 'advanced' ? '\u4E0A\u7D1A\u8005' : '\u30D7\u30ED';
    const introMessage = `[\u5FDC\u52DF]${nickname}\u3055\u3093\u304B\u3089\u306E\u5FDC\u52DF\u3067\u3059\n\n\u7A2E\u76EE: ${danceType || '\u672A\u8A2D\u5B9A'}\n\u5730\u57DF: ${area || '\u672A\u8A2D\u5B9A'}\n\u5F79\u5272: ${roleLabel}\n\u30EC\u30D9\u30EB: ${levelLabel}\n\u5E74\u4EE3: ${ageRange || '\u672A\u8A2D\u5B9A'}\n\n\u30E1\u30C3\u30BB\u30FC\u30B8:\n${message}`;

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
                text: `\u304A\u76F8\u624B\u52DF\u96C6\u306B\u65B0\u3057\u3044\u5FDC\u52DF\u304C\u3042\u308A\u307E\u3057\u305F\uFF01\n\n${nickname}\u3055\u3093\u304B\u3089\u306E\u5FDC\u52DF\u3067\u3059\u3002\n\u30B5\u30A4\u30C8\u3067\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\nhttps://www.dancspot.com/board/inbox`,
              },
            ],
          }),
        });
      }
    } catch (pushErr) {
      console.error('LINE push notification error:', pushErr);
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
    const threadId = searchParams.get('threadId');
    const lineUserId = searchParams.get('lineUserId');

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

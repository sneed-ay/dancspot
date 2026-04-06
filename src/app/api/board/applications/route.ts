import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// POST: Submit an application to a partner thread
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      threadId, applicantLineUserId, applicantLineDisplayName, applicantLinePictureUrl,
      nickname, content, danceType, area, role, ageRange, height, proAm,
      danceExperience, direction, practiceFrequency, practiceLocation,
      smoking, maritalStatus, stdOrg, stdLevel, latinOrg, latinLevel, message,
    } = body;

    if (!threadId || !applicantLineUserId) {
      return NextResponse.json({ error: 'threadId and applicantLineUserId are required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Get the thread to find the poster
    const { data: thread, error: threadError } = await supabase
      .from('board_threads')
      .select('id, line_user_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Don't allow self-application
    if (thread.line_user_id === applicantLineUserId) {
      return NextResponse.json({ error: 'Cannot apply to your own post' }, { status: 400 });
    }

    // Check for duplicate application
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('thread_id', threadId)
      .eq('applicant_line_user_id', applicantLineUserId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 409 });
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        thread_id: threadId,
        applicant_line_user_id: applicantLineUserId,
        applicant_line_display_name: applicantLineDisplayName || '',
        applicant_line_picture_url: applicantLinePictureUrl || null,
        nickname: nickname || '',
        content: content || '',
        dance_type: danceType || '',
        area: area || '',
        role: role || '',
        age_range: ageRange || null,
        height: height || null,
        pro_am: proAm || null,
        dance_experience: danceExperience || null,
        direction: direction || null,
        practice_frequency: practiceFrequency || null,
        practice_location: practiceLocation || null,
        smoking: smoking || null,
        marital_status: maritalStatus || null,
        std_org: stdOrg || null,
        std_level: stdLevel || null,
        latin_org: latinOrg || null,
        latin_level: latinLevel || null,
        message: message || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        application_id: application.id,
        thread_id: threadId,
        poster_line_user_id: thread.line_user_id,
        applicant_line_user_id: applicantLineUserId,
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
    }

    // Send initial message if provided
    if (conversation && message) {
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_line_user_id: applicantLineUserId,
        content: message,
      });
    }

    // Send LINE push notification to poster
    try {
      const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
      if (channelAccessToken && thread.line_user_id) {
        await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + channelAccessToken,
          },
          body: JSON.stringify({
            to: thread.line_user_id,
            messages: [{
              type: 'text',
              text: 'お相手募集に応募がありました！\nダンスポットのメッセージを確認してください。\nhttps://www.dancspot.com/board/inbox',
            }],
          }),
        });
      }
    } catch (lineError) {
      console.error('LINE notification error:', lineError);
    }

    return NextResponse.json({
      application: { id: application.id },
      conversationId: conversation?.id || null,
    }, { status: 201 });
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get applications for a thread (poster only) or my applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const lineUserId = searchParams.get('lineUserId');

    if (!lineUserId) {
      return NextResponse.json({ error: 'lineUserId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    if (threadId) {
      // Get applications for a specific thread (poster view)
      const { data, error } = await supabase
        .from('applications')
        .select('*, conversations(id)')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
      }
      return NextResponse.json({ applications: data || [] });
    } else {
      // Get my applications
      const { data, error } = await supabase
        .from('applications')
        .select('*, conversations(id), board_threads(nickname, dance_type)')
        .eq('applicant_line_user_id', lineUserId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
      }
      return NextResponse.json({ applications: data || [] });
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

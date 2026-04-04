import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('board_threads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching threads:', error);
      return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
    }
    return NextResponse.json({ threads: data || [] });
  } catch (error) {
    console.error('Threads fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lineUserId, lineDisplayName, linePictureUrl, nickname, content, danceType, area, role, ageRange, height, proAm, danceExperience, direction, practiceFrequency, practiceLocation, smoking, maritalStatus, stdOrg, stdLevel, latinOrg, latinLevel } = body;
    if (!lineUserId || !nickname) {
      return NextResponse.json({ error: 'lineUserId and nickname are required' }, { status: 400 });
    }
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('board_threads')
      .insert({
        line_user_id: lineUserId,
        line_display_name: lineDisplayName || '',
        line_picture_url: linePictureUrl || null,
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
      })
      .select()
      .single();
    if (error) {
      console.error('Error creating thread:', error);
      return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
    }
    return NextResponse.json({ thread: data }, { status: 201 });
  } catch (error) {
    console.error('Thread creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { postId, lineUserId } = await request.json();
    if (!postId || !lineUserId) {
      return NextResponse.json({ error: 'postId and lineUserId are required' }, { status: 400 });
    }
    const supabase = getServiceSupabase();
    const { data: thread, error: fetchError } = await supabase
      .from('board_threads')
      .select('id, line_user_id')
      .eq('id', postId)
      .single();
    if (fetchError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }
    if (thread.line_user_id !== lineUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { error: deleteError } = await supabase
      .from('board_threads')
      .delete()
      .eq('id', postId);
    if (deleteError) {
      console.error('Error deleting thread:', deleteError);
      return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Thread deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

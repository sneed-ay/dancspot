export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

const MAX_REPLIES = 1000;

// GET /api/board/threads/[threadId]/replies
export async function GET(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const supabase = getServiceSupabase();
    const { data: replies, error } = await supabase
      .from("board_replies")
      .select("*")
      .eq("thread_id", params.threadId)
      .order("created_at", { ascending: true })
      .limit(MAX_REPLIES);

    if (error) {
      console.error("Error fetching replies:", error);
      return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
    }

    return NextResponse.json({ replies: replies || [] });
  } catch (error) {
    console.error("Replies fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/board/threads/[threadId]/replies
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const { threadId } = params;
    const body = await request.json();
    const { author, content, lineUserId, lineDisplayName, linePictureUrl } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Verify thread exists
    const { data: thread, error: threadError } = await supabase
      .from("board_threads")
      .select("id")
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Check reply count limit
    const { count, error: countError } = await supabase
      .from("board_replies")
      .select("id", { count: "exact", head: true })
      .eq("thread_id", threadId);

    if (countError) {
      console.error("Error counting replies:", countError);
      return NextResponse.json({ error: "Failed to check reply count" }, { status: 500 });
    }

    if ((count || 0) >= MAX_REPLIES) {
      return NextResponse.json(
        { error: "このスレッドは" + MAX_REPLIES + "件に達したため、これ以上書き込めません。" },
        { status: 403 }
      );
    }

    const { data: reply, error } = await supabase
      .from("board_replies")
      .insert({
        thread_id: threadId,
        author: lineDisplayName || author || "名無しさん",
        content: content.trim(),
        line_user_id: lineUserId || null,
        line_display_name: lineDisplayName || null,
        line_picture_url: linePictureUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating reply:", error);
      return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
    }

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

function toFrontend(row: Record<string, unknown>, replyCount?: number) {
  return {
    id: row.id,
    category: row.dance_type || "",
    title: row.nickname || "",
    author: row.line_display_name || "",
    content: row.content || "",
    createdAt: row.created_at,
    replies: replyCount ?? 0,
    lineUserId: row.line_user_id || "",
    lineDisplayName: row.line_display_name || "",
    linePictureUrl: row.line_picture_url || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const supabase = getServiceSupabase();

    let query = supabase
      .from("board_threads")
      .select("*, board_replies(count)")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("dance_type", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching threads:", error);
      return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }

    const threads = (data || []).map((row: any) => {
      const replyCount = row.board_replies && row.board_replies.length > 0
        ? row.board_replies[0].count : 0;
      return toFrontend(row, replyCount);
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error("Threads fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, title, author, content, lineUserId, lineDisplayName, linePictureUrl } = body;

    if (!content && !title) {
      return NextResponse.json({ error: "Title or content is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("board_threads")
      .insert({
        dance_type: category || "",
        nickname: (title || "").trim(),
        content: (content || "").trim(),
        line_user_id: lineUserId || null,
        line_display_name: lineDisplayName || author || "",
        line_picture_url: linePictureUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating thread:", error);
      return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
    }

    return NextResponse.json({ thread: toFrontend(data) }, { status: 201 });
  } catch (error) {
    console.error("Thread creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { postId, lineUserId } = await request.json();

    if (!postId || !lineUserId) {
      return NextResponse.json({ error: "postId and lineUserId are required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: thread, error: fetchError } = await supabase
      .from("board_threads")
      .select("id, line_user_id")
      .eq("id", postId)
      .single();

    if (fetchError || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (thread.line_user_id !== lineUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("board_threads")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      console.error("Error deleting thread:", deleteError);
      return NextResponse.json({ error: "Failed to delete thread" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Thread deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

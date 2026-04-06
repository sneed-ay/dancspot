import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const supabase = getServiceSupabase();

    // Fetch the thread
    const { data: thread, error } = await supabase
      .from("board_threads")
      .select("*")
      .eq("id", params.threadId)
      .single();

    if (error || !thread) {
      return NextResponse.json(
        { error: "スレッドが見つかりません" },
        { status: 404 }
      );
    }

    // Fetch replies for this thread
    const { data: replies } = await supabase
      .from("board_replies")
      .select("*")
      .eq("thread_id", params.threadId)
      .order("created_at", { ascending: true });

    // Transform to frontend format
    const result = {
      id: thread.id,
      category: thread.dance_type || "",
      title: thread.nickname || "",
      author: thread.line_display_name || "",
      content: thread.content || "",
      createdAt: thread.created_at,
      replies: (replies || []).length,
      lineUserId: thread.line_user_id || "",
      lineDisplayName: thread.line_display_name || "",
      linePictureUrl: thread.line_picture_url || null,
      replyList: (replies || []).map((r: Record<string, unknown>) => ({
        id: r.id,
        author: r.line_display_name || r.author || "",
        content: r.content || "",
        createdAt: r.created_at,
        lineUserId: r.line_user_id || "",
        lineDisplayName: r.line_display_name || "",
        linePictureUrl: r.line_picture_url || null,
      })),
    };

    return NextResponse.json({ thread: result });
  } catch (error) {
    console.error("Thread fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

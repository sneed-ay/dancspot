import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const supabase = getServiceSupabase();

    const { data: thread, error } = await supabase
      .from("board_threads")
      .select("*")
      .eq("id", params.threadId)
      .single();

    if (error || !thread) {
      return NextResponse.json({ error: "スレッドが見つかりません" }, { status: 404 });
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error("Thread fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

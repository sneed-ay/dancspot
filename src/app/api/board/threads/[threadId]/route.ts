import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Thread } from "../route";

const THREADS_FILE = path.join(process.cwd(), "data", "board", "threads.json");

function readThreads(): Thread[] {
  if (!fs.existsSync(THREADS_FILE)) return [];
  const data = JSON.parse(fs.readFileSync(THREADS_FILE, "utf-8"));
  return data.threads || [];
}

export async function GET(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  const threads = readThreads();
  const thread = threads.find((t) => t.id === params.threadId);

  if (!thread) {
    return NextResponse.json({ error: "スレッドが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(thread);
}

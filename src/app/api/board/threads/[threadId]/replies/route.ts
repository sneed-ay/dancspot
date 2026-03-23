import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Thread } from "../../route";

const DATA_DIR = path.join(process.cwd(), "data", "board");
const THREADS_FILE = path.join(DATA_DIR, "threads.json");

function readThreads(): Thread[] {
  if (!fs.existsSync(THREADS_FILE)) return [];
  const data = JSON.parse(fs.readFileSync(THREADS_FILE, "utf-8"));
  return data.threads || [];
}

function writeThreads(threads: Thread[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(THREADS_FILE, JSON.stringify({ threads }, null, 2));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const body = await request.json();
  const { author, content } = body;

  if (!content) {
    return NextResponse.json({ error: "本文は必須です" }, { status: 400 });
  }

  const threads = readThreads();
  const thread = threads.find((t) => t.id === params.threadId);

  if (!thread) {
    return NextResponse.json({ error: "スレッドが見つかりません" }, { status: 404 });
  }

  const newReply = {
    number: thread.replies.length + 1,
    author: author?.trim() || "名無しのダンサー",
    content,
    createdAt: new Date().toISOString(),
  };

  thread.replies.push(newReply);
  writeThreads(threads);

  return NextResponse.json(newReply, { status: 201 });
}

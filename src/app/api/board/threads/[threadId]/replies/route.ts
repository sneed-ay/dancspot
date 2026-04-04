import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const THREADS_FILE = path.join(DATA_DIR, "threads.json");

interface Reply {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
}

interface Thread {
  id: string;
  category: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  replies: number;
  replyList?: Reply[];
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
}

function readThreads(): Thread[] {
  if (!fs.existsSync(THREADS_FILE)) return [];
  const data = fs.readFileSync(THREADS_FILE, "utf-8");
  return JSON.parse(data);
}

function writeThreads(threads: Thread[]) {
  fs.writeFileSync(THREADS_FILE, JSON.stringify(threads, null, 2));
}

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
    const threads = readThreads();
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    const newReply: Reply = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
      author: lineDisplayName || author || "名無しさん",
      content: content.trim(),
      createdAt: new Date().toISOString(),
      lineUserId: lineUserId || undefined,
      lineDisplayName: lineDisplayName || undefined,
      linePictureUrl: linePictureUrl || undefined,
    };
    if (!thread.replyList) thread.replyList = [];
    thread.replyList.push(newReply);
    thread.replies = thread.replyList.length;
    writeThreads(threads);
    return NextResponse.json({ reply: newReply }, { status: 201 });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }
}

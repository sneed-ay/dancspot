import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const THREADS_FILE = path.join(DATA_DIR, "threads.json");

interface Thread {
  id: string;
  category: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  replies: number;
  replyList?: unknown[];
  lineUserId?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(THREADS_FILE)) {
    fs.writeFileSync(THREADS_FILE, JSON.stringify([], null, 2));
  }
}

function readThreads(): Thread[] {
  ensureDataDir();
  const data = fs.readFileSync(THREADS_FILE, "utf-8");
  return JSON.parse(data);
}

function writeThreads(threads: Thread[]) {
  ensureDataDir();
  fs.writeFileSync(THREADS_FILE, JSON.stringify(threads, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const threads = readThreads();
    const filtered = category
      ? threads.filter((t) => t.category === category)
      : threads;
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ threads: filtered });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, title, author, content, lineUserId, lineDisplayName, linePictureUrl } = body;
    if (!category || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const threads = readThreads();
    const newThread: Thread = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
      category,
      title: title.trim(),
      author: lineDisplayName || author || "名無しさん",
      content: content.trim(),
      createdAt: new Date().toISOString(),
      replies: 0,
      lineUserId: lineUserId || undefined,
      lineDisplayName: lineDisplayName || undefined,
      linePictureUrl: linePictureUrl || undefined,
    };
    threads.push(newThread);
    writeThreads(threads);
    return NextResponse.json({ thread: newThread }, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
  }
}

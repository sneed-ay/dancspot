import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "board");
const THREADS_FILE = path.join(DATA_DIR, "threads.json");

export interface Reply {
  number: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  category: string;
  title: string;
  author: string;
  createdAt: string;
  replies: Reply[];
}

function readThreads(): Thread[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(THREADS_FILE)) {
    fs.writeFileSync(THREADS_FILE, JSON.stringify({ threads: [] }));
    return [];
  }
  const data = JSON.parse(fs.readFileSync(THREADS_FILE, "utf-8"));
  return data.threads || [];
}

function writeThreads(threads: Thread[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(THREADS_FILE, JSON.stringify({ threads }, null, 2));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let threads = readThreads();

  if (category && category !== "all") {
    threads = threads.filter((t) => t.category === category);
  }

  // Sort by newest first (by latest reply or creation date)
  threads.sort((a, b) => {
    const aLast = a.replies.length > 0 ? a.replies[a.replies.length - 1].createdAt : a.createdAt;
    const bLast = b.replies.length > 0 ? b.replies[b.replies.length - 1].createdAt : b.createdAt;
    return new Date(bLast).getTime() - new Date(aLast).getTime();
  });

  return NextResponse.json(threads);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { category, title, author, content } = body;

  if (!category || !title || !content) {
    return NextResponse.json({ error: "カテゴリ、タイトル、本文は必須です" }, { status: 400 });
  }

  const threads = readThreads();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const newThread: Thread = {
    id,
    category,
    title,
    author: author?.trim() || "名無しのダンサー",
    createdAt: now,
    replies: [
      {
        number: 1,
        author: author?.trim() || "名無しのダンサー",
        content,
        createdAt: now,
      },
    ],
  };

  threads.push(newThread);
  writeThreads(threads);

  return NextResponse.json(newThread, { status: 201 });
}

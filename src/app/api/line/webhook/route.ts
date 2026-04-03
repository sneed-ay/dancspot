import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// LINE Webhook endpoint - receives events from LINE platform
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");
  
  // Verify webhook signature
  const channelSecret = process.env.LINE_CHANNEL_SECRET || "";
  const hash = crypto
    .createHmac("SHA256", channelSecret)
    .update(body)
    .digest("base64");
  
  if (signature !== hash) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const events = JSON.parse(body).events;
  
  for (const event of events) {
    // Handle follow event - when user adds the bot as friend
    if (event.type === "follow") {
      const userId = event.source.userId;
      console.log("New follower:", userId);
      // TODO: Store userId for future push notifications
    }
  }
  
  return NextResponse.json({ status: "ok" });
}

// LINE platform sends GET for webhook URL verification
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

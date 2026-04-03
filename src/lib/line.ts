// LINE Messaging API utility functions

const LINE_API_BASE = "https://api.line.me/v2/bot";

export async function sendPushMessage(userId: string, message: string) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  }
  const response = await fetch(LINE_API_BASE + "/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text: message }],
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    console.error("LINE push message failed:", error);
    throw new Error("Failed to send LINE message");
  }
  return response.json();
}

export async function notifyPartnerBoardMessage(
  recipientLineUserId: string,
  senderName: string,
  messagePreview: string
) {
  const text = "\u3010\u30c0\u30f3\u30b9\u30dd\u30c3\u30c8\u3011\n\n\u304a\u76f8\u624b\u52df\u96c6\u306b\u30e1\u30c3\u30bb\u30fc\u30b8\u304c\u5c4a\u304d\u307e\u3057\u305f\uff01\n\n\u5dee\u51fa\u4eba: " + senderName + "\n\u5185\u5bb9: " + messagePreview.substring(0, 100) + "\n\n\u2192 https://www.dancspot.com/board/partner";
  return sendPushMessage(recipientLineUserId, text);
}

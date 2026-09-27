export async function generateSmartReply(apiKey, persona, incomingText) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: `تو ${persona} هستی که در دایرکت/کامنت اینستاگرام جواب میدی. کوتاه، دوستانه و مفید جواب بده. حداکثر ۲-۳ جمله.`,
      messages: [{ role: "user", content: incomingText }],
    }),
  });
  const data = await res.json();
  const textBlock = data?.content?.find((c) => c.type === "text");
  return textBlock?.text?.trim() || "ممنون از پیامت! به‌زودی پاسخ کامل‌تری میدیم.";
}

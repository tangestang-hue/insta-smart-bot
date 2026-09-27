// ارسال پاسخ به دایرکت (Direct Message)
export async function replyToDM(igBusinessId, accessToken, recipientId, text) {
  const url = `https://graph.instagram.com/v21.0/${igBusinessId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      access_token: accessToken,
    }),
  });
  return res.json();
}

// ارسال پاسخ به کامنت (ریپلای زیر کامنت)
export async function replyToComment(commentId, accessToken, text) {
  const url = `https://graph.instagram.com/v21.0/${commentId}/replies`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, access_token: accessToken }),
  });
  return res.json();
}

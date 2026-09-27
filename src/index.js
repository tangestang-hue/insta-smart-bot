import { replyToDM, replyToComment } from "./instagram.js";
import { generateSmartReply } from "./ai.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ۱) تایید وب‌هوک متا (یک‌بار موقع ثبت آدرس در Meta App)
    if (request.method === "GET" && url.pathname === "/webhook") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      if (mode === "subscribe" && token === env.META_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response("Forbidden", { status: 403 });
    }

    // ۲) دریافت رویدادهای واقعی (پیام دایرکت یا کامنت جدید)
    if (request.method === "POST" && url.pathname === "/webhook") {
      const body = await request.json();
      await handleWebhookEvent(body, env);
      return new Response("EVENT_RECEIVED", { status: 200 });
    }

    // ۳) API ساده برای مدیریت تنظیمات هر کاربر (داشبورد بعدا از اینجا استفاده می‌کنه)
    if (url.pathname === "/api/account" && request.method === "POST") {
      return handleCreateAccount(request, env);
    }

    return new Response("Insta Smart Bot is running.", { status: 200 });
  },
};

async function handleWebhookEvent(body, env) {
  for (const entry of body.entry || []) {
    const igBusinessId = entry.id;

    // پیدا کردن کاربر مربوط به این اکانت اینستاگرام در دیتابیس
    const account = await env.DB.prepare(
      "SELECT * FROM accounts WHERE ig_business_id = ?"
    )
      .bind(igBusinessId)
      .first();
    if (!account) continue; // این اکانت هنوز ثبت نشده

    const accessToken = await env.TOKENS_KV.get(account.page_access_token_ref);
    if (!accessToken) continue;

    // --- پیام‌های دایرکت ---
    for (const messaging of entry.messaging || []) {
      if (!account.auto_reply_dm) continue;
      const senderId = messaging.sender?.id;
      const text = messaging.message?.text;
      if (!senderId || !text) continue;

      const reply = await generateSmartReply(env.ANTHROPIC_API_KEY, account.ai_persona, text);
      await replyToDM(igBusinessId, accessToken, senderId, reply);
      await logInteraction(env, account.id, "dm", senderId, text, reply);
    }

    // --- کامنت‌های جدید ---
    for (const change of entry.changes || []) {
      if (change.field !== "comments") continue;
      if (!account.auto_reply_comment) continue;
      const commentId = change.value?.id;
      const text = change.value?.text;
      if (!commentId || !text) continue;

      const reply = await generateSmartReply(env.ANTHROPIC_API_KEY, account.ai_persona, text);
      await replyToComment(commentId, accessToken, reply);
      await logInteraction(env, account.id, "comment", commentId, text, reply);
    }
  }
}

async function logInteraction(env, accountId, source, senderId, incomingText, replyText) {
  try {
    await env.DB.prepare(
      `INSERT INTO logs (account_id, source, sender_id, incoming_text, reply_text)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(accountId, source, senderId, incomingText, replyText)
      .run();
  } catch (e) {
    // اگه لاگ خطا داد، جلوی پاسخ‌دهی رو نگیر
    console.error("log error", e);
  }
}

// ثبت اکانت جدید یک کاربر (وقتی کسی ربات رو نصب می‌کنه)
async function handleCreateAccount(request, env) {
  const { ig_business_id, owner_email, access_token, ai_persona } = await request.json();
  if (!ig_business_id || !access_token) {
    return new Response(JSON.stringify({ error: "ig_business_id و access_token لازمه" }), {
      status: 400,
    });
  }
  const tokenRef = `token_${ig_business_id}`;
  await env.TOKENS_KV.put(tokenRef, access_token);
  await env.DB.prepare(
    `INSERT INTO accounts (ig_business_id, owner_email, page_access_token_ref, ai_persona)
     VALUES (?, ?, ?, ?)`
  )
    .bind(ig_business_id, owner_email || null, tokenRef, ai_persona || "یک دستیار فروش دوستانه و مختصر")
    .run();
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

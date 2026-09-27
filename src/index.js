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

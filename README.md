# ربات هوشمند اینستاگرام (چندکاربره)

## 🚀 روش پیشنهادی: دیپلوی با یک کلیک

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=REPLACE_WITH_YOUR_GITHUB_REPO_URL)

با کلیک روی این دکمه، Cloudflare خودش:
- این پروژه رو توی اکانت گیت‌هاب خودت کپی (فورک) می‌کنه
- دیتابیس D1 و فضای KV رو خودش می‌سازه و وصل می‌کنه (نیازی به کپی کردن ID نیست)
- ورکر رو دیپلوی می‌کنه

**مراحل:**
1. پروژه رو (همین فایل‌ها) توی یه ریپوی GitHub آپلود کن (Public باشه)
2. آدرس ریپو رو کپی کن (مثلاً `https://github.com/username/insta-smart-bot`)
3. توی همین فایل README، بخش `REPLACE_WITH_YOUR_GITHUB_REPO_URL` بالا رو با آدرس ریپوت عوض کن و Commit کن
4. حالا روی همون دکمه‌ی آبی بالا کلیک کن
5. یه صفحه تنظیمات بهت نشون می‌ده (اسم پروژه، اسم منابع) → معمولاً پیش‌فرض‌ها خوبن → Deploy بزن
6. بعد از دیپلوی، برو به تنظیمات Worker توی داشبورد Cloudflare → **Settings → Variables and Secrets** → این سه‌تا رو اضافه کن (نوع: Secret):
   - `META_VERIFY_TOKEN` (یه رشته دلخواه مثل `mysecret12345`)
   - `META_APP_SECRET` (از تنظیمات اپ متا)
   - `ANTHROPIC_API_KEY` (از console.anthropic.com)
7. یه بار دیگه Deploy بزن تا secretها اعمال بشن
8. آدرس Worker رو (بالای صفحه، شبیه `https://insta-smart-bot.xxx.workers.dev`) برای تنظیم Webhook در متا استفاده کن (بخش «ثبت در متا» پایین‌تر)

اگه این روش جواب نداد یا گیر کردی، برو سراغ روش دستی زیر 👇

## مراحل راه‌اندازی (روش دستی - جایگزین)

1. **ساخت اکانت Cloudflare** (رایگان): cloudflare.com
2. نصب ابزار خط فرمان:
   ```
   npm install -g wrangler
   wrangler login
   ```
3. ساخت دیتابیس و KV:
   ```
   wrangler d1 create insta_bot_db
   wrangler kv:namespace create TOKENS_KV
   ```
   خروجی هرکدوم رو (id) توی `wrangler.toml` جایگزین کن.

4. اجرای اسکیما:
   ```
   wrangler d1 execute insta_bot_db --file=schema.sql
   ```

5. ثبت secretها:
   ```
   wrangler secret put META_VERIFY_TOKEN
   wrangler secret put META_APP_SECRET
   wrangler secret put ANTHROPIC_API_KEY
   ```

6. دیپلوی:
   ```
   wrangler deploy
   ```

## ثبت در متا (Meta Developer)
- یک اپ در developers.facebook.com بساز، محصول "Instagram" و "Webhooks" رو اضافه کن
- Callback URL وب‌هوک: `https://<your-worker>.workers.dev/webhook`
- Verify Token: همون چیزی که در مرحله ۵ ست کردی
- اکانت اینستاگرام باید **Business/Creator** باشه و به یک صفحه فیسبوک وصل باشه

## اضافه کردن کاربر جدید (چندکاربره)
هر کسی که می‌خواد ربات رو نصب کنه، بعد از گرفتن Access Token خودش از متا،
این ریکوئست رو می‌فرسته:
```
POST /api/account
{
  "ig_business_id": "...",
  "access_token": "...",
  "owner_email": "user@example.com",
  "ai_persona": "توضیح شخصیت ربات برای این کاربر"
}
```

## قدم بعدی پیشنهادی
یک صفحه/داشبورد ساده (React یا HTML) بساز که کاربر بتونه با چند کلیک
اکانتش رو وصل کنه (به‌جای فرستادن دستی JSON). اگه بخوای همین الان اون رو هم می‌سازم.

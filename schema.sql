-- هر ردیف = یک کاربر (اکانت اینستاگرام بیزنسی) که ربات رو نصب کرده
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ig_business_id TEXT UNIQUE NOT NULL,   -- Instagram Business Account ID
  owner_email TEXT,
  page_access_token_ref TEXT,            -- کلید مرجع به KV (خود توکن اینجا ذخیره نمیشه)
  ai_persona TEXT DEFAULT 'یک دستیار فروش دوستانه و مختصر',
  auto_reply_dm INTEGER DEFAULT 1,       -- 1 = فعال
  auto_reply_comment INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- قوانین سفارشی هر کاربر (کلمه کلیدی -> پاسخ ثابت یا حالت AI)
CREATE TABLE IF NOT EXISTS rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  trigger_keyword TEXT,        -- خالی = همه پیام‌ها
  reply_mode TEXT DEFAULT 'ai', -- 'ai' یا 'fixed'
  fixed_reply TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- لاگ پیام/کامنت‌ها برای جلوگیری از پاسخ تکراری و آنالیز
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  source TEXT,          -- 'dm' یا 'comment'
  sender_id TEXT,
  message_id TEXT UNIQUE,
  incoming_text TEXT,
  reply_text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

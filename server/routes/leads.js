const rateLimit = require("express-rate-limit");
const { run, get, all } = require("../db");

// ─── Заявки на пробное занятие + отзывы учеников ─────────────────────────────

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  if (!req.session.user.is_admin) return res.status(403).json({ error: "Нет прав" });
  next();
}

// Мягкий лимит: за двумя прокси у многих посетителей может оказаться один IP
const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: "Слишком много заявок. Попробуйте позже или напишите во ВКонтакте." },
  standardHeaders: true,
  legacyHeaders: false,
});

const clean = (v, max = 300) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Уведомление в Telegram, если заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env
async function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const text = [
    "🌱 Новая заявка на пробное занятие",
    `Имя: ${lead.name}`,
    lead.grade && `Класс: ${lead.grade}`,
    lead.goal && `Цель: ${lead.goal}`,
    `Связь: ${lead.contact}`,
    lead.comment && `Комментарий: ${lead.comment}`,
  ].filter(Boolean).join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error("Telegram notify failed:", e.message);
  }
}

const publicRouter = require("express").Router();
const adminRouter = require("express").Router();

publicRouter.post("/leads", leadLimiter, (req, res) => {
  const { website, started_at } = req.body || {};
  // ловушки для ботов: скрытое поле и слишком быстрое заполнение — молча «принимаем»
  if (website || (Number(started_at) && Date.now() - Number(started_at) < 2500)) return res.json({ ok: true });

  const lead = {
    name: clean(req.body.name, 80),
    grade: clean(req.body.grade, 40),
    goal: clean(req.body.goal, 80),
    contact: clean(req.body.contact, 120),
    comment: clean(req.body.comment, 1000),
  };
  if (!lead.name) return res.status(400).json({ error: "Напиши, как тебя зовут" });
  if (!lead.contact) return res.status(400).json({ error: "Оставь телефон, Telegram или ВКонтакте для связи" });
  if (!req.body.consent) return res.status(400).json({ error: "Нужно согласие на обработку персональных данных" });

  run("INSERT INTO leads (name, grade, goal, contact, comment) VALUES (?, ?, ?, ?, ?)",
    lead.name, lead.grade || null, lead.goal || null, lead.contact, lead.comment || null);
  notifyTelegram(lead);
  res.json({ ok: true });
});

adminRouter.get("/leads", requireAdmin, (req, res) => {
  res.json(all("SELECT * FROM leads ORDER BY created_at DESC, id DESC"));
});

adminRouter.patch("/leads/:id", requireAdmin, (req, res) => {
  const status = req.body.status === "done" ? "done" : "new";
  run("UPDATE leads SET status = ? WHERE id = ?", status, req.params.id);
  res.json({ ok: true });
});

adminRouter.delete("/leads/:id", requireAdmin, (req, res) => {
  run("DELETE FROM leads WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

// ── Отзывы ──
publicRouter.get("/reviews", (req, res) => {
  res.json(all("SELECT id, author, role, text, rating, source, source_url FROM reviews ORDER BY order_index, id"));
});

adminRouter.get("/reviews", requireAdmin, (req, res) => {
  res.json(all("SELECT * FROM reviews ORDER BY order_index, id"));
});

function reviewFields(body) {
  const rating = Math.round(Number(body.rating));
  const url = clean(body.source_url, 300);
  return {
    author: clean(body.author, 80),
    role: clean(body.role, 120) || null,
    text: String(body.text ?? "").trim().slice(0, 3000),
    rating: rating >= 1 && rating <= 5 ? rating : null,
    source: clean(body.source, 60) || null,
    source_url: /^https?:\/\//i.test(url) ? url : null,
  };
}

adminRouter.post("/reviews", requireAdmin, (req, res) => {
  const r = reviewFields(req.body);
  if (!r.author || !r.text) return res.status(400).json({ error: "Нужны имя и текст отзыва" });
  const next = get("SELECT COALESCE(MAX(order_index), -1) + 1 AS n FROM reviews").n;
  const id = run("INSERT INTO reviews (author, role, text, rating, source, source_url, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)",
    r.author, r.role, r.text, r.rating, r.source, r.source_url, next).lastInsertRowid;
  res.json({ id });
});

adminRouter.put("/reviews/:id", requireAdmin, (req, res) => {
  const r = reviewFields(req.body);
  if (!r.author || !r.text) return res.status(400).json({ error: "Нужны имя и текст отзыва" });
  run("UPDATE reviews SET author = ?, role = ?, text = ?, rating = ?, source = ?, source_url = ? WHERE id = ?",
    r.author, r.role, r.text, r.rating, r.source, r.source_url, req.params.id);
  res.json({ ok: true });
});

adminRouter.put("/reviews-order", requireAdmin, (req, res) => {
  if (!Array.isArray(req.body.ids)) return res.status(400).json({ error: "ids должен быть массивом" });
  req.body.ids.forEach((id, i) => run("UPDATE reviews SET order_index = ? WHERE id = ?", i, id));
  res.json({ ok: true });
});

adminRouter.delete("/reviews/:id", requireAdmin, (req, res) => {
  run("DELETE FROM reviews WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

module.exports = { publicRouter, adminRouter };

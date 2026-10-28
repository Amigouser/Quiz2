const crypto = require("crypto");
const { run, get, all } = require("../db");

// ─── Прогресс учеников: кабинет, сводка для репетитора, отчёт для родителей ──
// Считаем только отправленные попытки (submitted = 1): попытка создаётся
// при открытии теста, и незаконченные не должны портить статистику.

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  if (!req.session.user.is_admin) return res.status(403).json({ error: "Нет прав" });
  next();
}

const pct = (score, max) => (max > 0 ? Math.round((score / max) * 100) : 0);

function attemptsOf(userId, sinceDays = null) {
  return all(`
    SELECT a.id, a.score, a.max_score, a.completed_at, a.status,
           t.id AS test_id, t.title, t.section, t.mock_exam
    FROM attempts a JOIN tests t ON t.id = a.test_id
    WHERE a.user_id = ? AND a.submitted = 1
      ${sinceDays ? "AND a.completed_at >= datetime('now', ?)" : ""}
    ORDER BY a.completed_at
  `, ...(sinceDays ? [userId, `-${sinceDays} days`] : [userId]));
}

// Средний % по разделам (раздел берётся из теста; у теста их может быть несколько)
function sectionStats(attempts) {
  const map = {};
  for (const a of attempts) {
    if (a.mock_exam || !a.section || !(a.max_score > 0)) continue;
    for (const s of a.section.split(", ").filter(Boolean)) {
      (map[s] ||= { section: s, sum: 0, n: 0 });
      map[s].sum += a.score / a.max_score; map[s].n++;
    }
  }
  return Object.values(map)
    .map(s => ({ section: s.section, pct: Math.round((s.sum / s.n) * 100), tests: s.n }))
    .sort((a, b) => a.pct - b.pct);
}

function mockHistory(attempts) {
  return attempts.filter(a => a.mock_exam).map(a => ({
    date: a.completed_at, title: a.title, mock_exam: a.mock_exam,
    score: a.score, max: a.max_score, pending: a.status === "pending_review",
  }));
}

// Отчёт по ученику за период (для кабинета и для родителей)
function studentReport(userId, days = 30) {
  const user = get("SELECT id, name, created_at FROM users WHERE id = ?", userId);
  const recent = attemptsOf(userId, days);
  const allTime = attemptsOf(userId);
  const plant = get("SELECT streak, last_watered_date FROM plant_progress WHERE user_id = ?", userId);
  const collected = get("SELECT COUNT(*) AS c FROM plant_collection WHERE user_id = ?", userId).c;
  const regular = recent.filter(a => !a.mock_exam && a.max_score > 0);
  return {
    name: user?.name || "",
    days,
    tests_done: recent.length,
    avg_pct: regular.length ? Math.round(regular.reduce((s, a) => s + a.score / a.max_score, 0) / regular.length * 100) : null,
    active_days: new Set(recent.map(a => a.completed_at.slice(0, 10))).size,
    mocks: mockHistory(allTime),
    sections: sectionStats(allTime),
    recent_tests: recent.slice(-10).reverse().map(a => ({ title: a.title, date: a.completed_at, pct: pct(a.score, a.max_score), mock_exam: a.mock_exam, score: a.score, max: a.max_score })),
    streak: plant?.streak || 0,
    plants_collected: collected,
  };
}

const studentRouter = require("express").Router();
const adminRouter = require("express").Router();
const publicRouter = require("express").Router();

// Кабинет ученика: график пробников и слабые разделы
studentRouter.get("/me/progress", requireAuth, (req, res) => {
  res.json(studentReport(req.session.user.id, 30));
});

// ── Сводка по всем ученикам ──
adminRouter.get("/overview", requireAdmin, (req, res) => {
  const students = all("SELECT id, name, group_name, last_seen, created_at FROM users WHERE is_admin = 0");
  const now = Date.now();
  const daysAgo = (d) => (d ? Math.floor((now - Date.parse(d.replace(" ", "T") + "Z")) / 86400000) : null);

  const rows = students.map(s => {
    const att = attemptsOf(s.id);
    const graded = att.filter(a => a.max_score > 0);
    const last5 = graded.slice(-5), prev5 = graded.slice(-10, -5);
    const avg = (list) => (list.length ? Math.round(list.reduce((x, a) => x + a.score / a.max_score, 0) / list.length * 100) : null);
    const recentAvg = avg(last5), prevAvg = avg(prev5);
    const lastActivity = [att.length ? att[att.length - 1].completed_at : null, s.last_seen].filter(Boolean).sort().pop() || null;
    const mocks = mockHistory(att);
    const plant = get("SELECT streak, water_drops FROM plant_progress WHERE user_id = ?", s.id);
    return {
      id: s.id, name: s.name, group_name: s.group_name,
      last_activity: lastActivity,
      days_inactive: daysAgo(lastActivity),
      tests_30d: att.filter(a => daysAgo(a.completed_at) <= 30).length,
      recent_avg: recentAvg,
      trend: recentAvg !== null && prevAvg !== null ? recentAvg - prevAvg : null,
      last_mock: mocks[mocks.length - 1] || null,
      pending_review: att.filter(a => a.status === "pending_review").length,
      streak: plant?.streak || 0,
    };
  });

  // Разделы, которые плохо идут у всего класса
  const allAtt = all(`
    SELECT a.score, a.max_score, t.section, t.mock_exam FROM attempts a
    JOIN tests t ON t.id = a.test_id JOIN users u ON u.id = a.user_id
    WHERE a.submitted = 1 AND u.is_admin = 0
  `);

  res.json({
    students: rows.sort((a, b) => (b.days_inactive ?? 9999) - (a.days_inactive ?? 9999)),
    sections: sectionStats(allAtt),
    totals: {
      students: rows.length,
      active_7d: rows.filter(r => r.days_inactive !== null && r.days_inactive <= 7).length,
      inactive_7d: rows.filter(r => r.days_inactive === null || r.days_inactive > 7).length,
      falling: rows.filter(r => r.trend !== null && r.trend <= -10).length,
      pending_review: rows.reduce((s, r) => s + r.pending_review, 0),
    },
  });
});

// ── Ссылка-отчёт для родителей ──
adminRouter.get("/students/:id/report-link", requireAdmin, (req, res) => {
  const u = get("SELECT report_token FROM users WHERE id = ? AND is_admin = 0", req.params.id);
  if (!u) return res.status(404).json({ error: "Ученик не найден" });
  res.json({ token: u.report_token || null });
});

// создать (или пересоздать — старая ссылка перестанет работать)
adminRouter.post("/students/:id/report-link", requireAdmin, (req, res) => {
  const u = get("SELECT id FROM users WHERE id = ? AND is_admin = 0", req.params.id);
  if (!u) return res.status(404).json({ error: "Ученик не найден" });
  const token = crypto.randomBytes(18).toString("base64url");
  run("UPDATE users SET report_token = ? WHERE id = ?", token, u.id);
  res.json({ token });
});

adminRouter.delete("/students/:id/report-link", requireAdmin, (req, res) => {
  run("UPDATE users SET report_token = NULL WHERE id = ? AND is_admin = 0", req.params.id);
  res.json({ ok: true });
});

publicRouter.get("/report/:token", (req, res) => {
  const token = String(req.params.token || "");
  if (token.length < 16) return res.status(404).json({ error: "Отчёт не найден" });
  const u = get("SELECT id FROM users WHERE report_token = ? AND is_admin = 0", token);
  if (!u) return res.status(404).json({ error: "Отчёт не найден или ссылка устарела" });
  const report = studentReport(u.id, 30);
  // родителю — только имя, без фамилии и кода входа
  report.name = report.name.split(/\s+/)[0];
  res.json(report);
});

module.exports = { studentRouter, adminRouter, publicRouter };

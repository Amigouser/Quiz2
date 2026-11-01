const { db, run, get, all } = require("../db");
const { today } = require("../utils/water");

// ── Умное повторение (коробки Лейтнера) ─────────────────────────────────────
// «Знаю» — карточка переходит в следующую коробку и вернётся через больший срок,
// «Не знаю» — назад в коробку 0, повторить сегодня же.
const BOX_DAYS = [0, 1, 3, 7, 14, 30];
const MAX_BOX = BOX_DAYS.length - 1;
const LEARNED_BOX = 3; // от недели и дальше считаем «выучено»

function progressMap(userId, setId) {
  const rows = all("SELECT term, box, due, wrong, seen FROM flashcard_progress WHERE user_id = ? AND set_id = ?", userId, setId);
  return new Map(rows.map(r => [r.term, r]));
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user?.is_admin) return res.status(403).json({ error: "Нет доступа" });
  next();
}

const studentRouter = require("express").Router();
const adminRouter = require("express").Router();

// ── Public: list active card sets (no auth) ─────────────────────────────────
studentRouter.get("/flashcard-sets/public", (req, res) => {
  const sets = all(`
    SELECT s.id, s.title, s.topic, s.description, s.category, s.grade, s.section, s.part, s.line, s.source, COUNT(c.id) AS cards_count
    FROM flashcard_sets s
    LEFT JOIN flashcard_cards c ON c.set_id = s.id
    WHERE s.is_active = 1
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `);
  res.json(sets);
});

// ── Public: get one set with cards (no auth) ─────────────────────────────────
studentRouter.get("/flashcard-sets/public/:id", (req, res) => {
  const set = get("SELECT id, title, topic, description, category, grade, section, part, line, source, is_active, created_at FROM flashcard_sets WHERE id = ? AND is_active = 1", req.params.id);
  if (!set) return res.status(404).json({ error: "Набор не найден" });
  const cards = all("SELECT * FROM flashcard_cards WHERE set_id = ? ORDER BY order_index", set.id);
  res.json({ ...set, cards });
});

// ── Student: list active card sets ──────────────────────────────────────────
studentRouter.get("/flashcard-sets", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const sets = all(`
    SELECT s.id, s.title, s.topic, s.description,
           s.category, s.grade, s.section, s.part, s.line, s.source,
           COUNT(c.id) AS cards_count,
           CASE WHEN fsa.id IS NOT NULL THEN 1 ELSE 0 END AS is_assigned,
           (SELECT c2.image_data FROM flashcard_cards c2 WHERE c2.set_id = s.id AND c2.image_data IS NOT NULL LIMIT 1) AS preview_image
    FROM flashcard_sets s
    LEFT JOIN flashcard_cards c ON c.set_id = s.id
    LEFT JOIN flashcard_set_assignments fsa ON fsa.set_id = s.id AND fsa.user_id = ?
    WHERE s.is_active = 1
    GROUP BY s.id
    ORDER BY fsa.assigned_at DESC, s.created_at DESC
  `, userId);
  // сколько карточек пора повторить и сколько уже выучено (только по существующим терминам)
  const stats = all(`
    SELECT p.set_id,
           SUM(CASE WHEN p.due <= ? THEN 1 ELSE 0 END) AS due_count,
           SUM(CASE WHEN p.box >= ? THEN 1 ELSE 0 END) AS learned_count
    FROM flashcard_progress p
    JOIN flashcard_cards c ON c.set_id = p.set_id AND c.term = p.term
    WHERE p.user_id = ?
    GROUP BY p.set_id
  `, today(), LEARNED_BOX, userId);
  const bySet = new Map(stats.map(s => [s.set_id, s]));
  res.json(sets.map(s => ({
    ...s,
    is_assigned: s.is_assigned === 1,
    due_count: bySet.get(s.id)?.due_count || 0,
    learned_count: bySet.get(s.id)?.learned_count || 0,
  })));
});

// ── Student: get one set with cards ─────────────────────────────────────────
studentRouter.get("/flashcard-sets/:id", requireAuth, (req, res) => {
  const set = get("SELECT * FROM flashcard_sets WHERE id = ? AND is_active = 1", req.params.id);
  if (!set) return res.status(404).json({ error: "Набор не найден" });
  const cards = all(
    "SELECT * FROM flashcard_cards WHERE set_id = ? ORDER BY order_index",
    set.id
  );
  const progress = progressMap(req.session.user.id, set.id);
  const now = today();
  res.json({
    ...set,
    today: now,
    cards: cards.map(c => {
      const p = progress.get(c.term);
      return { ...c, box: p?.box ?? null, due: p?.due ?? null, wrong: p?.wrong || 0, is_due: p ? p.due <= now : false };
    }),
  });
});

// ── Student: ответ «знаю / не знаю» по одной карточке ───────────────────────
studentRouter.post("/flashcard-sets/:id/review", requireAuth, (req, res) => {
  const { term, known } = req.body || {};
  const card = term ? get("SELECT id FROM flashcard_cards WHERE set_id = ? AND term = ?", req.params.id, term) : null;
  if (!card) return res.status(404).json({ error: "Карточка не найдена" });
  const userId = req.session.user.id;
  const setId = Number(req.params.id);
  const prev = get("SELECT box FROM flashcard_progress WHERE user_id = ? AND set_id = ? AND term = ?", userId, setId, term);
  const box = known ? Math.min((prev?.box ?? 0) + 1, MAX_BOX) : 0;
  const due = today(BOX_DAYS[box]);
  run(`
    INSERT INTO flashcard_progress (user_id, set_id, term, box, due, wrong, seen, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
    ON CONFLICT (user_id, set_id, term) DO UPDATE SET
      box = excluded.box, due = excluded.due,
      wrong = wrong + excluded.wrong, seen = seen + 1, updated_at = excluded.updated_at
  `, userId, setId, term, box, due, known ? 0 : 1);
  res.json({ box, due });
});

// ── Admin: list all sets ─────────────────────────────────────────────────────
adminRouter.get("/flashcard-sets", requireAuth, requireAdmin, (req, res) => {
  const sets = all(`
    SELECT s.id, s.title, s.topic, s.description, s.is_active, s.created_at,
           COUNT(c.id) AS cards_count
    FROM flashcard_sets s
    LEFT JOIN flashcard_cards c ON c.set_id = s.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `);
  res.json(sets);
});

// ── Admin: get one set with cards ────────────────────────────────────────────
adminRouter.get("/flashcard-sets/:id", requireAuth, requireAdmin, (req, res) => {
  const set = get("SELECT * FROM flashcard_sets WHERE id = ?", req.params.id);
  if (!set) return res.status(404).json({ error: "Не найден" });
  const cards = all(
    "SELECT * FROM flashcard_cards WHERE set_id = ? ORDER BY order_index",
    set.id
  );
  res.json({ ...set, cards });
});

// ── Admin: create set ────────────────────────────────────────────────────────
adminRouter.post("/flashcard-sets", requireAuth, requireAdmin, (req, res) => {
  const { title, topic, description, category, grade, section, part, line, source, cards = [] } = req.body;
  if (!title) return res.status(400).json({ error: "Нужно название" });

  db.exec("BEGIN");
  let setId;
  try {
    setId = run(
      "INSERT INTO flashcard_sets (title, topic, description, category, grade, section, part, line, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      title, topic || null, description || null, category || null, grade || null, section || null, part || null, line || null, source || null
    ).lastInsertRowid;
    cards.forEach((c, i) => {
      run(
        "INSERT INTO flashcard_cards (set_id, term, definition, image_data, image_side, order_index) VALUES (?, ?, ?, ?, ?, ?)",
        setId, c.term, c.definition, c.image_data || null, c.image_side === "back" ? "back" : "front", i
      );
    });
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }
  res.json({ id: setId });
});

// ── Admin: update set ────────────────────────────────────────────────────────
adminRouter.put("/flashcard-sets/:id", requireAuth, requireAdmin, (req, res) => {
  const { title, topic, description, category, grade, section, part, line, source, cards } = req.body;
  const id = req.params.id;

  db.exec("BEGIN");
  try {
    run(
      "UPDATE flashcard_sets SET title = ?, topic = ?, description = ?, category = ?, grade = ?, section = ?, part = ?, line = ?, source = ? WHERE id = ?",
      title, topic || null, description || null, category || null, grade || null, section || null, part || null, line || null, source || null, id
    );
    if (Array.isArray(cards)) {
      run("DELETE FROM flashcard_cards WHERE set_id = ?", id);
      cards.forEach((c, i) => {
        run(
          "INSERT INTO flashcard_cards (set_id, term, definition, image_data, image_side, order_index) VALUES (?, ?, ?, ?, ?, ?)",
          id, c.term, c.definition, c.image_data || null, c.image_side === "back" ? "back" : "front", i
        );
      });
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }
  res.json({ ok: true });
});

// ── Admin: delete set ────────────────────────────────────────────────────────
adminRouter.delete("/flashcard-sets/:id", requireAuth, requireAdmin, (req, res) => {
  run("DELETE FROM flashcard_sets WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

// ── Admin: duplicate set ────────────────────────────────────────────────────
adminRouter.post("/flashcard-sets/:id/duplicate", requireAuth, requireAdmin, (req, res) => {
  const set = get("SELECT * FROM flashcard_sets WHERE id = ?", req.params.id);
  if (!set) return res.status(404).json({ error: "Набор не найден" });
  const cards = all("SELECT * FROM flashcard_cards WHERE set_id = ? ORDER BY order_index", req.params.id);

  db.exec("BEGIN");
  try {
    const newSetId = run(
      "INSERT INTO flashcard_sets (title, topic, description, category, grade, section, part, line, source, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      set.title + " (копия)", set.topic, set.description, set.category, set.grade, set.section, set.part, set.line, set.source, 1
    ).lastInsertRowid;

    for (const c of cards) {
      run("INSERT INTO flashcard_cards (set_id, term, definition, image_data, image_side, order_index) VALUES (?, ?, ?, ?, ?, ?)",
        newSetId, c.term, c.definition, c.image_data, c.image_side || "front", c.order_index);
    }

    db.exec("COMMIT");
    res.json({ id: newSetId });
  } catch (e) {
    db.exec("ROLLBACK");
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: toggle active ─────────────────────────────────────────────────────
adminRouter.patch("/flashcard-sets/:id/toggle", requireAuth, requireAdmin, (req, res) => {
  const s = get("SELECT is_active FROM flashcard_sets WHERE id = ?", req.params.id);
  if (!s) return res.status(404).json({ error: "Не найден" });
  run("UPDATE flashcard_sets SET is_active = ? WHERE id = ?", s.is_active ? 0 : 1, req.params.id);
  res.json({ ok: true });
});

module.exports = { student: studentRouter, admin: adminRouter };

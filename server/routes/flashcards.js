const { db, run, get, all } = require("../db");

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
    SELECT s.id, s.title, s.topic, s.description, s.category, COUNT(c.id) AS cards_count
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
  const set = get("SELECT * FROM flashcard_sets WHERE id = ? AND is_active = 1", req.params.id);
  if (!set) return res.status(404).json({ error: "Набор не найден" });
  const cards = all("SELECT * FROM flashcard_cards WHERE set_id = ? ORDER BY order_index", set.id);
  res.json({ ...set, cards });
});

// ── Student: list active card sets ──────────────────────────────────────────
studentRouter.get("/flashcard-sets", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const sets = all(`
    SELECT s.id, s.title, s.topic, s.description,
           COUNT(c.id) AS cards_count,
           CASE WHEN fsa.id IS NOT NULL THEN 1 ELSE 0 END AS is_assigned
    FROM flashcard_sets s
    LEFT JOIN flashcard_cards c ON c.set_id = s.id
    LEFT JOIN flashcard_set_assignments fsa ON fsa.set_id = s.id AND fsa.user_id = ?
    WHERE s.is_active = 1
    GROUP BY s.id
    ORDER BY fsa.assigned_at DESC, s.created_at DESC
  `, userId);
  res.json(sets.map(s => ({ ...s, is_assigned: s.is_assigned === 1 })));
});

// ── Student: get one set with cards ─────────────────────────────────────────
studentRouter.get("/flashcard-sets/:id", requireAuth, (req, res) => {
  const set = get("SELECT * FROM flashcard_sets WHERE id = ? AND is_active = 1", req.params.id);
  if (!set) return res.status(404).json({ error: "Набор не найден" });
  const cards = all(
    "SELECT * FROM flashcard_cards WHERE set_id = ? ORDER BY order_index",
    set.id
  );
  res.json({ ...set, cards });
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
  const { title, topic, description, category, cards = [] } = req.body;
  if (!title) return res.status(400).json({ error: "Нужно название" });

  db.exec("BEGIN");
  let setId;
  try {
    setId = run(
      "INSERT INTO flashcard_sets (title, topic, description, category) VALUES (?, ?, ?, ?)",
      title, topic || null, description || null, category || null
    ).lastInsertRowid;
    cards.forEach((c, i) => {
      run(
        "INSERT INTO flashcard_cards (set_id, term, definition, order_index) VALUES (?, ?, ?, ?)",
        setId, c.term, c.definition, i
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
  const { title, topic, description, category, cards } = req.body;
  const id = req.params.id;

  db.exec("BEGIN");
  try {
    run(
      "UPDATE flashcard_sets SET title = ?, topic = ?, description = ?, category = ? WHERE id = ?",
      title, topic || null, description || null, category || null, id
    );
    if (Array.isArray(cards)) {
      run("DELETE FROM flashcard_cards WHERE set_id = ?", id);
      cards.forEach((c, i) => {
        run(
          "INSERT INTO flashcard_cards (set_id, term, definition, order_index) VALUES (?, ?, ?, ?)",
          id, c.term, c.definition, i
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

// ── Admin: toggle active ─────────────────────────────────────────────────────
adminRouter.patch("/flashcard-sets/:id/toggle", requireAuth, requireAdmin, (req, res) => {
  const s = get("SELECT is_active FROM flashcard_sets WHERE id = ?", req.params.id);
  if (!s) return res.status(404).json({ error: "Не найден" });
  run("UPDATE flashcard_sets SET is_active = ? WHERE id = ?", s.is_active ? 0 : 1, req.params.id);
  res.json({ ok: true });
});

module.exports = { student: studentRouter, admin: adminRouter };

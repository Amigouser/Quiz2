const router = require("express").Router();
const { db, run, get, all } = require("../db");

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  if (!req.session.user.is_admin) return res.status(403).json({ error: "Нет прав" });
  next();
}

router.use(requireAdmin);

router.get("/tests", (req, res) => {
  const tests = all(`
    SELECT t.*,
           COUNT(DISTINCT q.id) AS questions_count,
           COUNT(DISTINCT a.id) AS attempt_count,
           ROUND(AVG(CASE WHEN a.max_score > 0 THEN a.score * 100.0 / a.max_score END), 0) AS avg_score
    FROM tests t
    LEFT JOIN questions q ON q.test_id = t.id
    LEFT JOIN attempts a ON a.test_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);
  res.json(tests);
});

router.get("/tests/:id", (req, res) => {
  const test = get("SELECT * FROM tests WHERE id = ?", req.params.id);
  if (!test) return res.status(404).json({ error: "Тест не найден" });
  const questions = all("SELECT * FROM questions WHERE test_id = ? ORDER BY order_index", req.params.id);
  for (const q of questions) {
    q.answers = all("SELECT * FROM answers WHERE question_id = ? ORDER BY order_index", q.id);
  }
  res.json({ ...test, questions });
});

router.post("/tests", (req, res) => {
  const { title, topic, description, questions = [], is_draft = 0 } = req.body;
  if (!title) return res.status(400).json({ error: "Название обязательно" });

  db.exec("BEGIN");
  let testId;
  try {
    testId = run(
      "INSERT INTO tests (title, topic, description, is_draft) VALUES (?, ?, ?, ?)",
      title, topic || null, description || null, is_draft ? 1 : 0
    ).lastInsertRowid;

    questions.forEach((q, qi) => {
      const qId = run(
        "INSERT INTO questions (test_id, question_text, hint, explanation, order_index) VALUES (?, ?, ?, ?, ?)",
        testId, q.text, q.hint || null, q.explanation || null, qi
      ).lastInsertRowid;

      (q.answers || []).forEach((a, ai) =>
        run("INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)",
          qId, a.text, a.is_correct ? 1 : 0, ai)
      );
    });

    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }

  res.json({ id: testId });
});

router.put("/tests/:id", (req, res) => {
  const { title, topic, description, questions } = req.body;
  if (!title) return res.status(400).json({ error: "Название обязательно" });

  db.exec("BEGIN");
  try {
    run("UPDATE tests SET title = ?, topic = ?, description = ? WHERE id = ?",
      title, topic || null, description || null, req.params.id);

    if (Array.isArray(questions)) {
      run("DELETE FROM questions WHERE test_id = ?", req.params.id);
      questions.forEach((q, qi) => {
        const qId = run(
          "INSERT INTO questions (test_id, question_text, hint, explanation, order_index) VALUES (?, ?, ?, ?, ?)",
          req.params.id, q.text, q.hint || null, q.explanation || null, qi
        ).lastInsertRowid;
        (q.answers || []).forEach((a, ai) =>
          run("INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)",
            qId, a.text, a.is_correct ? 1 : 0, ai)
        );
      });
    }
    db.exec("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    db.exec("ROLLBACK");
    res.status(500).json({ error: e.message });
  }
});

router.delete("/tests/:id", (req, res) => {
  run("DELETE FROM tests WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

router.patch("/tests/:id/toggle", (req, res) => {
  const test = get("SELECT is_active FROM tests WHERE id = ?", req.params.id);
  if (!test) return res.status(404).json({ error: "Тест не найден" });
  run("UPDATE tests SET is_active = ? WHERE id = ?", test.is_active ? 0 : 1, req.params.id);
  res.json({ ok: true });
});

router.patch("/tests/:id/publish", (req, res) => {
  run("UPDATE tests SET is_draft = 0, is_active = 1 WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

router.get("/students", (req, res) => {
  const students = all(`
    SELECT u.id, u.name, u.code, u.group_name, u.created_at,
           COUNT(DISTINCT a.id) AS attempt_count,
           ROUND(AVG(CASE WHEN a.max_score > 0 THEN a.score * 100.0 / a.max_score END), 0) AS avg_score,
           MAX(a.completed_at) AS last_attempt
    FROM users u
    LEFT JOIN attempts a ON a.user_id = u.id
    WHERE u.is_admin = 0
    GROUP BY u.id
    ORDER BY last_attempt DESC
  `);
  res.json(students);
});

router.delete("/students/:id", (req, res) => {
  const student = get("SELECT id FROM users WHERE id = ? AND is_admin = 0", req.params.id);
  if (!student) return res.status(404).json({ error: "Ученик не найден" });
  run("DELETE FROM users WHERE id = ? AND is_admin = 0", req.params.id);
  res.json({ ok: true });
});

router.post("/students", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Имя обязательно" });
  const trimmed = name.trim();

  const { group_name } = req.body;
  const existing = get("SELECT id FROM users WHERE name = ?", trimmed);
  if (existing) return res.status(409).json({ error: "Ученик с таким именем уже существует" });

  // Генерируем уникальный 8-значный код
  let code;
  do { code = String(Math.floor(10000000 + Math.random() * 90000000)); }
  while (get("SELECT id FROM users WHERE code = ?", code));

  const r = run(
    "INSERT INTO users (name, is_admin, code, group_name) VALUES (?, 0, ?, ?)",
    trimmed, code, group_name || null
  );
  const user = get("SELECT id, name, code, group_name, created_at FROM users WHERE id = ?", r.lastInsertRowid);
  res.json(user);
});

// ── Назначение тестов ученикам ──────────────────────────────────────────────

// Получить данные ученика: его назначения + все доступные тесты
router.get("/students/:id", (req, res) => {
  const student = get(
    "SELECT id, name, created_at FROM users WHERE id = ? AND is_admin = 0",
    req.params.id
  );
  if (!student) return res.status(404).json({ error: "Ученик не найден" });

  const stats = get(`
    SELECT COUNT(DISTINCT a.id) AS attempt_count,
           ROUND(AVG(CASE WHEN a.max_score > 0 THEN a.score * 100.0 / a.max_score END), 0) AS avg_score,
           MAX(a.completed_at) AS last_attempt
    FROM attempts a WHERE a.user_id = ?
  `, req.params.id);

  const assigned = all(`
    SELECT t.id, t.title, t.topic, t.is_draft, t.is_active,
           COUNT(q.id) AS questions_count,
           ta.assigned_at
    FROM test_assignments ta
    JOIN tests t ON t.id = ta.test_id
    LEFT JOIN questions q ON q.test_id = t.id
    WHERE ta.user_id = ?
    GROUP BY t.id
    ORDER BY ta.assigned_at DESC
  `, req.params.id);

  const allTests = all(`
    SELECT t.id, t.title, t.topic, t.is_draft, t.is_active,
           COUNT(q.id) AS questions_count
    FROM tests t
    LEFT JOIN questions q ON q.test_id = t.id
    WHERE t.is_draft = 0
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);

  const assignedIds = new Set(assigned.map(t => t.id));
  const available = allTests.filter(t => !assignedIds.has(t.id));

  res.json({ student: { ...student, ...stats }, assigned, available });
});

// Назначить тест ученику
router.post("/students/:id/assign", (req, res) => {
  const { test_id } = req.body;
  if (!test_id) return res.status(400).json({ error: "test_id обязателен" });

  const student = get("SELECT id FROM users WHERE id = ? AND is_admin = 0", req.params.id);
  if (!student) return res.status(404).json({ error: "Ученик не найден" });

  const test = get("SELECT id FROM tests WHERE id = ?", test_id);
  if (!test) return res.status(404).json({ error: "Тест не найден" });

  try {
    run(
      "INSERT OR IGNORE INTO test_assignments (user_id, test_id) VALUES (?, ?)",
      req.params.id, test_id
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Снять назначение
router.delete("/students/:id/assign/:testId", (req, res) => {
  run(
    "DELETE FROM test_assignments WHERE user_id = ? AND test_id = ?",
    req.params.id, req.params.testId
  );
  res.json({ ok: true });
});

// ── Назначение карточек ученикам ────────────────────────────────────────────

// Получить назначения карточных наборов для ученика
router.get("/students/:id/card-sets", (req, res) => {
  const student = get("SELECT id FROM users WHERE id = ? AND is_admin = 0", req.params.id);
  if (!student) return res.status(404).json({ error: "Ученик не найден" });

  const assigned = all(`
    SELECT s.id, s.title, s.topic, s.is_active,
           COUNT(c.id) AS cards_count,
           fsa.assigned_at
    FROM flashcard_set_assignments fsa
    JOIN flashcard_sets s ON s.id = fsa.set_id
    LEFT JOIN flashcard_cards c ON c.set_id = s.id
    WHERE fsa.user_id = ?
    GROUP BY s.id
    ORDER BY fsa.assigned_at DESC
  `, req.params.id);

  const allSets = all(`
    SELECT s.id, s.title, s.topic, s.is_active,
           COUNT(c.id) AS cards_count
    FROM flashcard_sets s
    LEFT JOIN flashcard_cards c ON c.set_id = s.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `);

  const assignedIds = new Set(assigned.map(s => s.id));
  const available = allSets.filter(s => !assignedIds.has(s.id));

  res.json({ assigned, available });
});

// Назначить набор карточек ученику
router.post("/students/:id/card-sets", (req, res) => {
  const { set_id } = req.body;
  if (!set_id) return res.status(400).json({ error: "set_id обязателен" });

  const student = get("SELECT id FROM users WHERE id = ? AND is_admin = 0", req.params.id);
  if (!student) return res.status(404).json({ error: "Ученик не найден" });

  try {
    run(
      "INSERT OR IGNORE INTO flashcard_set_assignments (user_id, set_id) VALUES (?, ?)",
      req.params.id, set_id
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Снять назначение набора карточек
router.delete("/students/:id/card-sets/:setId", (req, res) => {
  run(
    "DELETE FROM flashcard_set_assignments WHERE user_id = ? AND set_id = ?",
    req.params.id, req.params.setId
  );
  res.json({ ok: true });
});

router.get("/results", (req, res) => {
  const results = all(`
    SELECT a.id, a.score, a.max_score, a.completed_at,
           u.name AS user_name, t.title AS test_title, t.topic
    FROM attempts a
    JOIN users u ON u.id = a.user_id
    JOIN tests t ON t.id = a.test_id
    ORDER BY a.completed_at DESC
  `);
  res.json(results);
});

module.exports = router;

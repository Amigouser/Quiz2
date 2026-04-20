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
  const { title, topic, description } = req.body;
  run("UPDATE tests SET title = ?, topic = ?, description = ? WHERE id = ?",
    title, topic, description, req.params.id);
  res.json({ ok: true });
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
    SELECT u.id, u.name, u.created_at,
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

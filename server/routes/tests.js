const router = require("express").Router();
const { db, run, get, all } = require("../db");

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  next();
}

router.get("/tests", requireAuth, (req, res) => {
  const userId = req.session.user.id;

  const tests = all(`
    SELECT t.id, t.title, t.topic, t.description,
           COUNT(q.id) AS questions_count,
           CASE WHEN ta.id IS NOT NULL THEN 1 ELSE 0 END AS is_assigned
    FROM tests t
    LEFT JOIN questions q ON q.test_id = t.id
    LEFT JOIN test_assignments ta ON ta.test_id = t.id AND ta.user_id = ?
    WHERE t.is_active = 1 AND t.is_draft = 0
    GROUP BY t.id
    ORDER BY ta.assigned_at DESC, t.created_at DESC
  `, userId);

  const attempts = all(
    "SELECT test_id, score, max_score FROM attempts WHERE user_id = ? ORDER BY completed_at DESC",
    userId
  );

  const attemptMap = {};
  for (const a of attempts) {
    if (!attemptMap[a.test_id]) attemptMap[a.test_id] = a;
  }

  const result = tests.map((t) => {
    const attempt = attemptMap[t.id];
    const est_minutes = Math.max(1, Math.ceil(t.questions_count * 0.8));
    return {
      id: t.id,
      title: t.title,
      topic: t.topic || "Биология",
      description: t.description,
      questions_count: t.questions_count,
      est_minutes,
      status: attempt ? "done" : "new",
      score: attempt ? attempt.score : null,
      max_score: attempt ? attempt.max_score : t.questions_count,
      is_assigned: t.is_assigned === 1,
    };
  });

  res.json(result);
});

router.get("/tests/:id", requireAuth, (req, res) => {
  const test = get("SELECT * FROM tests WHERE id = ? AND is_active = 1", req.params.id);
  if (!test) return res.status(404).json({ error: "Тест не найден" });

  const questions = all(
    "SELECT * FROM questions WHERE test_id = ? ORDER BY order_index",
    test.id
  );

  const result = {
    id: test.id,
    title: test.title,
    topic: test.topic,
    questions: questions.map((q) => {
      const answers = all(
        "SELECT * FROM answers WHERE question_id = ? ORDER BY order_index",
        q.id
      );
      const correctIndex = answers.findIndex((a) => a.is_correct === 1);
      return {
        id: q.id,
        text: q.question_text,
        hint: q.hint,
        explanation: q.explanation,
        correct_index: correctIndex,
        answers: answers.map((a) => ({ id: a.id, text: a.answer_text })),
      };
    }),
  };

  res.json(result);
});

router.post("/attempts", requireAuth, (req, res) => {
  const { test_id } = req.body;
  const test = get("SELECT id FROM tests WHERE id = ?", test_id);
  if (!test) return res.status(404).json({ error: "Тест не найден" });

  const qCount = get("SELECT COUNT(*) as c FROM questions WHERE test_id = ?", test_id).c;
  const r = run(
    "INSERT INTO attempts (user_id, test_id, max_score) VALUES (?, ?, ?)",
    req.session.user.id, test_id, qCount
  );

  res.json({ attempt_id: r.lastInsertRowid });
});

router.post("/attempts/:id/submit", requireAuth, (req, res) => {
  const attemptId = req.params.id;
  const attempt = get(
    "SELECT * FROM attempts WHERE id = ? AND user_id = ?",
    attemptId, req.session.user.id
  );
  if (!attempt) return res.status(404).json({ error: "Попытка не найдена" });

  const { answers } = req.body;
  if (!Array.isArray(answers)) return res.status(400).json({ error: "answers должен быть массивом" });

  let score = 0;
  const results = [];

  db.exec("BEGIN");
  try {
    for (const ans of answers) {
      const { question_id, answer_id } = ans;
      const correctAnswer = get(
        "SELECT id FROM answers WHERE question_id = ? AND is_correct = 1",
        question_id
      );
      const isCorrect = correctAnswer && correctAnswer.id === answer_id ? 1 : 0;
      if (isCorrect) score++;

      run(
        "INSERT INTO attempt_answers (attempt_id, question_id, answer_id, is_correct) VALUES (?, ?, ?, ?)",
        attemptId, question_id, answer_id, isCorrect
      );

      results.push({
        question_id,
        answer_id,
        is_correct: isCorrect,
        correct_answer_id: correctAnswer ? correctAnswer.id : null,
      });
    }
    run("UPDATE attempts SET score = ? WHERE id = ?", score, attemptId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }

  res.json({ score, max_score: attempt.max_score, results });
});

module.exports = router;

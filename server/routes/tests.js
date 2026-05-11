const router = require("express").Router();
const { db, run, get, all } = require("../db");

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  next();
}

router.get("/tests/public", (req, res) => {
  const tests = all(`
    SELECT t.id, t.title, t.topic, t.description, t.category, t.grade, t.section, t.part, t.line, t.source,
           COUNT(q.id) AS questions_count
    FROM tests t
    LEFT JOIN questions q ON q.test_id = t.id
    WHERE t.is_active = 1 AND t.is_draft = 0
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);

  res.json(tests.map((t) => ({
    id: t.id,
    title: t.title,
    topic: t.topic || "Биология",
    description: t.description,
    category: t.category || null,
    grade: t.grade || null,
    section: t.section || null,
    part: t.part || null,
    line: t.line || null,
    source: t.source || null,
    questions_count: t.questions_count,
    est_minutes: Math.max(1, Math.ceil(t.questions_count * 0.8)),
  })));
});

router.get("/tests/public/:id", (req, res) => {
  const test = get("SELECT * FROM tests WHERE id = ? AND is_active = 1 AND is_draft = 0", req.params.id);
  if (!test) return res.status(404).json({ error: "Тест не найден" });
  const questions = all("SELECT * FROM questions WHERE test_id = ? ORDER BY order_index", test.id);
  res.json({
    id: test.id,
    title: test.title,
    topic: test.topic,
    questions: questions.map((q) => {
      const answers = all("SELECT * FROM answers WHERE question_id = ? ORDER BY order_index", q.id);
      const correctIndex = answers.findIndex((a) => a.is_correct === 1);
      return {
        id: q.id,
        text: q.question_text,
        hint: q.hint,
        explanation: q.explanation,
        question_type: q.question_type || "single",
        image_data: q.image_data || null,
        correct_text: q.correct_text || null,
        match_options: q.match_options ? JSON.parse(q.match_options) : ["1", "2"],
        correct_index: correctIndex,
        answers: answers.map((a) => ({ id: a.id, text: a.answer_text, match_value: a.match_value || null, is_correct: a.is_correct })),
      };
    }),
  });
});

router.get("/tests", requireAuth, (req, res) => {
  const userId = req.session.user.id;

  const tests = all(`
    SELECT t.id, t.title, t.topic, t.description,
           t.category, t.grade, t.section, t.part, t.line, t.source,
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
      category: t.category || null,
      grade: t.grade || null,
      section: t.section || null,
      part: t.part || null,
      line: t.line || null,
      source: t.source || null,
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
        question_type: q.question_type || "single",
        image_data: q.image_data || null,
        correct_text: q.correct_text || null,
        match_options: q.match_options ? JSON.parse(q.match_options) : ["1", "2"],
        correct_index: correctIndex,
        answers: answers.map((a) => ({ id: a.id, text: a.answer_text, match_value: a.match_value || null, is_correct: a.is_correct })),
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
      const { question_id, answer_id, answer_text, matches } = ans;
      const question = get("SELECT question_type, correct_text FROM questions WHERE id = ?", question_id);
      const qType = question?.question_type || "single";

      if (qType === "text_input") {
        const expected = (question?.correct_text || "").trim().toLowerCase();
        const given = (answer_text || "").trim().toLowerCase();
        const isCorrect = expected && given === expected ? 1 : 0;
        if (isCorrect) score++;
        run(
          "INSERT INTO attempt_answers (attempt_id, question_id, answer_id, answer_text, is_correct) VALUES (?, ?, ?, ?, ?)",
          attemptId, question_id, null, answer_text || "", isCorrect
        );
        results.push({ question_id, answer_text, is_correct: isCorrect, correct_text: question?.correct_text });

      } else if (qType === "multiple_select") {
        const selectedIds = (answer_text || "").split(",").map(Number).filter(Boolean).sort((a, b) => a - b);
        const correctIds = all("SELECT id FROM answers WHERE question_id = ? AND is_correct = 1", question_id).map(a => a.id).sort((a, b) => a - b);
        const isCorrect = selectedIds.length === correctIds.length && selectedIds.every((id, i) => id === correctIds[i]) ? 1 : 0;
        if (isCorrect) score++;
        run(
          "INSERT INTO attempt_answers (attempt_id, question_id, answer_id, answer_text, is_correct) VALUES (?, ?, ?, ?, ?)",
          attemptId, question_id, null, answer_text || "", isCorrect
        );
        results.push({ question_id, answer_text, is_correct: isCorrect });

      } else if (qType === "sequence") {
        const studentOrder = (answer_text || "").split(",").map(Number).filter(Boolean);
        const correctOrder = all("SELECT id FROM answers WHERE question_id = ? ORDER BY order_index", question_id).map(a => a.id);
        const isCorrect = studentOrder.length === correctOrder.length && studentOrder.every((id, i) => id === correctOrder[i]) ? 1 : 0;
        if (isCorrect) score++;
        run(
          "INSERT INTO attempt_answers (attempt_id, question_id, answer_id, answer_text, is_correct) VALUES (?, ?, ?, ?, ?)",
          attemptId, question_id, null, answer_text || "", isCorrect
        );
        results.push({ question_id, answer_text, is_correct: isCorrect });

      } else if (qType === "matching" || qType === "fill_blanks") {
        const matchEntries = Object.entries(matches || {});
        let allCorrect = matchEntries.length > 0;
        for (const [aid, selectedVal] of matchEntries) {
          const expected = get("SELECT match_value FROM answers WHERE id = ?", Number(aid));
          const itemCorrect = expected && expected.match_value === selectedVal ? 1 : 0;
          if (!itemCorrect) allCorrect = false;
          run(
            "INSERT INTO attempt_answers (attempt_id, question_id, answer_id, answer_text, is_correct) VALUES (?, ?, ?, ?, ?)",
            attemptId, question_id, Number(aid), selectedVal, itemCorrect
          );
        }
        if (allCorrect) score++;
        results.push({ question_id, matches, is_correct: allCorrect ? 1 : 0 });

      } else {
        const correctAnswer = get(
          "SELECT id FROM answers WHERE question_id = ? AND is_correct = 1",
          question_id
        );
        const isCorrect = correctAnswer && Number(correctAnswer.id) === Number(answer_id) ? 1 : 0;
        if (isCorrect) score++;
        run(
          "INSERT INTO attempt_answers (attempt_id, question_id, answer_id, is_correct) VALUES (?, ?, ?, ?)",
          attemptId, question_id, answer_id, isCorrect
        );
        results.push({ question_id, answer_id, is_correct: isCorrect, correct_answer_id: correctAnswer?.id ?? null });
      }
    }
    run("UPDATE attempts SET score = ?, completed_at = datetime('now') WHERE id = ?", score, attemptId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }

  res.json({ score, max_score: Number(attempt.max_score), results });
});

module.exports = router;

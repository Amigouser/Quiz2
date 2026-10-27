const router = require("express").Router();
const { db, run, get, all } = require("../db");
const { NO_CREDIT, textErrors, setErrors, orderErrors, pointsFor } = require("../utils/scoring");

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  next();
}

router.get("/tests/public", (req, res) => {
  const tests = all(`
    SELECT t.id, t.title, t.topic, t.description, t.category, t.grade, t.section, t.part, t.line, t.source, t.mock_exam,
           COUNT(q.id) AS questions_count, COALESCE(SUM(COALESCE(q.max_points, 1)), 0) AS points_total
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
    mock_exam: t.mock_exam || null,
    questions_count: t.questions_count,
    points_total: t.points_total,
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
    mock_exam: test.mock_exam || null,
    questions: questions.map((q) => {
      const answers = all("SELECT * FROM answers WHERE question_id = ? ORDER BY order_index", q.id);
      // Гостевой тест проверяется прямо в браузере, поэтому ему нужны правильные
      // ответы (как и в /tests/:id для учеников) — без них верные ответы не засчитывались.
      return {
        id: q.id,
        text: q.question_text,
        hint: q.hint,
        explanation: q.explanation,
        question_type: q.question_type || "single",
        image_data: q.image_data || null,
        correct_text: q.correct_text || null,
        correct_index: answers.findIndex((a) => a.is_correct === 1),
        max_points: q.max_points || null,
        match_options: (() => { try { const p = typeof q.match_options === "string" ? JSON.parse(q.match_options) : q.match_options; return Array.isArray(p) ? p : ["1","2"]; } catch(_) { return ["1","2"]; } })(),
        grading_criteria: q.grading_criteria || null,
        answers: answers.map((a) => ({ id: a.id, text: a.answer_text, match_value: a.match_value || null, is_correct: a.is_correct })),
      };
    }),
  });
});

router.get("/tests", requireAuth, (req, res) => {
  const userId = req.session.user.id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;

  const total = get(`
    SELECT COUNT(DISTINCT t.id) as c
    FROM tests t
    LEFT JOIN test_assignments ta ON ta.test_id = t.id AND ta.user_id = ?
    WHERE t.is_active = 1 AND t.is_draft = 0
  `, userId).c;

  const tests = all(`
    SELECT t.id, t.title, t.topic, t.description,
           t.category, t.grade, t.section, t.part, t.line, t.source, t.mock_exam,
           COUNT(q.id) AS questions_count,
           CASE WHEN ta.id IS NOT NULL THEN 1 ELSE 0 END AS is_assigned
    FROM tests t
    LEFT JOIN questions q ON q.test_id = t.id
    LEFT JOIN test_assignments ta ON ta.test_id = t.id AND ta.user_id = ?
    WHERE t.is_active = 1 AND t.is_draft = 0
    GROUP BY t.id
    ORDER BY ta.assigned_at DESC, t.created_at DESC
    LIMIT ? OFFSET ?
  `, userId, limit, offset);

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
      mock_exam: t.mock_exam || null,
      questions_count: t.questions_count,
      est_minutes,
      status: attempt ? "done" : "new",
      score: attempt ? attempt.score : null,
      max_score: attempt ? attempt.max_score : t.questions_count,
      is_assigned: t.is_assigned === 1,
    };
  });

  res.json({
    data: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
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
    mock_exam: test.mock_exam || null,
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
        match_options: (() => { try { const p = typeof q.match_options === "string" ? JSON.parse(q.match_options) : q.match_options; return Array.isArray(p) ? p : ["1","2"]; } catch(_) { return ["1","2"]; } })(),
        grading_criteria: q.grading_criteria || null,
        max_points: q.max_points || null,
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

  const maxScore = get("SELECT COALESCE(SUM(COALESCE(max_points, 1)), 0) as s FROM questions WHERE test_id = ?", test_id).s;
  const r = run(
    "INSERT INTO attempts (user_id, test_id, max_score) VALUES (?, ?, ?)",
    req.session.user.id, test_id, maxScore
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
  let hasOpenResponse = false;
  const results = [];

  const saveAnswer = (questionId, answerId, answerText, isCorrect, points) => run(
    "INSERT INTO attempt_answers (attempt_id, question_id, answer_id, answer_text, is_correct, points) VALUES (?, ?, ?, ?, ?, ?)",
    attemptId, questionId, answerId, answerText, isCorrect, points
  );

  db.exec("BEGIN");
  try {
    for (const ans of answers) {
      const { question_id, answer_id, answer_text, matches } = ans;
      const question = get("SELECT question_type, correct_text, max_points FROM questions WHERE id = ?", question_id);
      if (!question) continue;
      const qType = question.question_type || "single";
      const maxPoints = question.max_points || 1;

      if (qType === "open_response") {
        // проверяет репетитор вручную — баллы появятся после проверки
        hasOpenResponse = true;
        saveAnswer(question_id, null, answer_text || "", 0, null);
        results.push({ question_id, answer_text, is_correct: 0, points: null, max_points: maxPoints, pending_review: true });
        continue;
      }

      let errors = NO_CREDIT;
      if (qType === "text_input") {
        errors = textErrors(answer_text, question.correct_text);
      } else if (qType === "multiple_select") {
        const selectedIds = (answer_text || "").split(",").map(Number).filter(Boolean);
        const correctIds = all("SELECT id FROM answers WHERE question_id = ? AND is_correct = 1", question_id).map(a => a.id);
        errors = setErrors(selectedIds, correctIds);
      } else if (qType === "sequence") {
        const studentOrder = (answer_text || "").split(",").map(Number).filter(Boolean);
        const correctOrder = all("SELECT id FROM answers WHERE question_id = ? ORDER BY order_index", question_id).map(a => a.id);
        errors = orderErrors(studentOrder, correctOrder);
      } else if (qType === "matching" || qType === "fill_blanks") {
        const items = all("SELECT id, match_value FROM answers WHERE question_id = ? ORDER BY order_index", question_id);
        const given = matches || {};
        errors = items.length > 0 ? items.filter(it => given[it.id] !== it.match_value).length : NO_CREDIT;
      } else {
        const correctAnswer = get("SELECT id FROM answers WHERE question_id = ? AND is_correct = 1", question_id);
        errors = correctAnswer && Number(correctAnswer.id) === Number(answer_id) ? 0 : NO_CREDIT;
      }

      const points = pointsFor(errors, maxPoints);
      const isCorrect = points === maxPoints ? 1 : 0;
      score += points;

      if (qType === "matching" || qType === "fill_blanks") {
        // по строке на каждый элемент; баллы за задание — в первой строке
        const items = all("SELECT id, match_value FROM answers WHERE question_id = ? ORDER BY order_index", question_id);
        items.forEach((it, i) => {
          const selectedVal = (matches || {})[it.id] ?? null;
          saveAnswer(question_id, it.id, selectedVal, selectedVal === it.match_value ? 1 : 0, i === 0 ? points : null);
        });
        results.push({ question_id, matches, is_correct: isCorrect, points, max_points: maxPoints });
      } else if (qType === "single") {
        saveAnswer(question_id, answer_id ?? null, null, isCorrect, points);
        results.push({ question_id, answer_id, is_correct: isCorrect, points, max_points: maxPoints });
      } else {
        saveAnswer(question_id, null, answer_text || "", isCorrect, points);
        results.push({ question_id, answer_text, is_correct: isCorrect, points, max_points: maxPoints, correct_text: qType === "text_input" ? question.correct_text : undefined });
      }
    }
    const status = hasOpenResponse ? "pending_review" : "graded";
    run("UPDATE attempts SET score = ?, status = ?, completed_at = datetime('now') WHERE id = ?", score, status, attemptId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }

  const test = get("SELECT mock_exam FROM tests WHERE id = ?", attempt.test_id);
  res.json({
    score,
    max_score: Number(attempt.max_score),
    status: hasOpenResponse ? "pending_review" : "graded",
    mock_exam: test?.mock_exam || null,
    results,
  });
});

module.exports = router;

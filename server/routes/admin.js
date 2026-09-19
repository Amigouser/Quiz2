const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { db, run, get, all } = require("../db");
const DB_PATH = path.join(__dirname, "../../data/biology.db");

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  if (!req.session.user.is_admin) return res.status(403).json({ error: "Нет прав" });
  next();
}

router.use(requireAdmin);

// ── Импорт теста из JSON (пробник) ──────────────────────────────────────────
router.post("/tests/import", (req, res) => {
  const data = req.body;
  if (!data || typeof data !== "object") return res.status(400).json({ error: "Неверный JSON" });

  // Поддержка обоих форматов: exam_title / title
  const title = data.exam_title || data.title;
  if (!title) return res.status(400).json({ error: "Отсутствует title (или exam_title)" });

  // Вопросы: part1 + part2, или questions
  let rawQuestions = [];
  if (Array.isArray(data.part1)) rawQuestions = rawQuestions.concat(data.part1);
  if (Array.isArray(data.part2)) rawQuestions = rawQuestions.concat(data.part2);
  if (rawQuestions.length === 0 && Array.isArray(data.questions)) rawQuestions = data.questions;
  if (rawQuestions.length === 0) return res.status(400).json({ error: "Нет вопросов (ищем part1, part2 или questions)" });

  const errors = [];
  const questions = [];

  // Нормализация correct_answer → массив строк
  function normalizeAnswer(raw) {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw.map(String).map(s => s.trim()).filter(Boolean);
    const s = String(raw).trim();
    if (!s) return [];
    // "31;13" → берём первый вариант (альтернативы через ;)
    if (s.includes(";")) return [s.split(";")[0].trim()];
    return [s];
  }

  // Извлечь текст ответа из correct_answer с учётом ";"
  function answerField(raw) {
    if (raw == null) return "";
    const s = String(raw).trim();
    if (!s) return "";
    // Несколько допустимых вариантов: "75; 75 нуклеотидов"
    if (s.includes(";")) return s;
    return s;
  }

  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    const qId = q.id || String(i + 1);
    const questionText = (q.prompt || q.question_text || q.text || "").trim();

    if (!questionText) {
      errors.push({ question: qId, error: "Нет текста вопроса" });
      continue;
    }

    const answerType = q.answer_type;
    let qType = null;
    let correctText = null;
    let answers = [];
    let matchOptions = null;
    let imageNote = q.image_note || null;
    // Если есть image (путь к файлу), но нет image_note — используем image как подсказку
    if (!imageNote && q.image) imageNote = q.image;

    if (!answerType) {
      // Часть 2 — развёрнутый ответ
      qType = "open_response";
    } else if (answerType === "text" || answerType === "number") {
      qType = "text_input";
      const raw = answerField(q.correct_answer);
      if (raw.includes(";")) {
        correctText = JSON.stringify(raw.split(";").map(s => s.trim()).filter(Boolean));
      } else if (raw) {
        correctText = raw;
      }
    } else if (answerType === "digit_pairs" || answerType === "matching") {
      qType = "matching";
      // fields — левые элементы, correct_answer — строка цифр, каждая = ответ
      const fields = q.fields || [];
      const answersStr = normalizeAnswer(q.correct_answer)[0] || "";
      // Опции — цифры от 1 до максимума в ответе
      const maxDigit = Math.max(...answersStr.split("").map(Number).filter(n => !isNaN(n)), 0);
      matchOptions = Array.from({ length: maxDigit }, (_, i) => String(i + 1));
      for (let fi = 0; fi < fields.length; fi++) {
        answers.push({
          text: fields[fi],
          is_correct: 0,
          match_value: answersStr[fi] || "",
          order_index: fi,
        });
      }
      // Если нет fields, но есть промпт с А) Б) В)... — парсим
      if (answers.length === 0) {
        const letterMatches = questionText.match(/[А-Я]\)\s*([^\nА-Я]+)/g);
        if (letterMatches) {
          letterMatches.forEach((m, mi) => {
            const text = m.replace(/^[А-Я]\)\s*/, "").trim();
            answers.push({ text, is_correct: 0, match_value: answersStr[mi] || "", order_index: mi });
          });
        }
      }
    } else if (answerType === "digits_any_order") {
      qType = "multiple_select";
      const correctDigits = normalizeAnswer(q.correct_answer)[0] || "";
      const correctSet = new Set(correctDigits.split("").map(Number));
      // Извлечь варианты из промпта: "1) дисульфидный мостик\n2) нуклеотид..."
      const optMatches = questionText.match(/(\d+)\)\s*([^\n\d]+)/g);
      if (optMatches) {
        optMatches.forEach(m => {
          const match = m.match(/^(\d+)\)\s*(.+)$/);
          if (match) {
            const num = Number(match[1]);
            const text = match[2].trim();
            answers.push({ text: `${num}) ${text}`, is_correct: correctSet.has(num) ? 1 : 0, order_index: num - 1 });
          }
        });
      }
      if (answers.length === 0) {
        // Фолбэк: просто цифры
        for (let d = 1; d <= 6; d++) {
          answers.push({ text: String(d), is_correct: correctSet.has(d) ? 1 : 0, order_index: d - 1 });
        }
      }
    } else if (answerType === "sequence" || answerType === "sequence_short") {
      qType = "sequence";
      const seqStr = normalizeAnswer(q.correct_answer)[0] || "";
      // Последовательность цифр: "35124" → ["3","5","1","2","4"]
      const digits = seqStr.split("").filter(c => c >= "0" && c <= "9");
      // Извлечь тексты вариантов из промпта
      const optMatches = questionText.match(/(\d+)\)\s*([^\n\d]+)/g);
      const optMap = {};
      if (optMatches) {
        optMatches.forEach(m => {
          const match = m.match(/^(\d+)\)\s*(.+)$/);
          if (match) optMap[match[1]] = match[2].trim();
        });
      }
      digits.forEach((d, di) => {
        answers.push({
          text: optMap[d] ? `${d}) ${optMap[d]}` : d,
          is_correct: 0,
          order_index: di,
        });
      });
    } else {
      errors.push({ question: qId, error: `Неизвестный answer_type: "${answerType}"` });
      continue;
    }

    // Пояснение из answer_note или explanation
    const explanation = q.explanation || q.answer_note || null;

    questions.push({
      question_text: questionText,
      hint: q.hint || null,
      explanation,
      question_type: qType,
      image_note: imageNote,
      grading_criteria: q.grading_criteria || null,
      max_points: q.points || q.max_points || null,
      correct_text: correctText,
      match_options: matchOptions,
      answers,
    });
  }

  if (questions.length === 0) {
    return res.status(400).json({ error: "Ни один вопрос не удалось импортировать", errors });
  }

  db.exec("BEGIN");
  let testId;
  try {
    // topic: из source или exam_title
    const topic = data.source || null;
    const description = data.instructions || data.description || null;

    testId = run(
      "INSERT INTO tests (title, topic, description, category, grade, section, part, line, source, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)",
      title,
      topic,
      description,
      data.category || null,
      data.grade || null,
      data.section || null,
      data.part || null,
      data.line || null,
      data.source || null
    ).lastInsertRowid;

    questions.forEach((q, qi) => {
      let matchOptions = q.match_options ? JSON.stringify(q.match_options) : null;
      if (!matchOptions && q.correct_text) {
        try {
          const parsed = JSON.parse(q.correct_text);
          if (parsed.match_options) {
            matchOptions = JSON.stringify(parsed.match_options);
            q.correct_text = null;
          }
        } catch (_) {}
      }

      const qId = run(
        "INSERT INTO questions (test_id, question_text, hint, explanation, order_index, question_type, image_note, grading_criteria, max_points, correct_text, match_options) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        testId, q.question_text, q.hint, q.explanation, qi,
        q.question_type, q.image_note, q.grading_criteria, q.max_points,
        q.correct_text, matchOptions
      ).lastInsertRowid;

      q.answers.forEach((a, ai) =>
        run("INSERT INTO answers (question_id, answer_text, is_correct, order_index, match_value) VALUES (?, ?, ?, ?, ?)",
          qId, a.text, a.is_correct ? 1 : 0, a.order_index ?? ai, a.match_value || null)
      );
    });

    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }

  res.json({
    id: testId,
    title,
    questions_imported: questions.length,
    errors: errors.length > 0 ? errors : undefined,
  });
});

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
  const questions = all("SELECT id, test_id, question_text, hint, explanation, order_index, image_data, question_type, correct_text, match_options, image_note, grading_criteria, max_points FROM questions WHERE test_id = ? ORDER BY order_index", req.params.id);
  for (const q of questions) {
    q.answers = all("SELECT * FROM answers WHERE question_id = ? ORDER BY order_index", q.id);
  }
  res.json({ ...test, questions });
});

router.post("/tests", (req, res) => {
  const { title, topic, description, category, grade, section, part, line, source, questions = [], is_draft = 0 } = req.body;
  if (!title) return res.status(400).json({ error: "Название обязательно" });

  db.exec("BEGIN");
  let testId;
  try {
    testId = run(
      "INSERT INTO tests (title, topic, description, category, grade, section, part, line, source, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      title, topic || null, description || null, category || null, grade || null, section || null, part || null, line || null, source || null, is_draft ? 1 : 0
    ).lastInsertRowid;

    questions.forEach((q, qi) => {
      const qId = run(
        "INSERT INTO questions (test_id, question_text, hint, explanation, order_index, image_data, question_type, correct_text, match_options, image_note, grading_criteria, max_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        testId, q.text, q.hint || null, q.explanation || null, qi,
        q.image_data || null, q.question_type || "single", q.correct_text || null,
        q.match_options ? JSON.stringify(q.match_options) : null,
        q.image_note || null, q.grading_criteria || null, q.max_points || null
      ).lastInsertRowid;

      (q.answers || []).forEach((a, ai) =>
        run("INSERT INTO answers (question_id, answer_text, is_correct, order_index, match_value) VALUES (?, ?, ?, ?, ?)",
          qId, a.text, a.is_correct ? 1 : 0, ai, a.match_value || null)
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
  const { title, topic, description, category, grade, section, part, line, source, questions } = req.body;
  if (!title) return res.status(400).json({ error: "Название обязательно" });

  db.exec("BEGIN");
  try {
    run("UPDATE tests SET title = ?, topic = ?, description = ?, category = ?, grade = ?, section = ?, part = ?, line = ?, source = ? WHERE id = ?",
      title, topic || null, description || null, category || null, grade || null, section || null, part || null, line || null, source || null, req.params.id);

    if (Array.isArray(questions)) {
      run("DELETE FROM questions WHERE test_id = ?", req.params.id);
      questions.forEach((q, qi) => {
        const qId = run(
          "INSERT INTO questions (test_id, question_text, hint, explanation, order_index, image_data, question_type, correct_text, match_options, image_note, grading_criteria, max_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          req.params.id, q.text, q.hint || null, q.explanation || null, qi,
          q.image_data || null, q.question_type || "single", q.correct_text || null,
          q.match_options ? JSON.stringify(q.match_options) : null,
          q.image_note || null, q.grading_criteria || null, q.max_points || null
        ).lastInsertRowid;
        (q.answers || []).forEach((a, ai) =>
          run("INSERT INTO answers (question_id, answer_text, is_correct, order_index, match_value) VALUES (?, ?, ?, ?, ?)",
            qId, a.text, a.is_correct ? 1 : 0, ai, a.match_value || null)
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

router.post("/tests/:id/duplicate", (req, res) => {
  const test = get("SELECT * FROM tests WHERE id = ?", req.params.id);
  if (!test) return res.status(404).json({ error: "Тест не найден" });

  const questions = all("SELECT * FROM questions WHERE test_id = ? ORDER BY order_index", req.params.id);
  for (const q of questions) {
    q.answers = all("SELECT * FROM answers WHERE question_id = ? ORDER BY order_index", q.id);
  }

  db.exec("BEGIN");
  try {
    const newTestId = run(
      "INSERT INTO tests (title, topic, description, category, grade, section, part, line, source, is_draft, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      test.title + " (копия)", test.topic, test.description, test.category, test.grade, test.section, test.part, test.line, test.source, 1, 1
    ).lastInsertRowid;

    for (const q of questions) {
      const qId = run(
        "INSERT INTO questions (test_id, question_text, hint, explanation, order_index, image_data, question_type, correct_text, match_options, image_note, grading_criteria, max_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        newTestId, q.question_text, q.hint, q.explanation, q.order_index, q.image_data, q.question_type, q.correct_text, q.match_options, q.image_note, q.grading_criteria, q.max_points
      ).lastInsertRowid;

      for (const a of q.answers) {
        run("INSERT INTO answers (question_id, answer_text, is_correct, order_index, match_value) VALUES (?, ?, ?, ?, ?)",
          qId, a.answer_text, a.is_correct, a.order_index, a.match_value);
      }
    }

    db.exec("COMMIT");
    res.json({ id: newTestId });
  } catch (e) {
    db.exec("ROLLBACK");
    res.status(500).json({ error: e.message });
  }
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
           MAX(a.completed_at) AS last_attempt,
           (SELECT COUNT(*) FROM plant_collection WHERE user_id = u.id) AS plant_collection_count,
           (SELECT plant_type FROM plant_progress WHERE user_id = u.id) AS current_plant,
           (SELECT water_points FROM plant_progress WHERE user_id = u.id) AS plant_water_points
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
  db.exec("BEGIN");
  try {
    run("DELETE FROM plant_collection WHERE user_id = ?", req.params.id);
    run("DELETE FROM plant_progress WHERE user_id = ?", req.params.id);
    run("DELETE FROM attempt_answers WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ?)", req.params.id);
    run("DELETE FROM attempts WHERE user_id = ?", req.params.id);
    run("DELETE FROM users WHERE id = ? AND is_admin = 0", req.params.id);
    db.exec("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    db.exec("ROLLBACK");
    res.status(500).json({ error: e.message });
  }
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

  const plantProgress = get("SELECT plant_type, water_points, last_watered_date FROM plant_progress WHERE user_id = ?", req.params.id);
  const plantCollection = all(
    "SELECT plant_type, collected_at FROM plant_collection WHERE user_id = ? ORDER BY collected_at DESC",
    req.params.id
  );

  res.json({ student: { ...student, ...stats }, assigned, available, plant_progress: plantProgress, plant_collection: plantCollection });
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
           u.name AS user_name, t.title AS test_title, t.topic,
           SUM(CASE WHEN aa.is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
           SUM(CASE WHEN aa.is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count
    FROM attempts a
    JOIN users u ON u.id = a.user_id
    JOIN tests t ON t.id = a.test_id
    LEFT JOIN attempt_answers aa ON aa.attempt_id = a.id
    WHERE u.is_admin = 0
    GROUP BY a.id
    ORDER BY a.completed_at DESC
  `);
  res.json(results);
});

router.get("/results/:id", (req, res) => {
  const attempt = get(`
    SELECT a.id, a.score, a.max_score, a.completed_at,
           u.name AS user_name, t.title AS test_title, t.topic
    FROM attempts a
    JOIN users u ON u.id = a.user_id
    JOIN tests t ON t.id = a.test_id
    WHERE a.id = ?
  `, req.params.id);
  if (!attempt) return res.status(404).json({ error: "Попытка не найдена" });

  const questions = all(`
    SELECT q.id, q.question_text, q.question_type, q.correct_text, q.explanation, q.order_index
    FROM questions q
    WHERE q.test_id = (SELECT test_id FROM attempts WHERE id = ?)
    ORDER BY q.order_index
  `, req.params.id);

  const attemptAnswers = all(`
    SELECT aa.question_id, aa.answer_id, aa.answer_text, aa.is_correct
    FROM attempt_answers aa
    WHERE aa.attempt_id = ?
  `, req.params.id);

  const answersMap = {};
  for (const q of questions) {
    answersMap[q.id] = all(
      "SELECT id, answer_text, is_correct, order_index, match_value FROM answers WHERE question_id = ? ORDER BY order_index",
      q.id
    );
  }

  const enriched = questions.map(q => {
    const studentAnswers = attemptAnswers.filter(a => a.question_id === q.id);
    const allAnswers = answersMap[q.id] || [];
    const qType = q.question_type || "single";

    let studentAnswer = null;
    let correctAnswer = null;

    if (qType === "single") {
      const sa = studentAnswers[0];
      studentAnswer = sa ? allAnswers.find(a => a.id === sa.answer_id) : null;
      correctAnswer = allAnswers.find(a => a.is_correct === 1);
    } else if (qType === "text_input") {
      studentAnswer = { answer_text: studentAnswers[0]?.answer_text || "" };
      let raw = (q.correct_text || "").trim();
      let accepted = [];
      try { const p = JSON.parse(raw); if (Array.isArray(p)) accepted = p.map(String); } catch (_) {}
      if (accepted.length === 0 && raw) accepted = [raw];
      correctAnswer = { answer_text: accepted.join(", ") };
    } else if (qType === "multiple_select") {
      const selectedIds = (studentAnswers[0]?.answer_text || "").split(",").map(Number).filter(Boolean);
      studentAnswer = allAnswers.filter(a => selectedIds.includes(a.id));
      correctAnswer = allAnswers.filter(a => a.is_correct === 1);
    } else if (qType === "sequence") {
      const studentOrder = (studentAnswers[0]?.answer_text || "").split(",").map(Number).filter(Boolean);
      studentAnswer = studentOrder.map(id => allAnswers.find(a => a.id === id)).filter(Boolean);
      correctAnswer = [...allAnswers].sort((a, b) => a.order_index - b.order_index);
    } else if (qType === "matching" || qType === "fill_blanks") {
      const matches = {};
      for (const sa of studentAnswers) {
        if (sa.answer_id) matches[sa.answer_id] = sa.answer_text;
      }
      studentAnswer = allAnswers.map(a => ({
        id: a.id,
        answer_text: a.answer_text,
        match_value: a.match_value,
        student_selected: matches[a.id] || null,
        is_correct: matches[a.id] === a.match_value ? 1 : 0,
      }));
      correctAnswer = allAnswers.map(a => ({ id: a.id, match_value: a.match_value }));
    } else if (qType === "open_response") {
      studentAnswer = { answer_text: studentAnswers[0]?.answer_text || "" };
      correctAnswer = null;
    }

    return {
      question_id: q.id,
      question_text: q.question_text,
      question_type: qType,
      explanation: q.explanation,
      is_correct: studentAnswers.length > 0 ? studentAnswers[0].is_correct : 0,
      student_answer: studentAnswer,
      correct_answer: correctAnswer,
      all_answers: qType !== "text_input" ? allAnswers : undefined,
    };
  });

  res.json({ attempt, questions: enriched });
});

router.delete("/results/:id", (req, res) => {
  run("DELETE FROM attempts WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

router.delete("/results", (req, res) => {
  const { confirm } = req.body;
  if (confirm !== "DELETE_ALL") {
    return res.status(400).json({ error: 'Отправьте { "confirm": "DELETE_ALL" } для подтверждения' });
  }
  run("DELETE FROM attempts");
  res.json({ ok: true });
});

// ── Бэкап / Восстановление ────────────────────────────────────────────────────

router.get("/backup", (req, res) => {
  try { db.exec("PRAGMA wal_checkpoint(TRUNCATE)"); } catch (_) {}
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Disposition", `attachment; filename="biology-backup-${date}.zip"`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", { zlib: { level: 6 } });
  archive.on("error", (err) => {
    console.error("Backup archive error:", err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  });
  archive.pipe(res);

  if (fs.existsSync(DB_PATH)) {
    archive.file(DB_PATH, { name: "biology.db" });
  }

  const uploadsDir = path.join(__dirname, "..", "..", "data", "uploads");
  if (fs.existsSync(uploadsDir)) {
    archive.directory(uploadsDir, "uploads");
  }

  archive.finalize();
});

const unzipper = require("unzipper");

router.post("/restore", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "Нет данных" });
  const buffer = Buffer.from(data, "base64");
  if (buffer.length < 100) return res.status(400).json({ error: "Файл повреждён" });

  try { db.close(); } catch (_) {}
  try { fs.copyFileSync(DB_PATH, DB_PATH + ".bak"); } catch (_) {}

  const uploadsDir = path.join(__dirname, "..", "..", "data", "uploads");

  if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
    const tmpZip = DB_PATH + ".tmp.zip";
    fs.writeFileSync(tmpZip, buffer);
    fs.createReadStream(tmpZip)
      .pipe(unzipper.Extract({ path: path.join(__dirname, "..", "..", "data") }))
      .on("close", () => {
        try { fs.unlinkSync(tmpZip); } catch (_) {}
        res.json({ ok: true });
        setTimeout(() => { process.kill(process.pid, "SIGTERM"); }, 300);
      })
      .on("error", (err) => {
        try { fs.unlinkSync(tmpZip); } catch (_) {}
        res.status(500).json({ error: "Ошибка распаковки: " + err.message });
      });
  } else {
    fs.writeFileSync(DB_PATH, buffer);
    res.json({ ok: true });
    setTimeout(() => { process.kill(process.pid, "SIGTERM"); }, 300);
  }
});

// ── Разделы ───────────────────────────────────────────────────────────────────
router.get("/sections", (req, res) => {
  res.json(all("SELECT * FROM sections ORDER BY name"));
});
router.post("/sections", (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Название обязательно" });
  try {
    const r = run("INSERT INTO sections (name) VALUES (?)", name.trim());
    res.json(get("SELECT * FROM sections WHERE id = ?", r.lastInsertRowid));
  } catch { res.status(409).json({ error: "Раздел уже существует" }); }
});
router.put("/sections/:id", (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Название обязательно" });
  try {
    run("UPDATE sections SET name = ? WHERE id = ?", name.trim(), req.params.id);
    res.json({ ok: true });
  } catch { res.status(409).json({ error: "Такой раздел уже существует" }); }
});
router.delete("/sections/:id", (req, res) => {
  run("DELETE FROM sections WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

// ── Темы ──────────────────────────────────────────────────────────────────────
router.get("/topics", (req, res) => {
  res.json(all("SELECT * FROM topics ORDER BY name"));
});
router.post("/topics", (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Название обязательно" });
  try {
    const r = run("INSERT INTO topics (name) VALUES (?)", name.trim());
    res.json(get("SELECT * FROM topics WHERE id = ?", r.lastInsertRowid));
  } catch { res.status(409).json({ error: "Тема уже существует" }); }
});
router.put("/topics/:id", (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Название обязательно" });
  try {
    run("UPDATE topics SET name = ? WHERE id = ?", name.trim(), req.params.id);
    res.json({ ok: true });
  } catch { res.status(409).json({ error: "Такая тема уже существует" }); }
});
router.delete("/topics/:id", (req, res) => {
  run("DELETE FROM topics WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

module.exports = router;

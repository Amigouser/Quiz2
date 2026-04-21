const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "biology.db"));

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    topic TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    is_draft INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    hint TEXT,
    explanation TEXT,
    order_index INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    test_id INTEGER REFERENCES tests(id),
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    completed_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attempt_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER REFERENCES attempts(id) ON DELETE CASCADE,
    question_id INTEGER,
    answer_id INTEGER,
    is_correct INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS test_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
    assigned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, test_id)
  );

  CREATE TABLE IF NOT EXISTS flashcard_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    topic TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS flashcard_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS flashcard_set_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    assigned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, set_id)
  );
`);

function n(v) {
  return typeof v === "bigint" ? Number(v) : v;
}

function run(sql, ...params) {
  const stmt = db.prepare(sql);
  const r = stmt.run(...params);
  return { lastInsertRowid: n(r.lastInsertRowid), changes: n(r.changes) };
}

function get(sql, ...params) {
  return db.prepare(sql).get(...params) || null;
}

function all(sql, ...params) {
  return db.prepare(sql).all(...params);
}

// ── Миграции ──────────────────────────────────────────────────────────────────
try { db.exec("ALTER TABLE users ADD COLUMN code TEXT"); } catch (_) {}
try { db.exec("ALTER TABLE users ADD COLUMN group_name TEXT"); } catch (_) {}
// Создать коды для существующих учеников без кода
(function generateMissingCodes() {
  const users = all("SELECT id FROM users WHERE code IS NULL AND is_admin = 0");
  for (const u of users) {
    let code;
    do { code = String(Math.floor(10000000 + Math.random() * 90000000)); }
    while (get("SELECT id FROM users WHERE code = ?", code));
    run("UPDATE users SET code = ? WHERE id = ?", code, u.id);
  }
})();

function seed() {
  const adminExists = get("SELECT id FROM users WHERE name = 'admin'");
  if (adminExists) return;

  run("INSERT INTO users (name, is_admin) VALUES ('admin', 1)");

  const testId = run(
    "INSERT INTO tests (title, topic, description) VALUES (?, ?, ?)",
    "Строение растительной клетки",
    "Ботаника",
    "Проверяем знание основных органелл и их функций в растительной клетке."
  ).lastInsertRowid;

  const questionsData = [
    {
      text: "Какая структура отличает растительную клетку от животной?",
      hint: "Подсказка: отвечает за фотосинтез.",
      explanation: "Хлоропласты содержат хлорофилл и осуществляют фотосинтез. Их нет в животных клетках.",
      answers: [
        { text: "Митохондрия", is_correct: 0 },
        { text: "Хлоропласт", is_correct: 1 },
        { text: "Рибосома", is_correct: 0 },
        { text: "Аппарат Гольджи", is_correct: 0 },
      ],
    },
    {
      text: "Какую функцию выполняет клеточная стенка у растений?",
      hint: null,
      explanation: "Клеточная стенка из целлюлозы — жёсткий каркас, защищающий клетку и задающий форму.",
      answers: [
        { text: "Обеспечивает движение клетки", is_correct: 0 },
        { text: "Хранит генетическую информацию", is_correct: 0 },
        { text: "Придаёт клетке форму и защиту", is_correct: 1 },
        { text: "Синтезирует белки", is_correct: 0 },
      ],
    },
    {
      text: "Что находится в центральной вакуоли зрелой растительной клетки?",
      hint: null,
      explanation: "Крупная центральная вакуоль заполнена клеточным соком — раствором сахаров, солей и пигментов.",
      answers: [
        { text: "Клеточный сок", is_correct: 1 },
        { text: "ДНК", is_correct: 0 },
        { text: "Ферменты пищеварения", is_correct: 0 },
        { text: "Хлорофилл", is_correct: 0 },
      ],
    },
  ];

  questionsData.forEach((q, qi) => {
    const qId = run(
      "INSERT INTO questions (test_id, question_text, hint, explanation, order_index) VALUES (?, ?, ?, ?, ?)",
      testId, q.text, q.hint, q.explanation, qi
    ).lastInsertRowid;

    q.answers.forEach((a, ai) =>
      run("INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)",
        qId, a.text, a.is_correct, ai)
    );
  });
}

seed();

module.exports = { db, run, get, all };

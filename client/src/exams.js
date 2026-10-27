// ─── Пробники ОГЭ / ЕГЭ по биологии ─────────────────────────────────────────
// Структура и баллы — по спецификациям ФИПИ 2026. Если ФИПИ поменяет
// формат, правится только этот файл (и server/utils/scoring.js для правил подсчёта).

// Баллы за каждое задание по порядку
const OGE_POINTS = [
  1, 1, 1, 2, 2, 1, 2, 1, 2, 2, 2, 1, 3, 1, 1, 2, 2, 2, 2, 1, 2, // часть 1: 1–21
  2, 2, 3, 3, 3,                                                    // часть 2: 22–26
];
const EGE_ONE_POINT = new Set([1, 3, 4, 5, 9, 13]);
const EGE_POINTS = [
  ...Array.from({ length: 21 }, (_, i) => (EGE_ONE_POINT.has(i + 1) ? 1 : 2)), // часть 1: 1–21
  ...Array(7).fill(3),                                                          // часть 2: 22–28
];

// Перевод первичных баллов ЕГЭ в тестовые (индекс = первичный балл), Рособрнадзор 2026
const EGE_SCALE = [
  0, 3, 5, 7, 10, 12, 14, 17, 19, 21, 24, 26, 28, 31, 33, 36, 38, 40, 41, 43,
  45, 46, 48, 50, 51, 53, 55, 56, 58, 60, 61, 63, 65, 66, 68, 70, 71, 72, 73, 74,
  75, 76, 77, 78, 79, 80, 81, 83, 85, 86, 88, 90, 91, 93, 95, 96, 98, 100,
];

export const MOCK_EXAMS = {
  "ОГЭ": { points: OGE_POINTS, part1: 21, grade: "9 класс" },
  "ЕГЭ": { points: EGE_POINTS, part1: 21, grade: "11 класс" },
};

// Длительность экзамена, минуты
export const EXAM_MINUTES = { "ОГЭ": 150, "ЕГЭ": 235 };

export const mockMaxScore = (exam) => (MOCK_EXAMS[exam]?.points || []).reduce((s, p) => s + p, 0);

// ОГЭ: оценка по первичному баллу (0–12 → 2, 13–25 → 3, 26–37 → 4, 38+ → 5)
export function ogeGrade(primary) {
  if (primary >= 38) return 5;
  if (primary >= 26) return 4;
  if (primary >= 13) return 3;
  return 2;
}

export function egeTestScore(primary) {
  const p = Math.max(0, Math.min(EGE_SCALE.length - 1, Math.round(primary)));
  return EGE_SCALE[p];
}

// Шаблон вопросов пробника: задание N с нужными баллами и типом
// (часть 1 — краткий ответ цифрами, часть 2 — развёрнутый ответ, проверяет репетитор)
export function buildMockQuestions(exam, makeEmpty) {
  const cfg = MOCK_EXAMS[exam];
  if (!cfg) return [];
  return cfg.points.map((points, i) => {
    const n = i + 1;
    const isPart2 = n > cfg.part1;
    return {
      ...makeEmpty(),
      id: Date.now() + Math.random() + i,
      text: "",
      question_type: isPart2 ? "open_response" : "text_input",
      max_points: points,
      text_answers: isPart2 ? undefined : [""],
      expand: n === 1,
      mock_task: n,
    };
  });
}

// ─── Подсчёт баллов в браузере (гостевые тесты, предпросмотр) ────────────────
// Правила те же, что в server/utils/scoring.js.
const NO_CREDIT = Infinity;
const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
const compact = (s) => norm(s).replace(/[\s,.;]+/g, "");

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function acceptedAnswers(correctText) {
  const raw = String(correctText ?? "").trim();
  try { const p = JSON.parse(raw); if (Array.isArray(p)) return p.map(String).filter((s) => s.trim()); } catch (_) {}
  return raw ? [raw] : [];
}

function textErrors(given, correctText) {
  const g = compact(given);
  if (!g) return NO_CREDIT;
  let best = NO_CREDIT;
  for (const acc of acceptedAnswers(correctText)) {
    if (norm(acc) === norm(given) || compact(acc) === g) return 0;
    const a = compact(acc);
    if (/^\d+$/.test(a) && /^\d+$/.test(g)) best = Math.min(best, levenshtein(a, g));
  }
  return best;
}

function setErrors(selected, correct) {
  const sel = new Set(selected), cor = new Set(correct);
  if (sel.size === 0) return NO_CREDIT;
  return Math.max([...sel].filter((x) => !cor.has(x)).length, [...cor].filter((x) => !sel.has(x)).length);
}

function orderErrors(given, correct) {
  if (given.length === 0) return NO_CREDIT;
  let misplaced = Math.abs(given.length - correct.length);
  for (let i = 0; i < Math.min(given.length, correct.length); i++) if (given[i] !== correct[i]) misplaced++;
  return Math.ceil(misplaced / 2);
}

function pointsFor(errors, maxPoints) {
  const max = Number(maxPoints) > 0 ? Number(maxPoints) : 1;
  if (errors === 0) return max;
  if (max === 1 || errors === NO_CREDIT) return 0;
  return Math.max(0, max - errors);
}

// q — вопрос в формате QuizClassic, a — запись ответа из QuizClassic
export function scoreAnswer(q, a) {
  const max = q.max_points || 1;
  const type = q.question_type || "single";
  if (!a) return { points: 0, max, pending: type === "open_response" };
  if (type === "open_response") return { points: 0, max, pending: true };
  let errors = NO_CREDIT;
  if (type === "text_input") errors = textErrors(a.typed, q.correct_text);
  else if (type === "multiple_select") errors = setErrors(a.selected || [], q.correct_indices || []);
  else if (type === "sequence") errors = orderErrors(a.order || [], (q.options || []).map((_, i) => i));
  else if (type === "matching" || type === "fill_blanks") {
    const items = q._matchAnswers || [];
    errors = items.length ? items.filter((it) => (a.matches || {})[it.id] !== it.match_value).length : NO_CREDIT;
  } else errors = a.picked === q.correct ? 0 : NO_CREDIT;
  return { points: pointsFor(errors, max), max, pending: false };
}

// Итог по всему тесту
export function scoreQuiz(quiz, answers) {
  let score = 0, max = 0, pending = false;
  quiz.questions.forEach((q, i) => {
    const r = scoreAnswer(q, answers[i]);
    score += r.points; max += r.max; pending = pending || r.pending;
  });
  return { score, max_score: max, status: pending ? "pending_review" : "graded" };
}

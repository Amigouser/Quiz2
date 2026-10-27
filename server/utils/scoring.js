// ─── Подсчёт баллов за задание ───────────────────────────────────────────────
// Логика продублирована в client/src/exams.js (гостевые тесты считаются в браузере) —
// меняя правила здесь, поменяй и там.
//
// Задание стоит max_points баллов (по умолчанию 1).
//  • 1-балльное — всё или ничего.
//  • 2-3-балльное — как в ОГЭ/ЕГЭ: за каждую ошибку минус балл (не ниже нуля).

const NO_CREDIT = Infinity;

function normalizeText(s) {
  return String(s ?? "").trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
}

// Ответ из цифр/букв без разделителей: «2, 4, 5» → «245»
function compact(s) {
  return normalizeText(s).replace(/[\s,.;]+/g, "");
}

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
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter((s) => s.trim());
  } catch (_) {}
  return raw ? [raw] : [];
}

// Ошибки в текстовом ответе: точное совпадение — 0; для ответов из цифр
// считаем, сколько символов надо исправить (одна неверная/лишняя/пропущенная цифра — одна ошибка).
function textErrors(given, correctText) {
  const g = compact(given);
  if (!g) return NO_CREDIT;
  let best = NO_CREDIT;
  for (const acc of acceptedAnswers(correctText)) {
    if (normalizeText(acc) === normalizeText(given) || compact(acc) === g) return 0;
    const a = compact(acc);
    if (/^\d+$/.test(a) && /^\d+$/.test(g)) best = Math.min(best, levenshtein(a, g));
  }
  return best;
}

function setErrors(selected, correct) {
  const sel = new Set(selected), cor = new Set(correct);
  if (sel.size === 0) return NO_CREDIT;
  const extra = [...sel].filter((x) => !cor.has(x)).length;
  const missing = [...cor].filter((x) => !sel.has(x)).length;
  return Math.max(extra, missing);
}

// Перестановка двух элементов = одна ошибка
function orderErrors(given, correct) {
  if (given.length === 0) return NO_CREDIT;
  let misplaced = Math.abs(given.length - correct.length);
  const n = Math.min(given.length, correct.length);
  for (let i = 0; i < n; i++) if (given[i] !== correct[i]) misplaced++;
  return Math.ceil(misplaced / 2);
}

function pointsFor(errors, maxPoints) {
  const max = Number(maxPoints) > 0 ? Number(maxPoints) : 1;
  if (errors === 0) return max;
  if (max === 1 || errors === NO_CREDIT) return 0;
  return Math.max(0, max - errors);
}

module.exports = { NO_CREDIT, textErrors, setErrors, orderErrors, pointsFor };

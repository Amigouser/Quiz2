import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Leaf, Fern } from "../botanical";

const TG_LINK  = "https://t.me/vikokon";
const VK_LINK  = "https://vk.com/public219644318";
const LIMIT    = 3; // порог для тестов И для карточек

const TOPIC_ICONS = {
  "Цитология": "🔬", "Генетика": "🧬", "Зоология": "🦎",
  "Ботаника": "🌿", "Биохимия": "🧪", "Микробиология": "🦠",
  "Биология": "🌱", "Анатомия": "🫀", "Экология": "🌍",
};

// Встроенные категории, разделы, части (должны совпадать со списками в admin.jsx)
const CATEGORY_OPTIONS = ["9 класс", "10 класс", "11 класс", "ОГЭ", "ЕГЭ", "ВПР"];
const PART_OPTIONS = ["Часть 1", "Часть 2"];
const SECTION_OPTIONS = [
  "Биология как наука. Методы. Уровни организации",
  "Строение клетки",
  "Биохимия клетки",
  "Метаболизм клетки",
  "Клеточный цикл",
  "Размножение и развитие",
  "Прокариоты и вирусы",
  "Грибы и лишайники",
  "Растения",
  "Животные",
  "Человек",
  "Эволюция",
  "Экология",
  "Генетика",
];

function getDone() {
  return {
    tests: Number(localStorage.getItem("g_tests") || 0),
    cards: Number(localStorage.getItem("g_cards") || 0),
  };
}
function bumpTests() { const n = getDone().tests + 1; localStorage.setItem("g_tests", n); return n; }
function bumpCards() { const n = getDone().cards + 1; localStorage.setItem("g_cards", n); return n; }

// ── Модалка лимита ────────────────────────────────────────────────────────────
function LimitModal() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(10,25,18,0.82)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "var(--surface)", borderRadius: 28,
        border: "1.5px solid var(--border-soft)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        maxWidth: 480, width: "100%", padding: "40px 40px 36px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🌿</div>
        <h2 style={{
          fontFamily: "var(--f-serif)", fontSize: 26,
          lineHeight: 1.2, marginBottom: 16,
        }}>
          Привет! Я репетитор<br/>по биологии
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 28 }}>
          Готовлю к ОГЭ и ЕГЭ — понятно, системно, с результатом.<br/>
          Ты прошёл несколько заданий — давай спишемся и продолжим уже по‑настоящему! 🙌
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <a href={TG_LINK} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px 24px", borderRadius: 999,
              background: "#2aabee", color: "#fff",
              fontWeight: 700, fontSize: 15, textDecoration: "none",
              transition: "opacity 0.18s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <span style={{ fontSize: 20 }}>✈️</span> Написать в Telegram
          </a>
          <a href={VK_LINK} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px 24px", borderRadius: 999,
              background: "#4680c2", color: "#fff",
              fontWeight: 700, fontSize: 15, textDecoration: "none",
              transition: "opacity 0.18s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <span style={{ fontSize: 20 }}>🔗</span> ВКонтакте
          </a>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Никитенко Виктория Юрьевна · Репетитор по биологии · ТГУ
        </p>
      </div>
    </div>
  );
}

// ── Встроенный квиз ───────────────────────────────────────────────────────────
function GuestQuiz({ quiz, onFinish, onClose }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplain, setShowExplain] = useState(false);
  const [done, setDone] = useState(false);

  const q = quiz.questions[step];
  const total = quiz.questions.length;
  const score = answers.filter(Boolean).length;

  function choose(idx) {
    if (picked !== null) return;
    setPicked(idx);
    setShowExplain(true);
  }

  function next() {
    const correct = picked === q.correct_index;
    const newAnswers = [...answers, correct];
    if (step + 1 >= total) {
      setAnswers(newAnswers);
      setDone(true);
    } else {
      setAnswers(newAnswers);
      setStep(step + 1);
      setPicked(null);
      setShowExplain(false);
    }
  }

  if (done) {
    const finalScore = answers.filter(Boolean).length;
    return (
      <div style={overlayStyle}>
        <div style={panelStyle}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>
              {finalScore === total ? "🏆" : finalScore >= total / 2 ? "👍" : "📚"}
            </div>
            <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 24, marginBottom: 8 }}>
              {quiz.title}
            </h2>
            <div style={{ fontSize: 40, fontFamily: "var(--f-serif)", color: "var(--green-800)", fontWeight: 600 }}>
              {finalScore} / {total}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
              {finalScore === total ? "Отлично!" : finalScore >= total / 2 ? "Хороший результат" : "Нужно повторить"}
            </div>
          </div>
          <button
            style={btnGreen}
            onClick={onFinish}
          >
            Готово
          </button>
          <button style={btnGhost} onClick={onClose}>Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={{ ...panelStyle, maxWidth: 600 }}>
        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 22 }}>✕</button>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {step + 1} / {total}
          </div>
          <div style={{ fontSize: 13, color: "var(--green-800)", fontWeight: 600 }}>
            {quiz.topic}
          </div>
        </div>

        <div style={{
          height: 4, background: "var(--border-soft)", borderRadius: 99, marginBottom: 28, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "var(--green-600)",
            width: `${((step + 1) / total) * 100}%`,
            transition: "width 0.4s",
          }} />
        </div>

        <h3 style={{ fontFamily: "var(--f-serif)", fontSize: 20, lineHeight: 1.4, marginBottom: 24 }}>
          {q.text}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {q.answers.map((a, i) => {
            let bg = "var(--surface)";
            let border = "var(--border-soft)";
            let color = "var(--text)";
            if (picked !== null) {
              if (i === q.correct_index) { bg = "#d1fae5"; border = "var(--green-500)"; color = "#065f46"; }
              else if (i === picked) { bg = "#fee2e2"; border = "#f87171"; color = "#991b1b"; }
            }
            return (
              <div key={i} onClick={() => choose(i)} style={{
                padding: "14px 18px", borderRadius: 14,
                border: `1.5px solid ${border}`,
                background: bg, color, cursor: picked === null ? "pointer" : "default",
                fontSize: 15, lineHeight: 1.4,
                transition: "background 0.2s, border-color 0.2s",
              }}>
                {a.text}
              </div>
            );
          })}
        </div>

        {showExplain && q.explanation && (
          <div style={{
            padding: "12px 16px", borderRadius: 12,
            background: "var(--green-50)", border: "1px solid var(--green-200)",
            fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, marginBottom: 16,
          }}>
            💡 {q.explanation}
          </div>
        )}

        {picked !== null && (
          <button style={btnGreen} onClick={next}>
            {step + 1 >= total ? "Завершить" : "Следующий →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Встроенный просмотр карточек ──────────────────────────────────────────────
function GuestCards({ set, onFinish, onClose }) {
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const card = set.cards[step];
  const total = set.cards.length;

  function next() {
    if (step + 1 >= total) {
      setDone(true);
    } else {
      setStep(step + 1);
      setFlipped(false);
    }
  }

  if (done) {
    return (
      <div style={overlayStyle}>
        <div style={panelStyle}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🃏</div>
            <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 24, marginBottom: 8 }}>
              {set.title}
            </h2>
            <div style={{ fontSize: 16, color: "var(--text-soft)" }}>
              Все {total} карточек пройдено!
            </div>
          </div>
          <button style={btnGreen} onClick={onFinish}>Готово</button>
          <button style={btnGhost} onClick={onClose}>Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={{ ...panelStyle, maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 22 }}>✕</button>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{step + 1} / {total}</div>
          <div style={{ fontSize: 13, color: "var(--green-800)", fontWeight: 600 }}>{set.topic || "Карточки"}</div>
        </div>

        <div style={{
          height: 4, background: "var(--border-soft)", borderRadius: 99, marginBottom: 28, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "var(--green-600)",
            width: `${((step + 1) / total) * 100}%`,
            transition: "width 0.4s",
          }} />
        </div>

        {/* Карточка */}
        <div
          onClick={() => setFlipped(f => !f)}
          style={{
            minHeight: 200, borderRadius: 20,
            border: "1.5px solid var(--border-soft)",
            background: flipped ? "linear-gradient(135deg, var(--green-100), var(--green-200))" : "var(--surface)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "32px 28px", cursor: "pointer",
            textAlign: "center", marginBottom: 20,
            transition: "background 0.3s",
            userSelect: "none",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            {flipped ? "Определение" : "Термин"}
          </div>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, lineHeight: 1.4, color: flipped ? "var(--green-900)" : "var(--text)" }}>
            {flipped ? card.definition : card.term}
          </div>
          {!flipped && (
            <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
              Нажми чтобы перевернуть
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btnGhost, flex: 1 }} onClick={() => setFlipped(f => !f)}>
            {flipped ? "Скрыть" : "Показать"}
          </button>
          <button style={{ ...btnGreen, flex: 1 }} onClick={next}>
            {step + 1 >= total ? "Завершить" : "Следующая →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Стили ─────────────────────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed", inset: 0, zIndex: 500,
  background: "rgba(10,25,18,0.7)", backdropFilter: "blur(6px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 24,
};

const panelStyle = {
  background: "var(--surface)", borderRadius: 24,
  border: "1.5px solid var(--border-soft)",
  boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
  maxWidth: 480, width: "100%", padding: "32px 32px 28px",
};

const btnGreen = {
  display: "block", width: "100%",
  padding: "14px 24px", borderRadius: 999,
  background: "var(--green-800)", color: "#fff",
  fontWeight: 700, fontSize: 15, border: "none",
  cursor: "pointer", marginBottom: 10,
};

const btnGhost = {
  display: "block", width: "100%",
  padding: "12px 24px", borderRadius: 999,
  background: "transparent", color: "var(--text-soft)",
  fontWeight: 600, fontSize: 14,
  border: "1.5px solid var(--border-soft)",
  cursor: "pointer",
};

// ── Дропдаун-фильтр ───────────────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: "none", WebkitAppearance: "none",
          padding: "9px 36px 9px 16px",
          borderRadius: 999,
          border: value ? "1.5px solid var(--green-600)" : "1.5px solid var(--border-soft)",
          background: value ? "var(--green-100)" : "var(--surface)",
          color: value ? "var(--green-900)" : "var(--text-soft)",
          fontSize: 14, fontFamily: "var(--f-sans)", fontWeight: value ? 600 : 400,
          cursor: "pointer", outline: "none",
        }}
      >
        <option value="">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────────────────────────
export default function TasksPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [cardSets, setCardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeCards, setActiveCards] = useState(null);
  const [showLimit, setShowLimit] = useState(false);

  const [catFilter, setCatFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [lineFilter, setLineFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      API.getPublicTests().catch(() => []),
      API.getPublicCardSets().catch(() => []),
    ]).then(([t, c]) => {
      setTests(t);
      setCardSets(c);
      setLoading(false);
    });
  }, []);

  const dataSections = [...new Set([...tests.map(t => t.section), ...cardSets.map(c => c.section)].filter(Boolean))];
  const uniqueSections = [
    ...SECTION_OPTIONS,
    ...dataSections.filter(s => !SECTION_OPTIONS.includes(s)).sort(),
  ];
  const dataCategories = [...new Set([...tests.map(t => t.category), ...cardSets.map(c => c.category)].filter(Boolean))];
  const uniqueCategories = [
    ...CATEGORY_OPTIONS,
    ...dataCategories.filter(c => !CATEGORY_OPTIONS.includes(c)).sort(),
  ];
  const uniqueTopics  = [...new Set([...tests.map(t => t.topic),   ...cardSets.map(c => c.topic)].filter(Boolean))].sort();
  const dataParts = [...new Set([...tests.map(t => t.part), ...cardSets.map(c => c.part)].filter(Boolean))];
  const uniqueParts = [
    ...PART_OPTIONS,
    ...dataParts.filter(p => !PART_OPTIONS.includes(p)).sort(),
  ];
  const uniqueLines   = [...new Set([...tests.map(t => t.line),    ...cardSets.map(c => c.line)].filter(Boolean))].sort((a, b) => +a - +b);
  const uniqueSources = [...new Set([...tests.map(t => t.source),  ...cardSets.map(c => c.source)].filter(Boolean))].sort();
  const hasFilters = catFilter || sectionFilter || topicFilter || partFilter || lineFilter || sourceFilter || search;

  function applyFilters(items) {
    return items.filter(item => {
      if (catFilter && item.category !== catFilter) return false;
      if (sectionFilter && item.section !== sectionFilter) return false;
      if (topicFilter && item.topic !== topicFilter) return false;
      if (partFilter && item.part !== partFilter) return false;
      if (lineFilter && item.line !== lineFilter) return false;
      if (sourceFilter && item.source !== sourceFilter) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  function resetFilters() {
    setCatFilter(""); setSectionFilter(""); setTopicFilter(""); setPartFilter("");
    setLineFilter(""); setSourceFilter(""); setSearch("");
  }

  function checkLimit(t, c) {
    if (t >= LIMIT && c >= LIMIT) setShowLimit(true);
  }

  async function openTest(id) {
    const quiz = await API.getPublicTest(id).catch(() => null);
    if (quiz) setActiveQuiz(quiz);
  }

  async function openCards(id) {
    const set = await API.getPublicCardSet(id).catch(() => null);
    if (set) setActiveCards(set);
  }

  function handleQuizFinish() {
    const t = bumpTests();
    const { cards: c } = getDone();
    setActiveQuiz(null);
    checkLimit(t, c);
  }

  function handleCardsFinish() {
    const c = bumpCards();
    const { tests: t } = getDone();
    setActiveCards(null);
    checkLimit(t, c);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--f-sans)" }}>

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(15,42,30,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => navigate("/")} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}>
          <img src="/tutor2.jpg" alt="Vikokon" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(255,255,255,0.18)" }} />
          <span style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 16, color: "#fff" }}>
            Vikokon
          </span>
        </button>

        <button onClick={() => navigate("/login")} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 22px", borderRadius: 999,
          background: "#b7e4c7", color: "#0f2a1e",
          fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer",
        }}>
          Войти в кабинет
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 48px 80px" }}>

        {/* Title */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: "inline-block", background: "var(--green-100)",
            color: "var(--green-800)", borderRadius: 999,
            padding: "5px 16px", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
          }}>
            Задания
          </div>
          <h1 style={{
            fontFamily: "var(--f-serif)", fontSize: "clamp(30px, 3vw, 48px)",
            lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12,
          }}>
            Тесты и карточки<br/>
            <em style={{ color: "var(--green-800)" }}>по биологии</em>
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-soft)", lineHeight: 1.7 }}>
            Попробуй бесплатно — никакой регистрации не нужно.
          </p>
        </div>

        {/* Фильтры */}
        <div style={{ marginBottom: 36, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <FilterSelect label="Категория" value={catFilter} onChange={setCatFilter} options={uniqueCategories} />
          <FilterSelect label="Раздел" value={sectionFilter} onChange={setSectionFilter} options={uniqueSections} />
          {uniqueTopics.length > 0 && (
            <FilterSelect label="Тема" value={topicFilter} onChange={setTopicFilter} options={uniqueTopics} />
          )}
          <FilterSelect label="Часть" value={partFilter} onChange={setPartFilter} options={uniqueParts} />
          {uniqueLines.length > 0 && (
            <FilterSelect label="Линия" value={lineFilter} onChange={setLineFilter} options={uniqueLines} />
          )}
          {uniqueSources.length > 0 && (
            <FilterSelect label="Источник" value={sourceFilter} onChange={setSourceFilter} options={uniqueSources} />
          )}
          <div style={{ position: "relative" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..."
              style={{
                padding: "9px 16px 9px 38px", borderRadius: 999,
                border: "1.5px solid var(--border-soft)",
                background: "var(--surface)", fontSize: 14, outline: "none",
                fontFamily: "var(--f-sans)", minWidth: 180,
              }}
            />
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          {hasFilters && (
            <button onClick={resetFilters} style={{
              padding: "9px 16px", borderRadius: 999, fontSize: 13,
              border: "1.5px solid var(--border-soft)", background: "transparent",
              color: "var(--text-muted)", cursor: "pointer",
            }}>
              Сбросить
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)", fontSize: 16 }}>Загрузка…</div>
        ) : (
          <>
            {/* Тесты */}
            {applyFilters(tests).length > 0 && (
              <div style={{ marginBottom: 64 }}>
                <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 24, marginBottom: 24, letterSpacing: "-0.01em" }}>Тесты</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {applyFilters(tests).map((test) => (
                    <div key={test.id} onClick={() => openTest(test.id)} style={{
                      borderRadius: 20, overflow: "hidden",
                      border: "1.5px solid var(--border-soft)",
                      background: "var(--surface)", boxShadow: "var(--sh-sm)",
                      cursor: "pointer",
                      transition: "transform 0.25s cubic-bezier(0.22,0.8,0.32,1), box-shadow 0.25s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(26,52,36,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--sh-sm)"; }}
                    >
                      <div style={{
                        height: 110,
                        background: "linear-gradient(135deg, var(--green-100) 0%, var(--green-200) 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 44, position: "relative", overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", inset: 0, color: "var(--green-700)", opacity: 0.1 }}>
                          <Fern size={160} style={{ position: "absolute", top: -20, right: -20 }} />
                        </div>
                        <span style={{ position: "relative" }}>{TOPIC_ICONS[test.topic] || "🌱"}</span>
                      </div>
                      <div style={{ padding: "16px 18px" }}>
                        <div style={{
                          display: "inline-block", background: "var(--green-100)",
                          color: "var(--green-800)", borderRadius: 999,
                          padding: "2px 10px", fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8,
                        }}>
                          {test.topic}
                        </div>
                        <div style={{ fontFamily: "var(--f-serif)", fontSize: 17, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>
                          {test.title}
                        </div>
                        {test.description && (
                          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10 }}>
                            {test.description}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {test.questions_count} вопр. · ~{test.est_minutes} мин
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green-800)" }}>Начать →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Карточки */}
            {applyFilters(cardSets).length > 0 && (
              <div>
                <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 24, marginBottom: 24, letterSpacing: "-0.01em" }}>Карточки</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {applyFilters(cardSets).map((set) => (
                    <div key={set.id} onClick={() => openCards(set.id)} style={{
                      borderRadius: 20,
                      border: "1.5px solid var(--border-soft)",
                      background: "var(--surface)", boxShadow: "var(--sh-sm)",
                      padding: "20px 22px", cursor: "pointer",
                      transition: "transform 0.25s cubic-bezier(0.22,0.8,0.32,1), box-shadow 0.25s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(26,52,36,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--sh-sm)"; }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🃏</div>
                      <div style={{ fontFamily: "var(--f-serif)", fontSize: 17, fontWeight: 500, marginBottom: 6 }}>{set.title}</div>
                      {set.description && (
                        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10 }}>{set.description}</div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{set.cards_count ?? "—"} карточек</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green-800)" }}>Открыть →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tests.length === 0 && cardSets.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)", fontSize: 16 }}>
                Пока нет доступных заданий.
              </div>
            )}
          </>
        )}
      </div>

      {activeQuiz && (
        <GuestQuiz
          quiz={activeQuiz}
          onFinish={handleQuizFinish}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {activeCards && (
        <GuestCards
          set={activeCards}
          onFinish={handleCardsFinish}
          onClose={() => setActiveCards(null)}
        />
      )}

      {showLimit && <LimitModal />}
    </div>
  );
}

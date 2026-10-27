import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Leaf } from "../botanical";
import { findCover } from "../components/TestCover";
import { QuizClassic, QuizResults } from "./quiz";
import { scoreQuiz, EXAM_MINUTES } from "../exams";

const VK_LINK  = "https://vk.com/public219644318";
const LIMIT    = 3; // порог для тестов И для карточек

const TOPIC_ICONS = {
  "Цитология": "🔬", "Генетика": "🧬", "Зоология": "🦎",
  "Ботаника": "🌿", "Биохимия": "🧪", "Микробиология": "🦠",
  "Биология": "🌱", "Анатомия": "🫀", "Экология": "🌍",
};

const GRADE_OPTIONS = ["5 класс", "6 класс", "7 класс", "8 класс", "9 класс", "10 класс", "11 класс"];
const EXAM_OPTIONS = ["ОГЭ", "ЕГЭ", "ВПР"];
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
        maxWidth: 480, width: "100%", padding: "32px 24px 28px",
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


// ── Стили для карточек ────────────────────────────────────────────────────────
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
  display: "block", width: "100%", padding: "14px 24px", borderRadius: 999,
  background: "var(--green-800)", color: "#fff",
  fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", marginBottom: 10,
};
const btnGhost = {
  display: "block", width: "100%", padding: "12px 24px", borderRadius: 999,
  background: "transparent", color: "var(--text-soft)",
  fontWeight: 600, fontSize: 14, border: "1.5px solid var(--border-soft)", cursor: "pointer",
};

// ── Встроенный просмотр карточек ──────────────────────────────────────────────
function GuestCards({ set, onFinish, onClose }) {
  const [cards, setCards] = useState(() => [...set.cards]);
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const card = cards[step];
  const total = cards.length;
  // фото только на своей стороне карточки
  const cardImage = card?.image_data && (card.image_side === "back") === flipped;

  function shuffleCards() {
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setCards(arr);
    setStep(0);
    setFlipped(false);
  }

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
        <div className="quiz-modal-panel" style={panelStyle}>
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
      <div className="quiz-modal-panel" style={{ ...panelStyle, maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 22 }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={shuffleCards}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green-800)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
              title="Перемешать карточки"
            >
              🔀
            </button>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{step + 1} / {total}</div>
          </div>
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
            overflow: "visible",          }}
        >
          {cardImage && (
            <img src={card.image_data} alt="" style={{
              maxWidth: "100%", maxHeight: 140, borderRadius: 10,
              objectFit: "contain", marginBottom: 16,
            }} />
          )}
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: cardImage ? 8 : 12 }}>
            {flipped ? "Определение" : "Термин"}
          </div>
          <div className="pre-line" style={{ fontFamily: "var(--f-serif)", fontSize: 22, lineHeight: 1.4, color: flipped ? "var(--green-900)" : "var(--text)" }}>
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

// ── Библиотека заданий: обложка-миниатюра ─────────────────────────────────────
function LibraryThumb({ item, size, fallback }) {
  const cover = findCover(item);
  return (
    <span className="lib-thumb" style={{ width: size, height: size, background: cover ? cover.bg : "var(--green-100)" }}>
      {cover ? <img src={cover.src} alt="" loading="lazy" /> : <span>{fallback}</span>}
    </span>
  );
}

// «1 вопрос», «2 вопроса», «5 вопросов»
function plural(n, one, few, many) {
  const d = n % 10, dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

// Короткие подписи длинных разделов для бокового меню
const shortSection = (name) => ({
  "Биология как наука. Методы. Уровни организации": "Биология как наука",
  "Прокариоты и вирусы": "Прокариоты",
  "Грибы и лишайники": "Грибы",
}[name] || name);

const LIBRARY_STYLES = `
  .lib-layout { display: grid; grid-template-columns: 270px minmax(0, 1fr); min-height: 100vh; padding-top: 64px; }
  .lib-side {
    background: var(--green-50); border-right: 1px solid var(--border-soft);
    padding: 26px 16px; position: sticky; top: 64px; align-self: start;
    height: calc(100vh - 64px); overflow-y: auto;
  }
  .lib-side-title { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--text-muted); margin: 20px 10px 10px; }
  .lib-nav {
    width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px; border: none; background: none;
    border-radius: 12px; font: 600 14px var(--f-sans); color: var(--text-soft); cursor: pointer; text-align: left;
    transition: background .15s, box-shadow .15s;
  }
  .lib-nav:hover { background: rgba(255,255,255,.7); }
  .lib-nav.on { background: #fff; color: var(--text); box-shadow: 0 4px 14px rgba(20,40,30,.08); }
  .lib-nav i { margin-left: auto; font-style: normal; font-size: 12px; color: var(--text-muted); }
  .lib-nav-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lib-dot { width: 34px; height: 34px; flex-shrink: 0; border-radius: 9px; background: var(--green-100); color: var(--green-800); display: grid; place-items: center; font-weight: 800; }
  .lib-thumb { flex-shrink: 0; border-radius: 10px; overflow: hidden; display: grid; place-items: center; font-size: 22px; color: var(--green-800); font-weight: 800; }
  .lib-thumb img { width: 100%; height: 100%; object-fit: contain; display: block; }

  .lib-main { padding: 30px 40px 80px; min-width: 0; }
  .lib-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
  .lib-title { font-family: var(--f-serif); font-size: clamp(28px, 3vw, 40px); line-height: 1.1; letter-spacing: -.02em; }
  .lib-sub { color: var(--text-muted); margin-top: 4px; }
  .lib-seg { display: inline-flex; background: var(--green-50); border-radius: 12px; padding: 4px; }
  .lib-seg button { border: none; background: none; padding: 8px 16px; border-radius: 9px; font: 700 13px var(--f-sans); color: var(--text-soft); cursor: pointer; }
  .lib-seg button.on { background: #fff; color: var(--green-900); box-shadow: 0 2px 8px rgba(0,0,0,.06); }

  .lib-filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 22px; }
  .lib-search { position: relative; flex: 1 1 260px; max-width: 420px; color: var(--text-muted); }
  .lib-search svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .lib-search input {
    width: 100%; padding: 10px 16px 10px 38px; border-radius: 999px; border: 1.5px solid var(--border-soft);
    background: var(--surface); font: 14px var(--f-sans); outline: none; color: var(--text);
  }
  .lib-search input:focus { border-color: var(--green-600); }
  .lib-reset { padding: 9px 16px; border-radius: 999px; font-size: 13px; border: 1.5px solid var(--border-soft); background: transparent; color: var(--text-muted); cursor: pointer; }

  .lib-mocks { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); gap: 14px; margin-bottom: 22px; }
  .lib-mock {
    position: relative; overflow: hidden; text-align: left; border: none; cursor: pointer;
    border-radius: 22px; padding: 22px 24px 24px; color: #fff; font-family: var(--f-sans);
    transition: transform .25s cubic-bezier(.22,.8,.32,1), box-shadow .25s;
  }
  .lib-mock.oge { background: var(--green-800); }
  .lib-mock.ege { background: var(--green-900); }
  .lib-mock:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(20,40,30,.22); }
  .lib-mock small { font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--green-300); }
  .lib-mock h3 { font-family: var(--f-serif); font-weight: 500; font-size: 24px; line-height: 1.15; color: #fff; margin: 6px 0 14px; padding-right: 110px; }
  .lib-mock-nums { display: flex; gap: 24px; }
  .lib-mock-nums b { display: block; font: 700 26px/1 var(--f-serif); }
  .lib-mock-nums span { font-size: 12px; color: var(--green-300); }
  .lib-mock-cta { position: absolute; right: 22px; bottom: 22px; background: var(--amber); color: #3a1e0a; border-radius: 999px; padding: 10px 18px; font-weight: 800; font-size: 14px; }

  .lib-list { border: 1px solid var(--border-soft); border-radius: 18px; overflow: hidden; background: var(--surface); }
  .lib-row {
    width: 100%; display: flex; align-items: center; gap: 16px; padding: 12px 16px; border: none;
    border-bottom: 1px solid var(--border-soft); background: none; cursor: pointer; text-align: left;
    font-family: var(--f-sans); color: var(--text); transition: background .15s;
  }
  .lib-row:last-child { border-bottom: none; }
  .lib-row:hover { background: var(--green-50); }
  .lib-row:hover .lib-play { transform: scale(1.08); }
  .lib-row-body { flex: 1; min-width: 0; }
  .lib-row-title { font-family: var(--f-serif); font-size: 17px; line-height: 1.3; margin-bottom: 4px; }
  .lib-row-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
  .lib-tag { font-size: 11px; font-weight: 700; border-radius: 999px; padding: 3px 9px; background: var(--green-100); color: var(--green-800); }
  .lib-tag.cards { background: var(--amber-soft); color: #7a3e10; }
  .lib-play { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: var(--green-800); color: #fff; display: grid; place-items: center; transition: transform .2s; }
  .lib-play svg { margin-left: 2px; }
  .lib-empty { text-align: center; padding: 60px 0; color: var(--text-muted); font-size: 15px; }

  /* ── Телефоны и планшеты: меню превращается в строку кнопок ── */
  @media (max-width: 900px) {
    .lib-layout { grid-template-columns: 1fr; align-content: start; padding-top: 56px; }
    .lib-side {
      position: sticky; top: 56px; z-index: 20; height: auto; display: flex; gap: 6px; overflow-x: auto;
      padding: 10px 16px; border-right: none; border-bottom: 1px solid var(--border-soft); scrollbar-width: none;
    }
    .lib-side::-webkit-scrollbar { display: none; }
    .lib-side-title { display: none; }
    .lib-nav { width: auto; flex-shrink: 0; padding: 5px 12px 5px 5px; border-radius: 999px; background: #fff; border: 1px solid var(--border-soft); font-size: 13px; }
    .lib-nav.on { background: var(--green-800); color: #fff; border-color: var(--green-800); }
    .lib-nav.on i { color: var(--green-300); }
    .lib-nav .lib-dot, .lib-nav .lib-thumb { width: 26px !important; height: 26px !important; border-radius: 50%; font-size: 12px; }
    .lib-main { padding: 20px 16px 60px; }
    .lib-seg { width: 100%; } .lib-seg button { flex: 1; }
    .lib-search { flex-basis: 100%; max-width: none; }
    .lib-mock h3 { padding-right: 0; }
    .lib-mock-cta { position: static; display: inline-block; margin-top: 16px; }
    .lib-row { gap: 12px; padding: 12px; }
    .lib-row .lib-thumb { width: 44px !important; height: 44px !important; }
    .lib-row-title { font-size: 15px; }
    .lib-play { width: 34px; height: 34px; }
  }
`;

// ── Главный компонент ─────────────────────────────────────────────────────────
export default function TasksPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [cardSets, setCardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [guestResult, setGuestResult] = useState(null);
  const [quizKey, setQuizKey] = useState(0);
  const [activeCards, setActiveCards] = useState(null);
  const [showLimit, setShowLimit] = useState(false);

  const [gradeFilter, setGradeFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");   // all | mocks
  const [kind, setKind] = useState("all");   // all | tests | cards

  useEffect(() => {
    const prev = document.title;
    document.title = "Тесты и карточки по биологии бесплатно — ЕГЭ, ОГЭ, ВПР | Vikokon";
    return () => { document.title = prev; };
  }, []);

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

  const dataSections = [...new Set([...tests.map(t => t.section), ...cardSets.map(c => c.section)].filter(Boolean).flatMap(v => v.split(", ")))];
  const uniqueSections = [
    ...SECTION_OPTIONS,
    ...dataSections.filter(s => !SECTION_OPTIONS.includes(s)).sort(),
  ];
  const dataParts = [...new Set([...tests.map(t => t.part), ...cardSets.map(c => c.part)].filter(Boolean).flatMap(v => v.split(", ")))];
  const uniqueParts = [...PART_OPTIONS, ...dataParts.filter(p => !PART_OPTIONS.includes(p)).sort()];
  const uniqueTopics  = [...new Set([...tests.map(t => t.topic),   ...cardSets.map(c => c.topic)].filter(Boolean))].sort();
  const uniqueSources = [...new Set([...tests.map(t => t.source),  ...cardSets.map(c => c.source)].filter(Boolean).flatMap(v => v.split(", ")))].sort();
  const hasFilters = gradeFilter || examFilter || partFilter || sectionFilter || topicFilter || sourceFilter || search;

  function itemHasValue(itemVal, filterVal) {
    if (!filterVal) return true;
    if (!itemVal) return false;
    return itemVal.split(", ").includes(filterVal);
  }

  function applyFilters(items) {
    return items.filter(item => {
      if (gradeFilter && !itemHasValue(item.grade, gradeFilter)) return false;
      if (examFilter && !itemHasValue(item.category, examFilter)) return false;
      if (partFilter && !itemHasValue(item.part, partFilter)) return false;
      if (sectionFilter && !itemHasValue(item.section, sectionFilter)) return false;
      if (topicFilter && item.topic !== topicFilter) return false;
      if (sourceFilter && !itemHasValue(item.source, sourceFilter)) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  function resetFilters() {
    setGradeFilter(""); setExamFilter(""); setPartFilter(""); setSectionFilter("");
    setTopicFilter(""); setSourceFilter(""); setSearch("");
  }

  // Боковое меню и списки
  const mockTests = tests.filter(t => t.mock_exam);
  const sideSections = SECTION_OPTIONS.concat(dataSections.filter(s => !SECTION_OPTIONS.includes(s)).sort())
    .map(name => ({ name, count: [...tests, ...cardSets].filter(i => itemHasValue(i.section, name)).length }))
    .filter(s => s.count > 0);

  function pickNav(nextView, section = "", e) {
    // на телефоне меню — строка кнопок: подкручиваем выбранную в зону видимости
    e?.currentTarget?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setView(nextView);
    setSectionFilter(section);
    if (nextView === "mocks") setKind("tests");
    else if (view === "mocks") setKind("all");
  }

  const filteredTests = applyFilters(tests);
  const shownMocks = kind === "cards" ? [] : filteredTests.filter(t => t.mock_exam);
  const rows = view === "mocks" ? [] : [
    ...(kind === "cards" ? [] : filteredTests.filter(t => !t.mock_exam).map(item => ({ type: "test", item }))),
    ...(kind === "tests" ? [] : applyFilters(cardSets).map(item => ({ type: "cards", item }))),
  ];

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

  function transformGuestQuiz(quiz) {
    return {
      title: quiz.title,
      topic: quiz.topic,
      mock_exam: quiz.mock_exam || null,
      questions: quiz.questions.map(q => ({
        q: q.text,
        note: q.hint,
        options: q.answers.map(a => a.text),
        correct: q.correct_index,
        correct_indices: q.answers.map((a, i) => a.is_correct ? i : -1).filter(i => i >= 0),
        explain: q.explanation,
        question_type: q.question_type || "single",
        image_data: q.image_data || null,
        correct_text: q.correct_text || null,
        match_options: q.match_options || ["1", "2"],
        grading_criteria: q.grading_criteria || null,
        max_points: q.max_points || null,
        _questionId: q.id,
        _answerIds: q.answers.map(a => a.id),
        _matchAnswers: q.answers,
      })),
    };
  }

  function handleQuizFinish(answers) {
    const r = scoreQuiz(transformGuestQuiz(activeQuiz), answers);
    setGuestResult({ ...r, title: activeQuiz.title, mock_exam: activeQuiz.mock_exam || null });
  }

  function handleGuestClose() {
    const t = bumpTests();
    const { cards: c } = getDone();
    setActiveQuiz(null);
    setGuestResult(null);
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
      <header className="tasks-header" style={{
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

        <button className="tasks-login-btn" onClick={() => navigate("/login")} style={{
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

      <style>{LIBRARY_STYLES}</style>
      <div className="lib-layout">

        {/* ── Боковое меню: все / пробники / разделы ── */}
        <aside className="lib-side">
          <button className={`lib-nav${view === "all" && !sectionFilter ? " on" : ""}`} onClick={e => pickNav("all", "", e)}>
            <span className="lib-dot">★</span>Все задания<i>{tests.length + cardSets.length}</i>
          </button>
          {mockTests.length > 0 && (
            <button className={`lib-nav${view === "mocks" ? " on" : ""}`} onClick={e => pickNav("mocks", "", e)}>
              <span className="lib-dot">П</span>Пробники<i>{mockTests.length}</i>
            </button>
          )}
          {sideSections.length > 0 && <div className="lib-side-title">Разделы</div>}
          {sideSections.map(({ name, count }) => (
            <button key={name} className={`lib-nav${sectionFilter === name ? " on" : ""}`} onClick={e => pickNav("section", name, e)}>
              <LibraryThumb item={{ section: name }} size={34} fallback={name[0]} />
              <span className="lib-nav-name">{shortSection(name)}</span><i>{count}</i>
            </button>
          ))}
        </aside>

        <main className="lib-main">
          <div className="lib-top">
            <div>
              <h1 className="lib-title">{view === "mocks" ? "Пробники" : sectionFilter ? shortSection(sectionFilter) : "Все задания"}</h1>
              <p className="lib-sub">Бесплатно, без регистрации</p>
            </div>
            {view !== "mocks" && (
              <div className="lib-seg">
                {[["all", "Всё"], ["tests", "Тесты"], ["cards", "Карточки"]].map(([k, l]) => (
                  <button key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{l}</button>
                ))}
              </div>
            )}
          </div>

          {/* Поиск и уточняющие фильтры */}
          <div className="lib-filters">
            <div className="lib-search">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск: фотосинтез, митоз…" />
            </div>
            <FilterSelect label="Класс" value={gradeFilter} onChange={setGradeFilter} options={GRADE_OPTIONS} />
            <FilterSelect label="Экзамен" value={examFilter} onChange={setExamFilter} options={EXAM_OPTIONS} />
            {uniqueParts.length > 0 && (
              <FilterSelect label="Часть" value={partFilter} onChange={setPartFilter} options={uniqueParts} />
            )}
            {uniqueSources.length > 0 && (
              <FilterSelect label="Источник" value={sourceFilter} onChange={setSourceFilter} options={uniqueSources} />
            )}
            {hasFilters && (
              <button className="lib-reset" onClick={resetFilters}>Сбросить</button>
            )}
          </div>

          {loading ? (
            <div className="lib-empty">Загрузка…</div>
          ) : (
            <>
              {/* Пробники — крупные плашки */}
              {shownMocks.length > 0 && (
                <div className="lib-mocks">
                  {shownMocks.map(t => (
                    <button key={t.id} className={`lib-mock ${t.mock_exam === "ЕГЭ" ? "ege" : "oge"}`} onClick={() => openTest(t.id)}>
                      <small>Пробник {t.mock_exam}</small>
                      <h3>{t.title}</h3>
                      <div className="lib-mock-nums">
                        <div><b>{t.questions_count}</b><span>{plural(t.questions_count, "задание", "задания", "заданий")}</span></div>
                        <div><b>{t.points_total}</b><span>{plural(t.points_total, "балл", "балла", "баллов")}</span></div>
                        {EXAM_MINUTES[t.mock_exam] && <div><b>{EXAM_MINUTES[t.mock_exam]}</b><span>минут</span></div>}
                      </div>
                      <span className="lib-mock-cta">Решать →</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Тесты и карточки — списком */}
              {rows.length > 0 ? (
                <div className="lib-list">
                  {rows.map(({ type, item }) => (
                    <button key={type + item.id} className="lib-row" onClick={() => (type === "test" ? openTest(item.id) : openCards(item.id))}>
                      <LibraryThumb item={item} size={52} fallback={type === "cards" ? "🃏" : TOPIC_ICONS[item.topic] || "🌱"} />
                      <div className="lib-row-body">
                        <div className="lib-row-title">{item.title}</div>
                        <div className="lib-row-meta">
                          {type === "cards"
                            ? <span className="lib-tag cards">Карточки</span>
                            : (item.category || "").split(", ").filter(Boolean).map(c => <span key={c} className="lib-tag">{c}</span>)}
                          <span>
                            {type === "cards"
                              ? `${item.cards_count ?? 0} ${plural(item.cards_count ?? 0, "карточка", "карточки", "карточек")}`
                              : `${item.questions_count} ${plural(item.questions_count, "вопрос", "вопроса", "вопросов")} · ~${item.est_minutes} мин`}
                          </span>
                        </div>
                      </div>
                      <span className="lib-play" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M4 2.5v9l7.5-4.5z" fill="currentColor"/></svg>
                      </span>
                    </button>
                  ))}
                </div>
              ) : shownMocks.length === 0 && (
                <div className="lib-empty">
                  {tests.length === 0 && cardSets.length === 0 ? "Пока нет доступных заданий." : "Ничего не найдено — попробуй сбросить фильтры."}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {activeQuiz && !guestResult && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <QuizClassic
            key={quizKey}
            quiz={transformGuestQuiz(activeQuiz)}
            onFinish={handleQuizFinish}
            onExit={handleGuestClose}
          />
        </div>
      )}

      {activeQuiz && guestResult && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <QuizResults
            total={guestResult.max_score}
            correct={guestResult.score}
            quizTitle={guestResult.title}
            mockExam={guestResult.mock_exam}
            pendingReview={guestResult.status === "pending_review"}
            guest
            onRetry={() => { setGuestResult(null); setQuizKey(k => k + 1); }}
            onHome={handleGuestClose}
          />
        </div>
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

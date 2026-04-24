import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fern, BotanicalBg } from "../botanical";

const TOPIC_ICONS = {
  "Цитология": "🔬", "Генетика": "🧬", "Зоология": "🦎",
  "Ботаника": "🌿", "Биохимия": "🧪", "Микробиология": "🦠",
  "Биология": "🌱", "Анатомия": "🫀", "Экология": "🌍",
};

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

function QuizTile({ q, onStart }) {
  const scorePct = q.score != null && q.max_score ? Math.round((q.score / q.max_score) * 100) : null;
  const statusLabel = {
    done: `Пройден · ${q.score}/${q.max_score}`,
    inprogress: "В процессе",
    new: "Новый",
  }[q.status] || "Новый";
  const statusColor = {
    done: { bg: "var(--green-200)", fg: "var(--green-900)" },
    inprogress: { bg: "var(--accent-soft)", fg: "#5a3a10" },
    new: { bg: "var(--bg-muted)", fg: "var(--text-soft)" },
  }[q.status] || { bg: "var(--bg-muted)", fg: "var(--text-soft)" };

  return (
    <div
      onClick={onStart}
      style={{
        borderRadius: 20, overflow: "hidden",
        border: "1.5px solid var(--border-soft)",
        background: "var(--surface)", boxShadow: "var(--sh-sm)",
        cursor: "pointer",
        transition: "transform 0.25s cubic-bezier(0.22,0.8,0.32,1), box-shadow 0.25s",
        display: "flex", flexDirection: "column",
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
        {q.is_assigned && (
          <span style={{
            position: "absolute", top: 12, left: 12,
            background: "var(--green-800)", color: "#fff",
            padding: "3px 10px", borderRadius: 999,
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            boxShadow: "0 4px 10px rgba(26,52,36,0.2)",
          }}>🌱 Назначено</span>
        )}
        <span style={{ position: "relative" }}>{TOPIC_ICONS[q.topic] || "🌱"}</span>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{
          display: "inline-block", background: "var(--green-100)",
          color: "var(--green-800)", borderRadius: 999,
          padding: "2px 10px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          alignSelf: "flex-start",
        }}>
          {q.topic}
        </div>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 17, fontWeight: 500, lineHeight: 1.3 }}>
          {q.title}
        </div>
        {q.description && (
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
            {q.description}
          </div>
        )}
        {q.status === "done" && scorePct != null && (
          <div>
            <div className="progress"><div className="progress-fill" style={{ width: `${scorePct}%` }}/></div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Результат {scorePct}%</div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {q.questions_count || q.questions} вопр. · ~{q.est_minutes} мин
          </span>
          <span className="pill" style={{ background: statusColor.bg, color: statusColor.fg, fontSize: 11 }}>
            {statusLabel}
          </span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green-800)", textAlign: "right" }}>
          {q.status === "done" ? "Повторить →" : q.status === "inprogress" ? "Продолжить →" : "Начать →"}
        </div>
      </div>
    </div>
  );
}

function CardSetTile({ s, onStart }) {
  return (
    <div
      onClick={onStart}
      style={{
        borderRadius: 20,
        border: "1.5px solid var(--border-soft)",
        background: "var(--surface)", boxShadow: "var(--sh-sm)",
        padding: "20px 22px", cursor: "pointer",
        transition: "transform 0.25s cubic-bezier(0.22,0.8,0.32,1), box-shadow 0.25s",
        position: "relative",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(26,52,36,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--sh-sm)"; }}
    >
      {s.is_assigned && (
        <span style={{
          position: "absolute", top: 14, right: 14,
          background: "var(--green-800)", color: "#fff",
          padding: "3px 10px", borderRadius: 999,
          fontSize: 11, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>🌱 Назначено</span>
      )}
      <div style={{ fontSize: 36, marginBottom: 12 }}>🃏</div>
      <div style={{ fontFamily: "var(--f-serif)", fontSize: 17, fontWeight: 500, marginBottom: 6 }}>{s.title}</div>
      {s.description && (
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10 }}>{s.description}</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.cards_count ?? "—"} карточек</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green-800)" }}>Открыть →</span>
      </div>
    </div>
  );
}

export const StudentDashboard = ({ name = "Аня", quizzes = [], cardSets = [], onOpenQuiz, onOpenCards, onAdmin, onLogout }) => {
  const navigate = useNavigate();

  const [catFilter, setCatFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [lineFilter, setLineFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");

  const { uniqueCategories, uniqueSections, uniqueTopics, uniqueParts, uniqueLines, uniqueSources } = useMemo(() => {
    const dataSections   = [...new Set([...quizzes.map(t => t.section),  ...cardSets.map(c => c.section)].filter(Boolean))];
    const dataCategories = [...new Set([...quizzes.map(t => t.category), ...cardSets.map(c => c.category)].filter(Boolean))];
    const dataParts      = [...new Set([...quizzes.map(t => t.part),     ...cardSets.map(c => c.part)].filter(Boolean))];
    return {
      uniqueCategories: [...CATEGORY_OPTIONS, ...dataCategories.filter(c => !CATEGORY_OPTIONS.includes(c)).sort()],
      uniqueSections:   [...SECTION_OPTIONS,  ...dataSections.filter(s => !SECTION_OPTIONS.includes(s)).sort()],
      uniqueTopics:     [...new Set([...quizzes.map(t => t.topic),  ...cardSets.map(c => c.topic)].filter(Boolean))].sort(),
      uniqueParts:      [...PART_OPTIONS,     ...dataParts.filter(p => !PART_OPTIONS.includes(p)).sort()],
      uniqueLines:      [...new Set([...quizzes.map(t => t.line),   ...cardSets.map(c => c.line)].filter(Boolean))].sort((a, b) => +a - +b),
      uniqueSources:    [...new Set([...quizzes.map(t => t.source), ...cardSets.map(c => c.source)].filter(Boolean))].sort(),
    };
  }, [quizzes, cardSets]);

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

  const filteredQuizzes = applyFilters(quizzes);
  const filteredCards = applyFilters(cardSets);

  const doneSets = quizzes.filter(q => q.status === "done");
  const stats = {
    done: doneSets.length,
    total: quizzes.length,
    avg: doneSets.length === 0 ? 0 : Math.round(
      doneSets.reduce((acc, q) => acc + (q.max_score ? (q.score / q.max_score) : 0), 0) / doneSets.length * 100
    ),
    assigned: quizzes.filter(q => q.is_assigned).length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      {/* Top bar */}
      <div className="dash-topbar" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
          <img src="/tutor2.jpg" alt="Vikokon" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", border: "1.5px solid var(--border-soft)", flexShrink: 0 }} />
          <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 17 }}>Vikokon</div>
        </div>
        <div className="dash-topbar-right" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {onAdmin && <button className="btn btn-ghost btn-sm rsp-hide-mobile" onClick={onAdmin}>Панель репетитора</button>}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--green-200)",
              display: "grid", placeItems: "center", color: "var(--green-900)",
              fontFamily: "var(--f-serif)", fontWeight: 600,
            }}>{name[0]?.toUpperCase()}</div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
          </div>
          {onLogout && (
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Выйти</button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="dash-hero" style={{ padding: "40px 48px 28px", position: "relative", overflow: "hidden" }}>
        <BotanicalBg intensity={0.6} pattern="ferns" />
        <div style={{ position: "relative" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Задания</div>
          <h1 className="dash-h1" style={{
            fontFamily: "var(--f-serif)",
            fontSize: "clamp(30px, 3vw, 48px)",
            lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 8,
          }}>
            Привет, {name}.<br/>
            <em style={{ color: "var(--green-800)" }}>Тесты и карточки по биологии</em>
          </h1>
          <p style={{ color: "var(--text-soft)", fontSize: 16, maxWidth: 640, lineHeight: 1.7 }}>
            {quizzes.length === 0 && cardSets.length === 0
              ? "Пока ничего не добавлено. Загляни позже — задания появятся здесь."
              : `Доступно ${quizzes.length} тест${quizzes.length === 1 ? "" : "ов"} и ${cardSets.length} набор${cardSets.length === 1 ? "" : cardSets.length > 4 ? "ов" : "а"} карточек.`}
          </p>
        </div>

        {quizzes.length > 0 && (
          <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginTop: 32, maxWidth: 820, position: "relative" }}>
            {[
              { v: `${stats.done}/${stats.total}`, l: "пройдено тестов" },
              { v: stats.avg ? `${stats.avg}%` : "—",    l: "средний результат" },
              { v: `${quizzes.filter(q => q.status === "new").length}`, l: "новых тестов" },
              { v: `${stats.assigned}`, l: "назначено вам" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "18px 20px" }}>
                <div className="dash-stat-val" style={{
                  fontFamily: "var(--f-serif)", fontSize: 28, fontWeight: 500, letterSpacing: "-0.01em",
                  color: "var(--text)",
                }}>{s.v}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 4 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 48px" }}>
        {/* Filters */}
        {(quizzes.length > 0 || cardSets.length > 0) && (
          <div style={{ marginBottom: 32, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
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
        )}

        {/* Quizzes */}
        {filteredQuizzes.length > 0 && (
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 24, marginBottom: 24, letterSpacing: "-0.01em" }}>Тесты</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {filteredQuizzes.map(q => (
                <QuizTile key={q.id} q={q} onStart={() => onOpenQuiz?.(q)} />
              ))}
            </div>
          </div>
        )}

        {/* Cards */}
        {filteredCards.length > 0 && (
          <div>
            <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 24, marginBottom: 24, letterSpacing: "-0.01em" }}>Карточки</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {filteredCards.map(s => (
                <CardSetTile key={s.id} s={s} onStart={() => onOpenCards?.(s)} />
              ))}
            </div>
          </div>
        )}

        {quizzes.length === 0 && cardSets.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 16 }}>
            Пока нет доступных заданий.
          </div>
        )}

        {(quizzes.length > 0 || cardSets.length > 0) && filteredQuizzes.length === 0 && filteredCards.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 16 }}>
            По вашим фильтрам ничего не найдено.{" "}
            <button onClick={resetFilters} style={{
              background: "none", border: "none", color: "var(--green-800)",
              fontWeight: 600, cursor: "pointer", textDecoration: "underline",
            }}>Сбросить фильтры</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Legacy exports kept so other files importing them don't break
export const QuizCard = ({ q, onStart }) => <QuizTile q={q} onStart={onStart} />;
export const CardSetCard = ({ s, onStart }) => <CardSetTile s={s} onStart={onStart} />;

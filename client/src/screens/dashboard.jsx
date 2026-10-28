import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BotanicalBg } from "../botanical";
import { TestCover } from "../components/TestCover";
import { GardenCard, GARDEN_STYLES } from "../components/Garden";
import { LibraryThumb, plural, shortSection, LIBRARY_STYLES } from "../components/library";
import { MockChart, WeakSections, PROGRESS_STYLES } from "../components/ProgressCards";
import PlantSVG from "../components/PlantSVG";
import API from "../api";

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
      <TestCover item={q} icon={TOPIC_ICONS[q.topic] || "🌱"}>
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
      </TestCover>
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
        borderRadius: 16, overflow: "hidden",
        border: "1.5px solid var(--border-soft)",
        background: "var(--surface)", boxShadow: "var(--sh-sm)",
        cursor: "pointer",
        transition: "transform 0.2s cubic-bezier(0.22,0.8,0.32,1), box-shadow 0.2s",
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 18px",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(26,52,36,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--sh-sm)"; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: "linear-gradient(135deg, var(--green-100) 0%, var(--green-200) 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
      }}>
        {s.preview_image ? (
          <img src={s.preview_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
        ) : "🃏"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 15, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {s.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {s.cards_count ?? "—"} карточек{s.is_assigned ? " · 🌱 Назначено" : ""}
        </div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green-800)", flexShrink: 0 }}>→</span>
    </div>
  );
}

const PLANT_NAMES_MAP = {
  sunflower: "Подсолнух", rose: "Роза", cactus: "Кактус",
  fern: "Папоротник", orchid: "Орхидея", tulip: "Тюльпан",
  bamboo: "Бамбук", lavender: "Лаванда", succulent: "Суккулент", chamomile: "Ромашка",
};

function CollectionView() {
  const [plantData, setPlantData] = useState(null);

  useEffect(() => {
    API.getPlant().then(setPlantData).catch(() => {});
  }, []);

  if (!plantData) return (
    <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)", fontSize: 15 }}>
      Загрузка…
    </div>
  );

  const grouped = {};
  for (const item of plantData.collection) {
    if (!grouped[item.plant_type]) grouped[item.plant_type] = [];
    grouped[item.plant_type].push(item.collected_at);
  }

  const progressPct = plantData.stage < 5
    ? Math.round(((plantData.water_points - ([0,1,2,3,5,7][plantData.stage] ?? 0)) /
        (([0,1,2,3,5,7][plantData.stage + 1] ?? 7) - ([0,1,2,3,5,7][plantData.stage] ?? 0))) * 100)
    : 100;

  return (
    <div>
      {/* Текущий цветок показывается карточкой выше — здесь только коллекция */}
      {/* Collection grid */}
      <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 24, marginBottom: 8, letterSpacing: "-0.01em" }}>
        Собранные растения
      </h2>

      {plantData.collection_count === 0 ? (
        <div style={{
          textAlign: "center", padding: "64px 24px",
          background: "var(--surface)", borderRadius: 24,
          border: "1.5px solid var(--border-soft)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🌱</div>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 20, marginBottom: 8 }}>
            Коллекция пока пуста
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 320, margin: "0 auto" }}>
            Решай задания, получай капли 💧 и поливай цветок раз в день — после 7 поливов он расцветёт и попадёт в коллекцию
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
            Всего собрано: {plantData.collection_count} 🌸
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(190px,100%), 1fr))", gap: 16 }}>
            {Object.entries(grouped).map(([type, dates]) => (
              <div key={type} style={{
                background: "var(--surface)", border: "1.5px solid var(--border-soft)",
                borderRadius: 20, padding: "20px 16px", textAlign: "center",
                boxShadow: "var(--sh-sm)", position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(26,52,36,0.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--sh-sm)"; }}
              >
                {dates.length > 1 && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: "var(--green-800)", color: "#fff",
                    borderRadius: 999, fontSize: 11, fontWeight: 700,
                    padding: "2px 8px",
                  }}>×{dates.length}</div>
                )}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <PlantSVG plantType={type} stage={5} />
                </div>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                  {PLANT_NAMES_MAP[type] || type}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Собрано {dates.length} {dates.length === 1 ? "раз" : "раза"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                  {new Date(dates[0]).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const StudentDashboard = ({ name = "Аня", quizzes = [], cardSets = [], onOpenQuiz, onOpenCards, onAdmin, onLogout }) => {
  const navigate = useNavigate();

  // all | assigned | mocks | done | garden | section
  const [view, setView] = useState("all");
  const [kind, setKind] = useState("all"); // all | tests | cards
  const [plant, setPlant] = useState(null);

  const [gradeFilter, setGradeFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");

  const [progress, setProgress] = useState(null);
  useEffect(() => { API.getPlant().then(setPlant).catch(() => {}); }, []);
  useEffect(() => { API.getMyProgress().then(setProgress).catch(() => {}); }, []);

  const { uniqueParts, uniqueSources, sideSections } = useMemo(() => {
    const all = [...quizzes, ...cardSets];
    const dataSections = [...new Set(all.map(i => i.section).filter(Boolean).flatMap(v => v.split(", ")))];
    const dataParts = [...new Set(all.map(i => i.part).filter(Boolean).flatMap(v => v.split(", ")))];
    return {
      uniqueParts: [...PART_OPTIONS, ...dataParts.filter(p => !PART_OPTIONS.includes(p)).sort()],
      uniqueSources: [...new Set(all.map(i => i.source).filter(Boolean).flatMap(v => v.split(", ")))].sort(),
      sideSections: [...SECTION_OPTIONS, ...dataSections.filter(s => !SECTION_OPTIONS.includes(s)).sort()]
        .map(n => ({ name: n, count: all.filter(i => (i.section || "").split(", ").includes(n)).length }))
        .filter(s => s.count > 0),
    };
  }, [quizzes, cardSets]);

  const hasFilters = gradeFilter || examFilter || partFilter || sourceFilter || search;

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
      if (sourceFilter && !itemHasValue(item.source, sourceFilter)) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  function resetFilters() {
    setGradeFilter(""); setExamFilter(""); setPartFilter(""); setSourceFilter(""); setSearch("");
  }

  function pickNav(next, section = "", e) {
    e?.currentTarget?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setView(next);
    setSectionFilter(section);
    if (next === "mocks") setKind("tests");
    else if (view === "mocks") setKind("all");
  }

  const doneTests = quizzes.filter(q => q.status === "done");
  const assignedTodo = quizzes.filter(q => q.is_assigned && q.status !== "done");
  const mocks = quizzes.filter(q => q.mock_exam);
  const bestMock = mocks.filter(q => q.status === "done").sort((a, b) => b.score - a.score)[0];
  const avg = doneTests.length === 0 ? null : Math.round(
    doneTests.reduce((acc, q) => acc + (q.max_score ? q.score / q.max_score : 0), 0) / doneTests.length * 100
  );

  // что показать в списке для текущего пункта меню
  let testsShown = applyFilters(quizzes);
  if (view === "assigned") testsShown = testsShown.filter(q => q.is_assigned);
  if (view === "done") testsShown = testsShown.filter(q => q.status === "done");
  if (view === "mocks") testsShown = testsShown.filter(q => q.mock_exam);
  const cardsShown = ["all", "section"].includes(view) ? applyFilters(cardSets) : [];
  const mockPlaques = view === "all" || view === "mocks" ? (kind === "cards" ? [] : testsShown.filter(q => q.mock_exam)) : [];
  const rows = [
    ...(kind === "cards" ? [] : testsShown.filter(q => !mockPlaques.includes(q)).map(item => ({ type: "test", item }))),
    ...(kind === "tests" ? [] : cardsShown.map(item => ({ type: "cards", item }))),
  ];

  const titles = { all: `Привет, ${name} 👋`, assigned: "Назначено мне", mocks: "Пробники", done: "Пройденные", garden: "Мой сад" };
  const title = view === "section" ? shortSection(sectionFilter) : titles[view];
  const subtitle = assignedTodo.length > 0
    ? `У тебя ${assignedTodo.length} ${plural(assignedTodo.length, "задание", "задания", "заданий")} от Виктории`
    : "Решай задания — получай капли воды для своего цветка 💧";

  const statusOf = (q) => q.status === "done"
    ? <span className="dash-st ok">✓ {q.score}/{q.max_score}</span>
    : <span className="dash-st">{q.is_assigned ? "Назначено" : "Новый"}</span>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--f-sans)" }}>
      <style>{LIBRARY_STYLES + GARDEN_STYLES + DASH_STYLES + PROGRESS_STYLES}</style>

      {/* Шапка */}
      <header className="tasks-header dash-header">
        <button className="dash-logo" onClick={() => navigate("/")}>
          <img src="/tutor2.jpg" alt="Vikokon" />
          <span className="dash-logo-label">Vikokon</span>
        </button>
        <div className="dash-header-right">
          {onAdmin && <button className="dash-head-btn rsp-hide-mobile" onClick={onAdmin}>Панель репетитора</button>}
          {plant && <span className="dash-head-drops" title="Капли воды для цветка">💧 {plant.drops}</span>}
          <div className="dash-user"><span className="dash-ava">{name[0]?.toUpperCase()}</span><span className="dash-name rsp-hide-mobile">{name}</span></div>
          {onLogout && <button className="dash-head-btn" onClick={onLogout}>Выйти</button>}
        </div>
      </header>

      <div className="lib-layout">
        {/* Меню слева (на телефоне — строка кнопок) */}
        <aside className="lib-side">
          <button className={`lib-nav${view === "all" ? " on" : ""}`} onClick={e => pickNav("all", "", e)}>
            <span className="lib-dot">★</span>Все задания<i>{quizzes.length + cardSets.length}</i>
          </button>
          {quizzes.some(q => q.is_assigned) && (
            <button className={`lib-nav${view === "assigned" ? " on" : ""}`} onClick={e => pickNav("assigned", "", e)}>
              <span className="lib-dot dash-dot-amber">!</span>Назначено мне<i>{quizzes.filter(q => q.is_assigned).length}</i>
            </button>
          )}
          {mocks.length > 0 && (
            <button className={`lib-nav${view === "mocks" ? " on" : ""}`} onClick={e => pickNav("mocks", "", e)}>
              <span className="lib-dot">П</span>Пробники<i>{mocks.length}</i>
            </button>
          )}
          <button className={`lib-nav${view === "done" ? " on" : ""}`} onClick={e => pickNav("done", "", e)}>
            <span className="lib-dot">✓</span>Пройденные<i>{doneTests.length}</i>
          </button>
          <button className={`lib-nav${view === "garden" ? " on" : ""}`} onClick={e => pickNav("garden", "", e)}>
            <span className="lib-dot">🌻</span>Мой сад<i>{plant?.collection_count || 0}</i>
          </button>
          {sideSections.length > 0 && <div className="lib-side-title">Разделы</div>}
          {sideSections.map(({ name: s, count }) => (
            <button key={s} className={`lib-nav${view === "section" && sectionFilter === s ? " on" : ""}`} onClick={e => pickNav("section", s, e)}>
              <LibraryThumb item={{ section: s }} size={34} fallback={s[0]} />
              <span className="lib-nav-name">{shortSection(s)}</span><i>{count}</i>
            </button>
          ))}
          {plant && (
            <div className="dash-side-garden">
              <GardenCard data={plant} onChange={setPlant} compact />
              <button className="dash-garden-link" onClick={e => pickNav("garden", "", e)}>Как получить капли? →</button>
            </div>
          )}
        </aside>

        <main className="lib-main">
          {/* Цветок на телефоне — сверху, компактно */}
          {plant && view !== "garden" && <div className="dash-mobile-garden"><GardenCard data={plant} onChange={setPlant} compact /></div>}

          <div className="lib-top">
            <div>
              <h1 className="lib-title">{title}</h1>
              {view === "all" && <p className="lib-sub">{subtitle}</p>}
            </div>
            {view !== "garden" && view !== "mocks" && (
              <div className="lib-seg">
                {[["all", "Всё"], ["tests", "Тесты"], ["cards", "Карточки"]].map(([k, l]) => (
                  <button key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{l}</button>
                ))}
              </div>
            )}
          </div>

          {view === "garden" ? (
            <>
              {plant && <div className="dash-garden-big"><GardenCard data={plant} onChange={setPlant} /></div>}
              <CollectionView />
            </>
          ) : (
            <>
              {view === "all" && quizzes.length > 0 && (
                <div className="dash-stats-row">
                  <div className="dash-stat"><b>{doneTests.length}/{quizzes.length}</b><span>пройдено тестов</span></div>
                  <div className="dash-stat"><b>{avg === null ? "—" : `${avg}%`}</b><span>средний результат</span></div>
                  <div className="dash-stat"><b>{bestMock ? `${bestMock.score}/${bestMock.max_score}` : "—"}</b><span>лучший пробник</span></div>
                  <div className="dash-stat"><b>🔥 {plant?.streak || 0}</b><span>{plural(plant?.streak || 0, "день", "дня", "дней")} подряд с поливом</span></div>
                </div>
              )}

              {/* График пробников и слабые разделы */}
              {view === "all" && progress && (progress.mocks.length > 0 || progress.sections.some(s => s.pct < 75)) && (
                <div className="pc-row">
                  <MockChart mocks={progress.mocks} exam="ОГЭ" />
                  <MockChart mocks={progress.mocks} exam="ЕГЭ" />
                  <WeakSections sections={progress.sections} />
                </div>
              )}

              {/* Назначенное репетитором */}
              {view === "all" && assignedTodo.length > 0 && (
                <div className="dash-assigned">
                  <small>Назначено репетитором</small>
                  {assignedTodo.slice(0, 4).map(q => (
                    <button key={q.id} className="dash-assigned-row" onClick={() => onOpenQuiz?.(q)}>
                      <LibraryThumb item={q} size={44} fallback={q.mock_exam || "📝"} />
                      <div className="lib-row-body">
                        <div className="lib-row-title">{q.title}</div>
                        <div className="dash-assigned-meta">{q.questions_count} {plural(q.questions_count, "вопрос", "вопроса", "вопросов")} · ~{q.est_minutes} мин · +{q.mock_exam ? 3 : 1} 💧</div>
                      </div>
                      <span className="dash-assigned-cta">Начать →</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Поиск и фильтры */}
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
                {uniqueParts.length > 0 && <FilterSelect label="Часть" value={partFilter} onChange={setPartFilter} options={uniqueParts} />}
                {uniqueSources.length > 0 && <FilterSelect label="Источник" value={sourceFilter} onChange={setSourceFilter} options={uniqueSources} />}
                {hasFilters && <button className="lib-reset" onClick={resetFilters}>Сбросить</button>}
              </div>

              {mockPlaques.length > 0 && (
                <div className="lib-mocks">
                  {mockPlaques.map(q => (
                    <button key={q.id} className={`lib-mock ${q.mock_exam === "ЕГЭ" ? "ege" : "oge"}`} onClick={() => onOpenQuiz?.(q)}>
                      <small>Пробник {q.mock_exam}{q.is_assigned ? " · назначено" : ""}</small>
                      <h3>{q.title}</h3>
                      <div className="lib-mock-nums">
                        <div><b>{q.questions_count}</b><span>{plural(q.questions_count, "задание", "задания", "заданий")}</span></div>
                        <div><b>{q.points_total}</b><span>баллов</span></div>
                        {q.status === "done" && <div><b>{q.score}</b><span>твой результат</span></div>}
                      </div>
                      <span className="lib-mock-cta">{q.status === "done" ? "Ещё раз →" : "Решать →"}</span>
                    </button>
                  ))}
                </div>
              )}

              {rows.length > 0 ? (
                <div className="lib-list">
                  {rows.map(({ type, item }) => (
                    <button key={type + item.id} className="lib-row" onClick={() => (type === "test" ? onOpenQuiz?.(item) : onOpenCards?.(item))}>
                      <LibraryThumb item={item} size={52} fallback={type === "cards" ? "🃏" : TOPIC_ICONS[item.topic] || "🌱"} />
                      <div className="lib-row-body">
                        <div className="lib-row-title">{item.title}</div>
                        <div className="lib-row-meta">
                          {type === "cards"
                            ? <span className="lib-tag cards">Карточки</span>
                            : (item.category || "").split(", ").filter(Boolean).map(c => <span key={c} className="lib-tag">{c}</span>)}
                          {type === "test" && item.is_assigned && <span className="lib-tag dash-tag-assigned">Назначено</span>}
                          <span>
                            {type === "cards"
                              ? `${item.cards_count ?? 0} ${plural(item.cards_count ?? 0, "карточка", "карточки", "карточек")}`
                              : `${item.questions_count} ${plural(item.questions_count, "вопрос", "вопроса", "вопросов")} · ~${item.est_minutes} мин`}
                          </span>
                        </div>
                      </div>
                      {type === "test" && statusOf(item)}
                      <span className="lib-play" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 14 14"><path d="M4 2.5v9l7.5-4.5z" fill="currentColor"/></svg>
                      </span>
                    </button>
                  ))}
                </div>
              ) : mockPlaques.length === 0 && (
                <div className="lib-empty">
                  {quizzes.length === 0 && cardSets.length === 0
                    ? "Пока ничего не добавлено. Загляни позже — задания появятся здесь."
                    : view === "done" ? "Ты пока не прошёл ни одного теста — самое время начать!"
                    : "Ничего не найдено — попробуй сбросить фильтры."}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const DASH_STYLES = `
  .dash-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 64px; padding: 0 28px;
    background: rgba(15,42,30,0.95); backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: space-between;
  }
  .dash-logo { display: flex; align-items: center; gap: 10px; background: none; border: none; cursor: pointer; padding: 0; }
  .dash-logo img { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; border: 1px solid rgba(255,255,255,.18); }
  .dash-logo-label { font-family: var(--f-serif); font-weight: 600; font-size: 16px; color: #fff; }
  .dash-header-right { display: flex; align-items: center; gap: 12px; }
  .dash-head-btn { background: rgba(255,255,255,.08); color: rgba(255,255,255,.88); border: 1px solid rgba(255,255,255,.18); border-radius: 999px; padding: 8px 16px; font: 600 13px var(--f-sans); cursor: pointer; }
  .dash-head-drops { background: rgba(96,200,245,.16); color: #bfe6fb; border-radius: 999px; padding: 7px 12px; font-weight: 800; font-size: 13px; }
  .dash-user { display: flex; align-items: center; gap: 8px; color: #fff; font-size: 14px; font-weight: 600; }
  .dash-ava { width: 32px; height: 32px; border-radius: 50%; background: var(--green-300); color: var(--green-950); display: grid; place-items: center; font-family: var(--f-serif); font-weight: 700; }
  .dash-dot-amber { background: var(--amber-soft) !important; color: #7a3e10 !important; }
  .lib-side { display: flex; flex-direction: column; }
  .dash-side-garden { margin-top: auto; padding-top: 18px; }
  .dash-garden-link { display: block; margin: 6px auto 0; border: none; background: none; color: var(--green-800); font: 700 12px var(--f-sans); cursor: pointer; }
  .dash-mobile-garden { display: none; margin-bottom: 16px; }
  .dash-garden-big { max-width: 360px; margin-bottom: 28px; }
  .dash-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
  .dash-stat { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 16px; padding: 14px 16px; }
  .dash-stat b { display: block; font: 600 26px/1.1 var(--f-serif); color: var(--green-800); }
  .dash-stat span { font-size: 12px; color: var(--text-muted); font-weight: 600; }
  .dash-assigned { background: var(--green-900); border-radius: 20px; padding: 16px 18px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
  .dash-assigned small { font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--green-300); }
  .dash-assigned-row { display: flex; align-items: center; gap: 14px; width: 100%; text-align: left; border: none; cursor: pointer; background: rgba(255,255,255,.07); border-radius: 14px; padding: 10px 12px; color: #fff; font-family: var(--f-sans); transition: background .15s; }
  .dash-assigned-row:hover { background: rgba(255,255,255,.13); }
  .dash-assigned-row .lib-row-title { color: #fff; }
  .dash-assigned-meta { font-size: 12px; color: var(--green-300); }
  .dash-assigned-cta { flex-shrink: 0; background: var(--amber); color: #3a1e0a; border-radius: 999px; padding: 8px 14px; font-weight: 800; font-size: 13px; }
  .dash-tag-assigned { background: var(--amber-soft) !important; color: #7a3e10 !important; }
  .dash-st { flex-shrink: 0; font-size: 12px; font-weight: 800; color: var(--text-muted); }
  .dash-st.ok { color: var(--green-800); }

  @media (max-width: 900px) {
    .dash-header { height: 56px; padding: 0 14px; }
    .lib-side { flex-direction: row; }
    .dash-side-garden { display: none; }
    .dash-mobile-garden { display: block; }
    .dash-stats-row { grid-template-columns: 1fr 1fr; gap: 8px; }
    .dash-stat { padding: 12px; } .dash-stat b { font-size: 21px; }
    .dash-assigned { padding: 12px; }
    .dash-assigned-row { gap: 10px; padding: 8px; }
    .dash-assigned-cta { padding: 7px 10px; font-size: 12px; }
    .dash-st { display: none; }
    .dash-head-btn { padding: 6px 12px; font-size: 12px; }
  }
`;

// Legacy exports kept so other files importing them don't break
export const QuizCard = ({ q, onStart }) => <QuizTile q={q} onStart={onStart} />;
export const CardSetCard = ({ s, onStart }) => <CardSetTile s={s} onStart={onStart} />;

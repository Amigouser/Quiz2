// Student dashboard — list of available quizzes + recent results

const DASHBOARD_QUIZZES = [
  { id: 1, topic: "Ботаника", title: "Строение растительной клетки", questions: 12, est: "8 мин", status: "done", score: 11 },
  { id: 2, topic: "Ботаника", title: "Фотосинтез: световая фаза", questions: 10, est: "7 мин", status: "inprogress", progress: 40 },
  { id: 3, topic: "Зоология", title: "Хордовые: общая характеристика", questions: 15, est: "12 мин", status: "new" },
  { id: 4, topic: "Генетика", title: "Законы Менделя", questions: 8, est: "6 мин", status: "new" },
  { id: 5, topic: "Анатомия", title: "Сердце и круги кровообращения", questions: 14, est: "10 мин", status: "done", score: 9 },
  { id: 6, topic: "Экология", title: "Биоценоз и цепи питания", questions: 11, est: "9 мин", status: "new" },
];

const QuizCard = ({ q, onStart }) => {
  const scorePct = q.score ? Math.round((q.score / q.questions) * 100) : null;
  const statusLabel = {
    done: `Пройден · ${q.score}/${q.questions}`,
    inprogress: "В процессе",
    new: "Новый",
  }[q.status];
  const statusColor = {
    done: { bg: "var(--green-200)", fg: "var(--green-900)" },
    inprogress: { bg: "var(--accent-soft)", fg: "#5a3a10" },
    new: { bg: "var(--bg-muted)", fg: "var(--text-soft)" },
  }[q.status];

  return (
    <div className="card" style={{ padding: 0, cursor: "pointer" }} onClick={onStart}>
      {/* Illustration strip */}
      <div style={{
        height: 120,
        background: "linear-gradient(135deg, var(--green-100), var(--green-200))",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, color: "var(--green-800)", opacity: 0.4 }}>
          {q.topic === "Ботаника" && <Fern size={160} style={{ position: "absolute", top: -20, right: -20 }} />}
          {q.topic === "Зоология" && <Helix size={120} style={{ position: "absolute", top: -10, right: 20 }} />}
          {q.topic === "Генетика" && <Helix size={140} style={{ position: "absolute", top: -20, right: -10 }} />}
          {q.topic === "Анатомия" && <Cell size={160} style={{ position: "absolute", top: -30, right: -20 }} />}
          {q.topic === "Экология" && <Sprig size={140} style={{ position: "absolute", top: 0, right: 0, transform: "rotate(20deg)" }} />}
        </div>
        <div style={{ position: "absolute", top: 14, left: 16 }}>
          <span className="pill pill-muted" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}>
            {q.topic}
          </span>
        </div>
      </div>

      <div style={{ padding: "18px 20px 20px" }}>
        <h3 style={{ fontFamily: "var(--f-serif)", fontSize: 20, fontWeight: 500, marginBottom: 10, lineHeight: 1.25 }}>
          {q.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "var(--text-soft)", marginBottom: 14 }}>
          <span>· {q.questions} вопросов</span>
          <span>· {q.est}</span>
        </div>

        {q.status === "inprogress" && (
          <div style={{ marginBottom: 14 }}>
            <div className="progress"><div className="progress-fill" style={{ width: `${q.progress}%` }}/></div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Пройдено {q.progress}%</div>
          </div>
        )}
        {q.status === "done" && (
          <div style={{ marginBottom: 14 }}>
            <div className="progress"><div className="progress-fill" style={{ width: `${scorePct}%` }}/></div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Результат {scorePct}%</div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="pill" style={{ background: statusColor.bg, color: statusColor.fg }}>
            {statusLabel}
          </span>
          <button className="btn btn-soft btn-sm" onClick={(e) => { e.stopPropagation(); onStart?.(); }}>
            {q.status === "done" ? "Повторить" : q.status === "inprogress" ? "Продолжить" : "Начать"}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6h6 M7 3 l 3 3 l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = ({ name = "Аня", onOpenQuiz, onAdmin }) => {
  const [tab, setTab] = React.useState("Все");
  const topics = ["Все", "Ботаника", "Зоология", "Генетика", "Анатомия", "Экология"];
  const filtered = tab === "Все" ? DASHBOARD_QUIZZES : DASHBOARD_QUIZZES.filter(q => q.topic === tab);

  const stats = {
    done: DASHBOARD_QUIZZES.filter(q => q.status === "done").length,
    total: DASHBOARD_QUIZZES.length,
    avg: Math.round(
      DASHBOARD_QUIZZES.filter(q => q.score).reduce((a, q) => a + q.score / q.questions, 0) /
      Math.max(1, DASHBOARD_QUIZZES.filter(q => q.score).length) * 100
    ),
  };

  return (
    <div style={{ minHeight: 800, background: "var(--bg)", paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "var(--green-800)",
            color: "#fff", display: "grid", placeItems: "center",
          }}>
            <Leaf size={18} stroke={1.8} />
          </div>
          <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 17 }}>Живая клетка</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={onAdmin}>Панель репетитора</button>
          <button className="btn btn-ghost btn-sm">История</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--green-200)",
              display: "grid", placeItems: "center", color: "var(--green-900)",
              fontFamily: "var(--f-serif)", fontWeight: 600,
            }}>{name[0]?.toUpperCase()}</div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: "40px 48px 28px", position: "relative", overflow: "hidden" }}>
        <BotanicalBg intensity={0.6} pattern="ferns" />
        <div style={{ position: "relative" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Понедельник · 20 апреля</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Привет, {name}. <em style={{ color: "var(--green-800)" }}>Продолжим?</em>
          </h1>
          <p style={{ color: "var(--text-soft)", fontSize: 16, maxWidth: 560 }}>
            У тебя один начатый тест и четыре новых. Елена Ивановна оставила заметку к теме «Фотосинтез» — посмотри, когда будешь готов.
          </p>
        </div>

        {/* Stat strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32, maxWidth: 720 }}>
          {[
            { v: `${stats.done}/${stats.total}`, l: "пройдено тестов" },
            { v: `${stats.avg}%`, l: "средний результат" },
            { v: "3 дня", l: "серия без перерыва", accent: true },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "18px 20px" }}>
              <div style={{
                fontFamily: "var(--f-serif)", fontSize: 28, fontWeight: 500, letterSpacing: "-0.01em",
                color: s.accent ? "var(--accent)" : "var(--text)",
              }}>{s.v}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 4 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "0 48px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {topics.map(t => (
            <div key={t} className={`chip ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Показано {filtered.length} из {DASHBOARD_QUIZZES.length}</div>
      </div>

      {/* Quizzes grid */}
      <div style={{ padding: "0 48px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {filtered.map(q => <QuizCard key={q.id} q={q} onStart={() => onOpenQuiz?.(q)} />)}
      </div>

      {/* Recent attempts */}
      <div style={{ padding: "56px 48px 0" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Последние попытки</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {[
            { t: "Строение растительной клетки", date: "вчера, 19:40", score: "11/12", pct: 92, ok: true },
            { t: "Сердце и круги кровообращения", date: "18 апр, 17:05", score: "9/14", pct: 64, ok: false },
            { t: "Классификация животных", date: "12 апр, 15:22", score: "10/10", pct: 100, ok: true },
          ].map((r, i, arr) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 140px 120px 90px",
              alignItems: "center", gap: 16,
              padding: "16px 22px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{r.t}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{r.date}</div>
              </div>
              <div className="progress"><div className="progress-fill" style={{ width: `${r.pct}%`, background: r.ok ? "linear-gradient(90deg, var(--green-600), var(--green-800))" : "linear-gradient(90deg, var(--accent), #c57a3a)" }}/></div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 20, fontWeight: 500 }}>{r.score}</div>
              <button className="btn btn-ghost btn-sm">Разбор</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { StudentDashboard });

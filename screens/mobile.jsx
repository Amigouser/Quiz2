// Mobile versions — login + quiz + dashboard condensed for phone frames

const MobileLogin = () => {
  const [name, setName] = React.useState("Аня");
  return (
    <div style={{ width: "100%", height: "100%", background: "var(--bg)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", padding: "60px 24px 32px" }}>
      <BotanicalBg intensity={1.5} pattern="ferns" />
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ color: "var(--green-800)", marginBottom: 28 }}>
          <Leaf size={44} stroke={1.6}/>
        </div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Живая клетка</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 8 }}>
          Добро пожаловать <em style={{ color: "var(--green-800)" }}>на урок</em>
        </h1>
        <p style={{ color: "var(--text-soft)", fontSize: 14, marginBottom: 28 }}>
          Введи имя — без паролей.
        </p>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Твоё имя</label>
          <input className="input input-lg" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-lg" style={{ justifyContent: "center" }}>Войти на урок 🌱</button>
      </div>
    </div>
  );
};

const MobileQuiz = () => (
  <div style={{ width: "100%", height: "100%", background: "var(--bg)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
    <div style={{ padding: "52px 20px 12px", borderBottom: "1px solid var(--border-soft)", background: "var(--surface)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ботаника</span>
        <span>3 / 12</span>
      </div>
      <div className="progress"><div className="progress-fill" style={{ width: "25%" }}/></div>
    </div>
    <div style={{ padding: "24px 20px", flex: 1, overflow: "auto" }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Вопрос 03</div>
      <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 22, lineHeight: 1.25, marginBottom: 18 }}>
        Какая структура отличает растительную клетку от животной?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { t: "Митохондрия", s: "" },
          { t: "Хлоропласт", s: "correct" },
          { t: "Рибосома", s: "wrong" },
          { t: "Аппарат Гольджи", s: "" },
        ].map((o, i) => (
          <div key={i} className={`answer ${o.s} ${o.s ? "locked" : ""}`} style={{ padding: "14px 14px" }}>
            <div className="letter" style={{ flex: "0 0 30px", height: 30, fontSize: 13 }}>{String.fromCharCode(65 + i)}</div>
            <div style={{ flex: 1, fontSize: 14 }}>{o.t}</div>
            {o.s === "correct" && <span>🌱</span>}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 16, padding: "12px 14px",
        background: "var(--correct-bg)",
        borderLeft: "3px solid var(--correct)",
        borderRadius: 8,
      }}>
        <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 12, color: "var(--correct)", marginBottom: 4 }}>🌱 Верно</div>
        <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5 }}>
          Хлоропласты содержат хлорофилл и осуществляют фотосинтез.
        </div>
      </div>
    </div>
    <div style={{ padding: "12px 20px 28px", borderTop: "1px solid var(--border-soft)", background: "var(--surface)" }}>
      <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>Дальше</button>
    </div>
  </div>
);

const MobileDashboard = () => (
  <div style={{ width: "100%", height: "100%", background: "var(--bg)", overflow: "auto", paddingBottom: 24 }}>
    <div style={{ padding: "52px 20px 20px", position: "relative", overflow: "hidden" }}>
      <BotanicalBg intensity={0.5} pattern="ferns" />
      <div className="eyebrow" style={{ marginBottom: 10, position: "relative" }}>20 апреля</div>
      <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 26, lineHeight: 1.1, position: "relative" }}>
        Привет, Аня. <em style={{ color: "var(--green-800)" }}>Продолжим?</em>
      </h1>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 22 }}>2/6</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>пройдено</div>
      </div>
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, color: "var(--accent)" }}>3 дня</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>серия</div>
      </div>
    </div>
    <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      {DASHBOARD_QUIZZES.slice(0, 3).map(q => (
        <div key={q.id} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "var(--green-100)",
            color: "var(--green-800)",
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            {q.topic === "Ботаника" ? <Fern size={28} /> : <Cell size={32} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{q.topic}</div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 15, lineHeight: 1.2, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.title}</div>
            <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 4 }}>{q.questions} вопросов · {q.est}</div>
          </div>
          <span style={{ fontSize: 14, color: "var(--green-800)" }}>→</span>
        </div>
      ))}
    </div>
  </div>
);

const MobileResults = () => (
  <div style={{ width: "100%", height: "100%", background: "var(--bg)", position: "relative", overflow: "auto", padding: "52px 20px 28px" }}>
    <BotanicalBg intensity={0.5} />
    <div style={{ position: "relative" }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Результат</div>
      <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 26, lineHeight: 1.1, marginBottom: 18 }}>
        Отлично, <em style={{ color: "var(--green-800)" }}>Аня!</em>
      </h1>
      <div className="card" style={{ padding: 22, marginBottom: 14, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, color: "var(--green-200)" }}>
          <Cell size={150} />
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 64, lineHeight: 1, color: "var(--green-800)" }}>10</div>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, color: "var(--text-muted)" }}>/ 12</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>83% правильно</div>
      </div>
      <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}>Пройти ещё раз</button>
      <button className="btn btn-ghost btn-lg" style={{ width: "100%", justifyContent: "center" }}>К списку тестов</button>
    </div>
  </div>
);

Object.assign(window, { MobileLogin, MobileQuiz, MobileDashboard, MobileResults });

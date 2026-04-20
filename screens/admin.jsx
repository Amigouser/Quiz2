// Admin panel — tests list, create test, students results

const ADMIN_TESTS = [
  { id: 1, title: "Строение растительной клетки", topic: "Ботаника", questions: 12, assigned: 8, avg: 82, updated: "18 апр" },
  { id: 2, title: "Фотосинтез: световая фаза", topic: "Ботаника", questions: 10, assigned: 12, avg: 71, updated: "15 апр" },
  { id: 3, title: "Хордовые: общая характеристика", topic: "Зоология", questions: 15, assigned: 6, avg: 68, updated: "11 апр" },
  { id: 4, title: "Законы Менделя", topic: "Генетика", questions: 8, assigned: 14, avg: 77, updated: "09 апр", draft: true },
  { id: 5, title: "Сердце и круги кровообращения", topic: "Анатомия", questions: 14, assigned: 10, avg: 65, updated: "02 апр" },
];

const ADMIN_STUDENTS = [
  { name: "Аня Соколова", grade: "9 класс", tests: 12, avg: 88, streak: 5, last: "сегодня" },
  { name: "Миша Петров", grade: "10 класс", tests: 10, avg: 74, streak: 0, last: "вчера" },
  { name: "Лена Воронцова", grade: "11 класс", tests: 14, avg: 92, streak: 12, last: "сегодня" },
  { name: "Кирилл Ефимов", grade: "9 класс", tests: 6, avg: 61, streak: 0, last: "3 дня назад" },
  { name: "Дана Гаршина", grade: "10 класс", tests: 9, avg: 80, streak: 2, last: "вчера" },
  { name: "Саша Белов", grade: "11 класс", tests: 11, avg: 85, streak: 4, last: "сегодня" },
];

const AdminSidebar = ({ active, onTab }) => {
  const items = [
    { id: "tests", label: "Тесты", icon: "📚" },
    { id: "create", label: "Создать тест", icon: "✎" },
    { id: "students", label: "Ученики", icon: "👥" },
    { id: "results", label: "Результаты", icon: "📈" },
    { id: "library", label: "Библиотека", icon: "🌱" },
  ];
  return (
    <div className="sidebar" style={{ minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 20px" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--green-800)", color: "#fff", display: "grid", placeItems: "center" }}>
          <Leaf size={18} stroke={1.8} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 15 }}>Живая клетка</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>панель репетитора</div>
        </div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", padding: "8px 14px 4px" }}>Обучение</div>
      {items.map(it => (
        <div key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`} onClick={() => onTab?.(it.id)}>
          <span className="nav-ico" style={{ width: 18, textAlign: "center", color: "var(--text-muted)" }}>{it.icon}</span>
          {it.label}
        </div>
      ))}
      <div style={{ marginTop: "auto", padding: 12, background: "var(--green-100)", borderRadius: 14, border: "1px solid var(--green-200)" }}>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 14, color: "var(--green-900)", marginBottom: 4 }}>Елена Ивановна</div>
        <div style={{ fontSize: 11, color: "var(--green-800)" }}>репетитор · 36 учеников</div>
      </div>
    </div>
  );
};

const AdminTestsList = () => (
  <div style={{ padding: "32px 40px", flex: 1 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Тесты</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 36, letterSpacing: "-0.01em" }}>Библиотека заданий</h1>
        <p style={{ color: "var(--text-soft)", marginTop: 6 }}>Собранные тесты по биологии. Назначай ученикам, редактируй, смотри статистику.</p>
      </div>
      <button className="btn btn-primary">+ Новый тест</button>
    </div>

    <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
      <div className="chip active">Все</div>
      <div className="chip">Ботаника</div>
      <div className="chip">Зоология</div>
      <div className="chip">Генетика</div>
      <div className="chip">Анатомия</div>
      <div style={{ flex: 1 }}/>
      <input className="input" placeholder="Поиск по названию…" style={{ maxWidth: 260, padding: "10px 14px" }} />
    </div>

    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 90px 110px 120px 110px",
        padding: "12px 20px",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--bg-muted)",
        fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
      }}>
        <div>Тест</div><div>Тема</div><div>Вопр.</div><div>Назначен</div><div>Средний балл</div><div style={{ textAlign: "right" }}>Действия</div>
      </div>
      {ADMIN_TESTS.map((t, i) => (
        <div key={t.id} style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 90px 110px 120px 110px",
          padding: "16px 20px", alignItems: "center",
          borderBottom: i < ADMIN_TESTS.length - 1 ? "1px solid var(--border-soft)" : "none",
        }}>
          <div>
            <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              {t.title}
              {t.draft && <span className="pill pill-accent" style={{ fontSize: 10 }}>черновик</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>обновлён {t.updated}</div>
          </div>
          <div><span className="pill" style={{ background: "var(--green-100)" }}>{t.topic}</span></div>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 18 }}>{t.questions}</div>
          <div style={{ color: "var(--text-soft)" }}>{t.assigned} учеников</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1 }}><div className="progress" style={{ height: 4 }}><div className="progress-fill" style={{ width: `${t.avg}%` }}/></div></div>
            <span style={{ fontFamily: "var(--f-serif)", fontSize: 14 }}>{t.avg}%</span>
          </div>
          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost btn-sm">Открыть</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminCreateTest = () => {
  const [questions, setQuestions] = React.useState([
    { id: 1, q: "Какая структура отличает растительную клетку от животной?",
      options: ["Митохондрия", "Хлоропласт", "Рибосома", "Аппарат Гольджи"],
      correct: 1, expand: true },
    { id: 2, q: "Где в клетке синтезируется АТФ?",
      options: ["В ядре", "В рибосомах", "В митохондриях", "В лизосомах"],
      correct: 2, expand: false },
  ]);

  return (
    <div style={{ padding: "32px 40px", flex: 1, display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          <span>Тесты</span><span>›</span><span style={{ color: "var(--text)" }}>Новый тест</span>
        </div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32, marginBottom: 6 }}>Создание теста</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 28 }}>Назови тест, добавь вопросы и варианты ответа. Не забудь отметить правильный.</p>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="field">
              <label>Название теста</label>
              <input className="input input-lg" defaultValue="Фотосинтез: тёмная фаза" />
            </div>
            <div className="field">
              <label>Тема</label>
              <select className="input input-lg" style={{ cursor: "pointer" }}>
                <option>Ботаника</option><option>Зоология</option><option>Генетика</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Краткое описание (необязательно)</label>
            <textarea className="input" rows={2} defaultValue="Проверяем понимание цикла Кальвина и роли стромы." style={{ resize: "vertical", fontFamily: "var(--f-sans)" }}/>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="eyebrow">Вопросы · {questions.length}</div>
          <button className="btn btn-ghost btn-sm">+ Добавить вопрос</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {questions.map((q, qi) => (
            <div key={q.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, background: q.expand ? "var(--green-100)" : "transparent", borderBottom: q.expand ? "1px solid var(--green-200)" : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--green-800)", color: "#fff", fontFamily: "var(--f-serif)", display: "grid", placeItems: "center", fontSize: 14 }}>
                  {qi + 1}
                </div>
                <div style={{ flex: 1, fontWeight: 500 }}>{q.q}</div>
                <span className="pill pill-muted">{q.options.length} варианта</span>
                <button className="btn btn-ghost btn-sm">{q.expand ? "Свернуть" : "Править"}</button>
              </div>
              {q.expand && (
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="field">
                    <label>Текст вопроса</label>
                    <input className="input" defaultValue={q.q} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", letterSpacing: "0.02em", marginBottom: 10 }}>
                      Варианты ответа · отметь правильный
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {q.options.map((o, oi) => (
                        <label key={oi} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px",
                          background: oi === q.correct ? "var(--correct-bg)" : "var(--bg-muted)",
                          border: `1.5px solid ${oi === q.correct ? "var(--correct)" : "transparent"}`,
                          borderRadius: "var(--r-md)",
                          cursor: "pointer",
                        }}>
                          <input type="radio" name={`q-${q.id}`} defaultChecked={oi === q.correct} style={{ accentColor: "var(--green-800)", width: 18, height: 18 }}/>
                          <input defaultValue={o} style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15 }}/>
                          {oi === q.correct && <span className="pill" style={{ background: "var(--green-800)", color: "#fff" }}>верный</span>}
                          <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}>✕</button>
                        </label>
                      ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>+ Добавить вариант</button>
                  </div>
                  <div className="field">
                    <label>Пояснение к правильному ответу (видно после выбора)</label>
                    <textarea className="input" rows={2} placeholder="Объясни, почему этот ответ правильный…" style={{ resize: "vertical", fontFamily: "var(--f-sans)" }}/>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button className="btn btn-soft" style={{ justifyContent: "center" }}>
            + Добавить ещё один вопрос
          </button>
        </div>
      </div>

      {/* Right — preview + publish */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 32, alignSelf: "flex-start" }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Предпросмотр</div>
          <div style={{ border: "1px solid var(--border-soft)", borderRadius: 12, padding: 16, background: "var(--bg-muted)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Вопрос 01</div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 15, lineHeight: 1.35, marginBottom: 12 }}>
              Какая структура отличает растительную клетку от животной?
            </div>
            {["Митохондрия","Хлоропласт","Рибосома","Аппарат Гольджи"].map((o, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", marginBottom: 6,
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
                fontSize: 12,
              }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bg-muted)", display: "grid", placeItems: "center", fontSize: 10 }}>
                  {String.fromCharCode(65 + i)}
                </div>
                {o}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Назначение</div>
          <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 10 }}>Выбери учеников, которым отправить тест:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["9 класс", "10 класс", "11 класс", "Аня С.", "Миша П."].map((g, i) => (
              <span key={i} className={`chip ${i < 2 ? "active" : ""}`}>{g}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn btn-primary btn-lg" style={{ justifyContent: "center" }}>Опубликовать тест</button>
          <button className="btn btn-ghost" style={{ justifyContent: "center" }}>Сохранить как черновик</button>
        </div>
      </div>
    </div>
  );
};

const AdminStudents = () => (
  <div style={{ padding: "32px 40px", flex: 1 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Ученики</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 36 }}>Твой класс</h1>
        <p style={{ color: "var(--text-soft)", marginTop: 6 }}>6 активных учеников. Кликни на строку, чтобы увидеть детальные результаты.</p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-ghost">Экспорт CSV</button>
        <button className="btn btn-primary">+ Пригласить</button>
      </div>
    </div>

    {/* Summary cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
      {[
        { v: "6", l: "учеников", sub: "все активны" },
        { v: "62", l: "попыток за неделю", sub: "+12 vs прошлая" },
        { v: "80%", l: "средний балл класса", sub: "стабильно" },
        { v: "Лена В.", l: "лидер недели", sub: "12 дней подряд", accent: true },
      ].map((s, i) => (
        <div key={i} className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 26, fontWeight: 500, color: s.accent ? "var(--accent)" : "var(--text)" }}>{s.v}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{s.l}</div>
          <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 8 }}>{s.sub}</div>
        </div>
      ))}
    </div>

    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 100px 90px 1.3fr 100px 120px 100px",
        padding: "12px 20px", borderBottom: "1px solid var(--border-soft)",
        background: "var(--bg-muted)",
        fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
      }}>
        <div>Ученик</div><div>Класс</div><div>Тестов</div><div>Средний балл</div><div>Серия</div><div>Последний вход</div><div style={{ textAlign: "right" }}></div>
      </div>
      {ADMIN_STUDENTS.map((s, i) => (
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "2fr 100px 90px 1.3fr 100px 120px 100px",
          padding: "14px 20px", alignItems: "center",
          borderBottom: i < ADMIN_STUDENTS.length - 1 ? "1px solid var(--border-soft)" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: ["var(--green-200)","var(--accent-soft)","var(--green-300)"][i % 3],
              color: "var(--green-900)",
              display: "grid", placeItems: "center",
              fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 13,
            }}>{s.name.split(" ").map(w => w[0]).join("")}</div>
            <div style={{ fontWeight: 500 }}>{s.name}</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-soft)" }}>{s.grade}</div>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 16 }}>{s.tests}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, maxWidth: 160 }}>
              <div className="progress" style={{ height: 4 }}>
                <div className="progress-fill" style={{
                  width: `${s.avg}%`,
                  background: s.avg >= 80 ? "linear-gradient(90deg, var(--green-600), var(--green-800))"
                    : s.avg >= 65 ? "linear-gradient(90deg, var(--accent), #c57a3a)"
                    : "linear-gradient(90deg, var(--wrong), #8a2e1c)",
                }}/>
              </div>
            </div>
            <span style={{ fontFamily: "var(--f-serif)", fontSize: 14 }}>{s.avg}%</span>
          </div>
          <div>
            {s.streak > 0 ? <span className="pill pill-accent">🔥 {s.streak} дн.</span> : <span className="pill pill-muted">—</span>}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-soft)" }}>{s.last}</div>
          <div style={{ textAlign: "right" }}><button className="btn btn-ghost btn-sm">Детали</button></div>
        </div>
      ))}
    </div>
  </div>
);

const AdminPanel = ({ initialTab = "tests" }) => {
  const [tab, setTab] = React.useState(initialTab);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 800, background: "var(--bg)" }}>
      <AdminSidebar active={tab} onTab={setTab} />
      {tab === "tests" && <AdminTestsList />}
      {tab === "create" && <AdminCreateTest />}
      {tab === "students" && <AdminStudents />}
      {tab === "results" && <AdminStudents />}
      {tab === "library" && <AdminTestsList />}
    </div>
  );
};

Object.assign(window, { AdminPanel, AdminTestsList, AdminCreateTest, AdminStudents });

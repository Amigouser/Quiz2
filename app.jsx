// Main app — lays out all screens on a design canvas

const TWEAKS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "amber",
  "density": "cozy",
  "cards": "shadow"
}/*EDITMODE-END*/;

// Phone frame — simple iOS-ish
const Phone = ({ children, label }) => (
  <div style={{ position: "relative" }}>
    {label && <div style={{ position: "absolute", bottom: "100%", left: 0, paddingBottom: 8, fontSize: 12, fontWeight: 500, color: "rgba(60,50,40,0.7)", whiteSpace: "nowrap" }}>{label}</div>}
    <div style={{
      width: 375, height: 780,
      borderRadius: 44,
      background: "#0b120e",
      padding: 10,
      boxShadow: "0 30px 60px rgba(20,40,30,0.25), 0 8px 18px rgba(0,0,0,0.1), inset 0 0 0 2px #1a2520",
    }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: "var(--bg)", position: "relative" }}>
        {/* notch */}
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 110, height: 30, borderRadius: 20, background: "#0b120e", zIndex: 10 }}/>
        {/* status */}
        <div style={{ position: "absolute", top: 18, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 30px", fontSize: 13, fontWeight: 600, color: "var(--text)", zIndex: 11 }}>
          <span>9:41</span>
          <span style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 11 }}>•••• 🔋</span>
        </div>
        {children}
      </div>
    </div>
  </div>
);

// Browser window — simple chrome
const Browser = ({ children, label, url = "живая-клетка.ru", width = 1280, height = 860 }) => (
  <div style={{ position: "relative" }}>
    {label && <div style={{ position: "absolute", bottom: "100%", left: 0, paddingBottom: 8, fontSize: 12, fontWeight: 500, color: "rgba(60,50,40,0.7)", whiteSpace: "nowrap" }}>{label}</div>}
    <div style={{
      width, height,
      borderRadius: 12,
      background: "#e8e3d4",
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 30px 80px rgba(20,40,30,0.18), 0 8px 20px rgba(0,0,0,0.08)",
      overflow: "hidden",
    }}>
      <div style={{ height: 38, display: "flex", alignItems: "center", padding: "0 14px", gap: 10, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f05d50" }}/>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f4b947" }}/>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#4cbf56" }}/>
        </div>
        <div style={{ flex: 1, background: "#f7f4ea", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#5a6358", textAlign: "center", fontFamily: "ui-monospace, monospace" }}>
          🔒 {url}
        </div>
        <div style={{ width: 60 }}/>
      </div>
      <div style={{ width: "100%", height: "calc(100% - 38px)", overflow: "auto", background: "var(--bg)" }}>
        {children}
      </div>
    </div>
  </div>
);

function App() {
  const [t, setT] = React.useState(TWEAKS);
  const [showTweaks, setShowTweaks] = React.useState(false);

  React.useEffect(() => {
    const root = document.body;
    root.dataset.theme = t.theme;
    root.dataset.accent = t.accent;
    root.dataset.density = t.density;
    root.dataset.cards = t.cards;
  }, [t]);

  // Tweaks protocol
  React.useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") setShowTweaks(true);
      if (e.data?.type === "__deactivate_edit_mode") setShowTweaks(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const update = (k, v) => {
    const next = { ...t, [k]: v };
    setT(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [k]: v } }, "*");
  };

  return (
    <>
      <DesignCanvas>
        <DCSection title="Дизайн-система" subtitle="Принципы, токены, типографика и компоненты">
          <DCArtboard width={1100} height={1520}>
            <DesignSystemSheet />
          </DCArtboard>
        </DCSection>

        <DCSection title="Вход · 2 варианта" subtitle="Книжный split-экран и компактная карточка с аватаром репетитора">
          <DCArtboard label="A · Split — книжная обложка" width={1280} height={820}>
            <Browser url="живая-клетка.ru/вход" width={1280} height={820}>
              <LoginClassic />
            </Browser>
          </DCArtboard>
          <DCArtboard label="B · Компактная карточка" width={1280} height={820}>
            <Browser url="живая-клетка.ru/вход" width={1280} height={820}>
              <LoginCompact />
            </Browser>
          </DCArtboard>
        </DCSection>

        <DCSection title="Dashboard ученика" subtitle="Приветствие, статистика, фильтры по темам, карточки тестов">
          <DCArtboard width={1280} height={1360}>
            <Browser url="живая-клетка.ru" width={1280} height={1360}>
              <StudentDashboard />
            </Browser>
          </DCArtboard>
        </DCSection>

        <DCSection title="Прохождение теста · 2 варианта" subtitle="Классический stepper и фокусный split с ботанической плитой. Ответы раскрашиваются сразу.">
          <DCArtboard label="A · Classic stepper" width={1280} height={860}>
            <Browser url="живая-клетка.ru/тест/фотосинтез" width={1280} height={860}>
              <QuizClassic />
            </Browser>
          </DCArtboard>
          <DCArtboard label="B · Focused split" width={1280} height={860}>
            <Browser url="живая-клетка.ru/тест/фотосинтез" width={1280} height={860}>
              <QuizFocused />
            </Browser>
          </DCArtboard>
        </DCSection>

        <DCSection title="Экран результата" subtitle="Большой счёт, разбивка по темам, разбор ошибки, следующий шаг. Листья падают на входе.">
          <DCArtboard width={1280} height={900}>
            <Browser url="живая-клетка.ru/тест/результат" width={1280} height={900}>
              <QuizResults />
            </Browser>
          </DCArtboard>
        </DCSection>

        <DCSection title="Админ-панель" subtitle="Список тестов · создание теста · ученики и их результаты">
          <DCArtboard label="Тесты" width={1280} height={900}>
            <Browser url="живая-клетка.ru/админ/тесты" width={1280} height={900}>
              <AdminPanel initialTab="tests" />
            </Browser>
          </DCArtboard>
          <DCArtboard label="Создание теста" width={1280} height={1200}>
            <Browser url="живая-клетка.ru/админ/новый-тест" width={1280} height={1200}>
              <AdminPanel initialTab="create" />
            </Browser>
          </DCArtboard>
          <DCArtboard label="Ученики" width={1280} height={900}>
            <Browser url="живая-клетка.ru/админ/ученики" width={1280} height={900}>
              <AdminPanel initialTab="students" />
            </Browser>
          </DCArtboard>
        </DCSection>

        <DCSection title="Mobile" subtitle="Адаптивные ключевые экраны в iPhone-раме">
          <Phone label="Вход"><MobileLogin /></Phone>
          <Phone label="Dashboard"><MobileDashboard /></Phone>
          <Phone label="Квиз — выбор сделан"><MobileQuiz /></Phone>
          <Phone label="Результат"><MobileResults /></Phone>
        </DCSection>

        <DCPostIt top={60} right={60} rotate={3}>
          Всё в одном scrollable canvas — масштабируй колёсиком, таскай за фон
        </DCPostIt>
      </DesignCanvas>

      {/* Tweaks panel */}
      {showTweaks && (
        <div style={{
          position: "fixed", bottom: 20, right: 20,
          width: 280,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          zIndex: 10000,
          fontFamily: "var(--f-sans)",
        }}>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Tweaks
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--f-mono)" }}>v0.1</span>
          </div>

          <TweakRow label="Тема">
            {["light","sepia","dark"].map(v => (
              <TweakChip key={v} active={t.theme === v} onClick={() => update("theme", v)}>{v}</TweakChip>
            ))}
          </TweakRow>
          <TweakRow label="Акцент">
            {["amber","coral","ochre"].map(v => (
              <TweakChip key={v} active={t.accent === v} onClick={() => update("accent", v)}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: `var(--${v})`, display: "inline-block", marginRight: 6, verticalAlign: "middle" }}/>
                {v}
              </TweakChip>
            ))}
          </TweakRow>
          <TweakRow label="Плотность">
            {["compact","cozy","spacious"].map(v => (
              <TweakChip key={v} active={t.density === v} onClick={() => update("density", v)}>{v}</TweakChip>
            ))}
          </TweakRow>
          <TweakRow label="Карточки">
            {["flat","shadow","outline"].map(v => (
              <TweakChip key={v} active={t.cards === v} onClick={() => update("cards", v)}>{v}</TweakChip>
            ))}
          </TweakRow>
        </div>
      )}
    </>
  );
}

const TweakRow = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{children}</div>
  </div>
);
const TweakChip = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "5px 10px",
    fontSize: 12,
    border: `1px solid ${active ? "var(--green-800)" : "var(--border)"}`,
    background: active ? "var(--green-800)" : "var(--surface)",
    color: active ? "#fff" : "var(--text-soft)",
    borderRadius: 999,
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "lowercase",
  }}>{children}</button>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

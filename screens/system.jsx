// Design system overview — tokens, type, colors, components displayed as a style guide

const DesignSystemSheet = () => {
  return (
    <div style={{
      width: 1100,
      background: "var(--bg)",
      padding: "48px 56px",
      position: "relative",
      overflow: "hidden",
    }}>
      <BotanicalBg intensity={0.35} pattern="mix" />

      {/* Header */}
      <div style={{ position: "relative", marginBottom: 48, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Система · v0.1</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 64, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 10 }}>
            Живая <em style={{ color: "var(--green-800)" }}>клетка</em>
          </h1>
          <p style={{ color: "var(--text-soft)", fontSize: 16, maxWidth: 520 }}>
            Дизайн-система для образовательной платформы репетитора по биологии. Книжный, природный, спокойный — как страница из современного учебника.
          </p>
        </div>
        <div style={{ color: "var(--green-700)", opacity: 0.8 }}>
          <Cell size={120} />
        </div>
      </div>

      {/* Principles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 48 }}>
        {[
          { t: "Книжный", d: "Тёплые кремовые фоны, серифный заголовочный шрифт, научные подписи курсивом." },
          { t: "Живой", d: "Мягкие анимации hover, падающие листья при правильном ответе, органические формы." },
          { t: "Чистый", d: "Много воздуха, одна акцентная единица в кадре, минимум декора на рабочих поверхностях." },
        ].map((p, i) => (
          <div key={i} className="card" style={{ padding: 22 }}>
            <div style={{ color: "var(--green-800)", marginBottom: 14 }}>
              {[<Leaf size={28} stroke={1.6}/>, <Sprig size={40}/>, <Cell size={40}/>][i]}
            </div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 20, marginBottom: 6 }}>{p.t}</div>
            <div style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.5 }}>{p.d}</div>
          </div>
        ))}
      </div>

      {/* Colors */}
      <SectionHeader n="01" title="Палитра" sub="Зелёные оттенки листвы, кремовая бумага, янтарный акцент" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          ["green-900", "#1b3d2a"], ["green-800", "#2d6a4f"], ["green-700", "#3d8765"], ["green-600", "#52b788"],
          ["green-500", "#74c69d"], ["green-400", "#95d5b2"], ["green-300", "#b7e4c7"], ["green-200", "#d8f3dc"],
        ].map(([n, v]) => (
          <div key={n}>
            <div style={{ background: v, borderRadius: 10, height: 72, border: "1px solid var(--border-soft)" }}/>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, marginTop: 6, color: "var(--text-soft)" }}>{v}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{n}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10, marginBottom: 48 }}>
        {[
          ["cream-50", "#fbfaf5"], ["cream-100", "#f7f4ea"], ["cream-200", "#efeadd"], ["cream-300", "#e3dcc9"],
          ["amber", "#f4a261"], ["coral", "#e07a5f"], ["ochre", "#c89b3c"], ["ink-900", "#1a1f1b"],
        ].map(([n, v]) => (
          <div key={n}>
            <div style={{ background: v, borderRadius: 10, height: 72, border: "1px solid var(--border-soft)" }}/>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, marginTop: 6, color: "var(--text-soft)" }}>{v}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{n}</div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <SectionHeader n="02" title="Типографика" sub="Fraunces — заголовки и научные подписи · Manrope — интерфейс и тело" />
      <div className="card" style={{ padding: 32, marginBottom: 48 }}>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 72, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 6 }}>
          Фотосинтез
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--f-mono)", marginBottom: 28 }}>
          Fraunces · 400 · 72/72 · tracking −3%
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TypeRow size={44} weight={400} label="Display · Fraunces 44" font="var(--f-serif)">Живая клетка</TypeRow>
            <TypeRow size={32} weight={500} label="H1 · Fraunces 32" font="var(--f-serif)">Строение клетки</TypeRow>
            <TypeRow size={22} weight={500} label="H2 · Fraunces 22" font="var(--f-serif)">Органоиды клетки</TypeRow>
            <TypeRow size={18} weight={500} label="H3 · Fraunces 18 italic" font="var(--f-serif)" italic>Fig. 1 — Cellula</TypeRow>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TypeRow size={16} weight={400} label="Body · Manrope 16/1.55">
              Хлоропласты — органоиды, осуществляющие фотосинтез. Содержат хлорофилл и другие пигменты.
            </TypeRow>
            <TypeRow size={14} weight={500} label="Small · Manrope 14/1.5">
              Подпись к карточке · кнопка · мета-информация
            </TypeRow>
            <TypeRow size={11} weight={700} label="Eyebrow · 11/uppercase/0.18em" mono>
              УРОК № 24 · 20 АПРЕЛЯ
            </TypeRow>
            <TypeRow size={12} weight={400} label="Mono · JetBrains 12" font="var(--f-mono)">
              #2d6a4f / oklch(0.42 0.08 155)
            </TypeRow>
          </div>
        </div>
      </div>

      {/* Components */}
      <SectionHeader n="03" title="Компоненты" sub="Кнопки, поля, карточки, пилюли, прогресс" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Кнопки</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-accent">Accent</button>
            <button className="btn btn-soft">Soft</button>
            <button className="btn btn-ghost">Ghost</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button className="btn btn-primary btn-sm">Small</button>
            <button className="btn btn-primary">Default</button>
            <button className="btn btn-primary btn-lg">Large</button>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Пилюли</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <span className="pill">Пройден</span>
            <span className="pill pill-accent">В процессе</span>
            <span className="pill pill-muted">Новый</span>
            <span className="pill pill-dot" style={{ background: "var(--correct-bg)", color: "var(--correct)" }}>Верно</span>
            <span className="pill pill-dot" style={{ background: "var(--wrong-bg)", color: "var(--wrong)" }}>Ошибка</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "14px 0 10px" }}>Чипы</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <span className="chip active">Ботаника</span>
            <span className="chip">Зоология</span>
            <span className="chip">Генетика</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 48 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Поля</div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Имя ученика</label>
            <input className="input" placeholder="Например, Аня"/>
          </div>
          <div className="field">
            <label>Название теста</label>
            <input className="input input-lg" defaultValue="Фотосинтез"/>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Прогресс</div>
          <div style={{ marginBottom: 10 }}><div className="progress"><div className="progress-fill" style={{ width: "25%" }}/></div></div>
          <div style={{ marginBottom: 10 }}><div className="progress"><div className="progress-fill" style={{ width: "66%" }}/></div></div>
          <div style={{ marginBottom: 18 }}><div className="progress"><div className="progress-fill" style={{ width: "92%" }}/></div></div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Варианты ответа</div>
          <div className="answer" style={{ marginBottom: 6 }}>
            <div className="letter">A</div>
            <div>Нейтральное состояние</div>
          </div>
          <div className="answer correct locked">
            <div className="letter">B</div>
            <div>Правильный ответ</div>
            <span>🌱</span>
          </div>
        </div>
      </div>

      {/* Icons */}
      <SectionHeader n="04" title="Иконография" sub="Тонкие ботанические гравюры, все используют currentColor" />
      <div className="card" style={{ padding: 32, color: "var(--green-800)", display: "flex", gap: 32, alignItems: "center", justifyContent: "space-around" }}>
        <IconPreview label="Leaf"><Leaf size={48} stroke={1.2}/></IconPreview>
        <IconPreview label="Fern"><Fern size={64} stroke={1}/></IconPreview>
        <IconPreview label="Sprig"><Sprig size={60} stroke={1}/></IconPreview>
        <IconPreview label="Cell"><Cell size={64}/></IconPreview>
        <IconPreview label="Helix"><Helix size={48}/></IconPreview>
      </div>
    </div>
  );
};

const SectionHeader = ({ n, title, sub }) => (
  <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", gap: 16 }}>
    <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 32, color: "var(--green-700)", letterSpacing: "-0.02em" }}>{n}</div>
    <div style={{ flex: 1, borderBottom: "1px solid var(--border)" }}/>
    <div style={{ fontFamily: "var(--f-serif)", fontSize: 22 }}>{title}</div>
    <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 320, textAlign: "right" }}>{sub}</div>
  </div>
);

const TypeRow = ({ size, weight, label, font, italic, mono, children }) => (
  <div>
    <div style={{
      fontFamily: font || (mono ? "var(--f-mono)" : "var(--f-sans)"),
      fontSize: size, fontWeight: weight,
      fontStyle: italic ? "italic" : "normal",
      lineHeight: size > 32 ? 1.1 : 1.5,
      letterSpacing: size > 32 ? "-0.02em" : size < 14 ? "0.06em" : "-0.005em",
      textTransform: mono && size <= 12 ? "uppercase" : "none",
      color: "var(--text)",
      marginBottom: 4,
    }}>{children}</div>
    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em" }}>{label}</div>
  </div>
);

const IconPreview = ({ label, children }) => (
  <div style={{ textAlign: "center", color: "inherit" }}>
    {children}
    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>{label}</div>
  </div>
);

Object.assign(window, { DesignSystemSheet });

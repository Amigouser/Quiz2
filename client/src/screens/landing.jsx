import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Fern, Sprig, Cell, Helix } from "../botanical";

// ─── Настройки — отредактируй под своё ─────────────────────────────────────
const TUTOR_PHOTO = "/tutor.png";

const TUTOR = {
  name:    "Никитенко Виктория Юрьевна",
  title:   "Репетитор по биологии",
  tagline: "Студент-исследователь ТГУ, арахнолог.\nГотовлю к ОГЭ и ЕГЭ — понятно, системно, с результатом.",
  bio:     "Магистр фундаментальной и прикладной биологии, кафедра зоологии беспозвоночных Томского государственного университета (2025). С 2023 года работаю репетитором по биологии. Средняя оценка на Профи.ру — 5.0.",
  stats: [
    { value: 2,  suffix: "+",  label: "года опыта" },
    { value: 25, suffix: "+",  label: "учеников" },
    { value: 5,  suffix: ".0", label: "рейтинг Профи.ру" },
  ],
};

const DIPLOMAS = [
  {
    year: "2019–2023",
    title: "Бакалавр биологии",
    institution: "Томский государственный университет",
    faculty: "Направление 06.03.01 «Биология»",
  },
  {
    year: "2023–2025",
    title: "Магистр фундаментальной и прикладной биологии",
    institution: "Томский государственный университет",
    faculty: "Кафедра зоологии беспозвоночных · 06.04.01",
  },
  {
    year: "2023",
    title: "Earth Science Camp",
    institution: "СПбГУ · Карельский научный центр РАН",
    faculty: "Студенческая школа по естественным наукам · Санкт-Петербург",
  },
];

const ARTICLES = [
  {
    year: "2024",
    title: "Обзор рода Mustelicosa и близких видов группы albostriata из рода Alopecosa (Araneae: Lycosidae)",
    journal: "Экология: факты, гипотезы, модели",
    volume: "ИЭРиЖ УрО РАН, Екатеринбург. С. 152",
    url: null,
  },
  {
    year: "2023",
    title: "Фауна пауков (Chelecerata, Aranei) на южной окраине г. Томска и его окрестностей",
    journal: "Биосистемы: организация, поведение, управление",
    volume: "76-я Всероссийская школа-конференция, Н. Новгород. С. 234",
    url: null,
  },
  {
    year: "2022",
    title: "Фауна пауков (Araneae) Томска",
    journal: "XVI Съезд Русского энтомологического общества",
    volume: "Москва, КМК. С. 151",
    url: null,
  },
  {
    year: "2022",
    title: "Фауна пауков Томска",
    journal: "Старт в науку — LXXI конференция Биологического института ТГУ",
    volume: "Томск: Дельтаплан. С. 35",
    url: null,
  },
  {
    year: "2020",
    title: "Biology + technology",
    journal: "Старт в науку — LXIX конференция Биологического института ТГУ",
    volume: "Томск: Дельтаплан. P. 109",
    url: null,
  },
];

const VK_EVENTS = [
  {
    date: "Сент. 2023",
    title: "Earth Science Camp",
    desc: "Студенческая школа по естественным наукам · СПбГУ и КарНЦ РАН, Санкт-Петербург",
    url: "https://vk.com/wall-219644318_39",
    icon: "🏕️",
  },
  {
    date: "Май 2023",
    title: "Ночь в музее",
    desc: "Лекция «Микромир в макропроцессах: удивительные насекомые» · ТГУ",
    url: "https://vk.com/wall-219644318_33",
    icon: "🦋",
  },
  {
    date: "Март 2023",
    title: "Живая Земля",
    desc: "Практикум «Энтомология — искусство коллекционирования» для школьников · ТГУ",
    url: "https://vk.com/wall-219644318_19",
    icon: "🔬",
  },
];

const FEATURES = [
  { icon: "🔬", title: "Научная основа",        text: "Действующий исследователь ТГУ — преподаю биологию на основе актуальной науки, а не только учебников." },
  { icon: "🎯", title: "Подготовка к экзаменам", text: "Специализируюсь на ОГЭ и ЕГЭ по биологии. Разбираем типичные ошибки и отрабатываем слабые места." },
  { icon: "🌿", title: "Понятный язык",          text: "Сложные темы объясняю на живых примерах. Зоология, ботаника, генетика — без скуки и зубрёжки." },
  { icon: "📈", title: "Виден прогресс",         text: "Тесты после каждого урока прямо на этой платформе — и ты, и я видим твой результат в реальном времени." },
];

// ─── CSS-анимации ────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes lf-float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-16px) rotate(2.5deg); }
    66%      { transform: translateY(-8px) rotate(-1.5deg); }
  }
  @keyframes lf-float2 {
    0%,100% { transform: translateY(0px) rotate(0deg) scaleX(-1); }
    50%     { transform: translateY(-20px) rotate(-3deg) scaleX(-1); }
  }
  @keyframes lf-drift {
    0%,100% { transform: translateY(0) translateX(0) rotate(0deg); }
    25%     { transform: translateY(-12px) translateX(6px) rotate(3deg); }
    75%     { transform: translateY(8px)  translateX(-4px) rotate(-2deg); }
  }
  @keyframes lf-pulse {
    0%,100% { opacity: 0.12; transform: scale(1); }
    50%     { opacity: 0.22; transform: scale(1.04); }
  }
  @keyframes lf-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes lf-in {
    from { opacity:0; transform: translateY(40px) scale(0.97); }
    to   { opacity:1; transform: translateY(0)    scale(1); }
  }
  @keyframes lf-counter-in {
    from { opacity:0; transform: scale(0.7); }
    to   { opacity:1; transform: scale(1); }
  }
  @keyframes lf-bg-shift {
    0%,100% { background-position: 0% 50%; }
    50%     { background-position: 100% 50%; }
  }
  @keyframes lf-glow {
    0%,100% { box-shadow: 0 0 0 0 rgba(82,183,136,0); }
    50%     { box-shadow: 0 0 40px 8px rgba(82,183,136,0.18); }
  }

  .lf-reveal {
    opacity: 0;
    transform: translateY(36px);
    transition: opacity 0.75s cubic-bezier(0.22,0.8,0.32,1),
                transform 0.75s cubic-bezier(0.22,0.8,0.32,1);
  }
  .lf-reveal.visible { opacity: 1; transform: none; }

  .lf-reveal-left {
    opacity: 0; transform: translateX(-40px);
    transition: opacity 0.75s cubic-bezier(0.22,0.8,0.32,1),
                transform 0.75s cubic-bezier(0.22,0.8,0.32,1);
  }
  .lf-reveal-left.visible { opacity: 1; transform: none; }

  .lf-reveal-right {
    opacity: 0; transform: translateX(40px);
    transition: opacity 0.75s cubic-bezier(0.22,0.8,0.32,1),
                transform 0.75s cubic-bezier(0.22,0.8,0.32,1);
  }
  .lf-reveal-right.visible { opacity: 1; transform: none; }

  .lf-card-hover {
    transition: transform 0.28s cubic-bezier(0.22,0.8,0.32,1),
                box-shadow 0.28s cubic-bezier(0.22,0.8,0.32,1),
                border-color 0.2s ease;
    cursor: default;
  }
  .lf-card-hover:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 20px 60px rgba(26,52,36,0.14), 0 4px 14px rgba(26,52,36,0.08);
  }

  .lf-nav-link {
    position: relative; text-decoration: none;
    font-size: 14px; font-weight: 500;
    color: rgba(255,255,255,0.75);
    transition: color 0.2s;
    padding: 4px 0;
  }
  .lf-nav-link::after {
    content: ""; position: absolute; bottom: -2px; left: 0;
    width: 0; height: 1.5px;
    background: #b7e4c7;
    transition: width 0.25s cubic-bezier(0.22,0.8,0.32,1);
  }
  .lf-nav-link:hover { color: #b7e4c7; }
  .lf-nav-link:hover::after { width: 100%; }

  .lf-hero-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px; border-radius: 999px;
    font-weight: 600; font-size: 15px; border: none; cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.2s ease, opacity 0.2s;
  }
  .lf-hero-btn:active { transform: scale(0.96) !important; }

  .lf-hero-btn-primary {
    background: #b7e4c7; color: #0f2a1e;
  }
  .lf-hero-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 32px rgba(183,228,199,0.35);
  }

  .lf-hero-btn-ghost {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.85);
    border: 1.5px solid rgba(255,255,255,0.18);
    backdrop-filter: blur(8px);
  }
  .lf-hero-btn-ghost:hover {
    background: rgba(255,255,255,0.14);
    transform: translateY(-2px);
  }

  .lf-feature-card {
    transition: transform 0.3s cubic-bezier(0.22,0.8,0.32,1),
                background 0.2s, box-shadow 0.3s;
    border-radius: 20px;
    border: 1.5px solid var(--border-soft);
    background: var(--surface);
    box-shadow: var(--sh-sm);
  }
  .lf-feature-card:hover {
    transform: translateY(-4px);
    background: var(--green-50);
    border-color: var(--green-300);
    box-shadow: 0 16px 48px rgba(26,52,36,0.1);
  }

  .lf-article-row {
    transition: background 0.18s, padding-left 0.22s cubic-bezier(0.22,0.8,0.32,1);
    border-radius: 12px;
  }
  .lf-article-row:hover {
    background: var(--green-50);
    padding-left: 32px !important;
  }

  .lf-stat-card {
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
  }
  .lf-stat-card:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 20px 60px rgba(26,52,36,0.14);
  }

  .lf-nav-link.lf-nav-active { color: #b7e4c7; }
  .lf-nav-link.lf-nav-active::after { width: 100%; }
`;

// ─── Хук: активная секция в навигации ────────────────────────────────────────
function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const visible = new Set();
    const update = () => setActive(ids.find(id => visible.has(id)) ?? null);
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const io = new IntersectionObserver(
        ([entry]) => { entry.isIntersecting ? visible.add(id) : visible.delete(id); update(); },
        { rootMargin: "-64px 0px -50% 0px", threshold: 0 }
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach(io => io?.disconnect());
  }, []);
  return active;
}

// ─── Хук: анимации при скролле ───────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".lf-reveal,.lf-reveal-left,.lf-reveal-right")
      .forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

// ─── Компонент: анимированный счётчик ────────────────────────────────────────
function CountUp({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1200;
        const steps = 50;
        const step = value / steps;
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, value);
          setCount(Math.round(current));
          if (current >= value) clearInterval(timer);
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Волновой разделитель ─────────────────────────────────────────────────────
function WaveDivider({ fill = "var(--bg)", fromColor = "#0f2a1e" }) {
  return (
    <div style={{ background: fromColor, lineHeight: 0 }}>
      <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%" }}>
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,10 1440,40 L1440,72 L0,72 Z"
          fill={fill}/>
      </svg>
    </div>
  );
}

// ─── Главный компонент ───────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  useReveal();
  const activeSection = useActiveSection(["about", "diplomas", "articles"]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: "var(--f-sans)", overflowX: "hidden" }}>
      <style>{STYLES}</style>

      {/* ══ HEADER ════════════════════════════════════════════════════════════ */}
      <header className="lf-header" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(15, 42, 30, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--green-600)", color: "#fff",
            display: "grid", placeItems: "center",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.12)",
          }}>
            <Leaf size={18} stroke={1.8} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 16, color: "#fff", lineHeight: 1.1 }}>
              Живая клетка
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>
            </div>
          </div>
        </div>

        <nav className="lf-nav" style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {[["Об авторе","about"],["Образование","diplomas"],["Конференции","articles"]].map(([l,id]) => (
            <a key={id} href={`#${id}`} className={`lf-nav-link${activeSection === id ? " lf-nav-active" : ""}`}>{l}</a>
          ))}
        </nav>

        <button
          className="lf-hero-btn lf-hero-btn-primary lf-header-btn"
          style={{ padding: "10px 22px", fontSize: 14 }}
          onClick={() => navigate("/login")}
        >
          Войти в кабинет
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      {/* ══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section className="lf-hero-section" style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0a1f14 0%, #0f2a1e 40%, #1b3d2a 70%, #2d5a40 100%)",
        backgroundSize: "200% 200%",
        animation: "lf-bg-shift 12s ease infinite",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center",
        paddingTop: 64,
      }}>
        {/* Floating botanical decorations */}
        <div style={{ position: "absolute", top: "8%", right: "6%", color: "#52b788", opacity: 0.12, animation: "lf-float 8s ease-in-out infinite", pointerEvents: "none" }}>
          <Fern size={340} />
        </div>
        <div style={{ position: "absolute", bottom: "5%", left: "2%", color: "#52b788", opacity: 0.08, animation: "lf-float2 10s ease-in-out infinite 2s", pointerEvents: "none" }}>
          <Fern size={240} />
        </div>
        <div style={{ position: "absolute", top: "20%", left: "5%", color: "#74c69d", opacity: 0.07, animation: "lf-drift 14s ease-in-out infinite", pointerEvents: "none" }}>
          <Sprig size={160} />
        </div>
        <div style={{ position: "absolute", top: "55%", right: "18%", color: "#b7e4c7", opacity: 0.06, animation: "lf-drift 9s ease-in-out infinite 3s", pointerEvents: "none" }}>
          <Helix size={100} />
        </div>
        <div style={{ position: "absolute", bottom: "20%", right: "4%", color: "#52b788", opacity: 0.08, animation: "lf-pulse 7s ease-in-out infinite 1s", pointerEvents: "none" }}>
          <Cell size={180} />
        </div>
        {/* Ambient orb */}
        <div style={{
          position: "absolute", top: "30%", right: "28%",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(82,183,136,0.12) 0%, transparent 70%)",
          animation: "lf-pulse 6s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div className="lf-hero-grid" style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "80px 48px",
          display: "grid", gridTemplateColumns: "1fr 420px",
          gap: 72, alignItems: "center",
          position: "relative", width: "100%",
        }}>
          {/* Left */}
          <div style={{ animation: "lf-in 0.9s cubic-bezier(0.22,0.8,0.32,1) both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(183,228,199,0.12)",
              border: "1px solid rgba(183,228,199,0.25)",
              borderRadius: 999, padding: "6px 16px",
              marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#74c69d", animation: "lf-pulse 2s infinite", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#b7e4c7", letterSpacing: "0.08em", fontWeight: 600 }}>
                РЕПЕТИТОР ПО БИОЛОГИИ · ОГЭ И ЕГЭ
              </span>
            </div>

            <h1 style={{
              fontFamily: "var(--f-serif)",
              fontSize: "clamp(44px, 5.5vw, 78px)",
              lineHeight: 1.0, letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: 28,
            }}>
              {TUTOR.name}
              <br />
              <em style={{
                color: "transparent",
                backgroundImage: "linear-gradient(135deg, #74c69d, #b7e4c7)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                fontStyle: "italic",
              }}>
                {TUTOR.title}
              </em>
            </h1>

            <p style={{
              fontSize: 18, lineHeight: 1.7,
              color: "rgba(255,255,255,0.65)",
              maxWidth: 480, whiteSpace: "pre-line",
              marginBottom: 44,
            }}>
              {TUTOR.tagline}
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 60 }}>
              <button className="lf-hero-btn lf-hero-btn-primary" onClick={() => navigate("/login")}>
                Начать обучение
                <span style={{ fontSize: 16 }}>🌱</span>
              </button>
              <a href="#about" style={{ textDecoration: "none" }}>
                <button className="lf-hero-btn lf-hero-btn-ghost">Узнать больше</button>
              </a>
            </div>

            {/* Stats */}
            <div className="lf-hero-stats" style={{ display: "flex", gap: 48 }}>
              {TUTOR.stats.map((s, i) => (
                <div key={i} style={{ animation: `lf-in 0.9s cubic-bezier(0.22,0.8,0.32,1) ${0.15 + i * 0.1}s both` }}>
                  <div style={{
                    fontFamily: "var(--f-serif)", fontSize: 38,
                    fontWeight: 500, lineHeight: 1,
                    color: "#fff",
                    marginBottom: 6,
                  }}>
                    <CountUp value={s.value} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: "0.03em" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Photo */}
          <div className="lf-hero-photo" style={{
            position: "relative",
            animation: "lf-in 1.0s cubic-bezier(0.22,0.8,0.32,1) 0.2s both",
          }}>
            {/* Декоративное кольцо */}
            <div style={{
              position: "absolute", inset: -20,
              borderRadius: 38,
              border: "1px solid rgba(183,228,199,0.12)",
              animation: "lf-glow 4s ease-in-out infinite",
              pointerEvents: "none",
            }} />

            {/* Фото-карточка */}
            <div style={{
              width: "100%", maxWidth: 380, height: 460,
              borderRadius: 28, overflow: "hidden",
              background: "linear-gradient(160deg, #1b4332, #2d6a4f)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
              position: "relative",
            }}>
              {/* Паттерн за фото */}
              <div style={{ position: "absolute", inset: 0, color: "#52b788", opacity: 0.07 }}>
                <Fern size={320} style={{ position: "absolute", top: -40, right: -40 }} />
              </div>

              {TUTOR_PHOTO ? (
                <img src={TUTOR_PHOTO} alt={TUTOR.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative" }} />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 16, position: "relative",
                }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                    display: "grid", placeItems: "center",
                    color: "rgba(255,255,255,0.4)",
                  }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="18" r="10" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6 46 Q24 32, 42 46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5 }}>
                    Здесь будет фото<br/>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>замените TUTOR_PHOTO</span>
                  </div>
                </div>
              )}
            </div>

            {/* Значок справа внизу */}
            <div style={{
              position: "absolute", bottom: -12, right: -20,
              background: "linear-gradient(135deg, #2d6a4f, #52b788)",
              borderRadius: 20, padding: "16px 22px",
              boxShadow: "0 12px 40px rgba(45,106,79,0.5)",
              border: "1px solid rgba(255,255,255,0.12)",
              textAlign: "center",
              animation: "lf-float 6s ease-in-out infinite 1s",
            }}>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 26, fontWeight: 500, color: "#fff", lineHeight: 1 }}>
                {TUTOR.stats[1].value}+
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 3, letterSpacing: "0.06em" }}>
                УЧЕНИКОВ
              </div>
            </div>

            {/* Маленький значок слева сверху */}
            <div style={{
              position: "absolute", top: 24, left: -24,
              background: "rgba(15,42,30,0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(183,228,199,0.2)",
              borderRadius: 14, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              animation: "lf-float 7s ease-in-out infinite 2s",
            }}>
              <span style={{ fontSize: 16 }}>🎓</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>ТГУ</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Зоология</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          opacity: 0.4,
        }}>
          <div style={{ fontSize: 11, color: "#b7e4c7", letterSpacing: "0.1em" }}>СКРОЛЛ</div>
          <div style={{ width: 1, height: 40, background: "linear-gradient(180deg, #74c69d, transparent)" }} />
        </div>
      </section>

      {/* Волна */}
      <WaveDivider fill="var(--bg)" fromColor="#0f2a1e" />

      {/* ══ О РЕПЕТИТОРЕ ══════════════════════════════════════════════════════ */}
      <section id="about" className="lf-section-pad" style={{ padding: "80px 48px 96px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          <div className="lf-reveal" style={{ marginBottom: 56, maxWidth: 640 }}>
            <div style={{
              display: "inline-block", background: "var(--green-100)",
              color: "var(--green-800)", borderRadius: 999,
              padding: "5px 16px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>
              Об авторе
            </div>
            <h2 style={{
              fontFamily: "var(--f-serif)", fontSize: "clamp(30px, 3vw, 46px)",
              lineHeight: 1.1, letterSpacing: "-0.02em",
            }}>
              Почему ученики<br/>
              <em style={{ color: "var(--green-800)" }}>выбирают меня</em>
            </h2>
          </div>

          <div className="lf-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            {/* Текст */}
            <div className="lf-reveal-left">
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text-soft)", marginBottom: 24 }}>
                {TUTOR.bio}
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text-soft)", marginBottom: 24 }}>
                Моя научная специализация — арахнология: систематика и морфология пауков. Участвовала
                в полевых практиках общим объёмом более 1000 часов, выступала на всероссийских
                и международных конференциях по зоологии и энтомологии.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--text-soft)", marginBottom: 36 }}>
                На занятиях использую интерактивные тесты прямо здесь, в «Живой клетке».
                После каждого урока ты проходишь тест — я вижу результат и корректирую программу.
              </p>
              {/* Ссылки */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
                <a
                  href="https://profi.ru/profile/NikitenkoVY"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", borderRadius: 999,
                    background: "var(--green-100)", color: "var(--green-900)",
                    fontWeight: 600, fontSize: 14, textDecoration: "none",
                    border: "1.5px solid var(--green-300)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(45,106,79,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <span style={{ fontSize: 16 }}>⭐</span> Профиль на Профи.ру
                </a>
                <a
                  href="https://vital.lib.tsu.ru/vital/access/services/Download/vital:18585/SOURCE01"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", borderRadius: 999,
                    background: "var(--bg-muted)", color: "var(--text-soft)",
                    fontWeight: 600, fontSize: 14, textDecoration: "none",
                    border: "1.5px solid var(--border-soft)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <span style={{ fontSize: 16 }}>📄</span> Бакалаврская работа
                </a>
              </div>

              <button
                className="lf-hero-btn"
                style={{
                  background: "var(--green-800)", color: "#fff",
                  boxShadow: "0 8px 28px rgba(45,106,79,0.3)",
                  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(45,106,79,0.4)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 8px 28px rgba(45,106,79,0.3)";
                }}
                onClick={() => navigate("/login")}
              >
                Войти в кабинет 🌱
              </button>

              {/* Мероприятия ВК */}
              <div style={{ marginTop: 36 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--text-muted)",
                  marginBottom: 14,
                }}>
                  Мероприятия и проекты
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {VK_EVENTS.map((ev, i) => (
                    <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "12px 16px", borderRadius: 14,
                        background: "var(--surface)",
                        border: "1.5px solid var(--border-soft)",
                        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                        cursor: "pointer",
                      }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "var(--green-300)";
                          e.currentTarget.style.transform = "translateX(4px)";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,106,79,0.1)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.transform = "";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: "#e8f0ff",
                          display: "grid", placeItems: "center", fontSize: 18,
                        }}>
                          {ev.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{ev.title}</span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-muted)", padding: "2px 8px", borderRadius: 999 }}>{ev.date}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{ev.desc}</div>
                        </div>
                        <div style={{ color: "#5181b8", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>ВК ↗</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {FEATURES.map((item, i) => (
                <div
                  key={i}
                  className={`lf-feature-card lf-reveal`}
                  style={{
                    padding: "20px 24px",
                    display: "flex", gap: 18, alignItems: "flex-start",
                    transitionDelay: `${i * 0.07}s`,
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "var(--green-100)",
                    display: "grid", placeItems: "center", fontSize: 20,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{item.title}</div>
                    <div style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.55 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ ДИПЛОМЫ ════════════════════════════════════════════════════════════ */}
      <section id="diplomas" className="lf-section-pad" style={{
        padding: "96px 48px",
        background: "linear-gradient(180deg, var(--green-50) 0%, var(--bg) 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Фоновый ботанический элемент */}
        <div style={{ position: "absolute", top: -20, right: -40, color: "var(--green-800)", opacity: 0.04, pointerEvents: "none" }}>
          <Fern size={480} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div className="lf-reveal" style={{ marginBottom: 56 }}>
            <div style={{
              display: "inline-block", background: "var(--green-100)",
              color: "var(--green-800)", borderRadius: 999,
              padding: "5px 16px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>
              Образование
            </div>
            <h2 style={{
              fontFamily: "var(--f-serif)", fontSize: "clamp(30px, 3vw, 46px)",
              lineHeight: 1.1, letterSpacing: "-0.02em",
            }}>
              Образование и<br/>
              <em style={{ color: "var(--green-800)" }}>деятельность</em>
            </h2>
          </div>

          <div className="lf-diplomas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {DIPLOMAS.map((d, i) => (
              <div
                key={i}
                className="lf-card-hover lf-reveal"
                style={{
                  borderRadius: 24, overflow: "hidden",
                  border: "1.5px solid var(--border-soft)",
                  background: "var(--surface)",
                  boxShadow: "var(--sh-md)",
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                {/* Illustration */}
                <div style={{
                  height: 200,
                  background: `linear-gradient(135deg, var(--green-100) 0%, var(--green-200) 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, color: "var(--green-700)", opacity: 0.13 }}>
                    <Fern size={220} style={{ position: "absolute", top: -30, right: -30 }} />
                  </div>
                  <div style={{ position: "relative", textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
                    <div style={{ fontSize: 12, color: "var(--green-800)", opacity: 0.6 }}>диплом</div>
                  </div>
                  <div style={{
                    position: "absolute", top: 16, left: 16,
                    background: "var(--green-800)", color: "#fff",
                    borderRadius: 999, padding: "4px 14px",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                  }}>
                    {d.year}
                  </div>
                </div>

                <div style={{ padding: "22px 24px" }}>
                  <div style={{
                    fontFamily: "var(--f-serif)", fontSize: 19,
                    fontWeight: 500, marginBottom: 8, lineHeight: 1.2,
                  }}>
                    {d.title}
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: "var(--green-800)", marginBottom: 5,
                  }}>
                    {d.institution}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>
                    {d.faculty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ СТАТЬИ ═════════════════════════════════════════════════════════════ */}
      <section id="articles" className="lf-section-pad" style={{ padding: "96px 48px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="lf-reveal" style={{ marginBottom: 56 }}>
            <div style={{
              display: "inline-block", background: "var(--green-100)",
              color: "var(--green-800)", borderRadius: 999,
              padding: "5px 16px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>
              Публикации
            </div>
            <h2 style={{
              fontFamily: "var(--f-serif)", fontSize: "clamp(30px, 3vw, 46px)",
              lineHeight: 1.1, letterSpacing: "-0.02em",
            }}>
              Конференции и<br/>
              <em style={{ color: "var(--green-800)" }}>публикации</em>
            </h2>
          </div>

          <div style={{
            borderRadius: 24, overflow: "hidden",
            border: "1.5px solid var(--border-soft)",
            background: "var(--surface)",
            boxShadow: "var(--sh-md)",
          }}>
            {ARTICLES.map((a, i) => (
              <div
                key={i}
                className="lf-article-row lf-reveal"
                style={{
                  padding: "28px 28px",
                  borderBottom: i < ARTICLES.length - 1 ? "1px solid var(--border-soft)" : "none",
                  display: "flex", gap: 24, alignItems: "flex-start",
                  transitionDelay: `${i * 0.08}s`,
                }}
              >
                <div style={{
                  flexShrink: 0, width: 60, height: 60, borderRadius: 14,
                  background: "linear-gradient(135deg, var(--green-100), var(--green-200))",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--f-serif)", fontSize: 13, fontWeight: 700,
                  color: "var(--green-800)", textAlign: "center", lineHeight: 1.2,
                }}>
                  {a.year}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--f-serif)", fontSize: 18, lineHeight: 1.35,
                    marginBottom: 10, color: a.url ? "var(--green-800)" : "var(--text)",
                  }}>
                    {a.url ? (
                      <a href={a.url} target="_blank" rel="noopener noreferrer"
                        style={{ color: "inherit", textDecoration: "none" }}>
                        {a.title} ↗
                      </a>
                    ) : a.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      background: "var(--green-100)", color: "var(--green-800)",
                      borderRadius: 999, padding: "3px 12px",
                      fontSize: 12, fontWeight: 600,
                    }}>{a.journal}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{a.volume}</span>
                  </div>
                </div>

                <div style={{ flexShrink: 0, color: "var(--green-300)", marginTop: 4 }}>
                  <Sprig size={28} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════════════════ */}
      <section className="lf-cta-section" style={{
        padding: "96px 48px 112px",
        background: "linear-gradient(160deg, #0a1f14 0%, #0f2a1e 50%, #1b4332 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, color: "#52b788", opacity: 0.06, animation: "lf-float 10s ease-in-out infinite", pointerEvents: "none" }}>
          <Cell size={400} />
        </div>
        <div style={{ position: "absolute", bottom: -40, left: 40, color: "#74c69d", opacity: 0.05, animation: "lf-float2 8s ease-in-out infinite 2s", pointerEvents: "none" }}>
          <Fern size={280} />
        </div>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(82,183,136,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div className="lf-reveal" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(183,228,199,0.1)",
            border: "1px solid rgba(183,228,199,0.2)",
            borderRadius: 999, padding: "6px 18px",
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#74c69d", animation: "lf-pulse 2s infinite", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#b7e4c7", letterSpacing: "0.1em", fontWeight: 700 }}>
              НАЧНИ ПРЯМО СЕЙЧАС
            </span>
          </div>

          <h2 className="lf-reveal" style={{
            fontFamily: "var(--f-serif)",
            fontSize: "clamp(36px, 4vw, 56px)",
            color: "#fff", lineHeight: 1.1,
            letterSpacing: "-0.02em", marginBottom: 20,
          }}>
            Готов проверить<br/>
            <em style={{
              color: "transparent",
              backgroundImage: "linear-gradient(135deg, #74c69d, #b7e4c7)",
              WebkitBackgroundClip: "text", backgroundClip: "text",
            }}>свои знания?</em>
          </h2>

          <p className="lf-reveal" style={{
            fontSize: 17, color: "rgba(255,255,255,0.6)",
            lineHeight: 1.7, marginBottom: 44,
          }}>
            Войди в кабинет и проходи тесты по биологии.<br/>
            Результаты видит твой репетитор.
          </p>

          <div className="lf-reveal" style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <button
              className="lf-hero-btn lf-hero-btn-primary"
              style={{ padding: "16px 36px", fontSize: 16 }}
              onClick={() => navigate("/login")}
            >
              Войти в кабинет 🌱
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer className="lf-footer" style={{
        padding: "32px 48px",
        borderTop: "1px solid var(--border-soft)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "var(--green-800)", color: "#fff",
            display: "grid", placeItems: "center",
          }}>
            <Leaf size={15} stroke={1.8} />
          </div>
          <span style={{ fontFamily: "var(--f-serif)", fontSize: 15, color: "var(--text-soft)" }}>
            Живая клетка · {TUTOR.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="https://profi.ru/profile/NikitenkoVY" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: "var(--green-800)", textDecoration: "none", fontWeight: 600 }}>
            ⭐ Профи.ру
          </a>
          <a href="https://vk.com/public219644318" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: "#5181b8", textDecoration: "none", fontWeight: 600 }}>
            🔗 ВКонтакте
          </a>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· Репетитор по биологии · ОГЭ и ЕГЭ</span>
        </div>
      </footer>
    </div>
  );
}

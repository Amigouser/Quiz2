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
    icon: "🎓",
    accent: "var(--green-100)",
    accent2: "var(--green-200)",
  },
  {
    year: "2023–2025",
    title: "Магистр фундаментальной и прикладной биологии",
    institution: "Томский государственный университет",
    faculty: "Кафедра зоологии беспозвоночных · 06.04.01",
    icon: "🎓",
    accent: "var(--green-100)",
    accent2: "var(--green-200)",
  },
  {
    year: "2023",
    title: "Earth Science Camp",
    institution: "СПбГУ · Карельский научный центр РАН",
    faculty: "Студенческая школа по естественным наукам · Санкт-Петербург",
    icon: "🏕️",
    accent: "#e8f0ff",
    accent2: "#d0e2ff",
  },
  {
    year: "09.2024 — сейчас",
    title: "Биотехнолог-энтомолог",
    institution: "ООО «Смартинсект»",
    faculty: "Коммерческое разведение насекомых · совмещение",
    icon: "💼",
    accent: "#fdf3e3",
    accent2: "#fde8c3",
    isWork: true,
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
    date: "Февр. 2025",
    title: "Зимняя школа Плавучего университета",
    desc: "«Морская биология» · БФУ, г. Калининград, 3–5 февраля 2025",
    url: null,
    icon: "🌊",
    cert: "/tutor3.jpg",
  },
  {
    date: "Сент. 2023",
    title: "Earth Science Camp",
    desc: "Студенческая школа по естественным наукам · СПбГУ и КарНЦ РАН, Санкт-Петербург",
    url: "https://vk.com/wall-219644318_39",
    icon: "🏕️",
    cert: "/tutor4.jpg",
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

  /* Hero composition */
  .lf-comp {
    position: relative;
    width: min(96vw, 1100px);
    height: clamp(380px, 55vh, 560px);
    flex-shrink: 0;
    animation: lf-in 0.9s cubic-bezier(0.22,0.8,0.32,1) both;
  }
  .lf-comp-photo {
    position: absolute;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 20px 50px rgba(0,0,0,0.55);
    background: linear-gradient(160deg, #1b4332, #2d6a4f);
  }
  .lf-comp-photo img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .lf-comp-photo-1 {
    top: 0; left: 0;
    width: clamp(200px, 30%, 340px);
    height: clamp(130px, 38%, 220px);
    transform: rotate(-3deg);
  }
  .lf-comp-photo-2 {
    bottom: 0; right: 0;
    width: clamp(200px, 30%, 340px);
    height: clamp(130px, 38%, 220px);
    transform: rotate(2deg);
  }
  .lf-comp-text {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    white-space: nowrap;
    pointer-events: none;
    z-index: 3;
  }
  .lf-comp-title {
    font-family: var(--f-serif);
    font-size: clamp(52px, 8vw, 100px);
    font-weight: 600;
    line-height: 0.9;
    letter-spacing: -0.02em;
    color: transparent;
    background-image: linear-gradient(135deg, #74c69d 0%, #b7e4c7 50%, #52b788 100%);
    -webkit-background-clip: text;
    background-clip: text;
  }
  .lf-comp-sub {
    font-size: clamp(13px, 1.5vw, 18px);
    color: rgba(183,228,199,0.7);
    letter-spacing: 0.22em;
    font-family: var(--f-serif);
    font-style: italic;
    margin-bottom: 8px;
  }

  @media (max-width: 640px) {
    .lf-comp {
      width: 100%;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      padding: 0 20px 20px;
    }
    .lf-comp-photo { position: static; transform: none !important; width: 100%; height: 180px; }
    .lf-comp-photo-1 { order: 1; border-radius: 16px; margin-bottom: 24px; }
    .lf-comp-photo-2 { order: 3; border-radius: 16px; margin-top: 24px; }
    .lf-comp-text {
      position: static; transform: none;
      order: 2; white-space: normal;
      padding: 0 8px;
    }
    .lf-comp-title { font-size: clamp(44px, 13vw, 72px); }
    .lf-hero-section { height: auto !important; min-height: 100vh; }
  }

  /* CTA section responsive */
  .lf-cta-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 40px;
    align-items: center;
    max-width: 1100px;
    margin: 0 auto;
  }
  @media (max-width: 768px) {
    .lf-cta-grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      gap: 36px;
      text-align: center;
    }
    .lf-cta-grid > :nth-child(2) { order: -1; justify-self: center; width: min(280px, 80vw) !important; }
  }

  @media (max-width: 640px) {
    .lf-header { padding: 0 20px !important; }
    .lf-nav { display: none !important; }
    .lf-hero-section { padding-left: 0 !important; }
  }
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

// ─── Лайтбокс для сертификатов ───────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.88)",
      display: "grid", placeItems: "center",
      backdropFilter: "blur(10px)",
      animation: "lf-in 0.2s ease both",
      cursor: "zoom-out",
    }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
        <img src={src} alt="Сертификат" style={{
          maxWidth: "90vw", maxHeight: "88vh",
          borderRadius: 16, display: "block",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }} />
        <button onClick={onClose} style={{
          position: "absolute", top: -14, right: -14,
          width: 34, height: 34, borderRadius: "50%",
          background: "#fff", border: "none", cursor: "pointer",
          fontSize: 20, fontWeight: 700,
          display: "grid", placeItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}>×</button>
      </div>
    </div>
  );
}

// ─── Главный компонент ───────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  useReveal();
  const activeSection = useActiveSection(["about", "diplomas", "articles"]);
  const [lightbox, setLightbox] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const contactsRef = React.useRef(null);
  useEffect(() => {
    const h = e => { if (contactsRef.current && !contactsRef.current.contains(e.target)) setShowContacts(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

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
        <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/tutor2.jpg" alt="Vikokon" style={{
            width: 40, height: 40, borderRadius: 10,
            objectFit: "cover",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            flexShrink: 0,
          }} />
          <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 16, color: "#fff", lineHeight: 1.1 }}>
            Vikokon
          </div>
        </a>

        <nav className="lf-nav" style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {[["Об авторе","about"],["Образование","diplomas"],["Конференции","articles"]].map(([l,id]) => (
            <a key={id} href={`#${id}`} className={`lf-nav-link${activeSection === id ? " lf-nav-active" : ""}`}>{l}</a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Контакты */}
          <div ref={contactsRef} style={{ position: "relative" }}>
            <button
              className="lf-hero-btn lf-hero-btn-ghost lf-header-btn"
              style={{ padding: "10px 22px", fontSize: 14 }}
              onClick={() => setShowContacts(v => !v)}
            >
              Контакты
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: "transform 0.2s", transform: showContacts ? "rotate(180deg)" : "none" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showContacts && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: 260, borderRadius: 16,
                background: "rgba(10, 26, 18, 0.97)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                overflow: "hidden",
                animation: "lf-in 0.18s cubic-bezier(0.22,0.8,0.32,1) both",
                zIndex: 300,
              }}>
                <div style={{ padding: "10px 8px" }}>
                  {[
                    {
                      label: "ВКонтакте", href: "https://vk.com/vikotiks",
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#5181b8"><path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.019-1.304.587-1.496c.598-.189 1.365 1.26 2.179 1.815.615.418 1.082.326 1.082.326l2.172-.03s1.135-.07.597-1.097c-.044-.078-.312-.662-1.608-1.87-1.356-1.264-1.174-1.059.459-3.246.996-1.332 1.394-2.145 1.269-2.491-.12-.33-.855-.243-.855-.243l-2.443.015s-.181-.025-.315.056c-.132.08-.217.267-.217.267s-.387 1.03-.903 1.905c-1.088 1.847-1.524 1.945-1.702 1.83-.414-.267-.311-1.075-.311-1.648 0-1.793.271-2.54-.529-2.733-.265-.064-.46-.106-1.138-.113-.871-.009-1.608.003-2.025.207-.278.136-.492.44-.361.457.162.021.527.099.721.363.251.341.242 1.107.242 1.107s.144 2.11-.336 2.372c-.33.18-.783-.188-1.754-1.874-.498-.861-.874-1.814-.874-1.814s-.072-.181-.202-.278c-.157-.117-.376-.154-.376-.154l-2.322.015s-.348.01-.476.161c-.112.135-.009.414-.009.414s1.818 4.249 3.878 6.394c1.889 1.97 4.034 1.841 4.034 1.841h.972z"/></svg>,
                    },
                    {
                      label: "Telegram", href: "https://t.me/vikotiks",
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#29b6d8"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 13.67l-2.94-.92c-.64-.203-.654-.64.135-.954l11.566-4.461c.537-.194 1.006.131.973.886z"/></svg>,
                    },
                    {
                      label: "nikiviki@gmail.com", href: "mailto:nikiviki@gmail.com",
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#74c69d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>,
                    },
                  ].map((c, i) => (
                    <a key={i} href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer"
                      style={{ textDecoration: "none", display: "block" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 10,
                        transition: "background 0.15s", cursor: "pointer",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: "rgba(255,255,255,0.06)",
                          display: "grid", placeItems: "center",
                        }}>{c.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{c.label}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="lf-hero-btn lf-hero-btn-ghost lf-header-btn"
            style={{ padding: "10px 22px", fontSize: 14 }}
            onClick={() => navigate("/tasks")}
          >
            Задания
          </button>
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
        </div>
      </header>

      {/* ══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section className="lf-hero-section" style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0a1f14 0%, #0f2a1e 40%, #1b3d2a 70%, #2d5a40 100%)",
        backgroundSize: "200% 200%",
        animation: "lf-bg-shift 12s ease infinite",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
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
        <div style={{ position: "absolute", bottom: "20%", right: "4%", color: "#52b788", opacity: 0.08, animation: "lf-pulse 7s ease-in-out infinite 1s", pointerEvents: "none" }}>
          <Cell size={180} />
        </div>

        {/* Centered composition */}
        <div className="lf-comp">
          <div className="lf-comp-photo lf-comp-photo-1">
            <img src="/tutor1.jpg" alt="" onError={e => { e.target.style.display = "none"; }} />
          </div>

          <div className="lf-comp-photo lf-comp-photo-2">
            <img src="/tutor2.jpg" alt="" onError={e => { e.target.style.display = "none"; }} />
          </div>

          <div className="lf-comp-text">
            <div style={{ fontSize: 18, marginBottom: 6, color: "#74c69d", opacity: 0.7 }}>✦</div>
            <div className="lf-comp-sub">подготовка по</div>
            <div className="lf-comp-title">БИОЛОГИИ</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 16, color: "#52b788" }}>
              <span style={{ fontSize: 18, opacity: 0.55 }}>🌿</span>
              <span style={{ fontSize: 16, color: "#74c69d", opacity: 0.65 }}>✦</span>
              <span style={{ fontSize: 18, opacity: 0.55 }}>🌿</span>
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

      {/* ══ ТЕСТЫ + ЗАПИСЬ ════════════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(145deg, #0a1f14 0%, #0f2a1e 50%, #1b3d2a 100%)",
        padding: "80px 48px 100px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Wavy lines top decoration */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: "none" }}>
          <svg viewBox="0 0 1440 40" fill="none" style={{ display: "block", width: "100%" }}>
            <path d="M0,20 C200,5 400,35 600,20 C800,5 1000,35 1200,20 C1320,10 1380,25 1440,20" stroke="#52b788" strokeWidth="1.5" opacity="0.25" fill="none"/>
            <path d="M0,28 C200,13 400,43 600,28 C800,13 1000,43 1200,28 C1320,18 1380,33 1440,28" stroke="#52b788" strokeWidth="1" opacity="0.15" fill="none"/>
          </svg>
        </div>

        <div className="lf-cta-grid">
          {/* Left — ТЕСТЫ */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 13, color: "#74c69d", letterSpacing: "0.2em",
              marginBottom: 16, opacity: 0.7,
            }}>
              ↓
            </div>
            <div style={{
              fontFamily: "var(--f-serif)",
              fontSize: "clamp(36px, 4vw, 58px)",
              fontWeight: 600, letterSpacing: "-0.01em",
              color: "#fff", marginBottom: 20, lineHeight: 1,
            }}>
              ТЕСТЫ
            </div>
            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6, maxWidth: 260, margin: "0 auto 28px",
            }}>
              ОГЭ и ЕГЭ по биологии — проверь себя и отследи прогресс
            </p>
            <button
              className="lf-hero-btn lf-hero-btn-ghost"
              style={{ fontSize: 14, padding: "12px 28px" }}
              onClick={() => navigate("/tasks")}
            >
              Открыть задания
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Center — big photo */}
          <div style={{
            width: 320, flexShrink: 0,
            borderRadius: 28, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
            background: "linear-gradient(160deg, #1b4332, #2d6a4f)",
            aspectRatio: "3/4",
          }}>
            <img src="/hero-girl.jpg" alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>

          {/* Right — ЗАПИСЬ */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 13, color: "#74c69d", letterSpacing: "0.2em",
              marginBottom: 16, opacity: 0.7,
            }}>
              ↓
            </div>
            <div style={{
              fontFamily: "var(--f-serif)",
              fontSize: "clamp(28px, 3.5vw, 46px)",
              fontWeight: 600, letterSpacing: "-0.01em",
              color: "#fff", marginBottom: 20, lineHeight: 1.1,
            }}>
              ЗАПИСЬ<br/>НА КУРС
            </div>
            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6, maxWidth: 260, margin: "0 auto 28px",
            }}>
              Индивидуальные занятия с репетитором — пиши в Telegram
            </p>
            <a href="https://t.me/vikotiks" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button className="lf-hero-btn lf-hero-btn-primary" style={{ fontSize: 14, padding: "12px 28px" }}>
                Записаться
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div style={{
          position: "absolute", bottom: 0, left: "10%", right: "10%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(82,183,136,0.3), transparent)",
        }} />
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
                    <div key={i} style={{
                      borderRadius: 14, background: "var(--surface)",
                      border: "1.5px solid var(--border-soft)",
                      overflow: "hidden",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--green-300)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,106,79,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
                    >
                      {/* Основная строка */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "#e8f0ff", display: "grid", placeItems: "center", fontSize: 18 }}>
                          {ev.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{ev.title}</span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-muted)", padding: "2px 8px", borderRadius: 999 }}>{ev.date}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{ev.desc}</div>
                        </div>
                        {/* Кнопки действий */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {ev.cert && (
                            <button onClick={() => setLightbox(ev.cert)} style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--green-300)",
                              background: "var(--green-50)", color: "var(--green-800)",
                              fontSize: 12, fontWeight: 600, cursor: "pointer",
                              transition: "background 0.15s",
                            }}
                              onMouseEnter={e => e.currentTarget.style.background = "var(--green-100)"}
                              onMouseLeave={e => e.currentTarget.style.background = "var(--green-50)"}
                            >
                              📄 Сертификат
                            </button>
                          )}
                          {ev.url && (
                            <a href={ev.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                              <button style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                padding: "5px 10px", borderRadius: 8, border: "1.5px solid #c5d8f0",
                                background: "#eef3fb", color: "#5181b8",
                                fontSize: 12, fontWeight: 600, cursor: "pointer",
                                transition: "background 0.15s",
                              }}
                                onMouseEnter={e => e.currentTarget.style.background = "#dde8f7"}
                                onMouseLeave={e => e.currentTarget.style.background = "#eef3fb"}
                              >
                                ВК ↗
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
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

          <div className="lf-diplomas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {DIPLOMAS.map((d, i) => (
              <div
                key={i}
                className="lf-card-hover lf-reveal"
                style={{
                  borderRadius: 24, overflow: "hidden",
                  border: `1.5px solid ${d.isWork ? "#f5d9a0" : "var(--border-soft)"}`,
                  background: "var(--surface)",
                  boxShadow: "var(--sh-md)",
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                {/* Illustration */}
                <div style={{
                  height: 160,
                  background: `linear-gradient(135deg, ${d.accent || "var(--green-100)"} 0%, ${d.accent2 || "var(--green-200)"} 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  {!d.isWork && (
                    <div style={{ position: "absolute", inset: 0, color: "var(--green-700)", opacity: 0.13 }}>
                      <Fern size={220} style={{ position: "absolute", top: -30, right: -30 }} />
                    </div>
                  )}
                  <div style={{ position: "relative", textAlign: "center" }}>
                    <div style={{ fontSize: 44, marginBottom: 6 }}>{d.icon || "🎓"}</div>
                    <div style={{ fontSize: 11, color: d.isWork ? "#a07020" : "var(--green-800)", opacity: 0.7 }}>
                      {d.isWork ? "опыт работы" : "диплом"}
                    </div>
                  </div>
                  <div style={{
                    position: "absolute", top: 16, left: 16,
                    background: d.isWork ? "#d4900a" : "var(--green-800)", color: "#fff",
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
          <img src="/tutor2.jpg" alt="Vikokon" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontFamily: "var(--f-serif)", fontSize: 15, color: "var(--text-soft)" }}>
            Vikokon · {TUTOR.name}
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

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

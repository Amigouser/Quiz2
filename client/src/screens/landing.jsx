import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
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
    degree: "Бакалавриат",
    title: "Бакалавр биологии",
    institution: "Томский государственный университет",
    faculty: "Направление 06.03.01 «Биология»",
    photo: "/tutor6.jpg",
  },
  {
    year: "2023–2025",
    degree: "Магистратура",
    title: "Магистр фундаментальной и прикладной биологии",
    institution: "Томский государственный университет",
    faculty: "Кафедра зоологии беспозвоночных · 06.04.01",
    photo: "/tutor5.jpg",
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

const SKILLS = [
  "2 высших образования по направлению «Биология»",
  "Опыт полевых исследований",
  "Участие во всероссийских конференциях",
  "Тематические занятия для классов с естественно-научным уклоном",
  "Жизненные циклы паразитов и энтомология / арахнология — это ко мне 🕷",
];

const SERVICES_LIST = [
  { icon: "📝", text: "ЕГЭ" },
  { icon: "📘", text: "ОГЭ" },
  { icon: "✅", text: "Проверка домашних заданий" },
  { icon: "🎓", text: "Подготовка к ДВИ" },
  { icon: "📄", text: "Написание курсовой / диплома" },
];

const FACTS = [
  { icon: "🎓", value: "25+",    label: "учеников",              note: "индивидуально · онлайн" },
  { icon: "⏳", value: "2+",     label: "года опыта",             note: "репетитор с января 2024" },
  { icon: "🔬", value: "1000+",  label: "часов полевых",          note: "практики и экспедиции" },
  { icon: "⭐", value: "5.0",    label: "рейтинг Профи.ру",       note: "средняя оценка учеников" },
  { icon: "🧬", value: "2",      label: "высших образования",     note: "бакалавр + магистр ТГУ" },
  { icon: "📖", value: "5",      label: "научных публикаций",     note: "всероссийские конференции" },
];

const TIMELINE = [
  { year: "2019", title: "Поступила на биофак ТГУ",                desc: "Направление 06.03.01 «Биология»" },
  { year: "2022", title: "Диплом I степени «Старт в науку»",       desc: "Лучший доклад в секции «Зоология и гидробиология»" },
  { year: "2023", title: "Бакалавр биологии",                      desc: "Томский государственный университет" },
  { year: "2024", title: "Начало работы репетитором",              desc: "Индивидуальные занятия · ОГЭ, ЕГЭ, ДВИ" },
  { year: "2025", title: "Магистр фунд. и прикл. биологии",        desc: "Кафедра зоологии беспозвоночных · ТГУ" },
  { year: "2025", title: "Зимняя школа Плавучего университета",    desc: "«Морская биология» · БФУ, Калининград" },
];

const ACHIEVEMENTS = [
  {
    year: "2022",
    ribbon: "I степень",
    title: "Диплом I степени — «Старт в науку»",
    place: "ТГУ · LXXI научная студенческая конференция",
    detail: "За лучший доклад в секции «Зоология и гидробиология» · Институт биологии, экологии, почвоведения, сельского и лесного хозяйства",
    icon: "🏆",
  },
  {
    year: "2023",
    ribbon: "Благодарность",
    title: "Благодарность от ТГУ",
    place: "Национальный исследовательский Томский государственный университет",
    detail: "За организацию и проведение акции «Ночь в музеях ТГУ. Истории ТГУ»",
    icon: "✦",
  },
];

const PRICES = [
  {
    title: "ВПР по биологии",
    subtitle: "5–8 классы",
    price: "600",
    unit: "₽ / 60 мин",
    tone: "soft",
    note: "Стандартная программа школы",
  },
  {
    title: "ОГЭ по биологии",
    subtitle: "9 класс",
    price: "800",
    unit: "₽ / 60 мин",
    tone: "mid",
    note: "Систематическая подготовка к экзамену",
  },
  {
    title: "ЕГЭ по биологии",
    subtitle: "11 класс · профильный уровень",
    price: "900",
    unit: "₽ / 60 мин",
    tone: "strong",
    featured: true,
    note: "Профильная подготовка и разбор заданий 2-й части",
  },
  {
    title: "Общая биология",
    subtitle: "Любой уровень и программа",
    price: "по договорённости",
    unit: null,
    tone: "custom",
    note: "Подбираем формат и нагрузку под ученика",
  },
  {
    title: "Проверка домашнего задания",
    subtitle: "Разбор ошибок и консультация",
    price: "по договорённости",
    unit: null,
    tone: "custom",
    note: "Короткие встречи или письменный разбор",
  },
  {
    title: "Курсовая / диплом",
    subtitle: "Помощь в написании научных работ",
    price: "по договорённости",
    unit: null,
    tone: "custom",
    note: "Поддержка по структуре, источникам и редактуре",
  },
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

  .lf-diploma-card:nth-child(odd) .lf-diploma-frame { transform: rotate(-0.6deg); }
  .lf-diploma-card:nth-child(even) .lf-diploma-frame { transform: rotate(0.6deg); }
  .lf-diploma-card:hover .lf-diploma-frame {
    transform: rotate(0deg) translateY(-8px);
    box-shadow: 0 34px 70px -24px rgba(20, 60, 30, 0.38),
                0 10px 24px -6px rgba(20, 60, 30, 0.18);
  }
  .lf-diploma-card:hover .lf-diploma-img {
    transform: scale(1.04);
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
    .lf-stats-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 900px) and (min-width: 641px) {
    .lf-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }

  /* ══ ABOUT — field notebook / научный дневник ═══════════════════════════ */
  .lf-about-photo-card {
    position: relative;
    width: clamp(240px, 30vw, 320px);
    background: #fff;
    padding: 14px 14px 56px;
    box-shadow:
      0 2px 4px rgba(26,52,36,0.06),
      0 20px 50px rgba(26,52,36,0.18);
    border-radius: 3px;
    transform: rotate(-2.5deg);
    transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease);
    margin: 0 0 44px;
  }
  .lf-about-photo-card::before {
    content: "";
    position: absolute;
    top: -15px; left: 50%;
    transform: translateX(-50%) rotate(-3deg);
    width: 104px; height: 26px;
    background: linear-gradient(180deg, rgba(244,162,97,0.58), rgba(244,162,97,0.38));
    border-radius: 1px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    mix-blend-mode: multiply;
    z-index: 2;
  }
  .lf-about-photo-card:hover {
    transform: rotate(-0.8deg) translateY(-4px);
    box-shadow:
      0 4px 8px rgba(26,52,36,0.08),
      0 30px 64px rgba(26,52,36,0.22);
  }
  .lf-about-photo-img {
    width: 100%;
    aspect-ratio: 3 / 3.6;
    object-fit: cover;
    display: block;
    filter: sepia(0.06) saturate(1.04) contrast(1.02);
  }
  .lf-about-photo-caption {
    position: absolute;
    left: 14px; right: 14px; bottom: 14px;
    font-family: var(--f-serif);
    font-style: italic;
    font-size: 13px;
    color: var(--ink-700);
    line-height: 1.3;
    text-align: center;
  }
  .lf-about-photo-caption strong {
    display: block;
    font-variant: small-caps;
    font-style: normal;
    letter-spacing: 0.14em;
    color: var(--green-800);
    font-size: 10.5px;
    font-weight: 700;
    margin-bottom: 3px;
  }

  /* Drop cap */
  .lf-dropcap::first-letter {
    float: left;
    font-family: var(--f-serif);
    font-size: 82px;
    line-height: 0.82;
    padding: 8px 14px 0 0;
    color: var(--green-800);
    font-weight: 500;
    font-style: italic;
    text-shadow: 1px 1px 0 rgba(45,106,79,0.08);
  }

  /* Numbered paragraph */
  .lf-about-para {
    position: relative;
    padding-left: 46px;
    font-size: 17px;
    line-height: 1.75;
    color: var(--text-soft);
    margin-bottom: 22px;
  }
  .lf-about-para[data-num]::before {
    content: attr(data-num);
    position: absolute;
    left: 0; top: 10px;
    font-family: var(--f-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--green-800);
    font-weight: 700;
    opacity: 0.75;
  }

  /* Pull quote */
  .lf-pullquote {
    position: relative;
    margin: 44px 0 44px 16px;
    padding: 4px 0 4px 30px;
    border-left: 2px solid var(--green-800);
    font-family: var(--f-serif);
    font-style: italic;
    font-size: clamp(19px, 1.6vw, 23px);
    line-height: 1.42;
    color: var(--green-900);
    letter-spacing: -0.01em;
  }
  .lf-pullquote::before {
    content: "\\201C";
    position: absolute;
    left: -4px; top: -40px;
    font-family: var(--f-serif);
    font-size: 96px;
    line-height: 1;
    color: var(--green-300);
    font-style: normal;
    pointer-events: none;
  }
  .lf-pullquote cite {
    display: block;
    margin-top: 12px;
    font-size: 11px;
    font-style: normal;
    font-family: var(--f-mono);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--green-800);
    opacity: 0.75;
  }

  /* Botanical fleuron divider */
  .lf-fleuron {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin: 40px 0 32px;
  }
  .lf-fleuron::before, .lf-fleuron::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--green-300), transparent);
  }
  .lf-fleuron span {
    color: var(--green-700);
    font-size: 18px;
    letter-spacing: 0.4em;
    font-family: var(--f-serif);
    opacity: 0.85;
  }

  /* Specimen label — signature card */
  .lf-specimen {
    position: relative;
    border: 1.5px solid var(--ink-900);
    background: #fcfbf5;
    padding: 26px 28px 22px;
    border-radius: 2px;
    background-image:
      repeating-linear-gradient(0deg, transparent 0 28px, rgba(45,106,79,0.055) 28px 29px);
    box-shadow:
      0 10px 28px rgba(26,52,36,0.1),
      3px 3px 0 rgba(45,106,79,0.08);
    margin: 8px 0 32px;
  }
  .lf-specimen::before {
    content: "№ 001 · SPECIMEN · TSU";
    position: absolute;
    top: -9px; left: 22px;
    background: var(--bg);
    padding: 0 10px;
    font-family: var(--f-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--green-800);
    font-weight: 700;
  }
  .lf-specimen-stamp {
    position: absolute;
    top: 20px; right: 22px;
    width: 54px; height: 54px;
    border: 1.5px solid var(--green-700);
    border-radius: 50%;
    display: grid; place-items: center;
    color: var(--green-800);
    background: var(--green-50);
    transform: rotate(-10deg);
    font-family: var(--f-serif);
    font-style: italic;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-align: center;
    line-height: 1;
    opacity: 0.9;
  }
  .lf-specimen-stamp::before {
    content: "";
    position: absolute;
    inset: 3px;
    border: 1px dashed var(--green-700);
    border-radius: 50%;
    opacity: 0.5;
  }
  .lf-specimen-name {
    font-family: var(--f-serif);
    font-size: 24px;
    font-style: italic;
    font-weight: 500;
    color: var(--ink-900);
    line-height: 1.2;
    letter-spacing: -0.01em;
    padding-right: 66px;
  }
  .lf-specimen-role {
    margin-top: 6px;
    font-family: var(--f-mono);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--green-800);
    font-weight: 600;
  }
  .lf-specimen-meta {
    display: flex; flex-wrap: wrap; gap: 14px 24px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px dashed var(--green-400);
    font-size: 12px;
    color: var(--text-muted);
    font-family: var(--f-mono);
    letter-spacing: 0.04em;
  }
  .lf-specimen-meta strong {
    color: var(--ink-900);
    font-weight: 700;
    margin-right: 6px;
  }

  /* Feature cards — roman numerals */
  .lf-feature-card { position: relative; overflow: hidden; }
  .lf-feat-roman {
    position: absolute;
    top: 8px; right: 20px;
    font-family: var(--f-serif);
    font-size: 60px;
    font-style: italic;
    font-weight: 400;
    color: var(--green-200);
    line-height: 1;
    pointer-events: none;
    transition: color 0.35s, transform 0.35s var(--ease);
    z-index: 0;
  }
  .lf-feature-card:hover .lf-feat-roman {
    color: var(--green-400);
    transform: translateY(-3px) scale(1.06);
  }

  /* About — inline numbered list */
  .lf-about-list {
    position: relative;
    padding: 18px 22px 18px 46px;
    margin: 4px 0 22px;
    background: linear-gradient(135deg, rgba(232,242,235,0.7) 0%, rgba(232,242,235,0.25) 100%);
    border-left: 2px solid var(--green-400);
    border-radius: 0 14px 14px 0;
  }
  .lf-about-list[data-num]::before {
    content: attr(data-num);
    position: absolute;
    left: 14px; top: 22px;
    font-family: var(--f-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--green-800);
    font-weight: 700;
    opacity: 0.75;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }
  .lf-about-list-title {
    font-family: var(--f-serif);
    font-size: 14px;
    font-style: italic;
    color: var(--green-800);
    letter-spacing: 0.02em;
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 10px;
  }
  .lf-about-list-title::after {
    content: ""; flex: 1; height: 1px;
    background: linear-gradient(90deg, var(--green-400), transparent);
    opacity: 0.6;
  }
  .lf-about-list ul {
    margin: 0; padding: 0; list-style: none;
    display: flex; flex-direction: column; gap: 7px;
  }
  .lf-about-list ul:not(.lf-about-list-tags) li {
    position: relative;
    padding-left: 22px;
    font-size: 15px;
    line-height: 1.55;
    color: var(--text-soft);
  }
  .lf-about-list ul:not(.lf-about-list-tags) li::before {
    content: "❋";
    position: absolute;
    left: 0; top: 1px;
    color: var(--green-700);
    font-size: 12px;
    opacity: 0.7;
  }
  .lf-about-list-tags {
    flex-direction: row !important; flex-wrap: wrap;
    gap: 8px !important;
  }
  .lf-about-list-tags li {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 7px 14px;
    background: #fff;
    border: 1.5px solid var(--green-200);
    border-radius: 999px;
    font-size: 13px; font-weight: 600;
    color: var(--green-900);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .lf-about-list-tags li:hover {
    transform: translateY(-2px);
    border-color: var(--green-400);
    box-shadow: 0 6px 16px rgba(45,106,79,0.12);
  }
  .lf-about-tag-icon { font-size: 14px; }

  /* Achievements — medal cards */
  .lf-achievements-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .lf-achievement-card {
    position: relative;
    padding: 38px 32px 28px;
    background: linear-gradient(145deg, #fcfbf5 0%, #f4efe0 100%);
    border: 1.5px solid var(--green-200);
    border-radius: 18px;
    box-shadow: 0 12px 32px -16px rgba(26,52,36,0.18), 0 2px 6px rgba(26,52,36,0.05);
    overflow: hidden;
    transition: transform 0.35s var(--ease), box-shadow 0.35s;
  }
  .lf-achievement-card::before {
    content: "";
    position: absolute;
    inset: 6px;
    border: 1px dashed rgba(45,106,79,0.22);
    border-radius: 14px;
    pointer-events: none;
  }
  .lf-achievement-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 22px 44px -18px rgba(26,52,36,0.22), 0 4px 12px rgba(26,52,36,0.08);
  }
  .lf-achievement-ribbon {
    position: absolute;
    top: 22px; right: -34px;
    transform: rotate(35deg);
    background: linear-gradient(135deg, var(--green-700), var(--green-800));
    color: #fff;
    font-family: var(--f-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 5px 44px;
    box-shadow: 0 4px 10px rgba(26,52,36,0.2);
  }
  .lf-achievement-medal {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 18px;
  }
  .lf-achievement-medal-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #fff3c4, #e6c56a 60%, #b8922e);
    display: grid; place-items: center;
    font-size: 26px;
    box-shadow: 0 4px 14px rgba(184,146,46,0.4), inset 0 -3px 8px rgba(0,0,0,0.12);
    border: 2px solid rgba(255,255,255,0.7);
  }
  .lf-achievement-medal-year {
    font-family: var(--f-serif);
    font-size: 28px;
    font-weight: 600;
    font-style: italic;
    color: var(--green-800);
    letter-spacing: -0.01em;
  }
  .lf-achievement-title {
    position: relative; z-index: 1;
    font-family: var(--f-serif);
    font-size: 20px;
    line-height: 1.3;
    font-weight: 500;
    color: var(--ink-900);
    margin: 0 0 8px;
    letter-spacing: -0.01em;
  }
  .lf-achievement-place {
    position: relative; z-index: 1;
    font-size: 13px; font-weight: 700;
    color: var(--green-800);
    margin-bottom: 10px;
    letter-spacing: 0.01em;
  }
  .lf-achievement-detail {
    position: relative; z-index: 1;
    font-size: 13px;
    line-height: 1.55;
    color: var(--text-soft);
  }

  /* Prices — service cards */
  .lf-prices-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .lf-price-card {
    position: relative;
    padding: 32px 26px 26px;
    background: var(--surface);
    border: 1.5px solid var(--border-soft);
    border-radius: 22px;
    box-shadow: 0 8px 24px -14px rgba(26,52,36,0.14);
    transition: transform 0.35s var(--ease), box-shadow 0.35s, border-color 0.25s;
    display: flex; flex-direction: column;
    min-height: 260px;
  }
  .lf-price-card:hover {
    transform: translateY(-5px);
    border-color: var(--green-300);
    box-shadow: 0 18px 38px -16px rgba(26,52,36,0.2);
  }
  .lf-price-soft { background: #f4f9f5; }
  .lf-price-mid  { background: linear-gradient(160deg, #eef6f0 0%, #ffffff 100%); }
  .lf-price-strong {
    background: linear-gradient(160deg, var(--green-800) 0%, var(--green-900, #1b3d2a) 100%);
    color: #fff;
    border-color: transparent;
  }
  .lf-price-strong .lf-price-title,
  .lf-price-strong .lf-price-sub,
  .lf-price-strong .lf-price-value,
  .lf-price-strong .lf-price-unit,
  .lf-price-strong .lf-price-note { color: #fff; }
  .lf-price-strong .lf-price-sub { opacity: 0.75; }
  .lf-price-strong .lf-price-note { opacity: 0.8; border-top-color: rgba(255,255,255,0.18); }
  .lf-price-custom {
    background: repeating-linear-gradient(135deg, #fcfbf5 0 10px, #f7f4e9 10px 20px);
  }
  .lf-price-featured {
    transform: translateY(-8px);
    box-shadow: 0 22px 48px -18px rgba(26,52,36,0.35);
  }
  .lf-price-featured:hover { transform: translateY(-12px); }
  .lf-price-badge {
    position: absolute;
    top: -12px; left: 22px;
    background: #fff;
    color: var(--green-800);
    border: 1.5px solid var(--green-300);
    border-radius: 999px;
    padding: 5px 14px;
    font-family: var(--f-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    box-shadow: 0 4px 12px rgba(26,52,36,0.12);
  }
  .lf-price-head { margin-bottom: 22px; }
  .lf-price-title {
    font-family: var(--f-serif);
    font-size: 20px;
    font-weight: 500;
    line-height: 1.25;
    color: var(--ink-900);
    letter-spacing: -0.01em;
    margin-bottom: 6px;
  }
  .lf-price-sub {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.45;
  }
  .lf-price-amount {
    display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px;
    margin-bottom: auto;
    padding: 10px 0 16px;
  }
  .lf-price-value {
    font-family: var(--f-serif);
    font-size: clamp(30px, 3vw, 40px);
    font-weight: 600;
    line-height: 1;
    color: var(--green-800);
    letter-spacing: -0.02em;
  }
  .lf-price-custom .lf-price-value { font-size: clamp(20px, 2vw, 24px); font-style: italic; }
  .lf-price-unit {
    font-family: var(--f-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 600;
  }
  .lf-price-note {
    font-size: 12px;
    line-height: 1.55;
    color: var(--text-muted);
    padding-top: 14px;
    border-top: 1px dashed var(--green-300);
  }

  /* Facts — tile grid */
  .lf-facts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin: 0 0 64px;
  }
  .lf-fact-card {
    position: relative;
    display: flex; align-items: center; gap: 16px;
    padding: 20px 22px;
    background: linear-gradient(150deg, #fff 0%, #f4f9f5 100%);
    border: 1.5px solid var(--green-200);
    border-radius: 18px;
    box-shadow: 0 8px 22px -12px rgba(26,52,36,0.14);
    overflow: hidden;
    transition: transform 0.35s var(--ease), box-shadow 0.35s, border-color 0.25s;
  }
  .lf-fact-card::after {
    content: "";
    position: absolute;
    top: -40%; right: -30%;
    width: 140px; height: 140px; border-radius: 50%;
    background: radial-gradient(circle, rgba(116,198,157,0.25), transparent 70%);
    pointer-events: none;
  }
  .lf-fact-card:hover {
    transform: translateY(-4px);
    border-color: var(--green-400);
    box-shadow: 0 18px 36px -16px rgba(26,52,36,0.22);
  }
  .lf-fact-icon {
    width: 54px; height: 54px; flex-shrink: 0;
    border-radius: 16px;
    background: var(--green-100);
    display: grid; place-items: center;
    font-size: 26px;
    border: 1.5px solid var(--green-200);
  }
  .lf-fact-body { position: relative; z-index: 1; }
  .lf-fact-value {
    font-family: var(--f-serif);
    font-size: 30px; font-weight: 600;
    line-height: 1;
    color: transparent;
    background-image: linear-gradient(135deg, var(--green-700) 0%, var(--green-900, #1b3d2a) 100%);
    -webkit-background-clip: text; background-clip: text;
    letter-spacing: -0.02em;
    margin-bottom: 3px;
  }
  .lf-fact-label {
    font-size: 13px; font-weight: 700;
    color: var(--ink-900);
    letter-spacing: 0.01em;
  }
  .lf-fact-note {
    margin-top: 2px;
    font-size: 12px; color: var(--text-muted);
    font-family: var(--f-mono);
    letter-spacing: 0.02em;
  }

  /* Timeline — путь в биологии */
  .lf-timeline-wrap { margin: 96px auto 0; max-width: 900px; }
  .lf-timeline {
    position: relative;
    list-style: none; padding: 0; margin: 0;
  }
  .lf-timeline::before {
    content: "";
    position: absolute;
    left: 50%; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, transparent, var(--green-400) 8%, var(--green-400) 92%, transparent);
    transform: translateX(-50%);
  }
  .lf-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 64px 1fr;
    align-items: center;
    margin-bottom: 28px;
  }
  .lf-timeline-item:last-child { margin-bottom: 0; }
  .lf-timeline-node {
    grid-column: 2;
    display: grid; place-items: center;
    position: relative;
  }
  .lf-timeline-dot {
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--green-700);
    border: 3px solid var(--bg);
    box-shadow: 0 0 0 2px var(--green-400), 0 6px 14px rgba(26,52,36,0.22);
    transition: transform 0.25s var(--ease), box-shadow 0.25s;
  }
  .lf-timeline-item:hover .lf-timeline-dot {
    transform: scale(1.25);
    box-shadow: 0 0 0 3px var(--green-500, var(--green-400)), 0 8px 18px rgba(26,52,36,0.3);
  }
  .lf-timeline-card {
    padding: 16px 20px;
    background: var(--surface);
    border: 1.5px solid var(--border-soft);
    border-radius: 16px;
    box-shadow: 0 6px 18px -10px rgba(26,52,36,0.14);
    transition: transform 0.3s var(--ease), box-shadow 0.3s, border-color 0.25s;
    position: relative;
  }
  .lf-timeline-card::before {
    content: "";
    position: absolute;
    top: 50%;
    width: 10px; height: 10px;
    background: var(--surface);
    border: 1.5px solid var(--border-soft);
    transform: translateY(-50%) rotate(45deg);
  }
  .lf-timeline-left .lf-timeline-card {
    grid-column: 1;
    text-align: right;
  }
  .lf-timeline-left .lf-timeline-card::before {
    right: -6px;
    border-left: none; border-bottom: none;
  }
  .lf-timeline-right .lf-timeline-card {
    grid-column: 3;
  }
  .lf-timeline-right .lf-timeline-card::before {
    left: -6px;
    border-right: none; border-top: none;
  }
  .lf-timeline-item:hover .lf-timeline-card {
    transform: translateY(-2px);
    border-color: var(--green-300);
    box-shadow: 0 14px 28px -14px rgba(26,52,36,0.22);
  }
  .lf-timeline-year {
    font-family: var(--f-serif);
    font-size: 22px; font-weight: 600;
    font-style: italic;
    color: var(--green-800);
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  .lf-timeline-title {
    font-size: 15px; font-weight: 700;
    color: var(--ink-900);
    line-height: 1.3;
    margin-bottom: 4px;
  }
  .lf-timeline-desc {
    font-size: 13px; color: var(--text-soft);
    line-height: 1.5;
  }

  @media (max-width: 900px) {
    .lf-about-photo-card { margin: 0 auto 32px; width: min(280px, 80%); }
    .lf-about-para { padding-left: 34px; }
    .lf-about-list { padding-left: 38px; }
    .lf-about-list[data-num]::before { left: 10px; top: 18px; }
    .lf-dropcap::first-letter { font-size: 68px; padding: 6px 12px 0 0; }
    .lf-pullquote { margin-left: 0; font-size: 18px; }
    .lf-specimen-name { font-size: 20px; padding-right: 60px; }
    .lf-diplomas-grid { grid-template-columns: 1fr !important; gap: 56px !important; }
    .lf-achievements-grid { grid-template-columns: 1fr; gap: 20px; }
    .lf-prices-grid { grid-template-columns: 1fr; gap: 16px; }
    .lf-price-featured { transform: none; }
    .lf-price-featured:hover { transform: translateY(-5px); }
    .lf-facts-grid { grid-template-columns: 1fr; gap: 12px; margin-bottom: 48px; }
    .lf-fact-value { font-size: 26px; }
    .lf-timeline-wrap { margin-top: 72px; }
    .lf-timeline::before { left: 18px; }
    .lf-timeline-item {
      grid-template-columns: 36px 1fr;
      gap: 0;
    }
    .lf-timeline-node { grid-column: 1; }
    .lf-timeline-left .lf-timeline-card,
    .lf-timeline-right .lf-timeline-card {
      grid-column: 2;
      text-align: left;
      margin-left: 12px;
    }
    .lf-timeline-left .lf-timeline-card::before,
    .lf-timeline-right .lf-timeline-card::before {
      left: -6px; right: auto;
      border-left: 1.5px solid var(--border-soft);
      border-bottom: 1.5px solid var(--border-soft);
      border-top: none; border-right: none;
    }
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

// ─── Хук: плавный скролл (Lenis) ─────────────────────────────────────────────
function useSmoothScroll() {
  const lenisRef = useRef(null);
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);
  return lenisRef;
}

// ─── Хук: прогресс-бар + параллакс декораций ─────────────────────────────────
function useScrollEffects(progressRef, parallaxRefs) {
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const h = document.documentElement;
      const scroll = window.scrollY || h.scrollTop;
      const limit = h.scrollHeight - h.clientHeight;

      if (progressRef.current && limit > 0) {
        progressRef.current.style.transform = `scaleX(${scroll / limit})`;
      }
      parallaxRefs.current.forEach((el) => {
        if (!el) return;
        const speed = parseFloat(el.dataset.speed || "0.25");
        el.style.transform = `translate3d(0, ${scroll * speed}px, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [progressRef, parallaxRefs]);
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
    <div style={{ lineHeight: 0, fontSize: 0, position: "relative", zIndex: 1, marginBottom: -3 }}>
      <svg viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%" }}>
        <rect width="1440" height="74" fill={fromColor} />
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,10 1440,40 L1440,74 L0,74 Z"
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

// ─── Правовые модалки + куки-баннер ─────────────────────────────────────────
const LEGAL_CONTENT = {
  cookies: {
    title: "Политика использования cookies",
    updated: "Редакция от 24 апреля 2026 г.",
    body: [
      ["Что такое cookies",
        "Cookies — это небольшие текстовые файлы, которые сохраняются в вашем браузере при посещении Сайта. Они позволяют запомнить ваши действия и настройки (например, факт согласия с данной политикой) и обеспечить корректную работу сервиса."],
      ["Какие cookies мы используем",
        "Технические (необходимые): нужны для работы учебного кабинета и сохранения сессии. Функциональные: запоминают ваши предпочтения (например, выбранный режим, согласие на cookies). Аналитические: помогают понять, какие разделы Сайта востребованы, и улучшить их работу."],
      ["Управление cookies",
        "Вы можете удалить уже сохранённые cookies и запретить их сохранение в настройках вашего браузера. Обратите внимание: отключение части cookies может ограничить функциональность учебного кабинета."],
      ["Согласие",
        "При первом посещении Сайта отображается уведомление об использовании cookies. Нажимая «Принять», вы подтверждаете согласие на их использование в целях, описанных выше. Согласие хранится локально в вашем браузере."],
      ["Изменения",
        "Условия могут обновляться. Актуальная редакция всегда доступна по ссылке в футере Сайта."],
    ],
  },
};

function LegalModal({ kind, tutorName, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const data = LEGAL_CONTENT[kind];
  if (!data) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(10, 30, 20, 0.55)",
      backdropFilter: "blur(10px)",
      display: "grid", placeItems: "center",
      padding: 24,
      animation: "lf-in 0.22s ease both",
    }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(720px, 100%)",
          maxHeight: "85vh",
          background: "var(--surface)",
          borderRadius: 20,
          boxShadow: "0 40px 90px -20px rgba(10, 40, 22, 0.45)",
          border: "1px solid var(--border-soft)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Шапка */}
        <div style={{
          padding: "28px 32px 20px",
          background: "linear-gradient(180deg, var(--green-50) 0%, var(--surface) 100%)",
          borderBottom: "1px solid var(--border-soft)",
          position: "relative",
        }}>
          <div style={{
            display: "inline-block",
            background: "var(--green-100)", color: "var(--green-800)",
            borderRadius: 999, padding: "4px 12px",
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 10,
          }}>
            Правовая информация
          </div>
          <h2 style={{
            fontFamily: "var(--f-serif)",
            fontSize: 26, fontWeight: 500,
            lineHeight: 1.2, letterSpacing: "-0.01em",
            marginBottom: 6,
          }}>
            {data.title}
          </h2>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {data.updated} · {tutorName}
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              position: "absolute", top: 18, right: 18,
              width: 32, height: 32, borderRadius: "50%",
              background: "#fff", border: "1px solid var(--border-soft)",
              cursor: "pointer", fontSize: 18, lineHeight: 1,
              display: "grid", placeItems: "center",
              color: "var(--text-soft)",
            }}
          >
            ×
          </button>
        </div>

        {/* Текст */}
        <div style={{
          padding: "24px 32px 32px",
          overflowY: "auto",
          lineHeight: 1.65,
          color: "var(--text-soft)",
          fontSize: 14.5,
        }}>
          {data.body.map(([heading, text], i) => (
            <section key={i} style={{ marginBottom: 22 }}>
              <h3 style={{
                fontFamily: "var(--f-serif)",
                fontSize: 17, fontWeight: 600,
                color: "var(--text)", marginBottom: 8,
                display: "flex", alignItems: "baseline", gap: 10,
              }}>
                <span style={{
                  fontSize: 12, color: "var(--green-800)", fontWeight: 700,
                  fontFamily: "var(--f-sans)",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {heading}
              </h3>
              <p style={{ margin: 0 }}>{text}</p>
            </section>
          ))}
        </div>

        {/* Подвал */}
        <div style={{
          padding: "16px 32px",
          borderTop: "1px solid var(--border-soft)",
          background: "var(--green-50)",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 22px",
              background: "var(--green-800)", color: "#fff",
              border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}

function CookieBanner({ onAccept, onMore }) {
  return (
    <div style={{
      position: "fixed",
      left: 24, right: 24, bottom: 24,
      zIndex: 9998,
      maxWidth: 640, marginLeft: "auto", marginRight: "auto",
      background: "var(--surface)",
      border: "1px solid var(--border-soft)",
      borderRadius: 16,
      boxShadow: "0 24px 56px -12px rgba(10, 40, 22, 0.35)",
      padding: "18px 22px",
      display: "flex", alignItems: "center", gap: 16,
      flexWrap: "wrap",
      animation: "lf-in 0.3s ease 0.2s both",
    }}>
      <div style={{ fontSize: 22, lineHeight: 1 }}>🍪</div>
      <div style={{ flex: 1, minWidth: 220, fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.5 }}>
        Сайт использует cookies, чтобы запомнить ваше согласие и обеспечить работу учебного кабинета.{" "}
        <button
          type="button"
          onClick={onMore}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            color: "var(--green-800)", fontWeight: 600, textDecoration: "underline",
            textUnderlineOffset: 3, fontSize: "inherit", fontFamily: "inherit",
          }}
        >
          Подробнее
        </button>
      </div>
      <button
        type="button"
        onClick={onAccept}
        style={{
          padding: "10px 20px",
          background: "var(--green-800)", color: "#fff",
          border: "none", borderRadius: 10,
          fontSize: 13, fontWeight: 700, letterSpacing: "0.02em",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Принять
      </button>
    </div>
  );
}

// ─── Главный компонент ───────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  useReveal();
  const lenisRef = useSmoothScroll();
  const progressRef = useRef(null);
  const parallaxRefs = useRef([]);
  const setParallax = (i) => (el) => { parallaxRefs.current[i] = el; };
  useScrollEffects(progressRef, parallaxRefs);

  const scrollToTarget = (target) => {
    if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 1.2 });
    else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
    else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  };

  const activeSection = useActiveSection(["about", "diplomas", "prices", "articles"]);
  const [lightbox, setLightbox] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // "privacy" | "cookies" | null
  const [cookieConsent, setCookieConsent] = useState(() => {
    try { return localStorage.getItem("cookie-consent"); } catch { return null; }
  });
  const acceptCookies = () => {
    try { localStorage.setItem("cookie-consent", "accepted"); } catch {}
    setCookieConsent("accepted");
  };
  const contactsRef = React.useRef(null);
  useEffect(() => {
    const h = e => { if (contactsRef.current && !contactsRef.current.contains(e.target)) setShowContacts(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: "var(--f-sans)", overflowX: "hidden" }}>
      <style>{STYLES}</style>

      {/* ══ SCROLL PROGRESS BAR ═══════════════════════════════════════════════ */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 3, zIndex: 300, pointerEvents: "none",
        background: "rgba(255,255,255,0.04)",
      }}>
        <div ref={progressRef} style={{
          height: "100%", width: "100%",
          background: "linear-gradient(90deg, #52b788 0%, #74c69d 50%, #b7e4c7 100%)",
          transform: "scaleX(0)", transformOrigin: "0 50%",
          boxShadow: "0 0 12px rgba(116,198,157,0.55)",
          willChange: "transform",
        }} />
      </div>

      {/* ══ HEADER ════════════════════════════════════════════════════════════ */}
      <header className="lf-header" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(15, 42, 30, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="#" onClick={e => { e.preventDefault(); scrollToTarget(0); }}
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
          {[["Об авторе","about"],["Образование","diplomas"],["Цены","prices"],["Конференции","articles"]].map(([l,id]) => (
            <a key={id} href={`#${id}`}
              onClick={e => { e.preventDefault(); scrollToTarget(`#${id}`); }}
              className={`lf-nav-link${activeSection === id ? " lf-nav-active" : ""}`}>{l}</a>
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
        {/* Floating botanical decorations (parallax-wrapped) */}
        <div ref={setParallax(0)} data-speed="0.35" style={{ position: "absolute", top: "8%", right: "6%", pointerEvents: "none", willChange: "transform" }}>
          <div style={{ color: "#52b788", opacity: 0.12, animation: "lf-float 8s ease-in-out infinite" }}>
            <Fern size={340} />
          </div>
        </div>
        <div ref={setParallax(1)} data-speed="0.2" style={{ position: "absolute", bottom: "5%", left: "2%", pointerEvents: "none", willChange: "transform" }}>
          <div style={{ color: "#52b788", opacity: 0.08, animation: "lf-float2 10s ease-in-out infinite 2s" }}>
            <Fern size={240} />
          </div>
        </div>
        <div ref={setParallax(2)} data-speed="0.5" style={{ position: "absolute", top: "20%", left: "5%", pointerEvents: "none", willChange: "transform" }}>
          <div style={{ color: "#74c69d", opacity: 0.07, animation: "lf-drift 14s ease-in-out infinite" }}>
            <Sprig size={160} />
          </div>
        </div>
        <div ref={setParallax(3)} data-speed="0.15" style={{ position: "absolute", bottom: "20%", right: "4%", pointerEvents: "none", willChange: "transform" }}>
          <div style={{ color: "#52b788", opacity: 0.08, animation: "lf-pulse 7s ease-in-out infinite 1s" }}>
            <Cell size={180} />
          </div>
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

      <WaveDivider fill="var(--bg)" fromColor="#0f2a1e" />

      {/* ══ СТАТИСТИКА ════════════════════════════════════════════════════════ */}
      <section style={{ padding: "64px 48px 24px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: `repeat(${TUTOR.stats.length}, 1fr)`,
          gap: 20,
        }} className="lf-stats-grid">
          {TUTOR.stats.map((s, i) => (
            <div
              key={i}
              className="lf-stat-card lf-reveal"
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border-soft)",
                borderRadius: 24,
                padding: "32px 28px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(26,52,36,0.06)",
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <div style={{
                fontFamily: "var(--f-serif)",
                fontSize: "clamp(44px, 5vw, 64px)",
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "transparent",
                backgroundImage: "linear-gradient(135deg, var(--green-700) 0%, var(--green-800) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                marginBottom: 10,
              }}>
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div style={{
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.05em", textTransform: "uppercase",
                color: "var(--text-muted)",
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ ТЕСТЫ + ЗАПИСЬ ════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 48px 100px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 0,
          alignItems: "stretch",
          maxWidth: 900,
          margin: "0 auto",
        }}>

          {/* Left — ТЕСТЫ */}
          <div className="lf-card-hover" style={{
            textAlign: "center",
            background: "var(--green-50)",
            border: "1.5px solid var(--green-200)",
            borderRadius: 28,
            padding: "48px 40px 44px",
            boxShadow: "0 8px 32px rgba(45,106,79,0.08), 0 2px 8px rgba(45,106,79,0.04)",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: "var(--green-800)",
              display: "grid", placeItems: "center",
              marginBottom: 24,
              boxShadow: "0 6px 20px rgba(45,106,79,0.3)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <div style={{
              fontFamily: "var(--f-serif)",
              fontSize: "clamp(32px, 3.5vw, 52px)",
              fontWeight: 600, letterSpacing: "-0.01em",
              color: "var(--text)", marginBottom: 16, lineHeight: 1,
            }}>
              ТЕСТЫ
            </div>
            <p style={{
              fontSize: 15, color: "var(--text-soft)",
              lineHeight: 1.65, maxWidth: 240, margin: "0 auto 32px",
            }}>
              ОГЭ, ЕГЭ и ВПР по биологии — проверь себя и отследи прогресс
            </p>
            <button
              className="lf-hero-btn"
              style={{ fontSize: 14, padding: "13px 30px", background: "var(--green-800)", color: "#fff", marginTop: "auto" }}
              onClick={() => navigate("/tasks")}
            >
              Открыть задания
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Center — divider with leaf */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "0 32px", gap: 10,
          }}>
            <div style={{ width: 1, flex: 1, background: "linear-gradient(180deg, transparent, var(--green-300))" }} />
            <div style={{ color: "var(--green-600)", opacity: 0.7 }}>
              <Leaf size={32} stroke={1} />
            </div>
            <div style={{ width: 1, flex: 1, background: "linear-gradient(180deg, var(--green-300), transparent)" }} />
          </div>

          {/* Right — ЗАПИСЬ */}
          <div className="lf-card-hover" style={{
            textAlign: "center",
            background: "var(--green-50)",
            border: "1.5px solid var(--green-200)",
            borderRadius: 28,
            padding: "48px 40px 44px",
            boxShadow: "0 8px 32px rgba(45,106,79,0.08), 0 2px 8px rgba(45,106,79,0.04)",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: "var(--green-800)",
              display: "grid", placeItems: "center",
              marginBottom: 24,
              boxShadow: "0 6px 20px rgba(45,106,79,0.3)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div style={{
              fontFamily: "var(--f-serif)",
              fontSize: "clamp(26px, 3vw, 44px)",
              fontWeight: 600, letterSpacing: "-0.01em",
              color: "var(--text)", marginBottom: 16, lineHeight: 1.1,
            }}>
              ЗАПИСЬ<br/>НА КУРС
            </div>
            <p style={{
              fontSize: 15, color: "var(--text-soft)",
              lineHeight: 1.65, maxWidth: 240, margin: "0 auto 32px",
            }}>
              Индивидуальные занятия с репетитором — пиши в Telegram
            </p>
            <a href="https://t.me/vikotiks" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", marginTop: "auto" }}>
              <button className="lf-hero-btn lf-hero-btn-primary" style={{ fontSize: 14, padding: "13px 30px" }}>
                Записаться
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </a>
          </div>

        </div>
      </section>

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

          {/* Плитка фактов */}
          <div className="lf-facts-grid lf-reveal">
            {FACTS.map((f, i) => (
              <div
                key={i}
                className="lf-fact-card"
                style={{ transitionDelay: `${i * 0.06}s` }}
              >
                <div className="lf-fact-icon">{f.icon}</div>
                <div className="lf-fact-body">
                  <div className="lf-fact-value">{f.value}</div>
                  <div className="lf-fact-label">{f.label}</div>
                  <div className="lf-fact-note">{f.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lf-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            {/* Текст */}
            <div className="lf-reveal-left">
              <p className="lf-about-para lf-dropcap" data-num="§ 01">
                Меня зовут Виктория, и я — биолог по призванию. В 2025 году получила
                <em> второе высшее </em> образование и готова делиться не только фундаментальными
                знаниями по биологии, но и опытом проживания стрессового периода экзаменов.
              </p>

              <div className="lf-about-list" data-num="§ 02">
                <div className="lf-about-list-title">Из моих умений</div>
                <ul>
                  {SKILLS.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <p className="lf-about-para" data-num="§ 03">
                На занятиях стараюсь объяснять просто и понятно, использую индивидуальный
                подход с опорой на сильные стороны ученика и обязательно сверяюсь
                с актуальностью научных данных по каждой теме.
              </p>

              <div className="lf-about-list" data-num="§ 04">
                <div className="lf-about-list-title">С чем я могу помочь</div>
                <ul className="lf-about-list-tags">
                  {SERVICES_LIST.map((s, i) => (
                    <li key={i}>
                      <span className="lf-about-tag-icon">{s.icon}</span>
                      {s.text}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="lf-about-para" data-num="§ 05" style={{ marginBottom: 12 }}>
                Преподаю <em>дистанционно</em>. Первое занятие пробное — на нём мы обсудим
                организационные моменты и вместе построим учебный план. После каждого урока
                ты проходишь короткий тест прямо здесь, в «Живой клетке», — так мы видим прогресс.
              </p>

              <div className="lf-fleuron"><span>❦ · ❦ · ❦</span></div>

              {/* Ссылка на Профи.ру */}
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
              {FEATURES.map((item, i) => {
                const romans = ["I", "II", "III", "IV"];
                return (
                <div
                  key={i}
                  className={`lf-feature-card lf-reveal`}
                  style={{
                    padding: "22px 26px",
                    display: "flex", gap: 18, alignItems: "flex-start",
                    transitionDelay: `${i * 0.07}s`,
                  }}
                >
                  <span className="lf-feat-roman">{romans[i]}</span>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "var(--green-100)",
                    display: "grid", placeItems: "center", fontSize: 20,
                    position: "relative", zIndex: 1,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{item.title}</div>
                    <div style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.55 }}>{item.text}</div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Путь в биологии — timeline */}
          <div className="lf-timeline-wrap">
            <div className="lf-reveal" style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{
                display: "inline-block", background: "var(--green-100)",
                color: "var(--green-800)", borderRadius: 999,
                padding: "5px 16px", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
              }}>
                Путь в биологии
              </div>
              <h3 style={{
                fontFamily: "var(--f-serif)",
                fontSize: "clamp(24px, 2.4vw, 34px)",
                lineHeight: 1.15, letterSpacing: "-0.01em",
              }}>
                От первого курса до <em style={{ color: "var(--green-800)" }}>магистратуры</em>
              </h3>
            </div>

            <ol className="lf-timeline">
              {TIMELINE.map((t, i) => (
                <li
                  key={i}
                  className={`lf-timeline-item lf-reveal ${i % 2 === 0 ? "lf-timeline-left" : "lf-timeline-right"}`}
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <div className="lf-timeline-node">
                    <span className="lf-timeline-dot" />
                  </div>
                  <div className="lf-timeline-card">
                    <div className="lf-timeline-year">{t.year}</div>
                    <div className="lf-timeline-title">{t.title}</div>
                    <div className="lf-timeline-desc">{t.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
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

          <div className="lf-diplomas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 40 }}>
            {DIPLOMAS.map((d, i) => (
              <div
                key={i}
                className="lf-diploma-card lf-reveal"
                style={{
                  position: "relative",
                  transitionDelay: `${i * 0.12}s`,
                }}
              >
                {/* Ботанический декор за карточкой */}
                <div style={{
                  position: "absolute",
                  top: -24, right: -24,
                  color: "var(--green-700)", opacity: 0.08,
                  pointerEvents: "none", zIndex: 0,
                }}>
                  <Leaf size={140} />
                </div>

                {/* Фото-рамка (матовая паспарту) */}
                <div className="lf-diploma-frame" style={{
                  position: "relative", zIndex: 1,
                  background: "#fff",
                  padding: 14,
                  borderRadius: 6,
                  boxShadow: "0 20px 48px -20px rgba(20, 60, 30, 0.28), 0 4px 12px -4px rgba(20, 60, 30, 0.12)",
                  border: "1px solid rgba(20, 60, 30, 0.06)",
                  transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s",
                }}>
                  {/* Бейдж года */}
                  <div style={{
                    position: "absolute", top: -14, left: 24, zIndex: 2,
                    background: "var(--green-800)", color: "#fff",
                    borderRadius: 999, padding: "6px 18px",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                    boxShadow: "0 6px 16px -4px rgba(20, 60, 30, 0.4)",
                  }}>
                    {d.year}
                  </div>

                  {/* Бейдж степени */}
                  <div style={{
                    position: "absolute", top: -14, right: 24, zIndex: 2,
                    background: "#fff", color: "var(--green-800)",
                    border: "1.5px solid var(--green-200)",
                    borderRadius: 999, padding: "5px 14px",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}>
                    {d.degree}
                  </div>

                  {/* Фото диплома */}
                  <div style={{
                    position: "relative",
                    aspectRatio: "4 / 3",
                    overflow: "hidden",
                    borderRadius: 3,
                    background: "linear-gradient(135deg, var(--green-50) 0%, var(--green-100) 100%)",
                  }}>
                    <img
                      src={d.photo}
                      alt={`Диплом: ${d.title}`}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      className="lf-diploma-img"
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      }}
                    />
                    {/* Плейсхолдер, если фото ещё нет */}
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      color: "var(--green-800)", opacity: 0.5,
                      pointerEvents: "none", zIndex: -1,
                    }}>
                      <div style={{ fontSize: 56, marginBottom: 8 }}>🎓</div>
                      <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        фото диплома
                      </div>
                    </div>

                    {/* Лёгкое виньетирование для глубины */}
                    <div style={{
                      position: "absolute", inset: 0,
                      pointerEvents: "none",
                      boxShadow: "inset 0 0 60px rgba(0, 0, 0, 0.08)",
                    }} />
                  </div>
                </div>

                {/* Информация под рамкой */}
                <div style={{ padding: "28px 6px 0", position: "relative", zIndex: 1 }}>
                  <h3 style={{
                    fontFamily: "var(--f-serif)", fontSize: 22,
                    fontWeight: 500, marginBottom: 10, lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                  }}>
                    {d.title}
                  </h3>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: "var(--green-800)", marginBottom: 5,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{
                      width: 18, height: 1, background: "var(--green-800)", opacity: 0.5,
                    }} />
                    {d.institution}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, paddingLeft: 26 }}>
                    {d.faculty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ДОСТИЖЕНИЯ ═════════════════════════════════════════════════════════ */}
      <section id="achievements" className="lf-section-pad" style={{
        padding: "96px 48px",
        background: "var(--bg)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", bottom: -40, left: -40, color: "var(--green-700)", opacity: 0.05, pointerEvents: "none" }}>
          <Sprig size={360} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div className="lf-reveal" style={{ marginBottom: 56 }}>
            <div style={{
              display: "inline-block", background: "var(--green-100)",
              color: "var(--green-800)", borderRadius: 999,
              padding: "5px 16px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>
              Достижения
            </div>
            <h2 style={{
              fontFamily: "var(--f-serif)", fontSize: "clamp(30px, 3vw, 46px)",
              lineHeight: 1.1, letterSpacing: "-0.02em",
            }}>
              Награды и<br/>
              <em style={{ color: "var(--green-800)" }}>благодарности</em>
            </h2>
          </div>

          <div className="lf-achievements-grid">
            {ACHIEVEMENTS.map((a, i) => (
              <article
                key={i}
                className="lf-achievement-card lf-reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="lf-achievement-ribbon">{a.ribbon}</div>
                <div className="lf-achievement-medal">
                  <span className="lf-achievement-medal-icon">{a.icon}</span>
                  <span className="lf-achievement-medal-year">{a.year}</span>
                </div>
                <h3 className="lf-achievement-title">{a.title}</h3>
                <div className="lf-achievement-place">{a.place}</div>
                <div className="lf-achievement-detail">{a.detail}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══ УСЛУГИ И ЦЕНЫ ══════════════════════════════════════════════════════ */}
      <section id="prices" className="lf-section-pad" style={{
        padding: "96px 48px",
        background: "linear-gradient(180deg, var(--bg) 0%, var(--green-50) 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, color: "var(--green-800)", opacity: 0.05, pointerEvents: "none" }}>
          <Fern size={420} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div className="lf-reveal" style={{ marginBottom: 56 }}>
            <div style={{
              display: "inline-block", background: "var(--green-100)",
              color: "var(--green-800)", borderRadius: 999,
              padding: "5px 16px", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>
              Услуги и цены
            </div>
            <h2 style={{
              fontFamily: "var(--f-serif)", fontSize: "clamp(30px, 3vw, 46px)",
              lineHeight: 1.1, letterSpacing: "-0.02em",
            }}>
              Форматы занятий<br/>
              <em style={{ color: "var(--green-800)" }}>и стоимость</em>
            </h2>
            <p style={{
              marginTop: 18, maxWidth: 620,
              fontSize: 15, lineHeight: 1.6, color: "var(--text-soft)",
            }}>
              Занятия дистанционные, длительность — по запросу.
              Первое занятие — пробное: знакомимся, обсуждаем цели и строим план.
            </p>
          </div>

          <div className="lf-prices-grid">
            {PRICES.map((p, i) => (
              <div
                key={i}
                className={`lf-price-card lf-price-${p.tone}${p.featured ? " lf-price-featured" : ""} lf-reveal`}
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                {p.featured && <div className="lf-price-badge">Популярное</div>}
                <div className="lf-price-head">
                  <div className="lf-price-title">{p.title}</div>
                  <div className="lf-price-sub">{p.subtitle}</div>
                </div>
                <div className="lf-price-amount">
                  <span className="lf-price-value">{p.price}</span>
                  {p.unit && <span className="lf-price-unit">{p.unit}</span>}
                </div>
                <div className="lf-price-note">{p.note}</div>
              </div>
            ))}
          </div>

          <div className="lf-reveal" style={{ marginTop: 40, textAlign: "center" }}>
            <a href="https://t.me/vikotiks" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button className="lf-hero-btn lf-hero-btn-primary" style={{ fontSize: 14, padding: "14px 32px" }}>
                Записаться на пробное занятие
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </a>
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

      {/* ══ FOOTER ═════════════════════════════════════════════════════════════ */}
      <footer className="lf-footer" style={{
        padding: "36px 48px 28px",
        borderTop: "1px solid var(--border-soft)",
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/tutor2.jpg" alt="Vikokon" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
            <span style={{ fontFamily: "var(--f-serif)", fontSize: 15, color: "var(--text-soft)" }}>
              Vikokon · {TUTOR.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
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
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
          paddingTop: 16, borderTop: "1px dashed var(--border-soft)",
        }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Vikokon. Все права защищены.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <a
              href="/privacy/"
              onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}
              style={{
                fontSize: 12, color: "var(--text-soft)", textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Политика конфиденциальности
            </a>
            <a
              href="/cookie/"
              onClick={(e) => { e.preventDefault(); navigate("/cookie"); }}
              style={{
                fontSize: 12, color: "var(--text-soft)", textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Политика использования cookies
            </a>
          </div>
        </div>
      </footer>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {legalModal && (
        <LegalModal
          kind={legalModal}
          tutorName={TUTOR.name}
          onClose={() => setLegalModal(null)}
        />
      )}
      {!cookieConsent && (
        <CookieBanner
          onAccept={acceptCookies}
          onMore={() => setLegalModal("cookies")}
        />
      )}
    </div>
  );
}

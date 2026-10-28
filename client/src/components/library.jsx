import React from "react";
import { findCover } from "./TestCover";

// Общая вёрстка «библиотеки заданий»: страница «Задания» и кабинет ученика

// ── Библиотека заданий: обложка-миниатюра ─────────────────────────────────────
export function LibraryThumb({ item, size, fallback }) {
  const cover = findCover(item);
  return (
    <span className="lib-thumb" style={{ width: size, height: size, background: cover ? cover.bg : "var(--green-100)" }}>
      {cover ? <img src={cover.src} alt="" loading="lazy" /> : <span>{fallback}</span>}
    </span>
  );
}

// «1 вопрос», «2 вопроса», «5 вопросов»
export function plural(n, one, few, many) {
  const d = n % 10, dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
  return many;
}

// Короткие подписи длинных разделов для бокового меню
export const shortSection = (name) => ({
  "Биология как наука. Методы. Уровни организации": "Биология как наука",
  "Прокариоты и вирусы": "Прокариоты",
  "Грибы и лишайники": "Грибы",
}[name] || name);

export const LIBRARY_STYLES = `
  .lib-layout { display: grid; grid-template-columns: 270px minmax(0, 1fr); min-height: 100vh; padding-top: 64px; }
  .lib-side {
    background: var(--green-50); border-right: 1px solid var(--border-soft);
    padding: 26px 16px; position: sticky; top: 64px; align-self: start;
    height: calc(100vh - 64px); overflow-y: auto;
  }
  .lib-side-title { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--text-muted); margin: 20px 10px 10px; }
  .lib-nav {
    width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px; border: none; background: none;
    border-radius: 12px; font: 600 14px var(--f-sans); color: var(--text-soft); cursor: pointer; text-align: left;
    transition: background .15s, box-shadow .15s;
  }
  .lib-nav:hover { background: rgba(255,255,255,.7); }
  .lib-nav.on { background: #fff; color: var(--text); box-shadow: 0 4px 14px rgba(20,40,30,.08); }
  .lib-nav i { margin-left: auto; font-style: normal; font-size: 12px; color: var(--text-muted); }
  .lib-nav-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lib-dot { width: 34px; height: 34px; flex-shrink: 0; border-radius: 9px; background: var(--green-100); color: var(--green-800); display: grid; place-items: center; font-weight: 800; }
  .lib-thumb { flex-shrink: 0; border-radius: 10px; overflow: hidden; display: grid; place-items: center; font-size: 22px; color: var(--green-800); font-weight: 800; }
  .lib-thumb img { width: 100%; height: 100%; object-fit: contain; display: block; }

  .lib-main { padding: 30px 40px 80px; min-width: 0; }
  .lib-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
  .lib-title { font-family: var(--f-serif); font-size: clamp(28px, 3vw, 40px); line-height: 1.1; letter-spacing: -.02em; }
  .lib-sub { color: var(--text-muted); margin-top: 4px; }
  .lib-seg { display: inline-flex; background: var(--green-50); border-radius: 12px; padding: 4px; }
  .lib-seg button { border: none; background: none; padding: 8px 16px; border-radius: 9px; font: 700 13px var(--f-sans); color: var(--text-soft); cursor: pointer; }
  .lib-seg button.on { background: #fff; color: var(--green-900); box-shadow: 0 2px 8px rgba(0,0,0,.06); }

  .lib-filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 22px; }
  .lib-search { position: relative; flex: 1 1 260px; max-width: 420px; color: var(--text-muted); }
  .lib-search svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .lib-search input {
    width: 100%; padding: 10px 16px 10px 38px; border-radius: 999px; border: 1.5px solid var(--border-soft);
    background: var(--surface); font: 14px var(--f-sans); outline: none; color: var(--text);
  }
  .lib-search input:focus { border-color: var(--green-600); }
  .lib-reset { padding: 9px 16px; border-radius: 999px; font-size: 13px; border: 1.5px solid var(--border-soft); background: transparent; color: var(--text-muted); cursor: pointer; }

  .lib-mocks { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); gap: 14px; margin-bottom: 22px; }
  .lib-mock {
    position: relative; overflow: hidden; text-align: left; border: none; cursor: pointer;
    border-radius: 22px; padding: 22px 24px 24px; color: #fff; font-family: var(--f-sans);
    transition: transform .25s cubic-bezier(.22,.8,.32,1), box-shadow .25s;
  }
  .lib-mock.oge { background: var(--green-800); }
  .lib-mock.ege { background: var(--green-900); }
  .lib-mock:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(20,40,30,.22); }
  .lib-mock small { font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--green-300); }
  .lib-mock h3 { font-family: var(--f-serif); font-weight: 500; font-size: 24px; line-height: 1.15; color: #fff; margin: 6px 0 14px; padding-right: 110px; }
  .lib-mock-nums { display: flex; gap: 24px; }
  .lib-mock-nums b { display: block; font: 700 26px/1 var(--f-serif); }
  .lib-mock-nums span { font-size: 12px; color: var(--green-300); }
  .lib-mock-cta { position: absolute; right: 22px; bottom: 22px; background: var(--amber); color: #3a1e0a; border-radius: 999px; padding: 10px 18px; font-weight: 800; font-size: 14px; }

  .lib-list { border: 1px solid var(--border-soft); border-radius: 18px; overflow: hidden; background: var(--surface); }
  .lib-row {
    width: 100%; display: flex; align-items: center; gap: 16px; padding: 12px 16px; border: none;
    border-bottom: 1px solid var(--border-soft); background: none; cursor: pointer; text-align: left;
    font-family: var(--f-sans); color: var(--text); transition: background .15s;
  }
  .lib-row:last-child { border-bottom: none; }
  .lib-row:hover { background: var(--green-50); }
  .lib-row:hover .lib-play { transform: scale(1.08); }
  .lib-row-body { flex: 1; min-width: 0; }
  .lib-row-title { font-family: var(--f-serif); font-size: 17px; line-height: 1.3; margin-bottom: 4px; }
  .lib-row-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
  .lib-tag { font-size: 11px; font-weight: 700; border-radius: 999px; padding: 3px 9px; background: var(--green-100); color: var(--green-800); }
  .lib-tag.cards { background: var(--amber-soft); color: #7a3e10; }
  .lib-play { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: var(--green-800); color: #fff; display: grid; place-items: center; transition: transform .2s; }
  .lib-play svg { margin-left: 2px; }
  .lib-empty { text-align: center; padding: 60px 0; color: var(--text-muted); font-size: 15px; }

  /* ── Телефоны и планшеты: меню превращается в строку кнопок ── */
  @media (max-width: 900px) {
    .lib-layout { grid-template-columns: 1fr; align-content: start; padding-top: 56px; }
    .lib-side {
      position: sticky; top: 56px; z-index: 20; height: auto; display: flex; gap: 6px; overflow-x: auto;
      padding: 10px 16px; border-right: none; border-bottom: 1px solid var(--border-soft); scrollbar-width: none;
    }
    .lib-side::-webkit-scrollbar { display: none; }
    .lib-side-title { display: none; }
    .lib-nav { width: auto; flex-shrink: 0; padding: 5px 12px 5px 5px; border-radius: 999px; background: #fff; border: 1px solid var(--border-soft); font-size: 13px; }
    .lib-nav.on { background: var(--green-800); color: #fff; border-color: var(--green-800); }
    .lib-nav.on i { color: var(--green-300); }
    .lib-nav .lib-dot, .lib-nav .lib-thumb { width: 26px !important; height: 26px !important; border-radius: 50%; font-size: 12px; }
    .lib-main { padding: 20px 16px 60px; }
    .lib-seg { width: 100%; } .lib-seg button { flex: 1; }
    .lib-search { flex-basis: 100%; max-width: none; }
    .lib-mock h3 { padding-right: 0; }
    .lib-mock-cta { position: static; display: inline-block; margin-top: 16px; }
    .lib-row { gap: 12px; padding: 12px; }
    .lib-row .lib-thumb { width: 44px !important; height: 44px !important; }
    .lib-row-title { font-size: 15px; }
    .lib-play { width: 34px; height: 34px; }
  }
`;


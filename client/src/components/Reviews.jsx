import React, { useEffect, useState } from "react";
import API from "../api";

// ─── Отзывы учеников (добавляются в админке → «Отзывы») ─────────────────────

const PROFI_URL = "https://profi.ru/profile/NikitenkoVY";

function Stars({ value }) {
  return (
    <span className="rv-stars" aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map(i => <span key={i} className={i <= value ? "on" : ""}>★</span>)}
    </span>
  );
}

function ReviewCard({ r }) {
  const [open, setOpen] = useState(false);
  const long = r.text.length > 320;
  return (
    <figure className="rv-card">
      <div className="rv-head">
        <div className="rv-avatar">{r.author.trim()[0]?.toUpperCase()}</div>
        <div>
          <div className="rv-author">{r.author}</div>
          {r.role && <div className="rv-role">{r.role}</div>}
        </div>
        {r.rating && <Stars value={r.rating} />}
      </div>
      <blockquote className={`rv-text${long && !open ? " clamp" : ""}`}>{r.text}</blockquote>
      <div className="rv-foot">
        {long && <button onClick={() => setOpen(o => !o)}>{open ? "Свернуть" : "Читать полностью"}</button>}
        {r.source && (r.source_url
          ? <a href={r.source_url} target="_blank" rel="noopener noreferrer">{r.source} ↗</a>
          : <span>{r.source}</span>)}
      </div>
    </figure>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => { API.getReviews().then(setReviews).catch(() => {}); }, []);
  if (reviews.length === 0) return null;

  return (
    <div className="rv-wrap">
      <div className="rv-top">
        <div>
          <div className="rv-tag">Отзывы</div>
          <h3 className="rv-title">Что говорят <em>ученики и родители</em></h3>
        </div>
        <a className="rv-all" href={PROFI_URL} target="_blank" rel="noopener noreferrer">
          ⭐ 5.0 · все отзывы на Профи.ру ↗
        </a>
      </div>
      <div className="rv-grid">
        {reviews.map(r => <ReviewCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}

export const REVIEWS_STYLES = `
  .rv-wrap { margin-top: 72px; }
  .rv-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
  .rv-tag {
    display: inline-block; background: var(--green-100); color: var(--green-800); border-radius: 999px;
    padding: 5px 16px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 14px;
  }
  .rv-title { font-family: var(--f-serif); font-size: clamp(24px, 2.4vw, 34px); line-height: 1.15; }
  .rv-title em { color: var(--green-800); }
  .rv-all {
    display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 999px;
    background: var(--green-100); color: var(--green-900); border: 1.5px solid var(--green-300);
    font-weight: 600; font-size: 14px; text-decoration: none;
  }
  .rv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); gap: 16px; align-items: start; }
  .rv-card {
    margin: 0; background: var(--surface); border: 1.5px solid var(--border-soft); border-radius: 20px;
    padding: 20px 22px; box-shadow: var(--sh-sm); display: flex; flex-direction: column; gap: 12px;
  }
  .rv-head { display: flex; align-items: center; gap: 12px; }
  .rv-avatar {
    width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center;
    background: var(--green-800); color: #fff; font: 700 17px var(--f-serif);
  }
  .rv-author { font-weight: 700; font-size: 15px; color: var(--text); }
  .rv-role { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
  .rv-stars { margin-left: auto; color: var(--border); font-size: 15px; letter-spacing: 1px; white-space: nowrap; }
  .rv-stars .on { color: #f4a261; }
  .rv-text { margin: 0; font-size: 15px; line-height: 1.65; color: var(--text-soft); white-space: pre-line; }
  .rv-text.clamp { display: -webkit-box; -webkit-line-clamp: 7; -webkit-box-orient: vertical; overflow: hidden; }
  .rv-foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
  .rv-foot button { border: none; background: none; color: var(--green-800); font-weight: 700; cursor: pointer; padding: 0; font-size: 13px; }
  .rv-foot a, .rv-foot span { margin-left: auto; color: var(--text-muted); text-decoration: none; }
  .rv-foot a:hover { color: var(--green-800); }
`;

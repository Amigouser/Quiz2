import React from "react";
import { ogeGrade, egeTestScore } from "../exams";
import { shortSection } from "./library";

// ─── Прогресс: баллы за пробники по датам и слабые разделы ───────────────────
// data — ответ /api/me/progress или /api/report/:token

const fmtDate = (s) => new Date(s.replace(" ", "T") + "Z").toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

export function MockChart({ mocks, exam }) {
  const list = mocks.filter(m => m.mock_exam === exam).slice(-8);
  if (list.length === 0) return null;
  const max = Math.max(...list.map(m => m.max), 1);
  const last = list[list.length - 1];
  const verdict = exam === "ОГЭ" ? `оценка «${ogeGrade(last.score)}»` : `${egeTestScore(last.score)} тестовых баллов`;
  return (
    <div className="pc-card">
      <div className="pc-head">
        <b>Пробники {exam}</b>
        <span className="pc-badge">{verdict}</span>
      </div>
      <div className="pc-chart">
        {list.map((m, i) => (
          <div key={i} className="pc-col" title={`${m.title}: ${m.score} из ${m.max}`}>
            <span className="pc-val">{m.score}</span>
            <div className={`pc-bar${i === list.length - 1 ? " last" : ""}`} style={{ height: `${Math.max(6, (m.score / max) * 100)}%` }} />
            <span className="pc-date">{fmtDate(m.date)}</span>
          </div>
        ))}
      </div>
      {list.length > 1 && (
        <div className="pc-note">
          {last.score - list[0].score >= 0 ? `+${last.score - list[0].score}` : last.score - list[0].score} баллов с первого пробника
          {last.pending && " · развёрнутые ответы ещё проверяются"}
        </div>
      )}
    </div>
  );
}

export function WeakSections({ sections, title = "Стоит повторить" }) {
  const weak = sections.filter(s => s.pct < 75).slice(0, 4);
  if (weak.length === 0) return null;
  return (
    <div className="pc-card">
      <div className="pc-head"><b>{title}</b></div>
      <ul className="pc-weak">
        {weak.map(s => (
          <li key={s.section}>
            <span>{shortSection(s.section)}</span>
            <div className="pc-weak-bar"><i style={{ width: `${s.pct}%` }} /></div>
            <b className={s.pct < 50 ? "bad" : ""}>{s.pct}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const PROGRESS_STYLES = `
  .pc-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 14px; margin-bottom: 20px; }
  .pc-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 18px; padding: 16px 18px; }
  .pc-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 14px; }
  .pc-head b { font-family: var(--f-serif); font-size: 18px; font-weight: 500; color: var(--text); }
  .pc-badge { font-size: 12px; font-weight: 700; background: var(--green-100); color: var(--green-800); border-radius: 999px; padding: 4px 10px; white-space: nowrap; }
  .pc-chart { display: flex; align-items: flex-end; gap: 10px; height: 140px; border-bottom: 1px solid var(--border-soft); padding-top: 18px; }
  .pc-col { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; position: relative; min-width: 0; }
  .pc-bar { width: 100%; max-width: 46px; background: var(--green-300); border-radius: 8px 8px 0 0; }
  .pc-bar.last { background: var(--green-800); }
  .pc-val { font-size: 12px; font-weight: 800; color: var(--green-800); margin-bottom: 4px; }
  .pc-date { position: absolute; bottom: -20px; font-size: 10px; color: var(--text-muted); white-space: nowrap; }
  .pc-note { margin-top: 26px; font-size: 12px; color: var(--text-soft); }
  .pc-weak { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .pc-weak li { display: grid; grid-template-columns: minmax(0, 1.3fr) 1fr auto; align-items: center; gap: 10px; font-size: 14px; color: var(--text); }
  .pc-weak li span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pc-weak-bar { height: 6px; background: var(--bg-muted); border-radius: 9px; overflow: hidden; }
  .pc-weak-bar i { display: block; height: 100%; background: #e0a14a; border-radius: 9px; }
  .pc-weak b { font-size: 13px; color: #9a5a0c; }
  .pc-weak b.bad { color: var(--wrong); }
`;

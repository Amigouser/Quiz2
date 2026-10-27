import React, { useRef, useState } from "react";
import API from "../api";

// ─── Форма заявки на пробное занятие ─────────────────────────────────────────
// Заявка сохраняется в админке («Заявки») и, если настроен бот, приходит в Telegram.

const GRADES = ["5", "6", "7", "8", "9", "10", "11", "Студент / взрослый"];
const GOALS = ["ОГЭ", "ЕГЭ", "ВПР", "Олимпиада", "Подтянуть оценки", "ДВИ", "Другое"];

export function LeadForm({ onPrivacy }) {
  const [form, setForm] = useState({ name: "", grade: "", goal: "", contact: "", comment: "", consent: false, website: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [error, setError] = useState(null);
  const startedAt = useRef(Date.now());

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value })); setError(null); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Напиши, как тебя зовут");
    if (!form.contact.trim()) return setError("Оставь телефон, Telegram или ВКонтакте для связи");
    if (!form.consent) return setError("Нужно согласие на обработку персональных данных");
    setStatus("sending");
    try {
      await API.sendLead({ ...form, started_at: startedAt.current });
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="lead-done">
        <div className="lead-done-icon">🌱</div>
        <div className="lead-done-title">Заявка отправлена!</div>
        <p>Виктория свяжется с тобой в ближайшее время, чтобы договориться о пробном занятии.</p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={submit} noValidate>
      <label className="lead-field">
        <span>Как тебя зовут *</span>
        <input value={form.name} onChange={set("name")} placeholder="Имя" autoComplete="given-name" maxLength={80} />
      </label>
      <div className="lead-row">
        <label className="lead-field">
          <span>Класс</span>
          <select value={form.grade} onChange={set("grade")}>
            <option value="">—</option>
            {GRADES.map(g => <option key={g} value={g}>{/^\d+$/.test(g) ? `${g} класс` : g}</option>)}
          </select>
        </label>
        <label className="lead-field">
          <span>Цель</span>
          <select value={form.goal} onChange={set("goal")}>
            <option value="">—</option>
            {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
      </div>
      <label className="lead-field">
        <span>Как с тобой связаться *</span>
        <input value={form.contact} onChange={set("contact")} placeholder="Телефон, @telegram или ссылка ВК" maxLength={120} />
      </label>
      <label className="lead-field">
        <span>Комментарий</span>
        <textarea value={form.comment} onChange={set("comment")} rows={2} placeholder="Удобное время, что вызывает трудности…" maxLength={1000} />
      </label>
      {/* ловушка для ботов — людям не видна */}
      <input className="lead-hp" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} aria-hidden="true" />
      <label className="lead-consent">
        <input type="checkbox" checked={form.consent} onChange={set("consent")} />
        <span>
          Согласен(на) на обработку персональных данных согласно{" "}
          <a href="/privacy" onClick={e => { if (onPrivacy) { e.preventDefault(); onPrivacy(); } }}>политике конфиденциальности</a>
        </span>
      </label>
      {error && <div className="lead-error">{error}</div>}
      <button type="submit" className="lead-submit" disabled={status === "sending"}>
        {status === "sending" ? "Отправляем…" : "Записаться на пробное"}
      </button>
    </form>
  );
}

export const LEAD_STYLES = `
  .lead-form { display: flex; flex-direction: column; gap: 12px; }
  .lead-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .lead-field { display: flex; flex-direction: column; gap: 5px; }
  .lead-field span { font-size: 12px; font-weight: 600; color: rgba(26,46,31,0.6); }
  .lead-field input, .lead-field select, .lead-field textarea {
    width: 100%; padding: 11px 14px; border-radius: 12px; border: 1.5px solid #e3dcc9; background: #fbfaf5;
    font: 15px var(--f-sans); color: #1a2e1f; outline: none; resize: vertical;
  }
  .lead-field input:focus, .lead-field select:focus, .lead-field textarea:focus { border-color: #52b788; background: #fff; }
  .lead-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
  .lead-consent { display: flex; gap: 9px; align-items: flex-start; font-size: 12px; color: rgba(26,46,31,0.6); line-height: 1.45; cursor: pointer; }
  .lead-consent input { margin-top: 2px; accent-color: #2d6a4f; width: 16px; height: 16px; flex-shrink: 0; }
  .lead-consent a { color: #2d6a4f; }
  .lead-error { font-size: 13px; color: #c1523b; }
  .lead-submit {
    border: none; border-radius: 999px; padding: 14px 22px; cursor: pointer;
    background: #2d6a4f; color: #fff; font: 700 15px var(--f-sans); transition: transform .2s, box-shadow .2s;
  }
  .lead-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(45,106,79,.3); }
  .lead-submit:disabled { opacity: .7; cursor: default; transform: none; }
  .lead-done { text-align: center; padding: 18px 4px 6px; }
  .lead-done-icon { font-size: 48px; margin-bottom: 8px; }
  .lead-done-title { font-family: var(--f-serif); font-size: 22px; font-weight: 700; color: #1a2e1f; margin-bottom: 6px; }
  .lead-done p { font-size: 14px; color: rgba(26,46,31,0.6); line-height: 1.55; }
  @media (max-width: 420px) { .lead-row { grid-template-columns: 1fr; } }
`;

import React from "react";
import API from "../api";

// ─── Админка: заявки на пробное и отзывы учеников ────────────────────────────

const formatDate = (s) => {
  if (!s) return "";
  const d = new Date(s.replace(" ", "T") + "Z");
  return d.toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
};

// Ссылка, по которой можно сразу написать: телефон, @telegram, vk
function contactHref(c) {
  const v = c.trim();
  if (/^@?[a-z0-9_]{5,}$/i.test(v) && !/^\d+$/.test(v.replace("@", ""))) return `https://t.me/${v.replace("@", "")}`;
  if (/^(https?:\/\/)?(t\.me|vk\.com|vk\.ru)\//i.test(v)) return v.startsWith("http") ? v : `https://${v}`;
  const digits = v.replace(/[^\d+]/g, "");
  if (digits.replace("+", "").length >= 10) return `tel:${digits}`;
  return null;
}

export const AdminLeads = () => {
  const [leads, setLeads] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("new");

  const load = () => API.admin.getLeads().then(l => { setLeads(l); setLoading(false); }).catch(() => setLoading(false));
  React.useEffect(() => { load(); }, []);

  const toggle = async (l) => { await API.admin.setLeadStatus(l.id, l.status === "done" ? "new" : "done"); load(); };
  const remove = async (l) => { if (window.confirm("Удалить заявку?")) { await API.admin.deleteLead(l.id); load(); } };

  const shown = leads.filter(l => filter === "all" || (l.status || "new") === filter);
  const newCount = leads.filter(l => (l.status || "new") === "new").length;

  return (
    <div style={{ padding: "32px 40px", flex: 1, maxWidth: 1000 }}>
      <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32, marginBottom: 6 }}>Заявки на пробное</h1>
      <p style={{ color: "var(--text-soft)", marginBottom: 20, lineHeight: 1.6 }}>
        Заявки из формы «Записаться на пробное» на главной. Связалась с учеником — отметь «Обработана».
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[["new", `Новые${newCount ? ` · ${newCount}` : ""}`], ["done", "Обработанные"], ["all", "Все"]].map(([k, l]) => (
          <button key={k} className={`btn btn-sm ${filter === k ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      {loading ? <div style={{ color: "var(--text-muted)" }}>Загрузка…</div>
        : shown.length === 0 ? <div style={{ color: "var(--text-muted)" }}>{filter === "new" ? "Новых заявок нет." : "Заявок нет."}</div>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shown.map(l => {
              const href = contactHref(l.contact);
              return (
                <div key={l.id} className="card" style={{ padding: "16px 20px", opacity: l.status === "done" ? 0.65 : 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 17 }}>{l.name}</span>
                    {l.grade && <span className="pill pill-muted">{/^\d+$/.test(l.grade) ? `${l.grade} класс` : l.grade}</span>}
                    {l.goal && <span className="pill" style={{ background: "var(--green-100)", color: "var(--green-800)" }}>{l.goal}</span>}
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{formatDate(l.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 15, marginBottom: l.comment ? 6 : 10 }}>
                    📞 {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--green-800)", fontWeight: 600 }}>{l.contact}</a> : <b>{l.contact}</b>}
                  </div>
                  {l.comment && <div style={{ fontSize: 14, color: "var(--text-soft)", whiteSpace: "pre-wrap", marginBottom: 10 }}>{l.comment}</div>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className={`btn btn-sm ${l.status === "done" ? "btn-ghost" : "btn-primary"}`} onClick={() => toggle(l)}>
                      {l.status === "done" ? "Вернуть в новые" : "✓ Обработана"}
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", color: "var(--wrong)" }} onClick={() => remove(l)}>Удалить</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

const EMPTY_REVIEW = { author: "", role: "", text: "", rating: 5, source: "Профи.ру", source_url: "https://profi.ru/profile/NikitenkoVY" };

function ReviewEditor({ initial, onSave, onCancel, saving }) {
  const [r, setR] = React.useState(initial);
  const set = (k) => (e) => setR(x => ({ ...x, [k]: k === "rating" ? Number(e.target.value) : e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(r); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>Имя *</label><input className="input" value={r.author} onChange={set("author")} placeholder="Например: Анна, мама Максима" /></div>
        <div className="field"><label>Подпись</label><input className="input" value={r.role || ""} onChange={set("role")} placeholder="ОГЭ 2025 · 45 баллов" /></div>
      </div>
      <div className="field"><label>Текст отзыва *</label><textarea className="input" rows={5} value={r.text} onChange={set("text")} placeholder="Скопируй текст отзыва" style={{ resize: "vertical", fontFamily: "var(--f-sans)" }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 2fr", gap: 12 }}>
        <div className="field"><label>Оценка</label>
          <select className="input" value={r.rating || ""} onChange={set("rating")}>
            <option value="">—</option>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}
          </select>
        </div>
        <div className="field"><label>Откуда</label><input className="input" value={r.source || ""} onChange={set("source")} placeholder="Профи.ру" /></div>
        <div className="field"><label>Ссылка на источник</label><input className="input" value={r.source_url || ""} onChange={set("source_url")} placeholder="https://profi.ru/…" /></div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Сохраняем…" : "Сохранить"}</button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Отмена</button>}
      </div>
    </form>
  );
}

export const AdminReviews = () => {
  const [reviews, setReviews] = React.useState([]);
  const [editing, setEditing] = React.useState(null); // id | "new" | null
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  const load = () => API.admin.getReviews().then(setReviews).catch(e => setError(e.message));
  React.useEffect(() => { load(); }, []);

  const save = async (r) => {
    setSaving(true); setError(null);
    try {
      if (editing === "new") await API.admin.addReview(r); else await API.admin.updateReview(editing, r);
      setEditing(null); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const remove = async (r) => { if (window.confirm("Удалить отзыв?")) { await API.admin.deleteReview(r.id); load(); } };
  const move = async (i, dir) => {
    const next = [...reviews]; const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setReviews(next);
    await API.admin.reorderReviews(next.map(r => r.id));
  };

  return (
    <div style={{ padding: "32px 40px", flex: 1, maxWidth: 1000 }}>
      <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32, marginBottom: 6 }}>Отзывы учеников</h1>
      <p style={{ color: "var(--text-soft)", marginBottom: 20, lineHeight: 1.6 }}>
        Отзывы показываются на главной в блоке «Об авторе». Скопируй их из своего профиля на Профи.ру
        (или из сообщений учеников, с их разрешения). Пока отзывов нет, блок скрыт.
      </p>
      {error && <div style={{ color: "var(--wrong)", marginBottom: 12 }}>{error}</div>}

      {editing === "new" ? (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <ReviewEditor initial={EMPTY_REVIEW} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
        </div>
      ) : (
        <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={() => setEditing("new")}>+ Добавить отзыв</button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reviews.map((r, i) => (
          <div key={r.id} className="card" style={{ padding: "16px 20px" }}>
            {editing === r.id ? (
              <ReviewEditor initial={r} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <b style={{ fontSize: 16 }}>{r.author}</b>
                  {r.role && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.role}</span>}
                  {r.rating && <span style={{ color: "#f4a261" }}>{"★".repeat(r.rating)}</span>}
                  {r.source && <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{r.source}</span>}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-soft)", whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 10 }}>{r.text}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                  <button className="btn btn-ghost btn-sm" disabled={i === reviews.length - 1} onClick={() => move(i, 1)}>↓</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(r.id)}>Изменить</button>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", color: "var(--wrong)" }} onClick={() => remove(r)}>Удалить</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

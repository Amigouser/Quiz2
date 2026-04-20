import React from "react";
import { Leaf, Fern, Cell, Sprig, BotanicalBg } from "../botanical";

export const LoginClassic = ({ onEnter }) => {
  const [name, setName] = React.useState("");
  return (
    <div style={{
      position: "relative",
      width: "100%", minHeight: 640,
      background: "var(--bg)",
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      overflow: "hidden",
    }}>
      <BotanicalBg intensity={1} pattern="ferns" />

      {/* Left pane — greeting */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "72px 72px 64px",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "var(--green-800)", color: "#fff",
            display: "grid", placeItems: "center",
          }}>
            <Leaf size={24} stroke={1.6} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 18, fontWeight: 600 }}>Живая клетка</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.04em" }}>репетитор · биология</div>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Урок · сегодня</div>
          <h1 style={{
            fontFamily: "var(--f-serif)",
            fontSize: 56, fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}>
            Добро&nbsp;пожаловать<br/>
            <em style={{ fontStyle: "italic", color: "var(--green-800)" }}>на урок.</em>
          </h1>
          <p style={{ color: "var(--text-soft)", fontSize: 17, maxWidth: 440, lineHeight: 1.6 }}>
            Изучай биологию с помощью интерактивных тестов. Готов?
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); name.trim() && onEnter?.(name.trim()); }}
          style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label>Как тебя зовут?</label>
            <input className="input input-lg" placeholder="Например, Аня"
              value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={!name.trim()}
              style={{ opacity: name.trim() ? 1 : 0.5 }}>
              Войти на урок
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8 H13 M9 4 L 13 8 L 9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
              без пароля — по имени
            </span>
          </div>
        </form>
      </div>

      {/* Right pane — plate */}
      <div style={{
        position: "relative",
        background: "linear-gradient(160deg, var(--green-100), var(--green-200) 60%, var(--green-300))",
        borderLeft: "1px solid var(--border-soft)",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, color: "var(--green-900)", opacity: 0.15 }}>
          <Fern size={320} style={{ position: "absolute", top: -40, left: -60 }} />
          <Fern size={200} style={{ position: "absolute", bottom: -20, right: -20, transform: "scaleX(-1)" }} />
        </div>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          textAlign: "center",
          color: "var(--green-900)",
        }}>
          <div style={{ color: "var(--green-800)" }}>
            <Cell size={280} stroke={1.2} />
          </div>
          <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 15, marginTop: 18, color: "var(--green-900)" }}>
            Fig. 1 — Cellula vegetalis
          </div>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 6, color: "var(--green-700)" }}>
            строение · ядро · мембрана
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoginCompact = ({ onEnter }) => {
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onEnter?.(name.trim());
    } catch (err) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, var(--green-100), var(--bg) 70%)",
      display: "grid", placeItems: "center",
      padding: "48px 24px",
      overflow: "hidden",
    }}>
      <BotanicalBg intensity={1.5} pattern="mix" />
      <div style={{ color: "var(--green-700)", position: "absolute", top: 40, left: 40, opacity: 0.25 }}>
        <Sprig size={140} />
      </div>
      <div style={{ color: "var(--green-700)", position: "absolute", bottom: 40, right: 40, opacity: 0.25, transform: "rotate(160deg)" }}>
        <Sprig size={180} />
      </div>

      <div className="card" style={{
        width: "min(460px, 100%)",
        padding: 40,
        zIndex: 1,
        textAlign: "center",
      }}>
        {/* Tutor avatar */}
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "var(--green-200)",
          margin: "0 auto 20px",
          display: "grid", placeItems: "center",
          color: "var(--green-800)",
          position: "relative",
          border: "2px solid var(--green-300)",
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="18" r="8" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M6 40 Q 22 26, 38 40" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <div style={{
            position: "absolute", bottom: -4, right: -4,
            background: "var(--accent)", color: "#1a1005",
            fontSize: 10, fontWeight: 700, padding: "3px 8px",
            borderRadius: 999, border: "2px solid var(--surface)",
            letterSpacing: "0.06em",
          }}>ONLINE</div>
        </div>

        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 12 }}>Елена Ивановна</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 34, lineHeight: 1.1, marginBottom: 8 }}>
          Рада видеть тебя <br/>
          <em style={{ color: "var(--green-800)" }}>снова</em>
        </h1>
        <p style={{ color: "var(--text-soft)", fontSize: 14, marginBottom: 28 }}>
          Введи своё имя — и начнём урок.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input input-lg" placeholder="Твоё имя"
            value={name} onChange={e => setName(e.target.value)}
            style={{ textAlign: "center" }} autoFocus />
          {error && <div style={{ fontSize: 13, color: "var(--wrong)", textAlign: "center" }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={!name.trim() || loading}
            style={{ opacity: name.trim() && !loading ? 1 : 0.5, justifyContent: "center" }}>
            {loading ? "Входим…" : "Продолжить 🌱"}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px dashed var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
          Впервые тут? Имя станет твоим профилем автоматически.
        </div>
      </div>
    </div>
  );
};

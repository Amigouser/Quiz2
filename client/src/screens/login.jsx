import React, { useRef } from "react";
import { Leaf, Fern, Cell, Sprig, BotanicalBg } from "../botanical";

/* ── Полноэкранная версия с иллюстрацией (не используется, но оставим) ── */
export const LoginClassic = ({ onEnter }) => {
  const [code, setCode] = React.useState("");
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
            fontFamily: "var(--f-serif)", fontSize: 56, fontWeight: 400,
            lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 20,
          }}>
            Добро&nbsp;пожаловать<br/>
            <em style={{ fontStyle: "italic", color: "var(--green-800)" }}>на урок.</em>
          </h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); code.trim() && onEnter?.(code.trim()); }}
          style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label>Введи код доступа</label>
            <input className="input input-lg" placeholder="12345678"
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              maxLength={8} autoFocus />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={!code.trim()}>
            Войти
          </button>
        </form>
      </div>

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
          width: 320, textAlign: "center", color: "var(--green-900)",
        }}>
          <div style={{ color: "var(--green-800)" }}><Cell size={280} stroke={1.2} /></div>
        </div>
      </div>
    </div>
  );
};

/* ── Основная компактная версия — ввод 8-значного кода ── */
export const LoginCompact = ({ onEnter }) => {
  const [digits, setDigits] = React.useState(Array(8).fill(""));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const inputRefs = useRef([]);

  const handleDigit = (i, val) => {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    setError(null);
    if (ch && i < 7) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        setDigits(next);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 7) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    const next = Array(8).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 7);
    inputRefs.current[focusIdx]?.focus();
  };

  const code = digits.join("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length < 1) return;
    setLoading(true);
    setError(null);
    try {
      await onEnter?.(trimmed);
    } catch (err) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const isReady = code.length === 8;

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
        width: "min(500px, 100%)",
        padding: "48px 40px",
        zIndex: 1,
        textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "var(--green-800)", color: "#fff",
          margin: "0 auto 24px",
          display: "grid", placeItems: "center",
          boxShadow: "0 8px 24px rgba(30,80,50,0.18)",
        }}>
          <Leaf size={34} stroke={1.5} style={{ color: "#fff" }} />
        </div>

        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 12 }}>Живая клетка · биология</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32, lineHeight: 1.15, marginBottom: 10 }}>
          Введи код доступа
        </h1>
        <p style={{ color: "var(--text-soft)", fontSize: 14, marginBottom: 36, lineHeight: 1.55 }}>
          Твой репетитор выдаст тебе<br/>уникальный 8-значный код.
        </p>

        {/* 8-digit input */}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: "flex", gap: 8, justifyContent: "center",
            marginBottom: 20,
          }}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                autoFocus={i === 0}
                style={{
                  width: 44, height: 56,
                  textAlign: "center",
                  fontSize: 24, fontWeight: 600,
                  fontFamily: "var(--f-serif)",
                  border: `2px solid ${d ? "var(--green-600)" : "var(--border)"}`,
                  borderRadius: 10,
                  background: d ? "var(--green-50)" : "var(--surface)",
                  color: "var(--text)",
                  outline: "none",
                  transition: "border-color 0.15s, background 0.15s",
                  caretColor: "transparent",
                }}
                onFocus={e => e.target.style.borderColor = "var(--green-700)"}
                onBlur={e => e.target.style.borderColor = digits[i] ? "var(--green-600)" : "var(--border)"}
              />
            ))}
          </div>

          {error && (
            <div style={{
              fontSize: 13, color: "var(--wrong)", textAlign: "center",
              marginBottom: 12, padding: "8px 16px",
              background: "#fff5f5", borderRadius: 8,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={!isReady || loading}
            style={{ width: "100%", justifyContent: "center", opacity: isReady && !loading ? 1 : 0.5 }}
          >
            {loading ? "Входим…" : "Войти на урок 🌱"}
          </button>
        </form>

        <AdminLoginLink onEnter={onEnter} />
      </div>
    </div>
  );
};

/* ── Скрытая ссылка для входа репетитора ── */
function AdminLoginLink({ onEnter }) {
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      await onEnter?.("admin");
    } catch (err) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px dashed var(--border)" }}>
      {!show ? (
        <button
          onClick={() => setShow(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--text-muted)", textDecoration: "underline", textDecorationStyle: "dotted" }}
        >
          Я репетитор
        </button>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Вход для преподавателя</div>
          {error && <div style={{ fontSize: 12, color: "var(--wrong)", marginBottom: 8 }}>{error}</div>}
          <button className="btn btn-ghost btn-sm" onClick={handleAdmin} disabled={loading}
            style={{ fontSize: 13 }}>
            {loading ? "Входим…" : "Войти как репетитор"}
          </button>
        </div>
      )}
    </div>
  );
}

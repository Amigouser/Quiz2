import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BotanicalBg, Fern, Sprig } from "../botanical";
import API from "../api";

function Spinner() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <div style={{ fontFamily: "var(--f-serif)", fontSize: 18, color: "var(--green-800)", opacity: 0.6 }}>
        Загрузка…
      </div>
    </div>
  );
}

function FlashcardResults({ set, known, onRetry, onHome }) {
  const total = set.cards.length;
  const knownCount = known.size;
  const pct = total > 0 ? Math.round((knownCount / total) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 40, position: "relative", overflow: "hidden",
    }}>
      <BotanicalBg intensity={0.5} pattern="ferns" />
      <div style={{ position: "fixed", bottom: 0, right: 0, color: "var(--green-800)", opacity: 0.08, pointerEvents: "none" }}>
        <Fern size={400} />
      </div>
      <div className="card" style={{ padding: "48px 56px", maxWidth: 480, textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🌿</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32, marginBottom: 8 }}>Молодец!</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 32, fontSize: 15 }}>
          Ты прошёл все карточки набора<br />
          <strong style={{ color: "var(--text)" }}>«{set.title}»</strong>
        </p>
        <div style={{
          fontFamily: "var(--f-serif)", fontSize: 64,
          color: pct >= 70 ? "var(--green-800)" : "var(--accent)",
          lineHeight: 1, marginBottom: 8,
        }}>
          {pct}%
        </div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 36 }}>
          {knownCount} из {total} карточек запомнено
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onRetry}>Повторить</button>
          <button className="btn btn-primary" onClick={onHome}>На главную</button>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardsRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [done, setDone] = useState(false);

  useEffect(() => {
    API.getCardSet(id).then(setSet);
  }, [id]);

  const goNext = useCallback(() => {
    if (!set) return;
    if (index < set.cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setIndex(i => i + 1), 160);
    } else {
      setDone(true);
    }
  }, [set, index]);

  const handleKey = useCallback((e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      setFlipped(f => !f);
    }
    if (e.code === "ArrowRight") {
      setFlipped(false);
      setTimeout(() => setIndex(i => Math.min(i + 1, (set?.cards?.length || 1) - 1)), 160);
    }
    if (e.code === "ArrowLeft") {
      setFlipped(false);
      setTimeout(() => setIndex(i => Math.max(i - 1, 0)), 160);
    }
  }, [set]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const markKnown = () => {
    setKnown(prev => new Set([...prev, set.cards[index].id]));
    goNext();
  };

  const handleRetry = () => {
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setDone(false);
  };

  if (!set) return <Spinner />;

  if (done) {
    return (
      <FlashcardResults
        set={set}
        known={known}
        onRetry={handleRetry}
        onHome={() => navigate("/dashboard")}
      />
    );
  }

  const card = set.cards[index];
  const progress = set.cards.length > 1 ? (index / (set.cards.length - 1)) * 100 : 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <BotanicalBg intensity={0.35} pattern="ferns" />
      <div style={{ position: "fixed", bottom: -40, right: -40, color: "var(--green-800)", opacity: 0.07, pointerEvents: "none" }}>
        <Fern size={380} />
      </div>
      <div style={{ position: "fixed", top: 80, left: -20, color: "var(--green-800)", opacity: 0.06, pointerEvents: "none", transform: "scaleX(-1) rotate(10deg)" }}>
        <Sprig size={220} />
      </div>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--surface)",
        position: "relative",
      }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>← Назад</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 18, fontWeight: 600 }}>{set.title}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {set.topic && <span>{set.topic} · </span>}
            {set.cards.length} карточек
          </div>
        </div>
        <div style={{ fontSize: 14, color: "var(--text-soft)", fontFamily: "var(--f-serif)" }}>
          {index + 1} <span style={{ color: "var(--text-muted)" }}>/ {set.cards.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--border-soft)" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--green-600), var(--green-800))",
          transition: "width 0.35s ease",
          borderRadius: "0 2px 2px 0",
        }} />
      </div>

      {/* Card area */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 48px 0", position: "relative" }}>

        {/* Flip card */}
        <div
          style={{ width: "100%", maxWidth: 640, perspective: "1200px", cursor: "pointer" }}
          onClick={() => setFlipped(f => !f)}
        >
          <div style={{
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            height: 280,
          }}>
            {/* Front — Term */}
            <div style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "var(--surface)",
              border: "1.5px solid var(--border-soft)",
              borderRadius: "var(--r-lg)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.07)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "40px 56px",
            }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 20, fontWeight: 600 }}>
                Термин
              </div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 30, fontWeight: 500, textAlign: "center", lineHeight: 1.3 }}>
                {card.term}
              </div>
              <div style={{ marginTop: 28, fontSize: 12, color: "var(--text-muted)" }}>
                Пробел или клик · перевернуть
              </div>
            </div>

            {/* Back — Definition */}
            <div style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(145deg, var(--green-50), var(--green-100))",
              border: "1.5px solid var(--green-300)",
              borderRadius: "var(--r-lg)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.07)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "40px 56px",
            }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green-800)", marginBottom: 20, fontWeight: 600, opacity: 0.7 }}>
                Определение
              </div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, fontWeight: 400, textAlign: "center", lineHeight: 1.55 }}>
                {card.definition}
              </div>
            </div>
          </div>
        </div>

        {/* Know / Don't know — fades in after flip */}
        <div style={{
          marginTop: 32,
          display: "flex", gap: 14,
          opacity: flipped ? 1 : 0,
          transform: flipped ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s, transform 0.25s",
          pointerEvents: flipped ? "auto" : "none",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            style={{
              padding: "12px 36px", fontSize: 15, fontWeight: 500,
              background: "#fff0f0", color: "#c0392b",
              border: "1.5px solid #fbb", borderRadius: "var(--r-md)",
              cursor: "pointer",
            }}
          >
            Не знаю
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: "12px 36px", fontSize: 15 }}
            onClick={(e) => { e.stopPropagation(); markKnown(); }}
          >
            Знаю ✓
          </button>
        </div>

        {/* Prev / Next navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, marginBottom: 60 }}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={index === 0}
            onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => i - 1), 160); }}
          >
            ← Предыдущая
          </button>
          <button
            className="btn btn-ghost btn-sm"
            disabled={index === set.cards.length - 1}
            onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => i + 1), 160); }}
          >
            Следующая →
          </button>
        </div>

        {/* Known counter badge */}
        {known.size > 0 && (
          <div style={{
            position: "fixed", bottom: 28, right: 48,
            background: "var(--green-800)", color: "#fff",
            padding: "8px 16px", borderRadius: "var(--r-md)",
            fontSize: 13, fontWeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}>
            ✓ Запомнено: {known.size}
          </div>
        )}
      </div>
    </div>
  );
}

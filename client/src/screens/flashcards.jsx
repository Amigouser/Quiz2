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

// Порядок показа: сначала то, что пора повторить (самые трудные вперёд),
// потом новые карточки, в конце — уже выученные, которым срок ещё не подошёл
function smartOrder(cards) {
  const due = cards.filter(c => c.is_due).sort((a, b) => (a.box - b.box) || (b.wrong - a.wrong));
  const fresh = cards.filter(c => c.box == null);
  const later = cards.filter(c => c.box != null && !c.is_due).sort((a, b) => a.box - b.box);
  return [...due, ...fresh, ...later];
}

const REPEAT_GAP = 3;   // «Не знаю» — карточка вернётся через 3 карточки
const MAX_REPEATS = 2;  // и не больше двух раз за заход, чтобы не зациклиться

function FlashcardResults({ set, known, missed = [], onRetry, onRetryMissed, onHome, waterEarned = 0 }) {
  const total = set.cards.length;
  const knownCount = known.size;
  const pct = total > 0 ? Math.round((knownCount / total) * 100) : 0;

  return (
    <div className="fc-results-wrap" style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 40, position: "relative", overflow: "hidden",
    }}>
      <BotanicalBg intensity={0.5} pattern="ferns" />
      <div style={{ position: "fixed", bottom: 0, right: 0, color: "var(--green-800)", opacity: 0.08, pointerEvents: "none" }}>
        <Fern size={400} />
      </div>
      <div className="card fc-results-card" style={{ padding: "48px 56px", maxWidth: 480, textAlign: "center", position: "relative" }}>
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
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: missed.length ? 20 : 36 }}>
          {knownCount} из {total} карточек запомнено
        </div>
        {missed.length > 0 && (
          <div style={{ marginBottom: 28, padding: "12px 16px", borderRadius: 14, background: "#fff6ec", color: "#8a4b12", fontSize: 14, textAlign: "left" }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Трудные карточки ({missed.length}):</div>
            <div style={{ lineHeight: 1.5 }}>{missed.slice(0, 6).map(c => c.term).join(", ")}{missed.length > 6 ? "…" : ""}</div>
            <div style={{ marginTop: 6, color: "#a86a32", fontSize: 13 }}>Они попадутся тебе снова уже сегодня-завтра, а выученные — реже.</div>
          </div>
        )}
        {waterEarned > 0 && (
          <div style={{ margin: "-20px 0 24px", padding: "10px 14px", borderRadius: 14, background: "#e3f2fc", color: "#1f6fa8", fontWeight: 700, fontSize: 14 }}>
            💧 +{waterEarned} капля для твоего цветка — полей его в кабинете!
          </div>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {missed.length > 0 && <button className="btn btn-ghost" onClick={onRetryMissed}>Повторить трудные</button>}
          <button className="btn btn-ghost" onClick={onRetry}>Ещё раз всё</button>
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
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [done, setDone] = useState(false);
  // карточки, на которые ответили «Не знаю» в этом заходе, и сколько раз их уже вернули
  const [missed, setMissed] = useState(new Map());
  const [repeats, setRepeats] = useState(new Map());
  const [reported, setReported] = useState(new Set());

  // капля для цветка за пройденный набор (сервер даёт её раз в день на набор)
  const [waterEarned, setWaterEarned] = useState(0);
  useEffect(() => {
    if (done && set) API.rewardCards(set.id).then(r => setWaterEarned(r.earned || 0)).catch(() => {});
  }, [done]);

  useEffect(() => {
    API.getCardSet(id).then(data => {
      setSet(data);
      setCards(smartOrder(data.cards));
    });
  }, [id]);

  const shuffleCards = () => {
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    startSession(arr);
  };

  const startSession = (list) => {
    setCards(list);
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setMissed(new Map());
    setRepeats(new Map());
    setReported(new Set());
    setDone(false);
  };

  const review = (card, isKnown) => {
    API.reviewCard(set.id, card.term, isKnown).catch(() => {});
  };

  const goNext = useCallback(() => {
    if (!set) return;
    if (index < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setIndex(i => i + 1), 160);
    } else {
      setDone(true);
    }
  }, [cards, index]);

  const handleKey = useCallback((e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      setFlipped(f => !f);
    }
    if (e.code === "ArrowRight") {
      setFlipped(false);
      setTimeout(() => setIndex(i => Math.min(i + 1, cards.length - 1)), 160);
    }
    if (e.code === "ArrowLeft") {
      setFlipped(false);
      setTimeout(() => setIndex(i => Math.max(i - 1, 0)), 160);
    }
  }, [cards]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const markKnown = () => {
    const card = cards[index];
    setKnown(prev => new Set([...prev, card.id]));
    // «Знаю» поднимает карточку в следующую коробку только один раз за заход
    if (!reported.has(card.id)) {
      setReported(prev => new Set([...prev, card.id]));
      review(card, true);
    }
    goNext();
  };

  const markUnknown = () => {
    const card = cards[index];
    review(card, false);
    setMissed(prev => new Map(prev).set(card.id, card));
    setKnown(prev => { const k = new Set(prev); k.delete(card.id); return k; });
    setReported(prev => { const r = new Set(prev); r.delete(card.id); return r; });
    const n = repeats.get(card.id) || 0;
    if (n < MAX_REPEATS) {
      setRepeats(prev => new Map(prev).set(card.id, n + 1));
      setCards(prev => {
        const arr = [...prev];
        arr.splice(Math.min(index + 1 + REPEAT_GAP, arr.length), 0, card);
        return arr;
      });
      setFlipped(false);
      setTimeout(() => setIndex(i => i + 1), 160);
    } else {
      goNext();
    }
  };

  const handleRetry = () => startSession(smartOrder(set.cards));
  const handleRetryMissed = () => startSession([...missed.values()]);

  if (!set) return <Spinner />;

  if (done) {
    return (
      <FlashcardResults
        set={{ ...set, cards: [...new Map(cards.map(c => [c.id, c])).values()] }}
        known={known}
        missed={[...missed.values()].filter(c => !known.has(c.id))}
        onRetry={handleRetry}
        onRetryMissed={handleRetryMissed}
        onHome={() => navigate("/dashboard")}
        waterEarned={waterEarned}
      />
    );
  }

  const card = cards[index];
  // фото показываем только на той стороне, где его поставил репетитор
  const backImage = card.image_data && card.image_side === "back";
  const frontImage = card.image_data && !backImage;
  const progress = cards.length > 1 ? (index / (cards.length - 1)) * 100 : 100;

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
      <div className="fc-topbar" style={{
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
            {set.cards.some(c => c.is_due) && <span> · 🔁 повторить: {set.cards.filter(c => c.is_due).length}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={shuffleCards}
            title="Перемешать карточки"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            🔀 Перемешать
          </button>
          <div style={{ fontSize: 14, color: "var(--text-soft)", fontFamily: "var(--f-serif)" }}>
            {index + 1} <span style={{ color: "var(--text-muted)" }}>/ {cards.length}</span>
          </div>
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
      <div className="fc-area" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 48px 0", position: "relative" }}>

        {/* Flip card */}
        <div
          className="fc-card-wrap"
          style={{ width: "100%", maxWidth: 640, perspective: "1200px", cursor: "pointer" }}
          onClick={() => setFlipped(f => !f)}
        >
          <div className="fc-card" style={{
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: 280,
            maxHeight: "60vh",
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
              padding: "32px 28px",
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              {frontImage && (
                <img src={card.image_data} alt="" loading="eager" style={{
                  display: "block", maxWidth: "100%", height: "auto", maxHeight: 120,
                  borderRadius: 10, objectFit: "contain", marginBottom: 12, flexShrink: 0,
                  WebkitTransform: "translateZ(0)", transform: "translateZ(0)",
                }} />
              )}
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: frontImage ? 10 : 16, fontWeight: 600, flexShrink: 0 }}>
                Термин
                {(missed.has(card.id) || card.is_due) && (
                  <span style={{ marginLeft: 8, color: "#c0392b", letterSpacing: "0.06em" }}>
                    · {missed.has(card.id) ? "ещё раз" : "повторение"}
                  </span>
                )}
              </div>
              <div className="fc-term pre-line" style={{ fontFamily: "var(--f-serif)", fontSize: 24, fontWeight: 500, textAlign: "center", lineHeight: 1.35 }}>
                {card.term}
              </div>
              <div style={{ marginTop: 20, fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
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
              padding: "32px 28px",
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              {backImage && (
                <img src={card.image_data} alt="" loading="eager" style={{
                  display: "block", maxWidth: "100%", height: "auto", maxHeight: 100,
                  borderRadius: 10, objectFit: "contain", marginBottom: 12, flexShrink: 0,
                  WebkitTransform: "translateZ(0)", transform: "translateZ(0)",
                }} />
              )}
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green-800)", marginBottom: backImage ? 10 : 16, fontWeight: 600, opacity: 0.7, flexShrink: 0 }}>
                Определение
              </div>
              <div className="fc-def pre-line" style={{ fontFamily: "var(--f-serif)", fontSize: 20, fontWeight: 400, textAlign: "center", lineHeight: 1.55 }}>
                {card.definition}
              </div>
            </div>
          </div>
        </div>

        {/* Know / Don't know — fades in after flip */}
        <div className="fc-actions" style={{
          marginTop: 32,
          display: "flex", gap: 14,
          opacity: flipped ? 1 : 0,
          transform: flipped ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s, transform 0.25s",
          pointerEvents: flipped ? "auto" : "none",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); markUnknown(); }}
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
        <div className="fc-nav" style={{ display: "flex", gap: 12, marginTop: 24, marginBottom: 60 }}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={index === 0}
            onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => i - 1), 160); }}
          >
            ← Предыдущая
          </button>
          <button
            className="btn btn-ghost btn-sm"
            disabled={index === cards.length - 1}
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

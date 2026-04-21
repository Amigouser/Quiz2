import React from "react";
import { Leaf, Fern, Cell, Sprig, Helix, BotanicalBg } from "../botanical";

export const CardSetCard = ({ s, onStart }) => (
  <div className="card" style={{ padding: 0, cursor: "pointer" }} onClick={onStart}>
    {/* Illustration strip */}
    <div style={{
      height: 90,
      background: "linear-gradient(135deg, var(--green-200), var(--green-300))",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, color: "var(--green-800)", opacity: 0.3 }}>
        <Sprig size={130} style={{ position: "absolute", top: -10, right: -10, transform: "rotate(15deg)" }} />
      </div>
      <div style={{ position: "absolute", top: 14, left: 16, display: "flex", gap: 6 }}>
        <span className="pill pill-muted" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", fontSize: 11 }}>
          🃏 Карточки
        </span>
        {s.topic && (
          <span className="pill pill-muted" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", fontSize: 11 }}>
            {s.topic}
          </span>
        )}
        {s.is_assigned && (
          <span className="pill" style={{ background: "var(--green-800)", color: "#fff", backdropFilter: "blur(8px)", fontSize: 11 }}>
            🌱 Назначено
          </span>
        )}
      </div>
    </div>

    <div style={{ padding: "16px 20px 18px" }}>
      <h3 style={{ fontFamily: "var(--f-serif)", fontSize: 18, fontWeight: 500, marginBottom: 8, lineHeight: 1.25 }}>
        {s.title}
      </h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {s.cards_count} карточек</span>
        <button className="btn btn-soft btn-sm" onClick={(e) => { e.stopPropagation(); onStart?.(); }}>
          Учить
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6h6 M7 3 l 3 3 l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  </div>
);

export const QuizCard = ({ q, onStart }) => {
  const scorePct = q.score != null ? Math.round((q.score / q.questions) * 100) : null;
  const statusLabel = {
    done: `Пройден · ${q.score}/${q.questions}`,
    inprogress: "В процессе",
    new: "Новый",
  }[q.status] || "Новый";
  const statusColor = {
    done: { bg: "var(--green-200)", fg: "var(--green-900)" },
    inprogress: { bg: "var(--accent-soft)", fg: "#5a3a10" },
    new: { bg: "var(--bg-muted)", fg: "var(--text-soft)" },
  }[q.status] || { bg: "var(--bg-muted)", fg: "var(--text-soft)" };

  return (
    <div className="card" style={{ padding: 0, cursor: "pointer" }} onClick={onStart}>
      {/* Illustration strip */}
      <div style={{
        height: 120,
        background: "linear-gradient(135deg, var(--green-100), var(--green-200))",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, color: "var(--green-800)", opacity: 0.4 }}>
          {q.topic === "Ботаника" && <Fern size={160} style={{ position: "absolute", top: -20, right: -20 }} />}
          {q.topic === "Зоология" && <Helix size={120} style={{ position: "absolute", top: -10, right: 20 }} />}
          {q.topic === "Генетика" && <Helix size={140} style={{ position: "absolute", top: -20, right: -10 }} />}
          {q.topic === "Анатомия" && <Cell size={160} style={{ position: "absolute", top: -30, right: -20 }} />}
          {q.topic === "Экология" && <Sprig size={140} style={{ position: "absolute", top: 0, right: 0, transform: "rotate(20deg)" }} />}
          {!["Ботаника","Зоология","Генетика","Анатомия","Экология"].includes(q.topic) && (
            <Fern size={160} style={{ position: "absolute", top: -20, right: -20 }} />
          )}
        </div>
        <div style={{ position: "absolute", top: 14, left: 16, display: "flex", gap: 6 }}>
          <span className="pill pill-muted" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}>
            {q.topic}
          </span>
          {q.is_assigned && (
            <span className="pill" style={{
              background: "var(--green-800)", color: "#fff",
              backdropFilter: "blur(8px)", fontSize: 11,
            }}>
              🌱 Назначено
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "18px 20px 20px" }}>
        <h3 style={{ fontFamily: "var(--f-serif)", fontSize: 20, fontWeight: 500, marginBottom: 10, lineHeight: 1.25 }}>
          {q.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "var(--text-soft)", marginBottom: 14 }}>
          <span>· {q.questions} вопросов</span>
          <span>· {q.est}</span>
        </div>

        {q.status === "inprogress" && (
          <div style={{ marginBottom: 14 }}>
            <div className="progress"><div className="progress-fill" style={{ width: `${q.progress || 0}%` }}/></div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Пройдено {q.progress || 0}%</div>
          </div>
        )}
        {q.status === "done" && scorePct != null && (
          <div style={{ marginBottom: 14 }}>
            <div className="progress"><div className="progress-fill" style={{ width: `${scorePct}%` }}/></div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Результат {scorePct}%</div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="pill" style={{ background: statusColor.bg, color: statusColor.fg }}>
            {statusLabel}
          </span>
          <button className="btn btn-soft btn-sm" onClick={(e) => { e.stopPropagation(); onStart?.(); }}>
            {q.status === "done" ? "Повторить" : q.status === "inprogress" ? "Продолжить" : "Начать"}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6h6 M7 3 l 3 3 l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const StudentDashboard = ({ name = "Аня", quizzes = [], cardSets = [], onOpenQuiz, onOpenCards, onAdmin, onLogout }) => {
  const [tab, setTab] = React.useState("Все");
  const topics = ["Все", ...Array.from(new Set(quizzes.map(q => q.topic)))];
  const filtered = tab === "Все" ? quizzes : quizzes.filter(q => q.topic === tab);

  const doneSets = quizzes.filter(q => q.status === "done");
  const stats = {
    done: doneSets.length,
    total: quizzes.length,
    avg: doneSets.length === 0 ? 0 : Math.round(
      doneSets.reduce((acc, q) => acc + (q.score / q.questions), 0) / doneSets.length * 100
    ),
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>
      {/* Top bar */}
      <div className="dash-topbar" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        borderBottom: "1px solid var(--border-soft)",
        background: "var(--surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "var(--green-800)",
            color: "#fff", display: "grid", placeItems: "center",
          }}>
            <Leaf size={18} stroke={1.8} />
          </div>
          <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 17 }}>Живая клетка</div>
        </div>
        <div className="dash-topbar-right" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {onAdmin && <button className="btn btn-ghost btn-sm rsp-hide-mobile" onClick={onAdmin}>Панель репетитора</button>}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--green-200)",
              display: "grid", placeItems: "center", color: "var(--green-900)",
              fontFamily: "var(--f-serif)", fontWeight: 600,
            }}>{name[0]?.toUpperCase()}</div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
          </div>
          {onLogout && (
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Выйти</button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="dash-hero" style={{ padding: "40px 48px 28px", position: "relative", overflow: "hidden" }}>
        <BotanicalBg intensity={0.6} pattern="ferns" />
        <div style={{ position: "relative" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Сегодня</div>
          <h1 className="dash-h1" style={{ fontFamily: "var(--f-serif)", fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Привет, {name}. <em style={{ color: "var(--green-800)" }}>Продолжим?</em>
          </h1>
          <p style={{ color: "var(--text-soft)", fontSize: 16, maxWidth: 560 }}>
            {quizzes.length > 0
              ? `Доступно ${quizzes.length} тест${quizzes.length === 1 ? "" : "ов"}. Пройдено: ${stats.done}.`
              : "Тесты пока не добавлены. Зайди позже."}
          </p>
        </div>

        {/* Stat strip */}
        {quizzes.length > 0 && (
          <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32, maxWidth: 720 }}>
            {[
              { v: `${stats.done}/${stats.total}`, l: "пройдено тестов" },
              { v: stats.avg ? `${stats.avg}%` : "—", l: "средний результат" },
              { v: `${quizzes.filter(q => q.status === "new").length}`, l: "новых тестов" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "18px 20px" }}>
                <div className="dash-stat-val" style={{
                  fontFamily: "var(--f-serif)", fontSize: 28, fontWeight: 500, letterSpacing: "-0.01em",
                  color: "var(--text)",
                }}>{s.v}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 4 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      {quizzes.length > 0 && (
        <div className="dash-filters" style={{ padding: "0 48px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {topics.map(t => (
              <div key={t} className={`chip ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Показано {filtered.length} из {quizzes.length}</div>
        </div>
      )}

      {/* Quizzes grid */}
      {quizzes.length > 0 ? (
        <div className="dash-grid" style={{ padding: "0 48px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filtered.map(q => <QuizCard key={q.id} q={q} onStart={() => onOpenQuiz?.(q)} />)}
        </div>
      ) : (
        <div style={{ padding: "40px 48px", textAlign: "center", color: "var(--text-muted)" }}>
          Тесты ещё не добавлены
        </div>
      )}

      {/* Flashcard sets section */}
      {cardSets.length > 0 && (
        <div style={{ padding: "40px 48px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div className="eyebrow">Карточки для изучения</div>
            <span className="pill pill-muted" style={{ fontSize: 11 }}>{cardSets.length} набора</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {cardSets.map(s => (
              <CardSetCard key={s.id} s={s} onStart={() => onOpenCards?.(s)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

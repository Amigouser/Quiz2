import React from "react";
import { Leaf, Fern, Cell, Sprig, PlatePlaceholder, BotanicalBg, LeafBurst } from "../botanical";

// ── Variant A: textbook-style stepper ──
export const QuizClassic = ({ quiz, onFinish, onExit }) => {
  const [idx, setIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [locked, setLocked] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const [answers, setAnswers] = React.useState([]);

  const q = quiz.questions[idx];
  const isLast = idx === quiz.questions.length - 1;

  const pick = (i) => {
    if (locked) return;
    setSelected(i);
    setLocked(true);
    const correct = i === q.correct;
    setAnswers(a => [...a, { picked: i, correct }]);
    if (correct) setTimeout(() => setBurst(true), 120);
  };
  React.useEffect(() => { if (burst) { const t = setTimeout(() => setBurst(false), 2500); return () => clearTimeout(t); } }, [burst]);

  const next = () => {
    if (isLast) { onFinish?.(answers); return; }
    setIdx(i => i + 1); setSelected(null); setLocked(false);
  };

  const pct = ((idx + (locked ? 1 : 0)) / quiz.questions.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <LeafBurst go={burst} />
      <BotanicalBg intensity={0.4} pattern="mix" />

      {/* Top */}
      <div className="quiz-topbar" style={{ position: "relative", padding: "20px 48px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onExit}>← Выйти</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: "var(--text-soft)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {quiz.topic} · {quiz.title}
            </span>
            <span>Вопрос {idx + 1} из {quiz.questions.length}</span>
          </div>
          <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }}/></div>
        </div>
      </div>

      {/* Question body */}
      <div className="quiz-body" style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "56px 40px 80px" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Вопрос {String(idx + 1).padStart(2, "0")}</div>
        <h2 className="quiz-h2" style={{ fontFamily: "var(--f-serif)", fontSize: 34, lineHeight: 1.2, marginBottom: 10, letterSpacing: "-0.01em" }}>
          {q.q}
        </h2>
        {q.note && <p style={{ color: "var(--text-muted)", fontSize: 14, fontStyle: "italic", marginBottom: 28 }}>{q.note}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
          {q.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            let cls = "answer";
            if (locked) {
              if (i === q.correct) cls += " correct";
              else if (i === selected) cls += " wrong";
              cls += " locked";
            } else if (i === selected) cls += " selected";
            return (
              <div key={i} className={cls} onClick={() => pick(i)}>
                <div className="letter">{letter}</div>
                <div style={{ flex: 1 }}>{opt}</div>
                {locked && i === q.correct && <span style={{ fontSize: 20 }}>🌱</span>}
                {locked && i === selected && i !== q.correct && <span style={{ fontSize: 18, color: "var(--wrong)" }}>✕</span>}
              </div>
            );
          })}
        </div>

        {locked && (
          <div style={{
            marginTop: 24, padding: "16px 20px",
            background: selected === q.correct ? "var(--correct-bg)" : "var(--wrong-bg)",
            border: `1px solid ${selected === q.correct ? "var(--correct)" : "var(--wrong)"}`,
            borderRadius: "var(--r-md)",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <div style={{ fontSize: 24, lineHeight: 1 }}>{selected === q.correct ? "🌱" : "🍂"}</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: selected === q.correct ? "var(--correct)" : "var(--wrong)" }}>
                {selected === q.correct ? "Отлично!" : "Не совсем так."}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.55 }}>{q.explain}</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {locked ? "Продолжай — следующий вопрос готов" : "Выбери один ответ"}
          </span>
          <button className="btn btn-primary btn-lg" onClick={next} disabled={!locked} style={{ opacity: locked ? 1 : 0.4 }}>
            {isLast ? "Посмотреть результат" : "Следующий вопрос"}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8 H13 M9 4 L 13 8 L 9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Variant B: focused split ──
export const QuizFocused = ({ quiz, onFinish }) => {
  const [idx, setIdx] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [locked, setLocked] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const q = quiz.questions[idx];
  const isLast = idx === quiz.questions.length - 1;
  const pct = ((idx + (locked ? 1 : 0)) / quiz.questions.length) * 100;

  const pick = (i) => {
    if (locked) return;
    setSelected(i); setLocked(true);
    if (i === q.correct) setTimeout(() => setBurst(true), 100);
  };
  React.useEffect(() => { if (burst) { const t = setTimeout(() => setBurst(false), 2500); return () => clearTimeout(t); } }, [burst]);

  const next = () => { if (isLast) onFinish?.(); else { setIdx(i=>i+1); setSelected(null); setLocked(false); } };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", gridTemplateColumns: "420px 1fr", overflow: "hidden", position: "relative" }}>
      <LeafBurst go={burst} />

      {/* Left plate */}
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, var(--green-800), var(--green-900))",
        color: "#fff",
        padding: "32px 32px 40px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, color: "#fff", opacity: 0.07 }}>
          <Fern size={280} style={{ position: "absolute", top: -40, left: -60 }} />
          <Cell size={240} style={{ position: "absolute", bottom: -40, right: -50 }} />
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <img src="/tutor2.jpg" alt="Vikokon" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
            <div style={{ fontFamily: "var(--f-serif)", fontSize: 14 }}>Vikokon</div>
          </div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.7, marginBottom: 10 }}>
            {quiz.topic}
          </div>
          <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 28, lineHeight: 1.2, color: "#fff", marginBottom: 20 }}>
            {quiz.title}
          </h2>
          <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
            {quiz.questions.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 999,
                background: i < idx ? "var(--green-400)" : i === idx ? "#fff" : "rgba(255,255,255,0.2)",
                transition: "all 300ms",
              }}/>
            ))}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
            {idx + 1} / {quiz.questions.length} · {Math.round(pct)}% пройдено
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <PlatePlaceholder label={`Fig. ${idx + 1} — ${quiz.topic}`} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "var(--green-300)" }}/>
        </div>
      </div>

      {/* Right — question */}
      <div style={{ padding: "48px 56px", position: "relative", overflow: "hidden" }}>
        <BotanicalBg intensity={0.3} pattern="ferns" />
        <div style={{ position: "relative", maxWidth: 640 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Вопрос {String(idx + 1).padStart(2, "0")}</div>
          <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 36, lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.015em" }}>
            {q.q}
          </h2>
          {q.note && <p style={{ color: "var(--text-muted)", fontSize: 14, fontStyle: "italic", marginBottom: 24 }}>{q.note}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 28 }}>
            {q.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              let cls = "answer";
              if (locked) {
                if (i === q.correct) cls += " correct";
                else if (i === selected) cls += " wrong";
                cls += " locked";
              } else if (i === selected) cls += " selected";
              return (
                <div key={i} className={cls} onClick={() => pick(i)} style={{ padding: "18px 18px" }}>
                  <div className="letter">{letter}</div>
                  <div style={{ flex: 1, fontSize: 15 }}>{opt}</div>
                </div>
              );
            })}
          </div>

          {locked && (
            <div style={{
              marginTop: 24, padding: "18px 20px",
              background: selected === q.correct ? "var(--correct-bg)" : "var(--wrong-bg)",
              borderLeft: `3px solid ${selected === q.correct ? "var(--correct)" : "var(--wrong)"}`,
              borderRadius: 8,
            }}>
              <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 14, marginBottom: 6, color: selected === q.correct ? "var(--correct)" : "var(--wrong)" }}>
                {selected === q.correct ? "🌱 Верно" : "🍂 Почти"}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.55 }}>{q.explain}</div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 36 }}>
            <button className="btn btn-accent btn-lg" onClick={next} disabled={!locked} style={{ opacity: locked ? 1 : 0.4 }}>
              {isLast ? "Завершить" : "Дальше"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Results screen ──
export const QuizResults = ({ total = 0, correct = 0, quizTitle, onRetry, onHome }) => {
  const [burst, setBurst] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setBurst(true), 300); return () => clearTimeout(t); }, []);

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = pct >= 90 ? "Ботаник года" : pct >= 75 ? "Отлично" : pct >= 60 ? "Хорошо" : "Нужно повторить";
  const message = pct >= 90 ? "Материал усвоен блестяще — можно двигаться дальше." :
    pct >= 75 ? "Большинство ответов верные. Внимательно разбери ошибки." :
    pct >= 60 ? "Достойно. Перечитай материал и попробуй ещё." :
    "Давай вернёмся к теории — это нормально, биология требует времени.";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "48px 48px 80px", position: "relative", overflow: "hidden" }}>
      <LeafBurst go={burst} count={40} />
      <BotanicalBg intensity={0.4} pattern="mix" />

      <div style={{ maxWidth: 920, margin: "0 auto", position: "relative" }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Результат теста</div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 10 }}>
          {grade}
        </h1>
        {quizTitle && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 6, fontFamily: "var(--f-serif)", fontStyle: "italic" }}>
            {quizTitle}
          </p>
        )}
        <p style={{ color: "var(--text-soft)", fontSize: 17, maxWidth: 560, marginBottom: 36 }}>{message}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Big score card */}
          <div className="card" style={{ padding: 36, display: "flex", flexDirection: "column", gap: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, color: "var(--green-200)" }}>
              <Cell size={200} />
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 96, fontWeight: 400, lineHeight: 1, color: "var(--green-800)", letterSpacing: "-0.03em" }}>
                  {correct}
                </div>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 36, color: "var(--text-muted)" }}>/ {total}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.04em", marginTop: 6 }}>
                {pct}% правильных ответов
              </div>
            </div>

            <div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }}/>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={onRetry}>Пройти ещё раз</button>
              <button className="btn btn-ghost" onClick={onHome}>К списку тестов</button>
            </div>
          </div>

          {/* Next step card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 24, background: "var(--green-800)", color: "#fff", border: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Sprig size={32} stroke={1.4} style={{ color: "var(--green-300)" }} />
                <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--green-300)" }}>
                  Что дальше?
                </div>
              </div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, lineHeight: 1.25, marginBottom: 14, color: "#fff" }}>
                {pct >= 80 ? "Переходи к следующей теме" : "Повтори материал ещё раз"}
              </div>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>
                {pct >= 80
                  ? "Отличный результат! Попробуй другие тесты из библиотеки."
                  : "Перечитай конспект и пройди тест снова — результат улучшится."}
              </div>
              <button className="btn btn-accent" onClick={onHome}>К тестам</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

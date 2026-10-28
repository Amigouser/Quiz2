import React from "react";
import { Leaf, Fern, Cell, Sprig, PlatePlaceholder, BotanicalBg, LeafBurst } from "../botanical";
import { ogeGrade, egeTestScore } from "../exams";

const pointsLabel = (n) => (n === 1 ? "балл" : n >= 2 && n <= 4 ? "балла" : "баллов");

// Соответствие и пропуски: строка — текст сверху, варианты кнопками ниже (переносятся)
const MATCH_STYLES = `
  .quiz-timer { font-weight: 800; color: var(--green-800); background: var(--green-100); border-radius: 999px; padding: 3px 10px; font-variant-numeric: tabular-nums; }
  .quiz-timer.low { color: #fff; background: var(--wrong); animation: quizPulse 1s ease infinite; }
  @keyframes quizPulse { 50% { opacity: .7; } }
  .quiz-resume { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: space-between; margin-bottom: 18px; padding: 10px 14px; border-radius: 12px; background: var(--green-50); border: 1px solid var(--green-200); font-size: 13px; color: var(--green-900); font-weight: 600; }
  .quiz-resume button { border: none; background: none; color: var(--text-muted); font: 600 12px var(--f-sans); text-decoration: underline; cursor: pointer; }
  .match-list { display: flex; flex-direction: column; gap: 10px; }
  .match-row { background: var(--surface); border: 1.5px solid var(--border-soft); border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
  .match-row.ok { border-color: var(--correct); background: var(--correct-bg); }
  .match-row.bad { border-color: var(--wrong); }
  .match-text { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; line-height: 1.45; color: var(--text); overflow-wrap: anywhere; }
  .match-letter { flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; background: var(--green-100); color: var(--green-800); display: grid; place-items: center; font-weight: 800; font-size: 13px; }
  .match-mark { margin-left: auto; flex-shrink: 0; font-size: 18px; }
  .match-mark.ok { color: var(--correct); }
  .match-options { display: flex; flex-wrap: wrap; gap: 6px; padding-left: 36px; }
  .match-opt {
    min-width: 44px; min-height: 40px; padding: 6px 12px; border-radius: 10px; border: 2px solid var(--border);
    background: var(--surface); color: var(--text-soft); font: 700 14px var(--f-sans); cursor: pointer;
    text-align: center; line-height: 1.25; max-width: 100%; overflow-wrap: anywhere; transition: border-color .15s, background .15s;
  }
  .match-opt:hover:not(:disabled) { border-color: var(--green-600); }
  .match-opt.on { border-color: var(--green-700); background: var(--green-100); color: var(--green-900); }
  .match-opt.right { border-color: var(--correct); background: var(--correct-bg); color: var(--correct); }
  .match-opt.bad { border-color: var(--wrong); background: var(--wrong-bg); color: var(--wrong); }
  .match-opt:disabled { cursor: default; }
  .match-fix { padding-left: 36px; font-size: 13px; color: var(--wrong); }
  .match-list.short .match-row { flex-direction: row; align-items: center; flex-wrap: wrap; }
  .match-list.short .match-text { flex: 1 1 140px; }
  .match-list.fill .match-text { font-weight: 700; color: var(--green-800); }
  .match-list.short .match-options { padding-left: 0; }
  .match-list.short .match-fix { padding-left: 0; flex-basis: 100%; }
  @media (max-width: 600px) {
    .match-options, .match-fix { padding-left: 0; }
    .match-list:not(.short) .match-opt { flex: 1 1 calc(50% - 6px); }
  }
`;

// ── Variant A: textbook-style stepper ──
// Сохранённый прогресс теста (в браузере): закрытая вкладка не сбрасывает решение
function loadProgress(key, n) {
  if (!key) return null;
  try {
    const s = JSON.parse(localStorage.getItem(key) || "null");
    if (s && s.n === n && Array.isArray(s.answers) && s.answers.length > 0 && s.answers.length < n) return s;
  } catch (_) {}
  return null;
}
const clearProgress = (key) => { try { if (key) localStorage.removeItem(key); } catch (_) {} };

function formatTime(ms) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return `${h ? `${h}:` : ""}${String(m).padStart(h ? 2 : 1, "0")}:${String(sec).padStart(2, "0")}`;
}

// persistKey — где хранить прогресс; timeLimitMin — таймер (для пробников)
export const QuizClassic = ({ quiz, onFinish, onExit, persistKey = null, timeLimitMin = null }) => {
  const saved = React.useMemo(() => loadProgress(persistKey, quiz.questions.length), []);
  const [idx, setIdx] = React.useState(saved ? saved.answers.length : 0);
  const [selected, setSelected] = React.useState(null);
  const [locked, setLocked] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const [answers, setAnswers] = React.useState(saved ? saved.answers : []);
  const [startedAt, setStartedAt] = React.useState(saved?.startedAt || Date.now());
  const [resumed, setResumed] = React.useState(!!saved);
  const [now, setNow] = React.useState(Date.now());
  const answersRef = React.useRef(answers);
  answersRef.current = answers;
  const finishedRef = React.useRef(false);

  const finish = (list) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearProgress(persistKey);
    onFinish?.(list);
  };

  // сохраняем после каждого ответа
  React.useEffect(() => {
    if (!persistKey || finishedRef.current) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify({ n: quiz.questions.length, answers, startedAt }));
    } catch (_) {}
  }, [answers, startedAt]);

  // таймер: время вышло — тест завершается с тем, что успел ответить
  const deadline = timeLimitMin ? startedAt + timeLimitMin * 60000 : null;
  React.useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= deadline) finish(answersRef.current);
    }, 1000);
    return () => clearInterval(t);
  }, [deadline]);
  const remaining = deadline ? deadline - now : null;

  const restart = () => {
    clearProgress(persistKey);
    setAnswers([]); setIdx(0); setLocked(false); setStartedAt(Date.now()); setResumed(false);
  };
  const [typedText, setTypedText] = React.useState("");
  const [matchState, setMatchState] = React.useState({});
  const [multiSelected, setMultiSelected] = React.useState(new Set());
  const [seqOrder, setSeqOrder] = React.useState([]);

  const q = quiz.questions[idx];
  const qType = q.question_type || "single";
  const isLast = idx === quiz.questions.length - 1;

  React.useEffect(() => {
    setTypedText("");
    setMatchState({});
    setSelected(null);
    setMultiSelected(new Set());
    const curQ = quiz.questions[idx];
    const curType = curQ.question_type || "single";
    if (curType === "sequence") {
      const n = curQ.options?.length || 0;
      const arr = Array.from({ length: n }, (_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setSeqOrder(arr);
    } else {
      setSeqOrder([]);
    }
  }, [idx]);

  React.useEffect(() => { if (burst) { const t = setTimeout(() => setBurst(false), 2500); return () => clearTimeout(t); } }, [burst]);

  const pick = (i) => {
    if (locked || qType !== "single") return;
    setSelected(i);
    setLocked(true);
    const correct = i === q.correct;
    setAnswers(a => [...a, { picked: i, correct }]);
    if (correct) setTimeout(() => setBurst(true), 120);
  };

  const lockTextInput = () => {
    if (locked || !typedText.trim()) return;
    let accepted = [];
    try { const parsed = JSON.parse(q.correct_text || "[]"); if (Array.isArray(parsed)) accepted = parsed.map(s => String(s).trim().toLowerCase()); } catch (_) {}
    if (accepted.length === 0 && q.correct_text) accepted = [q.correct_text.trim().toLowerCase()];
    const given = typedText.trim().toLowerCase();
    const correct = accepted.length > 0 && accepted.includes(given);
    setLocked(true);
    setAnswers(a => [...a, { typed: typedText, correct }]);
    if (correct) setTimeout(() => setBurst(true), 120);
  };

  const lockOpenResponse = () => {
    if (locked || !typedText.trim()) return;
    setLocked(true);
    setAnswers(a => [...a, { typed: typedText, correct: false, pending_review: true }]);
  };

  const lockMatching = () => {
    if (locked) return;
    const items = q._matchAnswers || [];
    const allCorrect = items.length > 0 && items.every(ma => matchState[ma.id] === ma.match_value);
    setLocked(true);
    setAnswers(a => [...a, { matches: matchState, correct: allCorrect }]);
    if (allCorrect) setTimeout(() => setBurst(true), 120);
  };

  const lockMultiple = () => {
    if (locked) return;
    const correctSet = new Set(q.correct_indices || []);
    const selectedArr = [...multiSelected].sort((a, b) => a - b);
    const correctArr = [...correctSet].sort((a, b) => a - b);
    const allCorrect = selectedArr.length === correctArr.length && selectedArr.every((v, i) => v === correctArr[i]);
    setLocked(true);
    setAnswers(a => [...a, { selected: [...multiSelected], correct: allCorrect }]);
    if (allCorrect) setTimeout(() => setBurst(true), 120);
  };

  const lockSequence = () => {
    if (locked) return;
    const allCorrect = seqOrder.length > 0 && seqOrder.every((optIdx, pos) => optIdx === pos);
    setLocked(true);
    setAnswers(a => [...a, { order: [...seqOrder], correct: allCorrect }]);
    if (allCorrect) setTimeout(() => setBurst(true), 120);
  };

  const moveSeq = (fromPos, toPos) => {
    if (locked || toPos < 0 || toPos >= seqOrder.length) return;
    setSeqOrder(arr => {
      const next = [...arr];
      [next[fromPos], next[toPos]] = [next[toPos], next[fromPos]];
      return next;
    });
  };

  const allMatchesFilled = (q._matchAnswers || []).every(ma => matchState[ma.id]);

  const next = () => {
    if (isLast) { finish(answers); return; }
    setIdx(i => i + 1); setLocked(false); setResumed(false);
  };

  const pct = ((idx + (locked ? 1 : 0)) / quiz.questions.length) * 100;
  const lastAnswer = locked && answers.length > 0 ? answers[answers.length - 1] : null;
  const isCurrentCorrect = lastAnswer?.correct;

  const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8 H13 M9 4 L 13 8 L 9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflowX: "hidden", overflowY: "auto" }}>
      <style>{MATCH_STYLES}</style>
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
            <span style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
              {remaining !== null && (
                <span className={`quiz-timer${remaining < 5 * 60000 ? " low" : ""}`} title="Осталось времени">⏱ {formatTime(remaining)}</span>
              )}
              <span>Вопрос {idx + 1} из {quiz.questions.length}</span>
            </span>
          </div>
          <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }}/></div>
        </div>
      </div>

      {/* Question body */}
      <div className="quiz-body" style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "56px 40px 80px" }}>
        {resumed && (
          <div className="quiz-resume">
            <span>💾 Прогресс сохранён — продолжаем с {quiz.mock_exam ? "задания" : "вопроса"} {idx + 1}</span>
            <button type="button" onClick={restart}>Начать заново</button>
          </div>
        )}
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          {quiz.mock_exam ? `Задание ${idx + 1}` : `Вопрос ${String(idx + 1).padStart(2, "0")}`}
          {q.max_points > 1 && ` · ${q.max_points} ${pointsLabel(q.max_points)}`}
        </div>

        {/* Image */}
        {q.image_data && (
          <div style={{ marginBottom: 20 }}>
            <img src={q.image_data} alt="Иллюстрация" loading="eager" style={{
              display: "block", maxWidth: "100%", height: "auto", maxHeight: 340,
              borderRadius: 12, objectFit: "contain",
              border: "1px solid var(--border-soft)", background: "#fff",
            }} />
          </div>
        )}

        <h2 className="quiz-h2 pre-line" style={{ fontFamily: "var(--f-serif)", fontSize: (q.q || "").length > 160 ? 22 : (q.q || "").length > 80 ? 27 : 34, lineHeight: 1.25, marginBottom: 10, letterSpacing: "-0.01em" }}>
          {q.q}
        </h2>
        {q.note && <p className="pre-line" style={{ color: "var(--text-muted)", fontSize: 14, fontStyle: "italic", marginBottom: 28 }}>{q.note}</p>}

        {/* ── Single choice ── */}
        {qType === "single" && (
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
                  <div className="pre-line" style={{ flex: 1 }}>{opt}</div>
                  {locked && i === q.correct && <span style={{ fontSize: 20 }}>🌱</span>}
                  {locked && i === selected && i !== q.correct && <span style={{ fontSize: 18, color: "var(--wrong)" }}>✕</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Text input ── */}
        {qType === "text_input" && (
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, color: "var(--text-soft)" }}>Ответ:</span>
              <input
                className="input"
                style={{ width: 220, maxWidth: "100%", textAlign: "center", fontSize: 22, fontFamily: "var(--f-serif)", fontWeight: 700,
                  border: locked ? `2px solid ${isCurrentCorrect ? "var(--correct)" : "var(--wrong)"}` : undefined }}
                value={typedText}
                onChange={e => !locked && setTypedText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && lockTextInput()}
                disabled={locked}
                autoFocus={!locked}
                placeholder="?"
              />
              {!locked && (
                <button className="btn btn-primary" onClick={lockTextInput} disabled={!typedText.trim()}>
                  Проверить
                </button>
              )}
            </div>
            {locked && (() => {
              let accepted = [];
              try { const parsed = JSON.parse(q.correct_text || "[]"); if (Array.isArray(parsed)) accepted = parsed.map(s => String(s).trim()); } catch (_) {}
              if (accepted.length === 0 && q.correct_text) accepted = [q.correct_text.trim()];
              const displayText = accepted.length > 1 ? accepted.join(" / ") : accepted[0] || "";
              return (
                <div style={{ marginTop: 14, fontSize: 14, color: isCurrentCorrect ? "var(--correct)" : "var(--wrong)", fontWeight: 600 }}>
                  {isCurrentCorrect ? "🌱 Верно!" : `🍂 Верный ответ: ${displayText}`}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Multiple select ── */}
        {qType === "multiple_select" && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10, fontStyle: "italic" }}>
              Выберите все правильные ответы
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, i) => {
                const isSel = multiSelected.has(i);
                const isCorrect = locked && (q.correct_indices || []).includes(i);
                const isWrong = locked && isSel && !isCorrect;
                const isMissed = locked && !isSel && isCorrect;
                let border = isSel ? "var(--green-700)" : "var(--border-soft)";
                if (locked) border = isCorrect ? "var(--correct)" : isWrong ? "var(--wrong)" : isMissed ? "var(--correct)" : "var(--border-soft)";
                return (
                  <div key={i}
                    onClick={() => !locked && setMultiSelected(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", flexWrap: "wrap",
                      background: isSel ? "var(--green-100)" : isMissed ? "var(--correct-bg)" : "var(--surface)",
                      borderRadius: 12, border: `2px solid ${border}`,
                      cursor: locked ? "default" : "pointer", transition: "all 150ms",
                    }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${isSel ? (isWrong ? "var(--wrong)" : "var(--green-700)") : "var(--border)"}`,
                      background: isSel ? (isWrong ? "var(--wrong)" : "var(--green-700)") : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSel && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div className="pre-line" style={{ flex: "1 1 180px", minWidth: 0, fontSize: 15, overflowWrap: "anywhere" }}>{opt}</div>
                    {locked && isCorrect && <span style={{ fontSize: 20 }}>🌱</span>}
                    {locked && isWrong && <span style={{ fontSize: 18, color: "var(--wrong)" }}>✕</span>}
                    {locked && isMissed && <span style={{ fontSize: 12, color: "var(--correct)", fontWeight: 600 }}>← нужно было выбрать</span>}
                  </div>
                );
              })}
            </div>
            {!locked && (
              <button className="btn btn-primary" style={{ marginTop: 14 }}
                disabled={multiSelected.size === 0} onClick={lockMultiple}>
                Проверить выбор
              </button>
            )}
          </div>
        )}

        {/* ── Sequence ── */}
        {qType === "sequence" && seqOrder.length === (q.options?.length || 0) && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10, fontStyle: "italic" }}>
              Расставь элементы в правильном порядке
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {seqOrder.map((optIdx, pos) => {
                const isCorrect = locked && optIdx === pos;
                const isWrong = locked && optIdx !== pos;
                return (
                  <div key={optIdx} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    background: "var(--surface)", borderRadius: 12,
                    border: `1.5px solid ${isCorrect ? "var(--correct)" : isWrong ? "var(--wrong)" : "var(--border-soft)"}`,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: isCorrect ? "var(--correct)" : isWrong ? "var(--wrong)" : "var(--green-100)",
                      color: isCorrect || isWrong ? "#fff" : "var(--green-800)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 14,
                    }}>{pos + 1}</div>
                    <div className="pre-line" style={{ flex: 1, minWidth: 0, fontSize: 15, overflowWrap: "anywhere" }}>{q.options[optIdx]}</div>
                    {!locked && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <button onClick={() => moveSeq(pos, pos - 1)} disabled={pos === 0}
                          style={{
                            background: "none", border: "1px solid var(--border-soft)", borderRadius: 5,
                            width: 28, height: 22, cursor: pos === 0 ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            opacity: pos === 0 ? 0.3 : 1, fontSize: 10, color: "var(--text-soft)",
                          }}>▲</button>
                        <button onClick={() => moveSeq(pos, pos + 1)} disabled={pos === seqOrder.length - 1}
                          style={{
                            background: "none", border: "1px solid var(--border-soft)", borderRadius: 5,
                            width: 28, height: 22, cursor: pos === seqOrder.length - 1 ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            opacity: pos === seqOrder.length - 1 ? 0.3 : 1, fontSize: 10, color: "var(--text-soft)",
                          }}>▼</button>
                      </div>
                    )}
                    {locked && isCorrect && <span style={{ fontSize: 18, color: "var(--correct)" }}>✓</span>}
                    {locked && isWrong && <span style={{ fontSize: 12, color: "var(--wrong)", flexShrink: 0, textAlign: "right" }}>место {optIdx + 1}</span>}
                  </div>
                );
              })}
            </div>
            {!locked && (
              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={lockSequence}>
                Проверить порядок
              </button>
            )}
          </div>
        )}

        {/* ── Fill blanks / Matching: текст строки сверху, варианты — кнопками под ним ── */}
        {(qType === "fill_blanks" || qType === "matching") && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, fontStyle: "italic" }}>
              {qType === "fill_blanks" ? "Выбери вариант для каждого пропуска" : "Выбери вариант для каждой строки"}
            </div>
            <div className={`match-list${(q.match_options || []).every(o => String(o).length <= 3) ? " short" : ""}${qType === "fill_blanks" ? " fill" : ""}`}>
              {(q._matchAnswers || []).map((ma, mi) => {
                const chosen = matchState[ma.id];
                const itemCorrect = locked && chosen === ma.match_value;
                const itemWrong = locked && chosen !== ma.match_value;
                return (
                  <div key={ma.id} className={`match-row${itemCorrect ? " ok" : itemWrong ? " bad" : ""}`}>
                    <div className="match-text">
                      {/* в пропусках строка сама называется «А», «Б»… — свою букву не дублируем */}
                      {qType === "matching" && <span className="match-letter">{String.fromCharCode(1040 + mi)}</span>}
                      <span className="pre-line">{ma.text}</span>
                      {itemCorrect && <span className="match-mark ok">✓</span>}
                    </div>
                    <div className="match-options">
                      {(q.match_options || ["1", "2"]).map(opt => {
                        const isChosen = chosen === opt;
                        const isRight = locked && opt === ma.match_value;
                        return (
                          <button key={opt} type="button"
                            className={`match-opt${isChosen ? " on" : ""}${locked && isChosen && !isRight ? " bad" : ""}${isRight ? " right" : ""}`}
                            onClick={() => !locked && setMatchState(s => ({ ...s, [ma.id]: opt }))}
                            disabled={locked}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {itemWrong && <div className="match-fix">Правильно: <b>{ma.match_value}</b></div>}
                  </div>
                );
              })}
            </div>
            {!locked && (
              <button className="btn btn-primary" style={{ marginTop: 14 }}
                disabled={!allMatchesFilled} onClick={lockMatching}>
                {qType === "fill_blanks" ? "Проверить ответы" : "Проверить соответствие"}
              </button>
            )}
          </div>
        )}

        {/* ── Open response ── */}
        {qType === "open_response" && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 15, color: "var(--text-soft)", marginBottom: 10 }}>Напиши развёрнутый ответ:</div>
            <textarea
              className="input"
              rows={5}
              style={{ width: "100%", resize: "vertical", fontSize: 15, fontFamily: "var(--f-sans)", lineHeight: 1.6,
                border: locked ? "2px solid var(--green-400)" : undefined }}
              value={typedText}
              onChange={e => !locked && setTypedText(e.target.value)}
              disabled={locked}
              autoFocus={!locked}
              placeholder="Напиши свой ответ здесь…"
            />
            {!locked && (
              <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={lockOpenResponse} disabled={!typedText.trim()}>
                Отправить
              </button>
            )}
            {locked && (
              <div style={{ marginTop: 14, fontSize: 14, color: "var(--green-700)", fontWeight: 600 }}>
                ✍️ Ответ отправлен. Репетитор проверит его и выставит балл.
              </div>
            )}
            {q.grading_criteria && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg-muted)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--text-soft)", lineHeight: 1.5 }}>
                <b>Критерии:</b> {q.grading_criteria}
              </div>
            )}
          </div>
        )}

        {/* Feedback block (all types) */}
        {locked && q.explain && (
          <div style={{
            marginTop: 24, padding: "16px 20px",
            background: isCurrentCorrect ? "var(--correct-bg)" : "var(--wrong-bg)",
            border: `1px solid ${isCurrentCorrect ? "var(--correct)" : "var(--wrong)"}`,
            borderRadius: "var(--r-md)", display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <div style={{ fontSize: 24, lineHeight: 1 }}>{isCurrentCorrect ? "🌱" : "🍂"}</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4, color: isCurrentCorrect ? "var(--correct)" : "var(--wrong)" }}>
                {isCurrentCorrect ? "Отлично!" : "Не совсем так."}
              </div>
              <div className="pre-line" style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.55 }}>{q.explain}</div>
            </div>
          </div>
        )}

        <div className="quiz-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {locked ? "Продолжай — следующий вопрос готов"
              : qType === "matching" ? "Выбери соответствие для каждой строки"
              : qType === "fill_blanks" ? "Выбери цифру для каждого пропуска"
              : qType === "multiple_select" ? "Отметь все правильные ответы"
              : qType === "sequence" ? "Расставь элементы по порядку стрелками"
              : qType === "text_input" ? "Введи ответ и нажми Проверить"
              : qType === "open_response" ? "Напиши развёрнутый ответ"
              : "Выбери один ответ"}
          </span>
          <button className="btn btn-primary btn-lg" onClick={next} disabled={!locked} style={{ opacity: locked ? 1 : 0.4, flexShrink: 0 }}>
            {isLast ? "Посмотреть результат" : "Следующий вопрос"}
            <ArrowIcon />
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "grid", gridTemplateColumns: "420px 1fr", overflowX: "hidden", overflowY: "auto", position: "relative" }}>
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
          <h2 className="pre-line" style={{ fontFamily: "var(--f-serif)", fontSize: 36, lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.015em" }}>
            {q.q}
          </h2>
          {q.note && <p className="pre-line" style={{ color: "var(--text-muted)", fontSize: 14, fontStyle: "italic", marginBottom: 24 }}>{q.note}</p>}

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
                  <div className="pre-line" style={{ flex: 1, fontSize: 15 }}>{opt}</div>
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
              <div className="pre-line" style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.55 }}>{q.explain}</div>
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
export const QuizResults = ({ total = 0, correct = 0, quizTitle, onRetry, onHome, isPreview = false, mockExam = null, pendingReview = false, guest = false, waterEarned = 0, breakdown = null }) => {
  const [burst, setBurst] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setBurst(true), 300); return () => clearTimeout(t); }, []);

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = pct >= 90 ? "Ботаник года" : pct >= 75 ? "Отлично" : pct >= 60 ? "Хорошо" : "Нужно повторить";
  const message = pct >= 90 ? "Материал усвоен блестяще — можно двигаться дальше." :
    pct >= 75 ? "Большинство ответов верные. Внимательно разбери ошибки." :
    pct >= 60 ? "Достойно. Перечитай материал и попробуй ещё." :
    "Давай вернёмся к теории — это нормально, биология требует времени.";

  return (
    <div className="quiz-result-wrap" style={{ minHeight: "100vh", background: "var(--bg)", padding: "48px 48px 80px", position: "relative", overflowX: "hidden", overflowY: "auto" }}>
      <LeafBurst go={burst} count={40} />
      <BotanicalBg intensity={0.4} pattern="mix" />

      <div style={{ maxWidth: 920, margin: "0 auto", position: "relative" }}>
        {isPreview && (
          <div style={{
            marginBottom: 20, padding: "10px 16px",
            background: "var(--green-100)", border: "1px solid var(--green-300)",
            borderRadius: 10, fontSize: 13, color: "var(--green-800)",
          }}>
            Предпросмотр репетитора — результат не сохраняется в журнал
          </div>
        )}
        <div className="eyebrow" style={{ marginBottom: 14 }}>Результат теста</div>
        <h1 className="quiz-result-h1" style={{ fontFamily: "var(--f-serif)", fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 10 }}>
          {grade}
        </h1>
        {quizTitle && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 6, fontFamily: "var(--f-serif)", fontStyle: "italic" }}>
            {quizTitle}
          </p>
        )}
        <p style={{ color: "var(--text-soft)", fontSize: 17, maxWidth: 560, marginBottom: 36 }}>{message}</p>

        <div className="quiz-results-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Big score card */}
          <div className="card" style={{ padding: 36, display: "flex", flexDirection: "column", gap: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, color: "var(--green-200)" }}>
              <Cell size={200} />
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <div className="quiz-result-score" style={{ fontFamily: "var(--f-serif)", fontSize: 96, fontWeight: 400, lineHeight: 1, color: "var(--green-800)", letterSpacing: "-0.03em" }}>
                  {correct}
                </div>
                <div className="quiz-result-total" style={{ fontFamily: "var(--f-serif)", fontSize: 36, color: "var(--text-muted)" }}>/ {total}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.04em", marginTop: 6 }}>
                {mockExam ? `первичных ${pointsLabel(total)} · пробник ${mockExam}` : `${pct}% правильных ответов`}
              </div>
            </div>

            {mockExam && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: "var(--green-50)", border: "1.5px solid var(--green-200)", position: "relative" }}>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 40, fontWeight: 700, color: "var(--green-800)", lineHeight: 1 }}>
                  {mockExam === "ОГЭ" ? ogeGrade(correct) : egeTestScore(correct)}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.45 }}>
                  {mockExam === "ОГЭ" ? "оценка по шкале ОГЭ" : "тестовый балл ЕГЭ из 100"}
                  {pendingReview && <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{guest ? "без учёта развёрнутых ответов — без входа в кабинет они не проверяются" : "без учёта развёрнутых ответов — их проверит репетитор"}</div>}
                </div>
              </div>
            )}
            {!mockExam && pendingReview && (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{guest ? "Развёрнутые ответы без входа в кабинет не проверяются." : "Развёрнутые ответы проверит репетитор — баллы добавятся после проверки."}</div>
            )}

            <div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }}/>
              </div>
            </div>

            {waterEarned > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: "#e3f2fc", color: "#1f6fa8", fontWeight: 700, fontSize: 14, position: "relative" }}>
                💧 +{waterEarned} {waterEarned === 1 ? "капля" : waterEarned < 5 ? "капли" : "капель"} для твоего цветка — полей его в кабинете!
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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

        {/* Разбор пробника по заданиям */}
        {mockExam && breakdown?.length > 0 && (() => {
          const toRepeat = breakdown.filter(b => !b.pending && b.points < b.max);
          return (
            <div className="card" style={{ padding: 24, marginTop: 24, position: "relative" }}>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, marginBottom: 6 }}>Разбор по заданиям</div>
              <p style={{ fontSize: 14, color: "var(--text-soft)", marginBottom: 16 }}>
                {toRepeat.length === 0
                  ? "Все задания с автопроверкой решены на полный балл — отлично!"
                  : <>Стоит повторить: <b>{toRepeat.length > 1 ? "задания" : "задание"} {toRepeat.map(b => b.n).join(", ")}</b></>}
              </p>
              <div className="mock-grid">
                {breakdown.map(b => (
                  <div key={b.n} className={`mock-cell ${b.pending ? "pending" : b.points === b.max ? "full" : b.points > 0 ? "part" : "zero"}`}
                    title={b.pending ? "Проверит репетитор" : `${b.points} из ${b.max}`}>
                    <span>{b.n}</span>
                    <b>{b.pending ? "✍" : `${b.points}/${b.max}`}</b>
                  </div>
                ))}
              </div>
              <div className="mock-legend">
                <span><i className="full" />полный балл</span><span><i className="part" />частично</span>
                <span><i className="zero" />0 баллов</span><span><i className="pending" />проверит репетитор</span>
              </div>
              <style>{`
                .mock-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 8px; }
                .mock-cell { border-radius: 10px; padding: 7px 4px; text-align: center; border: 1.5px solid; }
                .mock-cell span { display: block; font-size: 11px; font-weight: 700; opacity: .7; }
                .mock-cell b { font-size: 14px; }
                .mock-cell.full { background: var(--correct-bg); border-color: var(--correct); color: var(--correct); }
                .mock-cell.part { background: #fdf0dc; border-color: #e0a14a; color: #9a5a0c; }
                .mock-cell.zero { background: var(--wrong-bg); border-color: var(--wrong); color: var(--wrong); }
                .mock-cell.pending { background: var(--bg-muted); border-color: var(--border); color: var(--text-muted); }
                .mock-legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; font-size: 12px; color: var(--text-muted); }
                .mock-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
                .mock-legend i.full { background: var(--correct); } .mock-legend i.part { background: #e0a14a; }
                .mock-legend i.zero { background: var(--wrong); } .mock-legend i.pending { background: var(--border); }
              `}</style>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

import React from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "../botanical";
import API from "../api";

const AdminSidebar = ({ active, onTab }) => {
  const navigate = useNavigate();
  const items = [
    { id: "tests", label: "Тесты", icon: "📚" },
    { id: "create", label: "Создать тест", icon: "✎" },
    { id: "students", label: "Ученики", icon: "👥" },
    { id: "results", label: "Результаты", icon: "📈" },
  ];
  return (
    <div className="sidebar" style={{ minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 20px" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--green-800)", color: "#fff", display: "grid", placeItems: "center" }}>
          <Leaf size={18} stroke={1.8} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 15 }}>Живая клетка</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>панель репетитора</div>
        </div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", padding: "8px 14px 4px" }}>Обучение</div>
      {items.map(it => (
        <div key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`} onClick={() => onTab?.(it.id)}>
          <span className="nav-ico" style={{ width: 18, textAlign: "center", color: "var(--text-muted)" }}>{it.icon}</span>
          {it.label}
        </div>
      ))}
      <div style={{ marginTop: "auto" }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
          onClick={() => navigate("/dashboard")}
        >
          ← К ученику
        </button>
      </div>
    </div>
  );
};

const AdminTestsList = ({ onCreateNew }) => {
  const [tests, setTests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = () => {
    setLoading(true);
    API.admin.getTests().then(data => { setTests(data); setLoading(false); }).catch(() => setLoading(false));
  };
  React.useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Удалить тест?")) return;
    await API.admin.deleteTest(id);
    load();
  };

  const handleToggle = async (id) => {
    await API.admin.toggleTest(id);
    load();
  };

  const handlePublish = async (id) => {
    await API.admin.publishTest(id);
    load();
  };

  return (
    <div style={{ padding: "32px 40px", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Тесты</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 36, letterSpacing: "-0.01em" }}>Библиотека заданий</h1>
          <p style={{ color: "var(--text-soft)", marginTop: 6 }}>Управляй тестами, публикуй и смотри статистику.</p>
        </div>
        <button className="btn btn-primary" onClick={onCreateNew}>+ Новый тест</button>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontFamily: "var(--f-serif)", fontSize: 16 }}>Загрузка…</div>
      ) : tests.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Тестов пока нет. <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={onCreateNew}>Создать первый</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 90px 90px 110px 140px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-muted)",
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
          }}>
            <div>Тест</div><div>Тема</div><div>Вопр.</div><div>Попыток</div><div>Ср. балл</div><div style={{ textAlign: "right" }}>Действия</div>
          </div>
          {tests.map((t, i) => (
            <div key={t.id} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 90px 90px 110px 140px",
              padding: "16px 20px", alignItems: "center",
              borderBottom: i < tests.length - 1 ? "1px solid var(--border-soft)" : "none",
              opacity: t.is_active ? 1 : 0.55,
            }}>
              <div>
                <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                  {t.title}
                  {t.is_draft ? <span className="pill pill-accent" style={{ fontSize: 10 }}>черновик</span> : null}
                  {!t.is_active && !t.is_draft ? <span className="pill pill-muted" style={{ fontSize: 10 }}>скрыт</span> : null}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{t.topic}</div>
              </div>
              <div><span className="pill" style={{ background: "var(--green-100)" }}>{t.topic}</span></div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 18 }}>{t.questions_count}</div>
              <div style={{ color: "var(--text-soft)" }}>{t.attempt_count || 0}</div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 16 }}>
                {t.avg_score != null ? `${t.avg_score}%` : "—"}
              </div>
              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                {t.is_draft && (
                  <button className="btn btn-primary btn-sm" onClick={() => handlePublish(t.id)}>Опубликовать</button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(t.id)}>
                  {t.is_active ? "Скрыть" : "Показать"}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--wrong)" }} onClick={() => handleDelete(t.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EMPTY_QUESTION = () => ({
  id: Date.now() + Math.random(),
  text: "",
  hint: "",
  explanation: "",
  expand: true,
  answers: [
    { id: 1, text: "", is_correct: true },
    { id: 2, text: "", is_correct: false },
    { id: 3, text: "", is_correct: false },
    { id: 4, text: "", is_correct: false },
  ],
});

const AdminCreateTest = ({ onCreated }) => {
  const [title, setTitle] = React.useState("");
  const [topic, setTopic] = React.useState("Ботаника");
  const [description, setDescription] = React.useState("");
  const [isDraft, setIsDraft] = React.useState(false);
  const [questions, setQuestions] = React.useState([EMPTY_QUESTION()]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  const updateQ = (qi, field, val) =>
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [field]: val } : q));

  const updateA = (qi, ai, field, val) =>
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qi) return q;
      const answers = q.answers.map((a, j) => {
        if (field === "is_correct") return { ...a, is_correct: j === ai };
        return j === ai ? { ...a, [field]: val } : a;
      });
      return { ...q, answers };
    }));

  const addAnswer = (qi) =>
    setQuestions(qs => qs.map((q, i) => i === qi
      ? { ...q, answers: [...q.answers, { id: Date.now(), text: "", is_correct: false }] }
      : q));

  const removeAnswer = (qi, ai) =>
    setQuestions(qs => qs.map((q, i) => i === qi
      ? { ...q, answers: q.answers.filter((_, j) => j !== ai) }
      : q));

  const addQuestion = () => setQuestions(qs => [...qs, EMPTY_QUESTION()]);
  const removeQuestion = (qi) => setQuestions(qs => qs.filter((_, i) => i !== qi));

  const handleSubmit = async (draft) => {
    if (!title.trim()) { setError("Введи название теста"); return; }
    const invalidQ = questions.findIndex(q => !q.text.trim());
    if (invalidQ !== -1) { setError(`Вопрос ${invalidQ + 1} пустой`); return; }

    setSaving(true);
    setError(null);
    try {
      await API.admin.createTest({
        title: title.trim(),
        topic,
        description: description.trim() || null,
        is_draft: draft ? 1 : 0,
        questions: questions.map(q => ({
          text: q.text.trim(),
          hint: q.hint.trim() || null,
          explanation: q.explanation.trim() || null,
          answers: q.answers.map(a => ({ text: a.text.trim(), is_correct: a.is_correct ? 1 : 0 })),
        })),
      });
      onCreated?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "32px 40px", flex: 1, display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          <span>Тесты</span><span>›</span><span style={{ color: "var(--text)" }}>Новый тест</span>
        </div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32, marginBottom: 6 }}>Создание теста</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 28 }}>Назови тест, добавь вопросы и варианты ответа. Не забудь отметить правильный.</p>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--wrong-bg)", border: "1px solid var(--wrong)", borderRadius: "var(--r-md)", marginBottom: 16, fontSize: 14, color: "var(--wrong)" }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="field">
              <label>Название теста</label>
              <input className="input input-lg" value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Фотосинтез" />
            </div>
            <div className="field">
              <label>Тема</label>
              <select className="input input-lg" value={topic} onChange={e => setTopic(e.target.value)} style={{ cursor: "pointer" }}>
                {["Ботаника","Зоология","Генетика","Анатомия","Экология","Цитология","Эволюция"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Краткое описание (необязательно)</label>
            <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Что проверяет этот тест?" style={{ resize: "vertical", fontFamily: "var(--f-sans)" }}/>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="eyebrow">Вопросы · {questions.length}</div>
          <button className="btn btn-ghost btn-sm" onClick={addQuestion}>+ Добавить вопрос</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {questions.map((q, qi) => (
            <div key={q.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
                background: q.expand ? "var(--green-100)" : "transparent",
                borderBottom: q.expand ? "1px solid var(--green-200)" : "none",
              }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--green-800)", color: "#fff", fontFamily: "var(--f-serif)", display: "grid", placeItems: "center", fontSize: 14 }}>
                  {qi + 1}
                </div>
                <div style={{ flex: 1, fontWeight: 500, color: q.text ? "var(--text)" : "var(--text-muted)" }}>
                  {q.text || "Новый вопрос"}
                </div>
                <span className="pill pill-muted">{q.answers.length} варианта</span>
                <button className="btn btn-ghost btn-sm" onClick={() => updateQ(qi, "expand", !q.expand)}>
                  {q.expand ? "Свернуть" : "Открыть"}
                </button>
                {questions.length > 1 && (
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--wrong)" }} onClick={() => removeQuestion(qi)}>✕</button>
                )}
              </div>
              {q.expand && (
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="field">
                    <label>Текст вопроса</label>
                    <input className="input" value={q.text} onChange={e => updateQ(qi, "text", e.target.value)} placeholder="Введи вопрос…" />
                  </div>
                  <div className="field">
                    <label>Подсказка (необязательно)</label>
                    <input className="input" value={q.hint} onChange={e => updateQ(qi, "hint", e.target.value)} placeholder="Направление для размышления…" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", letterSpacing: "0.02em", marginBottom: 10 }}>
                      Варианты ответа · отметь правильный
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {q.answers.map((a, ai) => (
                        <label key={a.id} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px",
                          background: a.is_correct ? "var(--correct-bg)" : "var(--bg-muted)",
                          border: `1.5px solid ${a.is_correct ? "var(--correct)" : "transparent"}`,
                          borderRadius: "var(--r-md)",
                          cursor: "pointer",
                        }}>
                          <input type="radio" checked={a.is_correct} onChange={() => updateA(qi, ai, "is_correct", true)}
                            style={{ accentColor: "var(--green-800)", width: 18, height: 18 }}/>
                          <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
                            placeholder={`Вариант ${String.fromCharCode(65 + ai)}`}
                            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, fontFamily: "var(--f-sans)" }}/>
                          {a.is_correct && <span className="pill" style={{ background: "var(--green-800)", color: "#fff" }}>верный</span>}
                          {q.answers.length > 2 && (
                            <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeAnswer(qi, ai)}>✕</button>
                          )}
                        </label>
                      ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => addAnswer(qi)}>+ Добавить вариант</button>
                  </div>
                  <div className="field">
                    <label>Пояснение к правильному ответу</label>
                    <textarea className="input" rows={2} value={q.explanation} onChange={e => updateQ(qi, "explanation", e.target.value)}
                      placeholder="Объясни, почему этот ответ правильный…" style={{ resize: "vertical", fontFamily: "var(--f-sans)" }}/>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button className="btn btn-soft" style={{ justifyContent: "center" }} onClick={addQuestion}>
            + Добавить ещё один вопрос
          </button>
        </div>
      </div>

      {/* Right — publish */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Публикация</div>
          <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 16 }}>
            {questions.length} вопрос{questions.length === 1 ? "" : "ов"} · тема: {topic}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary btn-lg" style={{ justifyContent: "center" }}
              disabled={saving} onClick={() => handleSubmit(false)}>
              {saving ? "Сохраняем…" : "Опубликовать тест"}
            </button>
            <button className="btn btn-ghost" style={{ justifyContent: "center" }}
              disabled={saving} onClick={() => handleSubmit(true)}>
              Сохранить как черновик
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminStudents = () => {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    API.admin.getStudents()
      .then(data => { setStudents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: "32px 40px", flex: 1, color: "var(--text-muted)", fontFamily: "var(--f-serif)", fontSize: 16 }}>Загрузка…</div>
  );

  return (
    <div style={{ padding: "32px 40px", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Ученики</div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 36 }}>Твой класс</h1>
          <p style={{ color: "var(--text-soft)", marginTop: 6 }}>{students.length} учеников</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Ученики ещё не заходили в систему
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 90px 1.3fr 160px",
            padding: "12px 20px", borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-muted)",
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
          }}>
            <div>Ученик</div><div>Тестов</div><div>Средний балл</div><div>Последний вход</div>
          </div>
          {students.map((s, i) => (
            <div key={s.id} style={{
              display: "grid",
              gridTemplateColumns: "2fr 90px 1.3fr 160px",
              padding: "14px 20px", alignItems: "center",
              borderBottom: i < students.length - 1 ? "1px solid var(--border-soft)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: ["var(--green-200)","var(--accent-soft)","var(--green-300)"][i % 3],
                  color: "var(--green-900)",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 13,
                }}>{s.name[0]?.toUpperCase()}</div>
                <div style={{ fontWeight: 500 }}>{s.name}</div>
              </div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 16 }}>{s.attempt_count || 0}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, maxWidth: 160 }}>
                  <div className="progress" style={{ height: 4 }}>
                    <div className="progress-fill" style={{
                      width: `${s.avg_score || 0}%`,
                      background: (s.avg_score || 0) >= 80
                        ? "linear-gradient(90deg, var(--green-600), var(--green-800))"
                        : "linear-gradient(90deg, var(--accent), #c57a3a)",
                    }}/>
                  </div>
                </div>
                <span style={{ fontFamily: "var(--f-serif)", fontSize: 14 }}>
                  {s.avg_score != null ? `${s.avg_score}%` : "—"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-soft)" }}>
                {s.last_attempt ? new Date(s.last_attempt).toLocaleDateString("ru-RU") : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminResults = () => {
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    API.admin.getResults()
      .then(data => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: "32px 40px", flex: 1, color: "var(--text-muted)", fontFamily: "var(--f-serif)", fontSize: 16 }}>Загрузка…</div>
  );

  return (
    <div style={{ padding: "32px 40px", flex: 1 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Результаты</div>
      <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 36, marginBottom: 28 }}>Все попытки</h1>

      {results.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Попыток ещё не было
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 2fr 1fr 140px",
            padding: "12px 20px", borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-muted)",
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
          }}>
            <div>Ученик</div><div>Тест</div><div>Результат</div><div>Дата</div>
          </div>
          {results.map((r, i) => (
            <div key={r.id} style={{
              display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 140px",
              padding: "14px 20px", alignItems: "center",
              borderBottom: i < results.length - 1 ? "1px solid var(--border-soft)" : "none",
            }}>
              <div style={{ fontWeight: 500 }}>{r.user_name}</div>
              <div>
                <div>{r.test_title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.topic}</div>
              </div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 18 }}>
                {r.score}/{r.max_score}
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>
                  {r.max_score > 0 ? `${Math.round(r.score / r.max_score * 100)}%` : ""}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-soft)" }}>
                {new Date(r.completed_at).toLocaleDateString("ru-RU")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminPanel = ({ initialTab = "tests" }) => {
  const [tab, setTab] = React.useState(initialTab);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar active={tab} onTab={setTab} />
      {tab === "tests" && <AdminTestsList onCreateNew={() => setTab("create")} />}
      {tab === "create" && <AdminCreateTest onCreated={() => setTab("tests")} />}
      {tab === "students" && <AdminStudents />}
      {tab === "results" && <AdminResults />}
    </div>
  );
};

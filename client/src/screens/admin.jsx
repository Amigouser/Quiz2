import React from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "../botanical";
import API from "../api";

// Встроенные разделы биологии (используются в формах тестов и карточек)
const BIO_SECTIONS = [
  "Биология как наука. Методы. Уровни организации",
  "Строение клетки",
  "Биохимия клетки",
  "Метаболизм клетки",
  "Клеточный цикл",
  "Размножение и развитие",
  "Прокариоты и вирусы",
  "Грибы и лишайники",
  "Растения",
  "Животные",
  "Человек",
  "Эволюция",
  "Экология",
  "Генетика",
];

const SectionSelect = ({ value, onChange }) => (
  <select
    className="input"
    value={value || ""}
    onChange={e => onChange(e.target.value)}
    style={{ cursor: "pointer" }}
  >
    <option value="">— выбери раздел —</option>
    {BIO_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
  </select>
);

// Классы и типы экзаменов — раздельно
const GRADE_OPTIONS = ["5 класс", "6 класс", "7 класс", "8 класс", "9 класс", "10 класс", "11 класс"];
const EXAM_OPTIONS = ["ОГЭ", "ЕГЭ", "ВПР"];

const MultiChipPicker = ({ value = [], onChange, options, shortLabel }) => {
  const arr = Array.isArray(value) ? value : (value ? [value] : []);
  const toggle = (opt) => {
    const next = arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt];
    onChange(next);
  };
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={arr.includes(opt) ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
        >
          {shortLabel ? shortLabel(opt) : opt}
        </button>
      ))}
    </div>
  );
};

const ChipPicker = ({ value, onChange, options, shortLabel }) => (
  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
    {options.map(opt => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(value === opt ? "" : opt)}
        className={value === opt ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
      >
        {shortLabel ? shortLabel(opt) : opt}
      </button>
    ))}
  </div>
);

const GradePicker = ({ value, onChange }) => (
  <MultiChipPicker value={value} onChange={onChange} options={GRADE_OPTIONS} shortLabel={g => g.replace(" класс", "")} />
);

const ExamPicker = ({ value, onChange }) => (
  <MultiChipPicker value={value} onChange={onChange} options={EXAM_OPTIONS} />
);

// Часть экзамена
const PART_OPTIONS = ["Часть 1", "Часть 2"];
const isExamCategory = (cat) => {
  const arr = Array.isArray(cat) ? cat : (cat ? [cat] : []);
  return arr.some(c => c === "ОГЭ" || c === "ЕГЭ");
};

const PartPicker = ({ value, onChange }) => (
  <MultiChipPicker value={value} onChange={onChange} options={PART_OPTIONS} />
);

// ── Управляемый пикер разделов/тем ───────────────────────────────────────────
function ManagedPicker({ value, onChange, loadItems, createItem, updateItem, deleteItem, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [newName, setNewName] = React.useState("");
  const [editId, setEditId] = React.useState(null);
  const [editName, setEditName] = React.useState("");
  const [err, setErr] = React.useState("");
  const ref = React.useRef();

  React.useEffect(() => {
    loadItems().then(setItems).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => setOpen(v => !v);

  const reload = () => loadItems().then(setItems).catch(() => {});

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const item = await createItem(newName.trim());
      setItems(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name, "ru")));
      setNewName("");
      setErr("");
    } catch (e) { setErr(e.message); }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateItem(id, editName.trim());
      setItems(prev => prev.map(it => it.id === id ? { ...it, name: editName.trim() } : it));
      if (value === items.find(it => it.id === id)?.name) onChange(editName.trim());
      setEditId(null); setErr("");
    } catch (e) { setErr(e.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Удалить «${name}»?`)) return;
    await deleteItem(id);
    setItems(prev => prev.filter(it => it.id !== id));
    if (value === name) onChange("");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={handleToggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 12px", borderRadius: "var(--r-md)",
          border: `1.5px solid ${value ? "var(--green-500)" : "var(--border-soft)"}`,
          background: value ? "var(--green-50)" : "var(--surface)",
          cursor: "pointer", fontSize: 14, color: value ? "var(--green-900)" : "var(--text-muted)",
          userSelect: "none",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || placeholder}
        </span>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0, marginLeft: 8, opacity: 0.5 }}>
          <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          zIndex: 400,
          background: "var(--surface)", border: "1.5px solid var(--border-soft)",
          borderRadius: "var(--r-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          maxHeight: 340, overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          {/* Добавить новый */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)", display: "flex", gap: 6 }}>
            <input
              className="input"
              value={newName}
              onChange={e => { setNewName(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="Новый..."
              style={{ flex: 1, fontSize: 13, padding: "6px 10px" }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={!newName.trim()}>
              + Добавить
            </button>
          </div>
          {err && <div style={{ padding: "4px 12px", fontSize: 12, color: "var(--wrong)" }}>{err}</div>}

          {/* Список */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {value && (
              <div
                onClick={() => { onChange(""); setOpen(false); }}
                style={{ padding: "8px 12px", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", borderBottom: "1px solid var(--border-soft)", fontStyle: "italic" }}
              >
                — Не выбрано —
              </div>
            )}
            {items.map(item => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center",
                background: item.name === value ? "var(--green-100)" : "transparent",
                borderBottom: "1px solid var(--border-soft)",
              }}>
                {editId === item.id ? (
                  <div style={{ display: "flex", flex: 1, gap: 4, padding: "6px 8px" }}>
                    <input
                      className="input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleUpdate(item.id); if (e.key === "Escape") setEditId(null); }}
                      autoFocus
                      style={{ flex: 1, fontSize: 13, padding: "5px 8px" }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(item.id)}>✓</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => { onChange(item.name); setOpen(false); }}
                      style={{ flex: 1, padding: "9px 12px", cursor: "pointer", fontSize: 13, lineHeight: 1.4 }}
                    >
                      {item.name}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "4px 7px", flexShrink: 0, color: "var(--text-muted)" }}
                      onClick={e => { e.stopPropagation(); setEditId(item.id); setEditName(item.name); }}
                      title="Переименовать"
                    >✏️</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "4px 7px", flexShrink: 0, color: "var(--wrong)", marginRight: 4 }}
                      onClick={e => { e.stopPropagation(); handleDelete(item.id, item.name); }}
                      title="Удалить"
                    >✕</button>
                  </>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ padding: "16px 12px", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                Пусто — добавь первый
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Множественный ManagedPicker ───────────────────────────────────────────
function ManagedPickerMulti({ value = [], onChange, loadItems, createItem, updateItem, deleteItem, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [newName, setNewName] = React.useState("");
  const [editId, setEditId] = React.useState(null);
  const [editName, setEditName] = React.useState("");
  const [err, setErr] = React.useState("");
  const ref = React.useRef();

  const arr = Array.isArray(value) ? value : (value ? [value] : []);

  React.useEffect(() => {
    loadItems().then(setItems).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const item = await createItem(newName.trim());
      setItems(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name, "ru")));
      setNewName("");
      setErr("");
    } catch (e) { setErr(e.message); }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateItem(id, editName.trim());
      setItems(prev => prev.map(it => it.id === id ? { ...it, name: editName.trim() } : it));
      if (arr.includes(items.find(it => it.id === id)?.name)) {
        onChange(arr.map(v => v === items.find(it => it.id === id)?.name ? editName.trim() : v));
      }
      setEditId(null); setErr("");
    } catch (e) { setErr(e.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Удалить «${name}»?`)) return;
    await deleteItem(id);
    setItems(prev => prev.filter(it => it.id !== id));
    if (arr.includes(name)) onChange(arr.filter(v => v !== name));
  };

  const toggleItem = (name) => {
    const next = arr.includes(name) ? arr.filter(v => v !== name) : [...arr, name];
    onChange(next);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 12px", borderRadius: "var(--r-md)",
          border: `1.5px solid ${arr.length ? "var(--green-500)" : "var(--border-soft)"}`,
          background: arr.length ? "var(--green-50)" : "var(--surface)",
          cursor: "pointer", fontSize: 14, color: arr.length ? "var(--green-900)" : "var(--text-muted)",
          userSelect: "none", minHeight: 38,
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {arr.length > 0 ? arr.join(", ") : placeholder}
        </span>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0, marginLeft: 8, opacity: 0.5 }}>
          <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          zIndex: 400,
          background: "var(--surface)", border: "1.5px solid var(--border-soft)",
          borderRadius: "var(--r-lg)", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          maxHeight: 340, overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)", display: "flex", gap: 6 }}>
            <input
              className="input"
              value={newName}
              onChange={e => { setNewName(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="Новый..."
              style={{ flex: 1, fontSize: 13, padding: "6px 10px" }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleCreate} disabled={!newName.trim()}>
              + Добавить
            </button>
          </div>
          {err && <div style={{ padding: "4px 12px", fontSize: 12, color: "var(--wrong)" }}>{err}</div>}

          <div style={{ overflowY: "auto", flex: 1 }}>
            {arr.length > 0 && (
              <div
                onClick={() => onChange([])}
                style={{ padding: "8px 12px", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", borderBottom: "1px solid var(--border-soft)", fontStyle: "italic" }}
              >
                — Очистить все —
              </div>
            )}
            {items.map(item => {
              const selected = arr.includes(item.name);
              return (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center",
                  background: selected ? "var(--green-100)" : "transparent",
                  borderBottom: "1px solid var(--border-soft)",
                }}>
                  {editId === item.id ? (
                    <div style={{ display: "flex", flex: 1, gap: 4, padding: "6px 8px" }}>
                      <input
                        className="input"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleUpdate(item.id); if (e.key === "Escape") setEditId(null); }}
                        autoFocus
                        style={{ flex: 1, fontSize: 13, padding: "5px 8px" }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(item.id)}>✓</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>✕</button>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={() => toggleItem(item.name)}
                        style={{ flex: 1, padding: "9px 12px", cursor: "pointer", fontSize: 13, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? "var(--green-600)" : "var(--border)"}`, background: selected ? "var(--green-600)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                          {selected && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        {item.name}
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "4px 7px", flexShrink: 0, color: "var(--text-muted)" }}
                        onClick={e => { e.stopPropagation(); setEditId(item.id); setEditName(item.name); }}
                        title="Переименовать"
                      >✏️</button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "4px 7px", flexShrink: 0, color: "var(--wrong)", marginRight: 4 }}
                        onClick={e => { e.stopPropagation(); handleDelete(item.id, item.name); }}
                        title="Удалить"
                      >✕</button>
                    </>
                  )}
                </div>
              );
            })}
            {items.length === 0 && (
              <div style={{ padding: "16px 12px", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                Пусто — добавь первый
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Мульти-тег инпут для свободного ввода ─────────────────────────────────
function MultiTagInput({ value = [], onChange, placeholder }) {
  const arr = Array.isArray(value) ? value : (value ? [value] : []);
  const [input, setInput] = React.useState("");

  const addTag = () => {
    const t = input.trim();
    if (!t || arr.includes(t)) { setInput(""); return; }
    onChange([...arr, t]);
    setInput("");
  };

  const removeTag = (tag) => onChange(arr.filter(v => v !== tag));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {arr.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {arr.map(tag => (
            <span key={tag} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: "var(--green-100)", color: "var(--green-900)", border: "1px solid var(--green-200)",
            }}>
              {tag}
              <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 14, color: "var(--green-700)", lineHeight: 1 }}>✕</button>
            </span>
          ))}
        </div>
      )}
      <input
        className="input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } if (e.key === "Tab" && input.trim()) { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={arr.length > 0 ? "Ещё..." : placeholder}
        style={{ fontSize: 13 }}
      />
    </div>
  );
}

const SectionPicker = ({ value, onChange }) => (
  <ManagedPicker
    value={value}
    onChange={onChange}
    placeholder="— выбери раздел —"
    loadItems={() => API.admin.getSections()}
    createItem={(name) => API.admin.createSection(name)}
    updateItem={(id, name) => API.admin.updateSection(id, name)}
    deleteItem={(id) => API.admin.deleteSection(id)}
  />
);

const TopicPicker = ({ value, onChange }) => (
  <ManagedPicker
    value={value}
    onChange={onChange}
    placeholder="— выбери тему —"
    loadItems={() => API.admin.getTopics()}
    createItem={(name) => API.admin.createTopic(name)}
    updateItem={(id, name) => API.admin.updateTopic(id, name)}
    deleteItem={(id) => API.admin.deleteTopic(id)}
  />
);

const SectionPickerMulti = ({ value, onChange }) => (
  <ManagedPickerMulti
    value={value}
    onChange={onChange}
    placeholder="— выбери разделы —"
    loadItems={() => API.admin.getSections()}
    createItem={(name) => API.admin.createSection(name)}
    updateItem={(id, name) => API.admin.updateSection(id, name)}
    deleteItem={(id) => API.admin.deleteSection(id)}
  />
);

const SourcePicker = ({ value, onChange }) => (
  <MultiTagInput value={value} onChange={onChange} placeholder="Напр.: ФИПИ, ВИПИМБ" />
);

const LinePicker = ({ value, onChange }) => (
  <MultiTagInput value={value} onChange={onChange} placeholder="Напр.: 5, 12" />
);

const AdminSidebar = ({ active, onTab }) => {
  const navigate = useNavigate();
  const fileRef = React.useRef();
  const [restoring, setRestoring] = React.useState(false);

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm("Восстановить из бэкапа? Текущие данные будут заменены. Сервер перезапустится автоматически.")) {
      e.target.value = "";
      return;
    }
    setRestoring(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      try {
        await API.admin.restore(base64);
        alert("Восстановлено! Перезагрузите страницу через 3–5 секунд.");
      } catch (err) {
        alert("Ошибка: " + err.message);
        setRestoring(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const items = [
    { id: "tests", label: "Тесты", icon: "📚" },
    { id: "cards", label: "Карточки", icon: "🃏" },
    { id: "students", label: "Ученики", icon: "👥" },
    { id: "results", label: "Результаты", icon: "📈" },
  ];
  return (
    <div className="sidebar" style={{ minHeight: "100%" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 20px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <img src="/tutor2.jpg" alt="Vikokon" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", border: "1.5px solid var(--border-soft)", flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 15 }}>Vikokon</div>
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
        <div style={{ borderTop: "1px solid var(--border-soft)", padding: "12px 8px 8px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", padding: "0 6px 6px" }}>База данных</div>
          <a href="/api/admin/backup" download style={{ textDecoration: "none", display: "block" }}>
            <div className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "flex-start", gap: 8 }}>
              💾 Скачать бэкап
            </div>
          </a>
          <label style={{ cursor: restoring ? "default" : "pointer", display: "block", marginTop: 4 }}>
            <div className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "flex-start", gap: 8, opacity: restoring ? 0.5 : 1 }}>
              📤 {restoring ? "Восстановление…" : "Восстановить"}
            </div>
            <input ref={fileRef} type="file" accept=".db,.zip" style={{ display: "none" }} onChange={handleRestore} disabled={restoring} />
          </label>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
          onClick={() => navigate("/")}
        >
          ← На главную
        </button>
      </div>
    </div>
  );
};

const AdminTestsList = ({ onCreateNew, onImport, onEdit }) => {
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
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={onImport}>📥 Импорт JSON</button>
          <button className="btn btn-primary" onClick={onCreateNew}>+ Новый тест</button>
        </div>
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
            gridTemplateColumns: "1fr 70px 70px 100px 230px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-muted)",
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
          }}>
            <div>Тест</div><div>Вопр.</div><div>Попыток</div><div>Ср. балл</div><div style={{ textAlign: "right" }}>Действия</div>
          </div>
          {tests.map((t, i) => (
            <div key={t.id} style={{
              display: "grid", gridTemplateColumns: "1fr 70px 70px 100px 230px",
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
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 18 }}>{t.questions_count}</div>
              <div style={{ color: "var(--text-soft)" }}>{t.attempt_count || 0}</div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 16 }}>
                {t.avg_score != null ? `${t.avg_score}%` : "—"}
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                {t.is_draft && (
                  <button className="btn btn-primary btn-sm" onClick={() => handlePublish(t.id)}>Опубл.</button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(t.id)}>Изменить</button>
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

// ── Универсальный импорт JSON ────────────────────────────────────────────────
const TEST_PROMPT_BASE = `Ты генератор учебных тестов по биологии. Верни ТОЛЬКО валидный JSON — без markdown, без пояснений вне JSON, без лишних символов.

Структура (строго):
{
  "title": "Короткое название теста",
  "topic": "Раздел биологии",
  "description": "1–2 предложения о чём тест",
  "questions": [
    {
      "text": "Текст вопроса?",
      "hint": "Краткая подсказка для ученика (строка или null)",
      "explanation": "Объяснение — почему ответ правильный (обязательно)",
      "answers": [
        { "text": "Правильный ответ", "is_correct": true },
        { "text": "Неверный вариант Б", "is_correct": false },
        { "text": "Неверный вариант В", "is_correct": false },
        { "text": "Неверный вариант Г", "is_correct": false }
      ]
    }
  ]
}

Задание: сделай {count} вопросов по теме "{topic}"`;

const CARDS_PROMPT_BASE = `Ты генератор учебных карточек по биологии. Верни ТОЛЬКО валидный JSON — без markdown, без пояснений вне JSON.

Структура (строго):
{
  "title": "Короткое название набора",
  "topic": "Раздел биологии",
  "description": "1–2 предложения о чём набор (или null)",
  "cards": [
    { "term": "Термин", "definition": "Чёткое определение" }
  ]
}

Задание: сделай {count} карточек по теме "{topic}"`;

function ImportJsonPanel({ type, onImport, onClose }) {
  const [text, setText] = React.useState("");
  const [err, setErr] = React.useState(null);
  const [subject, setSubject] = React.useState("");
  const [count, setCount] = React.useState(type === "test" ? 10 : 20);
  const [copied, setCopied] = React.useState(false);
  const fileRef = React.useRef();

  const baseTemplate = type === "test" ? TEST_PROMPT_BASE : CARDS_PROMPT_BASE;
  const prompt = baseTemplate
    .replace("{count}", count)
    .replace("{topic}", subject.trim() || "...");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setText(ev.target.result);
    reader.readAsText(file);
  };

  const handleApply = () => {
    setErr(null);
    let raw = text.trim();
    // strip markdown code fences if AI wrapped JSON
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    try {
      const data = JSON.parse(raw);
      onImport(data);
    } catch {
      setErr("Неверный JSON. Убедись что нейросеть вернула чистый JSON без лишнего текста.");
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const itemWord = type === "test" ? "вопросов" : "карточек";

  return (
    <div style={{
      background: "var(--green-50)", border: "1.5px solid var(--green-200)",
      borderRadius: "var(--r-lg)", padding: 24, marginBottom: 24,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--f-serif)", fontSize: 18, fontWeight: 600 }}>
          📥 Импорт из JSON
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>

      {/* Шаг 1 — настройка и промпт */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--text-soft)" }}>
          Шаг 1 — укажи тему и количество, затем скопируй промпт в ChatGPT / Claude / Gemini
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: "1 1 200px", minWidth: 0 }}
            placeholder="Тема, например: Фотосинтез"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: "var(--text-soft)", whiteSpace: "nowrap" }}>Кол-во {itemWord}:</span>
            <input
              className="input"
              type="number"
              min={1}
              max={50}
              style={{ width: 70 }}
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(50, Number(e.target.value))))}
            />
          </div>
        </div>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border-soft)",
          borderRadius: "var(--r-md)", padding: "12px 14px",
          fontSize: 12, fontFamily: "monospace", color: "var(--text-soft)",
          whiteSpace: "pre-wrap", maxHeight: 160, overflowY: "auto",
          marginBottom: 8,
        }}>
          {prompt}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={copyPrompt}>
          {copied ? "✅ Скопировано!" : "📋 Скопировать промпт"}
        </button>
      </div>

      {/* Шаг 2 — вставить JSON */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-soft)" }}>
          Шаг 2 — вставь ответ нейросети сюда или загрузи .json файл
        </div>
        <textarea
          className="input"
          rows={6}
          value={text}
          onChange={e => { setText(e.target.value); setErr(null); }}
          placeholder='{ "title": "...", "questions": [...] }'
          style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12, marginBottom: 8 }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
            📂 Загрузить .json файл
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: "none" }} onChange={handleFile} />
          {err && <span style={{ fontSize: 12, color: "var(--wrong)" }}>{err}</span>}
          <button
            className="btn btn-primary btn-sm"
            style={{ marginLeft: "auto" }}
            disabled={!text.trim()}
            onClick={handleApply}
          >
            Применить →
          </button>
        </div>
      </div>
    </div>
  );
}

function pasteImage(e, onLoad, folder = "questions") {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const result = await API.uploadImage(ev.target.result, folder);
          onLoad(result.url);
        } catch (err) {
          alert("Ошибка загрузки: " + err.message);
        }
      };
      reader.readAsDataURL(file);
      return;
    }
  }
}

async function uploadFileToServer(file, folder, onLoad) {
  if (file.size > 20 * 1024 * 1024) { alert("Файл слишком большой (макс. 20 МБ)"); return; }
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const result = await API.uploadImage(ev.target.result, folder);
      onLoad(result.url);
    } catch (err) {
      alert("Ошибка загрузки: " + err.message);
    }
  };
  reader.readAsDataURL(file);
}

const EMPTY_QUESTION = () => ({
  id: Date.now() + Math.random(),
  text: "",
  hint: "",
  explanation: "",
  question_type: "single",
  image_data: null,
  correct_text: "",
  match_options: ["1", "2"],
  expand: true,
  answers: [
    { id: 1, text: "", is_correct: true,  match_value: "" },
    { id: 2, text: "", is_correct: false, match_value: "" },
    { id: 3, text: "", is_correct: false, match_value: "" },
    { id: 4, text: "", is_correct: false, match_value: "" },
  ],
});

const AdminCreateTest = ({ onCreated, autoImport = false }) => {
  const [title, setTitle] = React.useState("");
  const [section, setSection] = React.useState([]);
  const [topic, setTopic] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [grade, setGrade] = React.useState([]);
  const [category, setCategory] = React.useState([]);
  const [part, setPart] = React.useState([]);
  const [line, setLine] = React.useState([]);
  const [source, setSource] = React.useState([]);
  const [isDraft, setIsDraft] = React.useState(false);
  const [questions, setQuestions] = React.useState([EMPTY_QUESTION()]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [showImport, setShowImport] = React.useState(autoImport);

  const handleImportTest = (data) => {
    if (data.title) setTitle(data.title);
    if (data.topic) setTopic(data.topic);
    if (data.description) setDescription(data.description);
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      setQuestions(data.questions.map(q => {
        let textAnswers = undefined;
        if ((q.question_type || "single") === "text_input" && q.correct_text) {
          try { const parsed = JSON.parse(q.correct_text); if (Array.isArray(parsed)) textAnswers = parsed.map(String); } catch (_) {}
          if (!textAnswers) textAnswers = [q.correct_text];
        }
        return {
          id: Date.now() + Math.random(),
          text: q.text || q.question_text || "",
          hint: q.hint || "",
          explanation: q.explanation || "",
          question_type: q.question_type || "single",
          image_data: q.image_data || null,
          correct_text: q.correct_text || "",
          text_answers: textAnswers,
          match_options: q.match_options || ["1", "2"],
          expand: true,
          answers: (q.answers || []).map((a, i) => ({
            id: Date.now() + Math.random() + i,
            text: a.text || a.answer_text || "",
            is_correct: !!(a.is_correct),
            match_value: a.match_value || "",
          })),
        };
      }));
    }
    setShowImport(false);
  };

  const updateQ = (qi, field, val) =>
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, [field]: val } : q));

  const updateA = (qi, ai, field, val) =>
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qi) return q;
      const isMulti = q.question_type === "multiple_select";
      const answers = q.answers.map((a, j) => {
        if (field === "is_correct") {
          if (isMulti) return { ...a, is_correct: j === ai ? (val ? 1 : 0) : a.is_correct };
          return { ...a, is_correct: j === ai ? 1 : 0 };
        }
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
        section: section.length > 0 ? section.join(", ") : null,
        topic: topic.trim() || null,
        description: description.trim() || null,
        grade: grade.length > 0 ? grade.join(", ") : null,
        category: category.length > 0 ? category.join(", ") : null,
        part: part.length > 0 ? part.join(", ") : null,
        line: line.length > 0 ? line.join(", ") : null,
        source: source.length > 0 ? source.join(", ") : null,
        is_draft: draft ? 1 : 0,
        questions: questions.map(q => {
          let correctText = null;
          if (q.question_type === "text_input") {
            const ta = (q.text_answers || []).filter(t => t && t.trim());
            if (ta.length > 1) correctText = JSON.stringify(ta.map(t => t.trim()));
            else if (ta.length === 1) correctText = ta[0].trim();
          } else {
            correctText = q.correct_text?.trim() || null;
          }
          return {
          text: q.text.trim(),
          hint: q.hint.trim() || null,
          explanation: q.explanation.trim() || null,
          question_type: q.question_type || "single",
          image_data: q.image_data || null,
          correct_text: correctText,
          match_options: q.match_options || ["1", "2"],
          answers: q.answers.map(a => ({ text: a.text.trim(), is_correct: a.is_correct ? 1 : 0, match_value: a.match_value || null })),
        };
        }),
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
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 6 }}>
          <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32 }}>Создание теста</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(v => !v)}>
            {showImport ? "✕ Закрыть импорт" : "📥 Импорт из JSON"}
          </button>
        </div>
        <p style={{ color: "var(--text-soft)", marginBottom: 20 }}>Назови тест, добавь вопросы и варианты ответа. Не забудь отметить правильный.</p>

        {showImport && (
          <ImportJsonPanel type="test" onImport={handleImportTest} onClose={() => setShowImport(false)} />
        )}

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--wrong-bg)", border: "1px solid var(--wrong)", borderRadius: "var(--r-md)", marginBottom: 16, fontSize: 14, color: "var(--wrong)" }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: 24, marginBottom: 20, overflow: "visible", transform: "none" }}>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Название теста</label>
            <input className="input input-lg" value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Фотосинтез" />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Краткое описание (необязательно)</label>
            <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Что проверяет этот тест?" style={{ resize: "vertical", fontFamily: "var(--f-sans)" }}/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div className="field">
              <label>Класс</label>
              <GradePicker value={grade} onChange={setGrade} />
            </div>
            <div className="field">
              <label>Экзамен</label>
              <ExamPicker value={category} onChange={(val) => { setCategory(val); if (!isExamCategory(val)) setPart([]); }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
            <div className="field">
              <label>Часть</label>
              <PartPicker value={part} onChange={setPart} />
            </div>
            <div className="field">
              <label>Раздел</label>
              <SectionPickerMulti value={section} onChange={setSection} />
            </div>
            <div className="field">
              <label>Тема</label>
              <TopicPicker value={topic} onChange={setTopic} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div className="field">
              <label>Источник</label>
              <SourcePicker value={source} onChange={setSource} />
            </div>
            <div className="field">
              <label>Линия</label>
              <LinePicker value={line} onChange={setLine} />
            </div>
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
                <div style={{ flex: 1, fontWeight: 500, color: q.text ? "var(--text)" : "var(--text-muted)" }} className="pre-line">
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
                  {/* Image */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 8 }}>Иллюстрация к вопросу</div>
                    {q.image_data ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img src={q.image_data} alt="" style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border-soft)", display: "block" }} />
                        <button onClick={() => updateQ(qi, "image_data", null)}
                          style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", cursor: "pointer", fontSize: 14, display: "grid", placeItems: "center" }}>✕</button>
                      </div>
                    ) : (
                      <label tabIndex={0}
                        onPaste={e => pasteImage(e, data => updateQ(qi, "image_data", data))}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 14px", border: "1.5px dashed var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-soft)", outline: "none" }}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--green-600)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                          const file = e.target.files[0]; if (!file) return;
                          uploadFileToServer(file, "questions", url => updateQ(qi, "image_data", url));
                          e.target.value = "";
                        }} />
                        📎 Файл или <kbd style={{ padding: "1px 5px", borderRadius: 4, border: "1px solid var(--border)", fontSize: 11, fontFamily: "monospace", background: "var(--bg-muted)" }}>Ctrl+V</kbd> для вставки
                      </label>
                    )}
                  </div>
                  {/* Question type */}
                  <div className="field">
                    <label>Тип вопроса</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[["single", "Один ответ"], ["text_input", "Ввод числа/текста"], ["matching", "Соответствие"], ["multiple_select", "Несколько ответов"], ["sequence", "Последовательность"], ["fill_blanks", "Заполни пропуски"]].map(([type, label]) => (
                        <button key={type} className={`btn btn-sm ${q.question_type === type ? "btn-primary" : "btn-ghost"}`}
                          onClick={() => updateQ(qi, "question_type", type)}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>Текст вопроса</label>
                    <textarea className="input" rows={3} value={q.text} onChange={e => updateQ(qi, "text", e.target.value)} placeholder="Введи вопрос…" />
                  </div>
                  <div className="field">
                    <label>Подсказка (необязательно)</label>
                    <textarea className="input" rows={2} value={q.hint} onChange={e => updateQ(qi, "hint", e.target.value)} placeholder="Направление для размышления…" />
                  </div>
                  {/* Single */}
                  {q.question_type === "single" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", letterSpacing: "0.02em", marginBottom: 10 }}>
                        Варианты ответа · отметь правильный
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <label key={a.id} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                            background: a.is_correct ? "var(--correct-bg)" : "var(--bg-muted)",
                            border: `1.5px solid ${a.is_correct ? "var(--correct)" : "transparent"}`,
                            borderRadius: "var(--r-md)", cursor: "pointer",
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
                  )}
                  {/* Text input */}
                  {q.question_type === "text_input" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>
                        Правильные ответы · ученик введёт один из них
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(q.text_answers || [q.correct_text || ""]).map((ans, ai) => (
                          <div key={ai} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 20, fontWeight: 600 }}>{ai + 1}.</span>
                            <input className="input" value={ans}
                              onChange={e => {
                                const arr = [...(q.text_answers || [q.correct_text || ""])];
                                arr[ai] = e.target.value;
                                updateQ(qi, "text_answers", arr);
                              }}
                              placeholder={ai === 0 ? "Например: 2" : `Вариант ${ai + 1}`}
                              style={{ flex: 1 }} />
                            {(q.text_answers || []).length > 1 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}
                                onClick={() => {
                                  const arr = (q.text_answers || []).filter((_, i) => i !== ai);
                                  updateQ(qi, "text_answers", arr);
                                }}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
                        onClick={() => {
                          const arr = q.text_answers || [q.correct_text || ""];
                          updateQ(qi, "text_answers", [...arr, ""]);
                        }}>+ Добавить вариант ответа</button>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Ученик введёт ответ в текстовое поле. Все варианты считаются правильными.</div>
                    </div>
                  )}
                  {/* Multiple select */}
                  {q.question_type === "multiple_select" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>
                        Варианты ответа · отметь все правильные
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <label key={a.id} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                            background: a.is_correct ? "var(--correct-bg)" : "var(--bg-muted)",
                            border: `1.5px solid ${a.is_correct ? "var(--correct)" : "transparent"}`,
                            borderRadius: "var(--r-md)", cursor: "pointer",
                          }}>
                            <input type="checkbox" checked={!!a.is_correct} onChange={e => updateA(qi, ai, "is_correct", e.target.checked)}
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
                  )}
                  {/* Sequence */}
                  {q.question_type === "sequence" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 4 }}>
                        Элементы последовательности · порядок строк = правильный порядок
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Добавь элементы в правильном порядке (сверху вниз). Ученик будет расставлять их в произвольном порядке.</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-muted)", borderRadius: 10 }}>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 24, fontWeight: 700 }}>{ai + 1}.</div>
                            <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
                              placeholder={`Элемент ${ai + 1}…`}
                              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontFamily: "var(--f-sans)" }}/>
                            {q.answers.length > 2 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeAnswer(qi, ai)}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => addAnswer(qi)}>+ Добавить элемент</button>
                    </div>
                  )}
                  {/* Matching */}
                  {q.question_type === "matching" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>
                        Правые варианты (кнопки выбора)
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                        {(q.match_options || ["1", "2"]).map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input value={opt} onChange={e => {
                              const newOpts = [...(q.match_options || ["1", "2"])];
                              newOpts[oi] = e.target.value;
                              updateQ(qi, "match_options", newOpts);
                            }} style={{ width: 60, textAlign: "center", padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 8, fontWeight: 700 }} />
                            {(q.match_options || []).length > 2 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }} onClick={() => {
                                updateQ(qi, "match_options", (q.match_options || []).filter((_, i) => i !== oi));
                              }}>✕</button>
                            )}
                          </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={() => updateQ(qi, "match_options", [...(q.match_options || ["1", "2"]), String((q.match_options || []).length + 1)])}>+ вариант</button>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 8 }}>
                        Левые элементы + правильный ответ
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-muted)", borderRadius: 10 }}>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 20 }}>{String.fromCharCode(1040 + ai)})</div>
                            <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
                              placeholder="Характеристика или элемент…"
                              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontFamily: "var(--f-sans)" }}/>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>→</span>
                            <select value={a.match_value || ""} onChange={e => updateA(qi, ai, "match_value", e.target.value)}
                              style={{ padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 8, fontWeight: 700, minWidth: 60 }}>
                              <option value="">?</option>
                              {(q.match_options || ["1", "2"]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {q.answers.length > 2 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeAnswer(qi, ai)}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => addAnswer(qi)}>+ Добавить строку</button>
                    </div>
                  )}
                  {/* Fill blanks */}
                  {q.question_type === "fill_blanks" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>
                        Цифры для выбора (список опций)
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                        {(q.match_options || ["1", "2"]).map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input value={opt} onChange={e => {
                              const newOpts = [...(q.match_options || ["1", "2"])];
                              newOpts[oi] = e.target.value;
                              updateQ(qi, "match_options", newOpts);
                            }} style={{ width: 60, textAlign: "center", padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 8, fontWeight: 700 }} />
                            {(q.match_options || []).length > 2 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }} onClick={() => {
                                updateQ(qi, "match_options", (q.match_options || []).filter((_, i) => i !== oi));
                              }}>✕</button>
                            )}
                          </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={() => updateQ(qi, "match_options", [...(q.match_options || ["1", "2"]), String((q.match_options || []).length + 1)])}>+ вариант</button>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 8 }}>
                        Пропуски (А, Б, В…) + правильная цифра
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-muted)", borderRadius: 10 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--green-800)", minWidth: 28 }}>{String.fromCharCode(1040 + ai)}</div>
                            <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
                              placeholder={`Пропуск ${String.fromCharCode(1040 + ai)} (подсказка или контекст)`}
                              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontFamily: "var(--f-sans)" }}/>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>→</span>
                            <select value={a.match_value || ""} onChange={e => updateA(qi, ai, "match_value", e.target.value)}
                              style={{ padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 8, fontWeight: 700, minWidth: 60 }}>
                              <option value="">?</option>
                              {(q.match_options || ["1", "2"]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {q.answers.length > 1 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeAnswer(qi, ai)}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => addAnswer(qi)}>+ Добавить пропуск</button>
                    </div>
                  )}
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

// ── Редактирование существующего теста ──────────────────────────────────────
const AdminEditTest = ({ testId, onSaved }) => {
  const [title, setTitle] = React.useState("");
  const [section, setSection] = React.useState([]);
  const [topic, setTopic] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [grade, setGrade] = React.useState("");
  const [category, setCategory] = React.useState([]);
  const [part, setPart] = React.useState([]);
  const [line, setLine] = React.useState([]);
  const [source, setSource] = React.useState([]);
  const [questions, setQuestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    API.admin.getTest(testId).then(data => {
      setTitle(data.title);
      setSection(data.section ? data.section.split(", ").filter(Boolean) : []);
      setTopic(data.topic || "");
      setDescription(data.description || "");
      setGrade(data.grade ? data.grade.split(", ").filter(Boolean) : []);
      setCategory(data.category ? data.category.split(", ").filter(Boolean) : []);
      setPart(data.part ? data.part.split(", ").filter(Boolean) : []);
      setLine(data.line ? data.line.split(", ").filter(Boolean) : []);
      setSource(data.source ? data.source.split(", ").filter(Boolean) : []);
      setQuestions(data.questions.map(q => {
        let textAnswers = undefined;
        if ((q.question_type || "single") === "text_input" && q.correct_text) {
          try { const parsed = JSON.parse(q.correct_text); if (Array.isArray(parsed)) textAnswers = parsed.map(String); } catch (_) {}
          if (!textAnswers) textAnswers = [q.correct_text];
        }
        return {
          id: q.id,
          text: q.question_text,
          hint: q.hint || "",
          explanation: q.explanation || "",
          question_type: q.question_type || "single",
          image_data: q.image_data || null,
          correct_text: q.correct_text || "",
          text_answers: textAnswers,
          match_options: q.match_options || ["1", "2"],
          expand: false,
          answers: q.answers.map(a => ({ id: a.id, text: a.answer_text, is_correct: !!a.is_correct, match_value: a.match_value || "" })),
        };
      }));
      setLoading(false);
    });
  }, [testId]);

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
      ? { ...q, answers: [...q.answers, { id: Date.now(), text: "", is_correct: false }] } : q));

  const removeAnswer = (qi, ai) =>
    setQuestions(qs => qs.map((q, i) => i === qi
      ? { ...q, answers: q.answers.filter((_, j) => j !== ai) } : q));

  const addQuestion = () => setQuestions(qs => [...qs, EMPTY_QUESTION()]);
  const removeQuestion = (qi) => setQuestions(qs => qs.filter((_, i) => i !== qi));

  const handleSave = async () => {
    if (!title.trim()) { setError("Введи название теста"); return; }
    setSaving(true); setError(null);
    try {
      await API.admin.updateTest(testId, {
        title: title.trim(), section: section.length > 0 ? section.join(", ") : null, topic: topic.trim() || null,
        description: description.trim() || null, grade: grade.length > 0 ? grade.join(", ") : null, category: category.length > 0 ? category.join(", ") : null,
        part: part.length > 0 ? part.join(", ") : null, line: line.length > 0 ? line.join(", ") : null, source: source.length > 0 ? source.join(", ") : null,
        questions: questions.map(q => {
          let correctText = null;
          if (q.question_type === "text_input") {
            const ta = (q.text_answers || []).filter(t => t && t.trim());
            if (ta.length > 1) correctText = JSON.stringify(ta.map(t => t.trim()));
            else if (ta.length === 1) correctText = ta[0].trim();
          } else {
            correctText = q.correct_text?.trim() || null;
          }
          return {
          text: q.text.trim(), hint: q.hint.trim() || null, explanation: q.explanation.trim() || null,
          question_type: q.question_type || "single",
          image_data: q.image_data || null,
          correct_text: correctText,
          match_options: q.match_options || ["1", "2"],
          answers: q.answers.map(a => ({ text: a.text.trim(), is_correct: a.is_correct ? 1 : 0, match_value: a.match_value || null })),
        };
        }),
      });
      onSaved?.();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ padding: "32px 40px", flex: 1, color: "var(--text-muted)", fontFamily: "var(--f-serif)", fontSize: 16 }}>Загрузка…</div>
  );

  return (
    <div style={{ padding: "32px 40px", flex: 1, display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          <span>Тесты</span><span>›</span><span style={{ color: "var(--text)" }}>Редактирование</span>
        </div>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32, marginBottom: 6 }}>Редактировать тест</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 20 }}>Измени название, вопросы или варианты ответа.</p>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--wrong-bg)", border: "1px solid var(--wrong)", borderRadius: "var(--r-md)", marginBottom: 16, fontSize: 14, color: "var(--wrong)" }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: 24, marginBottom: 20, overflow: "visible", transform: "none" }}>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Название теста</label>
            <input className="input input-lg" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Описание</label>
            <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)}
              style={{ resize: "vertical", fontFamily: "var(--f-sans)" }}/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div className="field">
              <label>Класс</label>
              <GradePicker value={grade} onChange={setGrade} />
            </div>
            <div className="field">
              <label>Экзамен</label>
              <ExamPicker value={category} onChange={(val) => { setCategory(val); if (!isExamCategory(val)) setPart([]); }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
            <div className="field">
              <label>Часть</label>
              <PartPicker value={part} onChange={setPart} />
            </div>
            <div className="field">
              <label>Раздел</label>
              <SectionPickerMulti value={section} onChange={setSection} />
            </div>
            <div className="field">
              <label>Тема</label>
              <TopicPicker value={topic} onChange={setTopic} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div className="field">
              <label>Источник</label>
              <SourcePicker value={source} onChange={setSource} />
            </div>
            <div className="field">
              <label>Линия</label>
              <LinePicker value={line} onChange={setLine} />
            </div>
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
                <div style={{ flex: 1, fontWeight: 500, color: q.text ? "var(--text)" : "var(--text-muted)" }} className="pre-line">
                  {q.text || "Новый вопрос"}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => updateQ(qi, "expand", !q.expand)}>
                  {q.expand ? "Свернуть" : "Открыть"}
                </button>
                {questions.length > 1 && (
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--wrong)" }} onClick={() => removeQuestion(qi)}>✕</button>
                )}
              </div>
              {q.expand && (
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Image */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 8 }}>Иллюстрация к вопросу</div>
                    {q.image_data ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img src={q.image_data} alt="" style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border-soft)", display: "block" }} />
                        <button onClick={() => updateQ(qi, "image_data", null)}
                          style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", cursor: "pointer", fontSize: 14, display: "grid", placeItems: "center" }}>✕</button>
                      </div>
                    ) : (
                      <label tabIndex={0}
                        onPaste={e => pasteImage(e, data => updateQ(qi, "image_data", data))}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 14px", border: "1.5px dashed var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-soft)", outline: "none" }}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--green-600)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                          const file = e.target.files[0]; if (!file) return;
                          uploadFileToServer(file, "questions", url => updateQ(qi, "image_data", url));
                          e.target.value = "";
                        }} />
                        📎 Файл или <kbd style={{ padding: "1px 5px", borderRadius: 4, border: "1px solid var(--border)", fontSize: 11, fontFamily: "monospace", background: "var(--bg-muted)" }}>Ctrl+V</kbd> для вставки
                      </label>
                    )}
                  </div>
                  {/* Question type */}
                  <div className="field">
                    <label>Тип вопроса</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[["single", "Один ответ"], ["text_input", "Ввод числа/текста"], ["matching", "Соответствие"], ["multiple_select", "Несколько ответов"], ["sequence", "Последовательность"], ["fill_blanks", "Заполни пропуски"]].map(([type, label]) => (
                        <button key={type} className={`btn btn-sm ${q.question_type === type ? "btn-primary" : "btn-ghost"}`}
                          onClick={() => updateQ(qi, "question_type", type)}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>Текст вопроса</label>
                    <textarea className="input" rows={3} value={q.text} onChange={e => updateQ(qi, "text", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Подсказка</label>
                    <textarea className="input" rows={2} value={q.hint} onChange={e => updateQ(qi, "hint", e.target.value)} />
                  </div>
                  {/* Single */}
                  {q.question_type === "single" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>Варианты ответа · отметь правильный</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <label key={a.id} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                            background: a.is_correct ? "var(--correct-bg)" : "var(--bg-muted)",
                            border: `1.5px solid ${a.is_correct ? "var(--correct)" : "transparent"}`,
                            borderRadius: "var(--r-md)", cursor: "pointer",
                          }}>
                            <input type="radio" checked={a.is_correct} onChange={() => updateA(qi, ai, "is_correct", true)}
                              style={{ accentColor: "var(--green-800)", width: 18, height: 18 }}/>
                            <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
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
                  )}
                  {/* Text input */}
                  {q.question_type === "text_input" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>
                        Правильные ответы · ученик введёт один из них
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(q.text_answers || [q.correct_text || ""]).map((ans, ai) => (
                          <div key={ai} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 20, fontWeight: 600 }}>{ai + 1}.</span>
                            <input className="input" value={ans}
                              onChange={e => {
                                const arr = [...(q.text_answers || [q.correct_text || ""])];
                                arr[ai] = e.target.value;
                                updateQ(qi, "text_answers", arr);
                              }}
                              placeholder={ai === 0 ? "Например: 2" : `Вариант ${ai + 1}`}
                              style={{ flex: 1 }} />
                            {(q.text_answers || []).length > 1 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}
                                onClick={() => {
                                  const arr = (q.text_answers || []).filter((_, i) => i !== ai);
                                  updateQ(qi, "text_answers", arr);
                                }}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
                        onClick={() => {
                          const arr = q.text_answers || [q.correct_text || ""];
                          updateQ(qi, "text_answers", [...arr, ""]);
                        }}>+ Добавить вариант ответа</button>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Ученик введёт ответ в текстовое поле. Все варианты считаются правильными.</div>
                    </div>
                  )}
                  {/* Multiple select */}
                  {q.question_type === "multiple_select" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>Варианты ответа · отметь все правильные</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <label key={a.id} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                            background: a.is_correct ? "var(--correct-bg)" : "var(--bg-muted)",
                            border: `1.5px solid ${a.is_correct ? "var(--correct)" : "transparent"}`,
                            borderRadius: "var(--r-md)", cursor: "pointer",
                          }}>
                            <input type="checkbox" checked={!!a.is_correct} onChange={e => updateA(qi, ai, "is_correct", e.target.checked)}
                              style={{ accentColor: "var(--green-800)", width: 18, height: 18 }}/>
                            <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
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
                  )}
                  {/* Sequence */}
                  {q.question_type === "sequence" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 4 }}>Элементы последовательности · порядок строк = правильный порядок</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Добавь элементы в правильном порядке (сверху вниз).</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-muted)", borderRadius: 10 }}>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 24, fontWeight: 700 }}>{ai + 1}.</div>
                            <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
                              placeholder={`Элемент ${ai + 1}…`}
                              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontFamily: "var(--f-sans)" }}/>
                            {q.answers.length > 2 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeAnswer(qi, ai)}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => addAnswer(qi)}>+ Добавить элемент</button>
                    </div>
                  )}
                  {/* Matching */}
                  {q.question_type === "matching" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>Правые варианты (кнопки выбора)</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                        {(q.match_options || ["1", "2"]).map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input value={opt} onChange={e => {
                              const newOpts = [...(q.match_options || ["1", "2"])];
                              newOpts[oi] = e.target.value;
                              updateQ(qi, "match_options", newOpts);
                            }} style={{ width: 60, textAlign: "center", padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 8, fontWeight: 700 }} />
                            {(q.match_options || []).length > 2 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }} onClick={() => {
                                updateQ(qi, "match_options", (q.match_options || []).filter((_, i) => i !== oi));
                              }}>✕</button>
                            )}
                          </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={() => updateQ(qi, "match_options", [...(q.match_options || ["1", "2"]), String((q.match_options || []).length + 1)])}>+ вариант</button>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 8 }}>Левые элементы + правильный ответ</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-muted)", borderRadius: 10 }}>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 20 }}>{String.fromCharCode(1040 + ai)})</div>
                            <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
                              placeholder="Характеристика или элемент…"
                              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontFamily: "var(--f-sans)" }}/>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>→</span>
                            <select value={a.match_value || ""} onChange={e => updateA(qi, ai, "match_value", e.target.value)}
                              style={{ padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 8, fontWeight: 700, minWidth: 60 }}>
                              <option value="">?</option>
                              {(q.match_options || ["1", "2"]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {q.answers.length > 2 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeAnswer(qi, ai)}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => addAnswer(qi)}>+ Добавить строку</button>
                    </div>
                  )}
                  {/* Fill blanks */}
                  {q.question_type === "fill_blanks" && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 10 }}>Цифры для выбора (список опций)</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                        {(q.match_options || ["1", "2"]).map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input value={opt} onChange={e => {
                              const newOpts = [...(q.match_options || ["1", "2"])];
                              newOpts[oi] = e.target.value;
                              updateQ(qi, "match_options", newOpts);
                            }} style={{ width: 60, textAlign: "center", padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 8, fontWeight: 700 }} />
                            {(q.match_options || []).length > 2 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }} onClick={() => {
                                updateQ(qi, "match_options", (q.match_options || []).filter((_, i) => i !== oi));
                              }}>✕</button>
                            )}
                          </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={() => updateQ(qi, "match_options", [...(q.match_options || ["1", "2"]), String((q.match_options || []).length + 1)])}>+ вариант</button>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-soft)", marginBottom: 8 }}>Пропуски (А, Б, В…) + правильная цифра</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.answers.map((a, ai) => (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-muted)", borderRadius: 10 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--green-800)", minWidth: 28 }}>{String.fromCharCode(1040 + ai)}</div>
                            <input value={a.text} onChange={e => updateA(qi, ai, "text", e.target.value)}
                              placeholder={`Пропуск ${String.fromCharCode(1040 + ai)}`}
                              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, fontFamily: "var(--f-sans)" }}/>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>→</span>
                            <select value={a.match_value || ""} onChange={e => updateA(qi, ai, "match_value", e.target.value)}
                              style={{ padding: "4px 8px", border: "1.5px solid var(--border)", borderRadius: 8, fontWeight: 700, minWidth: 60 }}>
                              <option value="">?</option>
                              {(q.match_options || ["1", "2"]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {q.answers.length > 1 && (
                              <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeAnswer(qi, ai)}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => addAnswer(qi)}>+ Добавить пропуск</button>
                    </div>
                  )}
                  <div className="field">
                    <label>Пояснение к правильному ответу</label>
                    <textarea className="input" rows={2} value={q.explanation} onChange={e => updateQ(qi, "explanation", e.target.value)}
                      style={{ resize: "vertical", fontFamily: "var(--f-sans)" }}/>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Сохранение</div>
          <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 16 }}>
            {questions.length} вопросов · тема: {topic}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary btn-lg" style={{ justifyContent: "center" }}
              disabled={saving} onClick={handleSave}>
              {saving ? "Сохраняем…" : "Сохранить изменения"}
            </button>
            <button className="btn btn-ghost" style={{ justifyContent: "center" }} onClick={() => onSaved?.()}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Панель назначения (тесты или карточки) ──────────────────────────────────
const AssignPanel = ({ assigned, available, busy, onAssign, onUnassign, labelCount, labelSuffix = "вопр." }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
    <div>
      <div className="eyebrow" style={{ marginBottom: 16 }}>Назначено · {assigned.length}</div>
      {assigned.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          Ничего не назначено.<br/>Выбери из списка справа.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {assigned.map(t => (
            <div key={t.id} className="card" style={{
              padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
              border: "1.5px solid var(--green-300)", background: "var(--green-50)",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {t.topic} · {labelCount(t)} {labelSuffix} · назначен {new Date(t.assigned_at).toLocaleDateString("ru-RU")}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--wrong)", flexShrink: 0 }}
                disabled={busy === t.id} onClick={() => onUnassign(t.id)}>
                {busy === t.id ? "…" : "Убрать"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    <div>
      <div className="eyebrow" style={{ marginBottom: 16 }}>Можно назначить · {available.length}</div>
      {available.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
          Всё уже назначено этому ученику
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {available.map(t => (
            <div key={t.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, opacity: t.is_active === 0 ? 0.55 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  {t.title}
                  {t.is_active === 0 && <span className="pill pill-muted" style={{ fontSize: 10 }}>скрыт</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{t.topic} · {labelCount(t)} {labelSuffix}</div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}
                disabled={busy === t.id} onClick={() => onAssign(t.id)}>
                {busy === t.id ? "…" : "Назначить"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Детальная карточка ученика с управлением назначениями ──
const StudentDetail = ({ studentId, onBack }) => {
  const [data, setData] = React.useState(null);
  const [cardData, setCardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(null);
  const [subtab, setSubtab] = React.useState("tests");

  const load = () => {
    setLoading(true);
    Promise.all([
      API.admin.getStudent(studentId),
      API.admin.getStudentCardSets(studentId),
    ]).then(([d, cd]) => {
      setData(d);
      setCardData(cd);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  React.useEffect(load, [studentId]);

  const assignTest = async (testId) => {
    setBusy(testId);
    await API.admin.assignTest(studentId, testId);
    const d = await API.admin.getStudent(studentId);
    setData(d);
    setBusy(null);
  };

  const unassignTest = async (testId) => {
    setBusy(testId);
    await API.admin.unassignTest(studentId, testId);
    const d = await API.admin.getStudent(studentId);
    setData(d);
    setBusy(null);
  };

  const assignCard = async (setId) => {
    setBusy(setId);
    await API.admin.assignCardSet(studentId, setId);
    const cd = await API.admin.getStudentCardSets(studentId);
    setCardData(cd);
    setBusy(null);
  };

  const unassignCard = async (setId) => {
    setBusy(setId);
    await API.admin.unassignCardSet(studentId, setId);
    const cd = await API.admin.getStudentCardSets(studentId);
    setCardData(cd);
    setBusy(null);
  };

  if (loading) return (
    <div style={{ padding: "32px 40px", flex: 1, color: "var(--text-muted)", fontFamily: "var(--f-serif)", fontSize: 16 }}>Загрузка…</div>
  );

  const { student, assigned, available, plant_progress, plant_collection } = data;

  const PLANT_NAMES_ADMIN = {
    sunflower: "Подсолнух", rose: "Роза", cactus: "Кактус",
    fern: "Папоротник", orchid: "Орхидея", tulip: "Тюльпан",
    bamboo: "Бамбук", lavender: "Лаванда", succulent: "Суккулент", chamomile: "Ромашка",
  };

  const grouped = {};
  for (const item of (plant_collection || [])) {
    if (!grouped[item.plant_type]) grouped[item.plant_type] = [];
    grouped[item.plant_type].push(item.collected_at);
  }

  return (
    <div style={{ padding: "32px 40px", flex: 1 }}>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 20 }}>
        ← Все ученики
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--green-200)", color: "var(--green-900)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 20,
        }}>{student.name[0]?.toUpperCase()}</div>
        <div>
          <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 28, lineHeight: 1.1 }}>{student.name}</h1>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            {student.attempt_count || 0} попыток ·{" "}
            {student.avg_score != null ? `средний балл ${student.avg_score}%` : "ещё не проходил тесты"} ·{" "}
            {student.last_attempt ? `последний вход ${new Date(student.last_attempt).toLocaleDateString("ru-RU")}` : "ни разу не входил"}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { id: "tests", label: `📚 Тесты (${assigned.length})` },
          { id: "cards", label: `🃏 Карточки (${cardData?.assigned?.length || 0})` },
          { id: "garden", label: `🌿 Сад (${plant_collection?.length || 0})` },
        ].map(t => (
          <div key={t.id} className={`chip ${subtab === t.id ? "active" : ""}`} onClick={() => setSubtab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {subtab === "tests" && (
        <AssignPanel
          assigned={assigned}
          available={available}
          busy={busy}
          onAssign={assignTest}
          onUnassign={unassignTest}
          labelCount={t => t.questions_count}
          labelSuffix="вопр."
        />
      )}

      {subtab === "cards" && cardData && (
        <AssignPanel
          assigned={cardData.assigned}
          available={cardData.available}
          busy={busy}
          onAssign={assignCard}
          onUnassign={unassignCard}
          labelCount={s => s.cards_count}
          labelSuffix="карт."
        />
      )}

      {subtab === "garden" && (
        <div>
          {/* Current plant */}
          {plant_progress && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 14,
              background: "var(--bg-muted)", borderRadius: 14, padding: "14px 20px",
              marginBottom: 24, fontSize: 13,
            }}>
              <span style={{ fontSize: 28 }}>🌱</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>
                  Сейчас растёт: {PLANT_NAMES_ADMIN[plant_progress.plant_type] || plant_progress.plant_type}
                </div>
                <div style={{ color: "var(--text-muted)" }}>
                  Стадия {Math.min(5, [0,1,2,3,5,7].filter(t => plant_progress.water_points >= t).length - 1)} из 5
                  {" · "}Поливов: {plant_progress.water_points}
                  {plant_progress.last_watered_date
                    ? ` · Последний полив: ${new Date(plant_progress.last_watered_date).toLocaleDateString("ru-RU")}`
                    : " · Ещё не поливал"}
                </div>
              </div>
            </div>
          )}

          {/* Collected */}
          {(plant_collection?.length || 0) === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "20px 0" }}>
              Ученик ещё не вырастил ни одного растения
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                Всего собрано: {plant_collection.length} растений
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {plant_collection.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 16px", borderRadius: 10,
                    background: "var(--bg-muted)", fontSize: 13,
                  }}>
                    <span style={{ fontSize: 20 }}>🌸</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>
                      {PLANT_NAMES_ADMIN[item.plant_type] || item.plant_type}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {new Date(item.collected_at).toLocaleDateString("ru-RU", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminStudents = () => {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState(null);
  const [newName, setNewName] = React.useState("");
  const [newGroup, setNewGroup] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);

  const load = () => {
    API.admin.getStudents()
      .then(data => { setStudents(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  React.useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await API.admin.createStudent(newName.trim(), newGroup || null);
      setNewName("");
      setNewGroup("");
      setShowCreate(false);
      load();
    } catch (err) {
      setCreateError(err.message || "Ошибка создания");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (!confirm(`Удалить ученика «${name}»? Все его данные, попытки и коллекция растений будут удалены без возможности восстановления.`)) return;
    setDeletingId(id);
    try {
      await API.admin.deleteStudent(id);
      load();
    } catch (err) {
      alert(err.message || "Ошибка удаления");
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = (e, code, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // Открыта детальная карточка ученика
  if (selectedId) {
    return <StudentDetail studentId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  if (loading) return (
    <div style={{ padding: "32px 40px", flex: 1, color: "var(--text-muted)", fontFamily: "var(--f-serif)", fontSize: 16 }}>Загрузка…</div>
  );

  return (
    <div style={{ padding: "32px 40px", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Ученики</div>
          <p style={{ color: "var(--text-soft)", marginTop: 6 }}>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? "Отмена" : "+ Добавить ученика"}
        </button>
      </div>

      {/* Create student form */}
      {showCreate && (
        <div className="card" style={{ padding: 24, marginBottom: 24, background: "var(--green-50)", border: "1.5px solid var(--green-200)" }}>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 18, marginBottom: 6 }}>Новый ученик</div>
          <p style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 16 }}>
            Введи имя — система автоматически создаст уникальный 8-значный код для входа.
          </p>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 200px", margin: 0 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Имя</label>
              <input
                className="input input-lg"
                placeholder="Например: Аня"
                value={newName}
                onChange={e => { setNewName(e.target.value); setCreateError(null); }}
                autoFocus
              />
            </div>
            <div className="field" style={{ flex: "0 0 160px", margin: 0 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Класс / группа</label>
              <select
                className="input input-lg"
                value={newGroup}
                onChange={e => setNewGroup(e.target.value)}
                style={{ cursor: "pointer" }}
              >
                <option value="">— не указан —</option>
                <option>5 класс</option>
                <option>6 класс</option>
                <option>7 класс</option>
                <option>8 класс</option>
                <option>9 класс</option>
                <option>10 класс</option>
                <option>11 класс</option>
                <option>ОГЭ</option>
                <option>ЕГЭ</option>
                <option>Студент</option>
              </select>
            </div>
            <div style={{ alignSelf: "flex-end", flexShrink: 0 }}>
              {createError && (
                <div style={{ fontSize: 12, color: "var(--wrong)", marginBottom: 6 }}>{createError}</div>
              )}
              <button type="submit" className="btn btn-primary btn-lg"
                disabled={!newName.trim() || creating}
                style={{ opacity: newName.trim() && !creating ? 1 : 0.5 }}>
                {creating ? "Создаём…" : "Создать и получить код"}
              </button>
            </div>
          </form>
        </div>
      )}

      {students.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 18, marginBottom: 8 }}>Учеников пока нет</div>
          <div style={{ fontSize: 14, marginBottom: 20 }}>Нажми «Добавить ученика», введи имя и выдай код.</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Добавить первого ученика</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 140px 80px 1.2fr 150px 110px",
            padding: "12px 20px", borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-muted)",
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
          }}>
            <div>Ученик</div><div>Код входа</div><div>Тестов</div><div>Средний балл</div><div>Последний вход</div><div></div>
          </div>
          {students.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.8fr 140px 80px 1.2fr 150px 110px",
                padding: "14px 20px", alignItems: "center",
                borderBottom: i < students.length - 1 ? "1px solid var(--border-soft)" : "none",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--green-50)"}
              onMouseLeave={e => e.currentTarget.style.background = ""}
              onClick={() => setSelectedId(s.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: ["var(--green-200)","var(--accent-soft)","var(--green-300)"][i % 3],
                  color: "var(--green-900)",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--f-serif)", fontWeight: 600, fontSize: 13,
                  flexShrink: 0,
                }}>{s.name[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                    {s.group_name && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.group_name}</div>
                    )}
                    {s.plant_collection_count > 0 && (
                      <div style={{ fontSize: 10, color: "var(--green-800)", fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
                        🌿 {s.plant_collection_count} в коллекции
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Code with copy button */}
              <div onClick={e => e.stopPropagation()}>
                {s.code ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <code style={{
                      fontFamily: "monospace", fontSize: 14, letterSpacing: "0.1em",
                      background: "var(--green-100)", padding: "3px 8px", borderRadius: 6,
                      color: "var(--green-900)", fontWeight: 700,
                    }}>{s.code}</code>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "3px 8px", fontSize: 11, flexShrink: 0 }}
                      onClick={e => copyCode(e, s.code, s.id)}
                      title="Скопировать код"
                    >
                      {copiedId === s.id ? "✓" : "📋"}
                    </button>
                  </div>
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                )}
              </div>

              <div style={{ fontFamily: "var(--f-serif)", fontSize: 16 }}>{s.attempt_count || 0}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, maxWidth: 120 }}>
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
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 12, color: "var(--green-800)", fontWeight: 600 }}
                  onClick={() => setSelectedId(s.id)}
                >
                  Назначить →
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--wrong)", padding: "4px 8px" }}
                  disabled={deletingId === s.id}
                  onClick={e => handleDelete(e, s.id, s.name)}
                  title="Удалить ученика"
                >
                  {deletingId === s.id ? "…" : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Flashcard set editor ────────────────────────────────────────────────────
const EMPTY_CARD = () => ({ id: Date.now() + Math.random(), term: "", definition: "", image_data: null });

const AdminEditCardSet = ({ editId, onSaved, autoImport = false }) => {
  const [title, setTitle] = React.useState("");
  const [section, setSection] = React.useState([]);
  const [topic, setTopic] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [grade, setGrade] = React.useState("");
  const [category, setCategory] = React.useState([]);
  const [part, setPart] = React.useState([]);
  const [line, setLine] = React.useState([]);
  const [source, setSource] = React.useState([]);
  const [cards, setCards] = React.useState([EMPTY_CARD()]);
  const [bulkText, setBulkText] = React.useState("");
  const [showBulk, setShowBulk] = React.useState(false);
  const [showImport, setShowImport] = React.useState(autoImport);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleImportCards = (data) => {
    if (data.title) setTitle(data.title);
    if (data.topic) setTopic(data.topic);
    if (data.description) setDescription(data.description || "");
    if (Array.isArray(data.cards) && data.cards.length > 0) {
      setCards(data.cards.map(c => ({
        id: Date.now() + Math.random(),
        term: c.term || c.front || "",
        definition: c.definition || c.back || "",
        image_data: c.image_data || null,
      })));
    }
    setShowImport(false);
  };

  React.useEffect(() => {
    if (!editId) return;
    API.admin.getCardSet(editId).then(data => {
      setTitle(data.title);
      setSection(data.section ? data.section.split(", ").filter(Boolean) : []);
      setTopic(data.topic || "");
      setDescription(data.description || "");
      setGrade(data.grade ? data.grade.split(", ").filter(Boolean) : []);
      setCategory(data.category ? data.category.split(", ").filter(Boolean) : []);
      setPart(data.part ? data.part.split(", ").filter(Boolean) : []);
      setLine(data.line ? data.line.split(", ").filter(Boolean) : []);
      setSource(data.source ? data.source.split(", ").filter(Boolean) : []);
      setCards(data.cards.map(c => ({ id: c.id, term: c.term, definition: c.definition, image_data: c.image_data || null })));
    });
  }, [editId]);

  const updateCard = (i, field, val) =>
    setCards(cs => cs.map((c, j) => j === i ? { ...c, [field]: val } : c));

  const addCard = () => setCards(cs => [...cs, EMPTY_CARD()]);
  const removeCard = (i) => setCards(cs => cs.filter((_, j) => j !== i));

  const applyBulk = () => {
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed = lines.map(line => {
      const sep = line.includes(" — ") ? " — " : line.includes(" - ") ? " - " : line.includes("\t") ? "\t" : null;
      if (!sep) return null;
      const idx = line.indexOf(sep);
      return { id: Date.now() + Math.random(), term: line.slice(0, idx).trim(), definition: line.slice(idx + sep.length).trim() };
    }).filter(Boolean);
    if (parsed.length) setCards(cs => [...cs.filter(c => c.term || c.definition), ...parsed]);
    setBulkText("");
    setShowBulk(false);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Введи название набора"); return; }
    const validCards = cards.filter(c => c.term.trim() && c.definition.trim());
    if (validCards.length === 0) { setError("Добавь хотя бы одну карточку"); return; }
    setSaving(true); setError(null);
    try {
      const payload = {
        title: title.trim(), section: section.length > 0 ? section.join(", ") : null, topic: topic.trim() || null,
        description: description.trim() || null, grade: Array.isArray(grade) ? grade.join(", ") : (grade || null), category: category.length > 0 ? category.join(", ") : null,
        part: part.length > 0 ? part.join(", ") : null, line: line.length > 0 ? line.join(", ") : null, source: source.length > 0 ? source.join(", ") : null,
        cards: validCards.map(c => ({ term: c.term.trim(), definition: c.definition.trim(), image_data: c.image_data || null })),
      };
      if (editId) await API.admin.updateCardSet(editId, payload);
      else await API.admin.createCardSet(payload);
      onSaved?.();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "32px 40px", flex: 1, display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          <span>Карточки</span><span>›</span><span style={{ color: "var(--text)" }}>{editId ? "Редактировать набор" : "Новый набор"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 6 }}>
          <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 32 }}>{editId ? "Редактировать набор" : "Создать набор карточек"}</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(v => !v)}>
            {showImport ? "✕ Закрыть импорт" : "📥 Импорт из JSON"}
          </button>
        </div>
        <p style={{ color: "var(--text-soft)", marginBottom: 20 }}>Добавь термины и определения. Ученик будет переворачивать карточки и запоминать.</p>

        {showImport && (
          <ImportJsonPanel type="cards" onImport={handleImportCards} onClose={() => setShowImport(false)} />
        )}

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--wrong-bg)", border: "1px solid var(--wrong)", borderRadius: "var(--r-md)", marginBottom: 16, fontSize: 14, color: "var(--wrong)" }}>
            {error}
          </div>
        )}

        {/* Meta */}
        <div className="card" style={{ padding: 24, marginBottom: 20, overflow: "visible", transform: "none" }}>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Название набора</label>
            <input className="input input-lg" value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Термины по генетике" />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Описание (необязательно)</label>
            <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Что будем учить?" style={{ resize: "vertical", fontFamily: "var(--f-sans)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div className="field">
              <label>Класс</label>
              <GradePicker value={grade} onChange={setGrade} />
            </div>
            <div className="field">
              <label>Экзамен</label>
              <ExamPicker value={category} onChange={(val) => { setCategory(val); if (!isExamCategory(val)) setPart([]); }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
            <div className="field">
              <label>Часть</label>
              <PartPicker value={part} onChange={setPart} />
            </div>
            <div className="field">
              <label>Раздел</label>
              <SectionPickerMulti value={section} onChange={setSection} />
            </div>
            <div className="field">
              <label>Тема</label>
              <TopicPicker value={topic} onChange={setTopic} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div className="field">
              <label>Источник</label>
              <SourcePicker value={source} onChange={setSource} />
            </div>
            <div className="field">
              <label>Линия</label>
              <LinePicker value={line} onChange={setLine} />
            </div>
          </div>
        </div>

        {/* Cards list */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="eyebrow">Карточки · {cards.filter(c => c.term || c.definition).length}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowBulk(v => !v)}>
              {showBulk ? "Скрыть импорт" : "⤓ Массовый импорт"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={addCard}>+ Добавить</button>
          </div>
        </div>

        {/* Bulk import */}
        {showBulk && (
          <div className="card" style={{ padding: 20, marginBottom: 16, background: "var(--green-50)", border: "1.5px solid var(--green-200)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Массовый импорт</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              По одной карточке на строку. Разделитель: <code style={{ background: "var(--bg-muted)", padding: "1px 4px", borderRadius: 3 }}> — </code> или <code style={{ background: "var(--bg-muted)", padding: "1px 4px", borderRadius: 3 }}>Tab</code>
            </p>
            <textarea className="input" rows={6}
              value={bulkText} onChange={e => setBulkText(e.target.value)}
              placeholder={"Хлоропласт — органелл, отвечающий за фотосинтез\nМитохондрия — «энергетическая станция» клетки\nРибосома — место синтеза белков"}
              style={{ resize: "vertical", fontFamily: "var(--f-sans)", fontSize: 13, marginBottom: 12 }} />
            <button className="btn btn-primary btn-sm" onClick={applyBulk} disabled={!bulkText.trim()}>
              Добавить {bulkText.split("\n").filter(l => l.trim()).length} карточек
            </button>
          </div>
        )}

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cards.map((c, i) => (
            <div key={c.id} style={{
              background: "var(--surface)", border: "1.5px solid var(--border-soft)",
              borderRadius: "var(--r-md)", padding: "12px 14px",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "center" }}>
                <textarea
                  className="input"
                  rows={2}
                  value={c.term} onChange={e => updateCard(i, "term", e.target.value)}
                  placeholder={`Термин ${i + 1}`}
                  style={{ fontSize: 14 }}
                />
                <textarea
                  className="input"
                  rows={2}
                  value={c.definition} onChange={e => updateCard(i, "definition", e.target.value)}
                  placeholder="Определение"
                  style={{ fontSize: 14 }}
                />
                {cards.length > 1 && (
                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--wrong)", padding: "4px 8px" }} onClick={() => removeCard(i)}>✕</button>
                )}
              </div>
              {/* Image */}
              <div style={{ marginTop: 8 }}>
                {c.image_data ? (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img src={c.image_data} alt="" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border-soft)", display: "block" }} />
                    <button onClick={() => updateCard(i, "image_data", null)}
                      style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", cursor: "pointer", fontSize: 12, display: "grid", placeItems: "center" }}>✕</button>
                  </div>
                ) : (
                  <label
                    onPaste={e => pasteImage(e, url => updateCard(i, "image_data", url), "flashcards")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "4px 10px", border: "1px dashed var(--border)", borderRadius: 6, fontSize: 12, color: "var(--text-muted)" }}
                  >
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                          const file = e.target.files[0]; if (!file) return;
                          uploadFileToServer(file, "flashcards", url => updateCard(i, "image_data", url));
                          e.target.value = "";
                        }} />
                    📎 Фото
                  </label>
                )}
              </div>
            </div>
          ))}

          <button className="btn btn-soft" style={{ justifyContent: "center" }} onClick={addCard}>
            + Добавить ещё карточку
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Сохранение</div>
          <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 16 }}>
            {cards.filter(c => c.term.trim()).length} карточек · тема: {topic}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary btn-lg" style={{ justifyContent: "center" }}
              disabled={saving} onClick={handleSave}>
              {saving ? "Сохраняем…" : editId ? "Сохранить изменения" : "Создать набор"}
            </button>
            <button className="btn btn-ghost" style={{ justifyContent: "center" }} onClick={() => onSaved?.()}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Список наборов карточек ─────────────────────────────────────────────────
const AdminFlashcardSets = () => {
  const [sets, setSets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editId, setEditId] = React.useState(null); // null = list, 0 = create, N = edit
  const [autoImport, setAutoImport] = React.useState(false);

  const load = () => {
    setLoading(true);
    API.admin.getCardSets().then(data => { setSets(data); setLoading(false); }).catch(() => setLoading(false));
  };
  React.useEffect(load, []);

  if (editId !== null) {
    return <AdminEditCardSet
      editId={editId || null}
      autoImport={autoImport}
      onSaved={() => { setEditId(null); setAutoImport(false); load(); }}
    />;
  }

  const handleDelete = async (id) => {
    if (!confirm("Удалить набор карточек?")) return;
    await API.admin.deleteCardSet(id);
    load();
  };

  const handleToggle = async (id) => {
    await API.admin.toggleCardSet(id);
    load();
  };

  return (
    <div style={{ padding: "32px 40px", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Карточки</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => { setAutoImport(true); setEditId(0); }}>📥 Импорт JSON</button>
          <button className="btn btn-primary" onClick={() => { setAutoImport(false); setEditId(0); }}>+ Новый набор</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontFamily: "var(--f-serif)", fontSize: 16 }}>Загрузка…</div>
      ) : sets.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Наборов пока нет.{" "}
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={() => setEditId(0)}>Создать первый</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 70px 90px 220px",
            padding: "12px 20px", borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-muted)",
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
          }}>
            <div>Набор</div><div>Карт.</div><div>Статус</div><div style={{ textAlign: "right" }}>Действия</div>
          </div>
          {sets.map((s, i) => (
            <div key={s.id} style={{
              display: "grid", gridTemplateColumns: "1fr 70px 90px 220px",
              padding: "16px 20px", alignItems: "center",
              borderBottom: i < sets.length - 1 ? "1px solid var(--border-soft)" : "none",
              opacity: s.is_active ? 1 : 0.55,
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.topic}</div>
              </div>
              <div style={{ fontFamily: "var(--f-serif)", fontSize: 18 }}>{s.cards_count}</div>
              <div>
                <span className="pill" style={{
                  background: s.is_active ? "var(--green-200)" : "var(--bg-muted)",
                  color: s.is_active ? "var(--green-900)" : "var(--text-muted)",
                  fontSize: 11,
                }}>
                  {s.is_active ? "активен" : "скрыт"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditId(s.id)}>Изменить</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(s.id)}>
                  {s.is_active ? "Скрыть" : "Показать"}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--wrong)" }} onClick={() => handleDelete(s.id)}>✕</button>
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

  const deleteResult = (id) => {
    API.admin.deleteResult(id).then(() => setResults(prev => prev.filter(r => r.id !== id)));
  };

  const deleteAll = () => {
    if (!window.confirm("Удалить все результаты?")) return;
    API.admin.deleteAllResults().then(() => setResults([]));
  };

  if (loading) return (
    <div style={{ padding: "32px 40px", flex: 1, color: "var(--text-muted)", fontFamily: "var(--f-serif)", fontSize: 16 }}>Загрузка…</div>
  );

  return (
    <div style={{ padding: "32px 40px", flex: 1 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Результаты</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--f-serif)", fontSize: 36, margin: 0 }}>Все попытки</h1>
        {results.length > 0 && (
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger, #e53)" }} onClick={deleteAll}>
            Очистить всё
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Попыток ещё не было
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 2fr 100px 100px 120px 40px",
            padding: "12px 20px", borderBottom: "1px solid var(--border-soft)",
            background: "var(--bg-muted)",
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600,
          }}>
            <div>Ученик</div><div>Тест</div><div>Баллы</div><div>Ответы</div><div>Дата</div><div></div>
          </div>
          {results.map((r, i) => (
            <div key={r.id} style={{
              display: "grid", gridTemplateColumns: "1.5fr 2fr 100px 100px 120px 40px",
              padding: "14px 20px", alignItems: "center",
              borderBottom: i < results.length - 1 ? "1px solid var(--border-soft)" : "none",
            }}>
              <div style={{ fontWeight: 500 }}>{r.user_name}</div>
              <div>
                <div>{r.test_title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.topic}</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--f-serif)", fontSize: 18 }}>
                  {r.score}/{r.max_score}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {r.max_score > 0 ? `${Math.round(r.score / r.max_score * 100)}%` : ""}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#2d9e5f" }}>✓ {r.correct_count ?? 0} верно</div>
                <div style={{ fontSize: 13, color: "#c0392b" }}>✗ {r.wrong_count ?? 0} неверно</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-soft)" }}>
                {new Date(r.completed_at).toLocaleDateString("ru-RU")}
              </div>
              <button
                onClick={() => deleteResult(r.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16, padding: "4px 6px", borderRadius: 4, lineHeight: 1 }}
                title="Удалить"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminPanel = ({ initialTab = "tests" }) => {
  const [tab, setTab] = React.useState(initialTab);
  const [importMode, setImportMode] = React.useState(false);
  const [editTestId, setEditTestId] = React.useState(null);

  const goTests = () => { setTab("tests"); setImportMode(false); setEditTestId(null); };
  const goCreate = () => { setImportMode(false); setEditTestId(null); setTab("create"); };
  const goImport = () => { setImportMode(true); setEditTestId(null); setTab("create"); };
  const goEdit = (id) => { setEditTestId(id); setTab("edit"); };

  return (
    <div className="admin-layout" style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar active={tab === "edit" ? "tests" : tab} onTab={(t) => { setTab(t); setImportMode(false); setEditTestId(null); }} />
      {tab === "tests" && <AdminTestsList onCreateNew={goCreate} onImport={goImport} onEdit={goEdit} />}
      {tab === "create" && <AdminCreateTest key={String(importMode)} autoImport={importMode} onCreated={goTests} />}
      {tab === "edit" && editTestId && <AdminEditTest testId={editTestId} onSaved={goTests} />}
      {tab === "cards" && <AdminFlashcardSets />}
      {tab === "students" && <AdminStudents />}
      {tab === "results" && <AdminResults />}
    </div>
  );
};

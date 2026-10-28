import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { ogeGrade, egeTestScore } from "../exams";
import { MockChart, WeakSections, PROGRESS_STYLES } from "../components/ProgressCards";
import { plural, shortSection } from "../components/library";

// ─── Отчёт для родителей (по секретной ссылке, без входа) ────────────────────

const fmtDate = (s) => new Date(s.replace(" ", "T") + "Z").toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

export default function ReportPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // страницу не нужно показывать в поиске
    const meta = document.createElement("meta");
    meta.name = "robots"; meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "Отчёт об успехах · Vikokon";
    API.getReport(token).then(setData).catch(e => setError(e.message));
    return () => { meta.remove(); document.title = prevTitle; };
  }, [token]);

  if (error) {
    return (
      <div className="rp-page"><style>{STYLES}</style>
        <div className="rp-wrap"><div className="rp-card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 44 }}>🔒</div>
          <h1 className="rp-title" style={{ fontSize: 26 }}>Отчёт недоступен</h1>
          <p className="rp-muted">{error}. Попросите у репетитора новую ссылку.</p>
        </div></div>
      </div>
    );
  }
  if (!data) return <div className="rp-page"><style>{STYLES}</style><div className="rp-wrap rp-muted">Загрузка…</div></div>;

  const lastMock = data.mocks[data.mocks.length - 1];
  const strong = [...data.sections].filter(s => s.pct >= 80).sort((a, b) => b.pct - a.pct).slice(0, 3);

  return (
    <div className="rp-page">
      <style>{STYLES + PROGRESS_STYLES}</style>
      <header className="rp-header">
        <img src="/tutor2.jpg" alt="" /><span>Vikokon</span>
        <span className="rp-header-sub">репетитор по биологии · Виктория Никитенко</span>
      </header>

      <main className="rp-wrap">
        <div className="rp-hero">
          <div className="rp-tag">Отчёт за последние {data.days} дней</div>
          <h1 className="rp-title">Успехи: <em>{data.name}</em></h1>
          <p className="rp-muted">Обновляется автоматически после каждого решённого теста.</p>
        </div>

        <div className="rp-stats">
          <div className="rp-stat"><b>{data.tests_done}</b><span>{plural(data.tests_done, "тест решён", "теста решено", "тестов решено")}</span></div>
          <div className="rp-stat"><b>{data.avg_pct == null ? "—" : `${data.avg_pct}%`}</b><span>средний результат</span></div>
          <div className="rp-stat"><b>{data.active_days}</b><span>{plural(data.active_days, "день занятий", "дня занятий", "дней занятий")}</span></div>
          {lastMock
            ? <div className="rp-stat"><b>{lastMock.mock_exam === "ОГЭ" ? `«${ogeGrade(lastMock.score)}»` : egeTestScore(lastMock.score)}</b>
                <span>{lastMock.mock_exam === "ОГЭ" ? "оценка за последний пробник ОГЭ" : "тестовый балл ЕГЭ (пробник)"}</span></div>
            : <div className="rp-stat"><b>🔥 {data.streak}</b><span>дней подряд на сайте</span></div>}
        </div>

        {(data.mocks.length > 0 || data.sections.length > 0) && (
          <div className="pc-row">
            <MockChart mocks={data.mocks} exam="ОГЭ" />
            <MockChart mocks={data.mocks} exam="ЕГЭ" />
            <WeakSections sections={data.sections} title="Над чем работаем" />
            {strong.length > 0 && (
              <div className="pc-card">
                <div className="pc-head"><b>Хорошо получается</b></div>
                <ul className="pc-weak">
                  {strong.map(s => (
                    <li key={s.section}><span>{shortSection(s.section)}</span>
                      <div className="pc-weak-bar"><i style={{ width: `${s.pct}%`, background: "var(--green-600)" }} /></div>
                      <b style={{ color: "var(--green-800)" }}>{s.pct}%</b></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {data.recent_tests.length > 0 && (
          <div className="rp-card">
            <div className="pc-head"><b>Последние тесты</b></div>
            <ul className="rp-list">
              {data.recent_tests.map((t, i) => (
                <li key={i}>
                  <span className="rp-list-title">{t.mock_exam && <span className="rp-mock">Пробник {t.mock_exam}</span>}{t.title}</span>
                  <span className="rp-muted">{fmtDate(t.date)}</span>
                  <b className={t.pct >= 80 ? "ok" : t.pct < 50 ? "bad" : ""}>{t.mock_exam ? `${t.score}/${t.max}` : `${t.pct}%`}</b>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.tests_done === 0 && data.mocks.length === 0 && (
          <div className="rp-card rp-muted" style={{ textAlign: "center" }}>За последний месяц решённых тестов пока нет.</div>
        )}

        <footer className="rp-foot">
          Вопросы по занятиям — Виктории Никитенко во <a href="https://vk.com/vikotiks" target="_blank" rel="noopener noreferrer">ВКонтакте</a>.
          <span> · <a href="/">vikokon.ru</a></span>
        </footer>
      </main>
    </div>
  );
}

const STYLES = `
  .rp-page { min-height: 100vh; background: var(--bg); font-family: var(--f-sans); color: var(--text); }
  .rp-header { display: flex; align-items: center; gap: 10px; padding: 14px 24px; background: var(--green-950, #0f2a1e); color: #fff; font-family: var(--f-serif); font-weight: 600; flex-wrap: wrap; }
  .rp-header img { width: 34px; height: 34px; border-radius: 9px; object-fit: cover; }
  .rp-header-sub { font-family: var(--f-sans); font-weight: 500; font-size: 13px; color: rgba(255,255,255,.65); margin-left: 6px; }
  .rp-wrap { max-width: 960px; margin: 0 auto; padding: 28px 20px 48px; }
  .rp-hero { margin-bottom: 20px; }
  .rp-tag { display: inline-block; background: var(--green-100); color: var(--green-800); border-radius: 999px; padding: 5px 14px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 12px; }
  .rp-title { font-family: var(--f-serif); font-weight: 500; font-size: clamp(30px, 4vw, 44px); line-height: 1.1; margin-bottom: 6px; }
  .rp-title em { color: var(--green-800); }
  .rp-muted { color: var(--text-muted); font-size: 14px; }
  .rp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(150px, 45%), 1fr)); gap: 12px; margin-bottom: 20px; }
  .rp-stat { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 18px; padding: 16px 18px; }
  .rp-stat b { display: block; font: 600 30px/1.1 var(--f-serif); color: var(--green-800); }
  .rp-stat span { font-size: 12px; color: var(--text-muted); font-weight: 600; }
  .rp-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 18px; padding: 16px 18px; margin-bottom: 20px; }
  .rp-list { list-style: none; margin: 0; padding: 0; }
  .rp-list li { display: grid; grid-template-columns: minmax(0, 1fr) auto 56px; gap: 12px; align-items: center; padding: 9px 0; border-top: 1px dashed var(--border-soft); font-size: 14px; }
  .rp-list li:first-child { border-top: none; }
  .rp-list-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rp-mock { font-size: 11px; font-weight: 700; background: var(--green-100); color: var(--green-800); border-radius: 999px; padding: 2px 8px; margin-right: 6px; }
  .rp-list b { text-align: right; color: #9a5a0c; } .rp-list b.ok { color: var(--green-800); } .rp-list b.bad { color: var(--wrong); }
  .rp-foot { margin-top: 28px; font-size: 13px; color: var(--text-muted); text-align: center; }
  .rp-foot a { color: var(--green-800); }
  @media (max-width: 600px) {
    .rp-header-sub { display: none; }
    .rp-list li { grid-template-columns: minmax(0, 1fr) 56px; }
    .rp-list li .rp-muted { display: none; }
  }
  @media print { .rp-header { background: #fff; color: #000; } }
`;

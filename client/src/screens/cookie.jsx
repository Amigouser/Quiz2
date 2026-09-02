import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Fern } from "../botanical";

const OPERATOR = "Никитенко Виктория Юрьевна";
const DOMAIN = "https://vikokon.ru";
const EMAIL = "nikiviki411@gmail.com";
const UPDATED = "24.04.2026";

const SECTIONS = [
  {
    n: "1",
    title: "Что такое cookie",
    intro: "Cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении сайта. Они позволяют распознавать вас при повторных визитах, сохранять настройки и обеспечивать работу определённых функций сайта.",
    blocks: [
      {
        heading: "Типы cookie-файлов:",
        bullets: [
          "Сеансовые — удаляются после закрытия браузера;",
          "Постоянные — хранятся на устройстве до установленного срока истечения;",
          "Сторонние — устанавливаются внешними сервисами и платформами.",
        ],
      },
      {
        heading: "",
        text: "Мы не используем cookie для хранения персональных данных без вашего согласия.",
      },
    ],
  },
  {
    n: "2",
    title: "Цели использования файлов cookie",
    intro: "Мы используем cookie-файлы и аналогичные технологии для следующих целей:",
    blocks: [
      {
        heading: "Обязательные (критически важные). Необходимы для корректной работы сайта:",
        bullets: [
          "Хранение содержимого корзины;",
          "Поддержка сессии и авторизации;",
          "Сохранение данных, введённых в формах, в течение одного сеанса.",
        ],
      },
      {
        heading: "Функциональные. Улучшают пользовательский опыт:",
        bullets: [
          "Запоминают выбранный язык, регион, другие настройки;",
          "Хранят информацию об уже предложенных функциях (например, онлайн-чат).",
        ],
      },
      {
        heading: "Аналитические. Используются для сбора статистических данных и оптимизации сайта:",
        bullets: [
          "Google Analytics, Яндекс.Метрика, Appsflyer и др.;",
          "Анализ пользовательских действий;",
          "Подсчёт ошибок, улучшение производительности сайта и интерфейса.",
        ],
      },
      {
        heading: "Рекламные и ссылочные.",
        text: "Позволяют оценивать эффективность рекламных кампаний и переходов с внешних источников (например, с сайтов партнёров или баннеров).",
      },
    ],
  },
  {
    n: "3",
    title: "Сторонние cookie",
    blocks: [
      {
        heading: "",
        text: "Некоторые cookie-файлы могут быть установлены сторонними сервисами (например, Google, Яндекс, VK, YouTube). Мы не управляем их использованием и не контролируем содержание таких cookie. Мы рекомендуем ознакомиться с политиками конфиденциальности этих сервисов для получения дополнительной информации.",
      },
      {
        heading: "",
        text: "Вы можете отказаться от использования сторонних cookie, изменив настройки в вашем браузере или воспользовавшись инструментами настройки на сайтах соответствующих сервисов.",
      },
    ],
  },
  {
    n: "4",
    title: "Управление cookie",
    blocks: [
      {
        heading: "",
        text: "Вы можете настроить браузер для блокировки или удаления cookie-файлов. Обратите внимание, что отключение cookie может повлиять на корректную работу некоторых функций сайта.",
      },
      {
        heading: "",
        text: "Если вы используете несколько устройств (например, смартфон и компьютер), настройки необходимо изменять отдельно для каждого устройства и браузера.",
      },
    ],
  },
  {
    n: "5",
    title: "Веб-маяки и подобные технологии",
    text: "На сайте и в электронных рассылках мы можем использовать веб-маяки (однопиксельные изображения), которые позволяют отслеживать взаимодействие с контентом. Они работают совместно с cookie и могут быть отключены при деактивации cookie или при блокировке загрузки изображений в настройках почтовой программы или браузера.",
  },
  {
    n: "6",
    title: "Обновление политики",
    text: `Актуальная версия настоящей Политики использования файлов cookie размещена в сети Интернет по адресу: ${DOMAIN}/cookie. Мы оставляем за собой право вносить в неё изменения в любое время без предварительного уведомления. Обновлённая редакция вступает в силу с момента её публикации по указанному адресу.`,
  },
];

export default function CookiePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = "Политика использования файлов cookie · Vikokon";
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--f-sans)",
    }}>
      {/* Шапка */}
      <header style={{
        position: "relative",
        padding: "56px 48px 72px",
        background: "linear-gradient(165deg, #0a1f14 0%, #0f2a1e 55%, #1b4332 100%)",
        color: "#fff",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, color: "#52b788", opacity: 0.08, pointerEvents: "none" }}>
          <Fern size={340} />
        </div>
        <div style={{ position: "absolute", bottom: -30, left: -20, color: "#74c69d", opacity: 0.06, pointerEvents: "none" }}>
          <Leaf size={220} />
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(183,228,199,0.1)",
              border: "1px solid rgba(183,228,199,0.25)",
              color: "#b7e4c7",
              borderRadius: 999, padding: "7px 16px",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer",
              marginBottom: 28,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(183,228,199,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(183,228,199,0.1)"}
          >
            ← На главную
          </button>

          <div style={{
            display: "inline-block",
            background: "rgba(183,228,199,0.14)",
            color: "#b7e4c7",
            borderRadius: 999, padding: "5px 14px",
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 18,
          }}>
            Правовая информация
          </div>

          <h1 style={{
            fontFamily: "var(--f-serif)",
            fontSize: "clamp(32px, 4.4vw, 52px)",
            fontWeight: 500, lineHeight: 1.08,
            letterSpacing: "-0.025em",
            marginBottom: 20,
            color: "#f5fbf7",
          }}>
            <span style={{ color: "#f5fbf7" }}>Политика использования</span><br/>
            <em style={{
              color: "transparent",
              backgroundImage: "linear-gradient(135deg, #b7e4c7 0%, #74c69d 55%, #95d5b2 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text",
              fontStyle: "italic",
            }}>
              файлов cookie
            </em>
          </h1>

          <div style={{
            fontSize: 14, color: "rgba(255,255,255,0.55)",
            fontWeight: 500,
          }}>
            Редакция от {UPDATED}
          </div>
        </div>
      </header>

      {/* Контент */}
      <main style={{
        maxWidth: 860, margin: "0 auto",
        padding: "64px 48px 96px",
      }}>
        <p style={{
          fontSize: 15.5, lineHeight: 1.7,
          color: "var(--text-soft)",
          marginBottom: 48,
          padding: "18px 22px",
          background: "var(--green-50)",
          border: "1px solid var(--green-200)",
          borderRadius: 12,
        }}>
          Продолжая использовать данный веб-сайт без изменения настроек браузера, вы выражаете согласие на использование cookie-файлов в соответствии с настоящей Политикой. Если вы не согласны с использованием файлов cookie, пожалуйста, измените настройки своего браузера или прекратите использование сайта.
        </p>

        {SECTIONS.map((s) => (
          <section key={s.n} style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "var(--f-serif)",
              fontSize: 26, fontWeight: 500,
              lineHeight: 1.25, letterSpacing: "-0.01em",
              marginBottom: 18,
              display: "flex", alignItems: "baseline", gap: 14,
            }}>
              <span style={{
                fontSize: 14, color: "var(--green-800)", fontWeight: 700,
                fontFamily: "var(--f-sans)",
                background: "var(--green-100)",
                borderRadius: 8,
                padding: "3px 10px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
              }}>
                § {s.n}
              </span>
              {s.title}
            </h2>

            {s.intro && (
              <p style={{
                fontSize: 15.5, lineHeight: 1.7,
                color: "var(--text-soft)",
                marginBottom: 14,
              }}>
                {s.intro}
              </p>
            )}

            {s.text && (
              <p style={{
                fontSize: 15.5, lineHeight: 1.7,
                color: "var(--text-soft)",
              }}>
                {s.text}
              </p>
            )}

            {s.blocks && s.blocks.map((b, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                {b.heading && (
                  <div style={{
                    fontWeight: 700, fontSize: 15,
                    color: "var(--text)", marginBottom: 8,
                  }}>
                    {b.heading}
                  </div>
                )}
                {b.text && (
                  <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--text-soft)", margin: 0 }}>
                    {b.text}
                  </p>
                )}
                {b.bullets && (
                  <ul style={{
                    margin: 0, paddingLeft: 0, listStyle: "none",
                    display: "flex", flexDirection: "column", gap: 8,
                  }}>
                    {b.bullets.map((x, j) => (
                      <li key={j} style={{
                        display: "flex", gap: 12,
                        fontSize: 15.5, lineHeight: 1.7,
                        color: "var(--text-soft)",
                      }}>
                        <span style={{
                          flexShrink: 0, marginTop: 11,
                          width: 5, height: 5, borderRadius: "50%",
                          background: "var(--green-700)",
                        }} />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        ))}

        <div style={{
          marginTop: 48, padding: "18px 22px",
          background: "var(--green-50)",
          border: "1px solid var(--green-200)",
          borderRadius: 12,
          fontSize: 13, color: "var(--text-soft)",
          display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between",
        }}>
          <span>
            По всем вопросам — <a href={`mailto:${EMAIL}`} style={{ color: "var(--green-800)", fontWeight: 600 }}>{EMAIL}</a>
          </span>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "var(--green-800)", color: "#fff",
              border: "none", borderRadius: 10,
              padding: "9px 20px", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Вернуться на главную
          </button>
        </div>
      </main>
    </div>
  );
}

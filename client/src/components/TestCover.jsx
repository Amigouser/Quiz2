import React from "react";
import { Fern } from "../botanical";

// ─── Обложки разделов тестов ────────────────────────────────────────────────
// Картинка выбирается по разделу теста (если его нет — по теме).
// bg — цвет фона самой картинки, им заливаются поля по бокам.
const COVERS = [
  { re: /человек|анатом/i,                 src: "/covers/anatomy.png",  bg: "#96282d" },
  { re: /генетик/i,                        src: "/covers/genetics.png", bg: "#2a2d5c" },
  { re: /прокариот|бактери|вирус/i,        src: "/covers/bacteria.jpg", bg: "#f0e4be" },
  { re: /гриб|лишайн/i,                    src: "/covers/fungi.jpg",    bg: "#f4eb8e" },
  { re: /растени|ботаник/i,                src: "/covers/botany.jpg",   bg: "#445b09" },
  { re: /животн|зоолог/i,                  src: "/covers/zoology.jpg",  bg: "#a84617" },
];

export function findCover(item) {
  for (const field of [item?.section, item?.topic]) {
    if (!field) continue;
    const hit = COVERS.find((c) => c.re.test(field));
    if (hit) return hit;
  }
  return null;
}

// Шапка карточки теста: обложка раздела или прежний зелёный фон с иконкой
export function TestCover({ item, icon, height = 110, children }) {
  const cover = findCover(item);
  return (
    <div style={{
      height,
      background: cover ? cover.bg : "linear-gradient(135deg, var(--green-100) 0%, var(--green-200) 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 44, position: "relative", overflow: "hidden",
    }}>
      {cover ? (
        <img src={cover.src} alt="" loading="lazy" style={{
          height: "100%", width: "100%", objectFit: "contain", display: "block",
        }} />
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, color: "var(--green-700)", opacity: 0.1 }}>
            <Fern size={160} style={{ position: "absolute", top: -20, right: -20 }} />
          </div>
          <span style={{ position: "relative" }}>{icon}</span>
        </>
      )}
      {item?.mock_exam && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "#fff", color: "#1b3d2a",
          padding: "3px 10px", borderRadius: 999,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        }}>Пробник {item.mock_exam}</span>
      )}
      {children}
    </div>
  );
}

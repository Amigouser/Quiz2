import React, { useState } from "react";
import API from "../api";
import PlantSVG from "./PlantSVG";

// ─── Цветок ученика ──────────────────────────────────────────────────────────
// Капли воды даются за задания (тест +1, от 80% ещё +1, пробник +3, карточки +1).
// Полить можно раз в день за 1 каплю — 7 поливов, и цветок расцветает и уходит
// в коллекцию. Без полива 3 дня цветок «грустит».

export const PLANT_NAMES = {
  sunflower: "Подсолнух", rose: "Роза", cactus: "Кактус", fern: "Папоротник", orchid: "Орхидея",
  tulip: "Тюльпан", bamboo: "Бамбук", lavender: "Лаванда", succulent: "Суккулент", chamomile: "Ромашка",
};

export function stageProgress(data) {
  if (!data || data.stage >= 5) return 100;
  const t = data.thresholds || [0, 1, 2, 3, 5, 7];
  return Math.round(((data.water_points - t[data.stage]) / (t[data.stage + 1] - t[data.stage])) * 100);
}

function Pot({ width = 100 }) {
  return (
    <div style={{ position: "relative", width, margin: "0 auto", flexShrink: 0 }}>
      <div style={{ height: width * 0.14, background: "#5a3e28", borderRadius: "4px 4px 0 0" }} />
      <div style={{ height: width * 0.52, background: "linear-gradient(160deg, #c1623f 0%, #a0472a 100%)", clipPath: "polygon(6% 0%, 94% 0%, 82% 100%, 18% 100%)" }} />
      <div style={{ height: width * 0.08, background: "#8b3a22", borderRadius: "0 0 6px 6px", width: "84%", margin: "0 auto" }} />
    </div>
  );
}

function statusText(data) {
  if (data.stage >= 5) return "Расцвёл! Забери в коллекцию 🌸";
  if (data.wilted) return "Цветок загрустил — полей его!";
  if (data.watered_today) return "Полит сегодня ✓ Приходи завтра";
  if (data.drops > 0) return "Можно полить 💧";
  return "Нет капель — пройди задание";
}

// data — ответ /api/plant; onChange(newData) — после полива/сбора
export function GardenCard({ data, onChange, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [anim, setAnim] = useState(null); // water | grew | collected
  const [error, setError] = useState(null);
  if (!data) return null;

  const ready = data.stage >= 5;

  const water = async () => {
    if (!data.can_water || busy) return;
    setBusy(true); setError(null); setAnim("water");
    try {
      const r = await API.waterPlant();
      onChange?.(r);
      setAnim(r.grew ? "grew" : "water");
    } catch (e) {
      setError(e.message === "no_drops" ? "Нет капель — пройди задание" : e.message === "already_watered" ? "Уже полит сегодня" : e.message);
    } finally {
      setBusy(false);
      setTimeout(() => setAnim(null), 1400);
    }
  };

  const collect = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await API.collectPlant();
      setAnim("collected");
      onChange?.(await API.getPlant());
    } catch (e) { setError(e.message); }
    finally { setBusy(false); setTimeout(() => setAnim(null), 1600); }
  };

  return (
    <div className={`garden${compact ? " compact" : ""}${data.wilted ? " wilted" : ""}`}>
      <div className="garden-plant">
        <div className={`garden-svg${anim === "grew" ? " grew" : ""}`}>
          <PlantSVG plantType={data.plant_type} stage={data.stage} />
          {anim === "water" && <div className="garden-drops"><i /><i /><i /><i /></div>}
          {anim === "collected" && <div className="garden-burst">🌸</div>}
        </div>
        <Pot width={compact ? 64 : 92} />
      </div>
      <div className="garden-info">
        <div className="garden-name">
          {PLANT_NAMES[data.plant_type] || data.plant_type}
          {data.streak > 0 && <span className="garden-streak" title="Дней подряд с поливом">🔥 {data.streak}</span>}
        </div>
        <div className="garden-status">{statusText(data)}</div>
        {!ready && (
          <div className="garden-bar" title={`Стадия ${data.stage} из 5`}>
            <i style={{ width: `${Math.max(4, ((data.stage + stageProgress(data) / 100) / 5) * 100)}%` }} />
          </div>
        )}
        <div className="garden-row">
          <span className="garden-drops-count" title="Капли воды">💧 {data.drops}</span>
          {ready ? (
            <button className="garden-btn collect" onClick={collect} disabled={busy}>🌸 В коллекцию</button>
          ) : (
            <button className="garden-btn" onClick={water} disabled={!data.can_water || busy}>
              {busy ? "Поливаем…" : data.watered_today ? "✓ Полито" : "Полить"}
            </button>
          )}
        </div>
        {error && <div className="garden-error">{error}</div>}
        {!compact && (
          <div className="garden-rules">
            Капли за задания: тест <b>+{data.rewards?.test ?? 1}</b>, от 80% ещё <b>+{data.rewards?.test_bonus ?? 1}</b>,
            пробник <b>+{data.rewards?.mock ?? 3}</b>, карточки <b>+{data.rewards?.cards ?? 1}</b>.
            Полить можно раз в день.{data.earned_today > 0 && <> Сегодня получено: <b>{data.earned_today} 💧</b></>}
          </div>
        )}
      </div>
    </div>
  );
}

export const GARDEN_STYLES = `
  .garden { background: linear-gradient(180deg, #eaf6ee 0%, #fdf8ea 100%); border: 1px solid var(--border-soft); border-radius: 20px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .garden.compact { flex-direction: row; align-items: center; gap: 14px; padding: 10px 14px; }
  .garden-plant { display: flex; flex-direction: column; align-items: center; }
  .garden-svg { position: relative; display: flex; justify-content: center; transition: filter .4s, transform .4s; }
  .garden-svg svg { width: 92px; height: 167px; }
  .garden.compact .garden-svg svg { width: 52px; height: 95px; }
  .garden.wilted .garden-svg { filter: saturate(.35) sepia(.35); transform: rotate(-4deg); transform-origin: bottom center; }
  .garden-svg.grew { animation: gardenGrow .6s ease; }
  @keyframes gardenGrow { 50% { transform: scale(1.12); } }
  .garden-drops { position: absolute; inset: 0; pointer-events: none; }
  .garden-drops i { position: absolute; top: 5%; width: 8px; height: 12px; background: #60c8f5; border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%; animation: gardenDrop .9s ease-out forwards; }
  .garden-drops i:nth-child(1) { left: 30%; } .garden-drops i:nth-child(2) { left: 45%; animation-delay: .12s; }
  .garden-drops i:nth-child(3) { left: 58%; animation-delay: .24s; } .garden-drops i:nth-child(4) { left: 70%; animation-delay: .36s; }
  @keyframes gardenDrop { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(60px) scale(.5); } }
  .garden-burst { position: absolute; inset: 0; display: grid; place-items: center; font-size: 56px; animation: gardenBurst 1.5s ease forwards; }
  @keyframes gardenBurst { to { opacity: 0; transform: scale(2.4) translateY(-30px); } }
  .garden-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .garden-name { display: flex; align-items: center; gap: 8px; font-family: var(--f-serif); font-size: 17px; font-weight: 600; color: var(--text); }
  .garden-streak { margin-left: auto; font-family: var(--f-sans); font-size: 13px; font-weight: 800; color: #b5541c; }
  .garden-status { font-size: 12px; color: var(--text-soft); }
  .garden.wilted .garden-status { color: #b5541c; font-weight: 700; }
  .garden-bar { height: 6px; border-radius: 9px; background: rgba(45,106,79,.12); overflow: hidden; }
  .garden-bar i { display: block; height: 100%; background: var(--green-600); border-radius: 9px; transition: width .8s ease; }
  .garden-row { display: flex; align-items: center; gap: 8px; }
  .garden-drops-count { white-space: nowrap; font-weight: 800; font-size: 14px; color: #1f6fa8; background: #e3f2fc; border-radius: 999px; padding: 6px 11px; }
  .garden-btn { margin-left: auto; border: none; border-radius: 999px; padding: 8px 16px; font: 700 13px var(--f-sans); cursor: pointer; background: #3a8ee6; color: #fff; transition: transform .15s, opacity .15s; }
  .garden-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .garden-btn:disabled { background: var(--bg-muted); color: var(--text-muted); cursor: default; }
  .garden-btn.collect { background: var(--green-800); animation: gardenGrow 1.6s ease infinite; }
  .garden-error { font-size: 12px; color: var(--wrong); }
  .garden-rules { font-size: 11px; line-height: 1.5; color: var(--text-muted); }
`;

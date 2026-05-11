import React, { useState, useEffect, useCallback } from "react";
import API from "../api";
import PlantSVG from "./PlantSVG";

const PLANT_NAMES = {
  sunflower: "Подсолнух",
  rose: "Роза",
  cactus: "Кактус",
  fern: "Папоротник",
  orchid: "Орхидея",
  tulip: "Тюльпан",
  bamboo: "Бамбук",
  lavender: "Лаванда",
  succulent: "Суккулент",
  chamomile: "Ромашка",
};

// Горшок — CSS-фигура
function Pot() {
  return (
    <div style={{ position: "relative", width: 100, margin: "0 auto", flexShrink: 0 }}>
      {/* земля */}
      <div style={{
        height: 14, background: "#5a3e28", borderRadius: "4px 4px 0 0",
        width: "100%", marginBottom: 0,
      }} />
      {/* горшок */}
      <div style={{
        width: "100%", height: 52,
        background: "linear-gradient(160deg, #c1623f 0%, #a0472a 100%)",
        clipPath: "polygon(6% 0%, 94% 0%, 82% 100%, 18% 100%)",
        position: "relative",
      }}>
        {/* полоска-блик */}
        <div style={{
          position: "absolute", top: 8, left: "20%", width: "12%", height: "60%",
          background: "rgba(255,255,255,0.15)", borderRadius: 4,
        }} />
      </div>
      {/* поддон */}
      <div style={{
        height: 8, background: "#8b3a22", borderRadius: "0 0 6px 6px",
        width: "84%", margin: "0 auto",
      }} />
    </div>
  );
}

// Капли воды при анимации
function WaterDrop({ style }) {
  return (
    <div style={{
      position: "absolute", width: 8, height: 12,
      background: "#60c8f5", borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
      opacity: 0, animation: "waterDrop 0.9s ease-out forwards",
      ...style,
    }} />
  );
}

export default function PlantWidget() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [watering, setWatering] = useState(false);
  const [drops, setDrops] = useState([]);
  const [grew, setGrew] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [justCollected, setJustCollected] = useState(null);

  const load = useCallback(() => {
    API.getPlant().then(setData).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const water = async () => {
    if (!data?.can_water || watering) return;
    setWatering(true);

    // Анимация капель
    const newDrops = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      left: `${30 + i * 10}%`,
      top: `${20 + (i % 2) * 15}%`,
      delay: `${i * 0.12}s`,
    }));
    setDrops(newDrops);
    setTimeout(() => setDrops([]), 1200);

    try {
      const res = await API.waterPlant();
      setData(res);
      if (res.grew) {
        setGrew(true);
        setTimeout(() => setGrew(false), 2000);
      }
    } catch (e) {
      if (e.message === "already_watered") load();
    } finally {
      setWatering(false);
    }
  };

  const collect = async () => {
    if (collecting) return;
    setCollecting(true);
    try {
      const res = await API.collectPlant();
      setJustCollected(res.collected);
      setTimeout(() => { setJustCollected(null); load(); }, 2200);
    } catch (_) {}
    finally { setCollecting(false); }
  };

  if (!data) return null;

  const isReady = data.stage === 5;
  const progressPct = data.stage < 5
    ? Math.round(((data.water_points - (
        [0,1,2,3,5,7][data.stage] ?? 0
      )) / (
        ([0,1,2,3,5,7][data.stage + 1] ?? 7) - ([0,1,2,3,5,7][data.stage] ?? 0)
      )) * 100)
    : 100;

  return (
    <>
      <style>{`
        @keyframes waterDrop {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          80%  { opacity: 0.6; transform: translateY(36px) scale(0.7); }
          100% { opacity: 0; transform: translateY(50px) scale(0.4); }
        }
        @keyframes growPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
        @keyframes collectBurst {
          0%   { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(2.5) translateY(-40px); }
        }
        .plant-toggle {
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .plant-toggle:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(26,52,36,0.22); }
      `}</style>

      {/* Кнопка-горшок в углу */}
      {!open && (
        <button
          className="plant-toggle"
          onClick={() => setOpen(true)}
          style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 300,
            background: "var(--surface)", border: "1.5px solid var(--border-soft)",
            borderRadius: 20, padding: "10px 16px",
            cursor: "pointer", boxShadow: "0 6px 24px rgba(26,52,36,0.14)",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <span style={{ fontSize: 26 }}>
            {isReady ? "🌸" : data.stage === 0 ? "🪴" : "🌱"}
          </span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-800)" }}>
              {PLANT_NAMES[data.plant_type] || data.plant_type}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {isReady ? "Готов к сбору!" : data.can_water ? "Можно полить 💧" : "Уже полит сегодня"}
            </div>
          </div>
          {data.collection_count > 0 && (
            <div style={{
              background: "var(--green-800)", color: "#fff",
              borderRadius: 999, fontSize: 10, fontWeight: 700,
              padding: "2px 7px", minWidth: 20, textAlign: "center",
            }}>
              {data.collection_count}
            </div>
          )}
        </button>
      )}

      {/* Развёрнутая панель */}
      {open && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 300,
          background: "var(--surface)", border: "1.5px solid var(--border-soft)",
          borderRadius: 24, boxShadow: "0 16px 48px rgba(26,52,36,0.18)",
          width: 260, padding: "20px 20px 18px",
          animation: "fadeIn 0.2s ease",
        }}>
          {/* Шапка */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green-800)" }}>
                {PLANT_NAMES[data.plant_type] || data.plant_type}
              </div>
              {data.collection_count > 0 && (
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Коллекция: {data.collection_count} 🌸
                </div>
              )}
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", fontSize: 18, lineHeight: 1, padding: 4,
            }}>✕</button>
          </div>

          {/* Зона растения */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "relative", display: "flex", justifyContent: "center",
              animation: grew ? "growPulse 0.5s ease" : "none",
            }}>
              <PlantSVG plantType={data.plant_type} stage={data.stage} />

              {/* Капли воды */}
              {drops.map(d => (
                <WaterDrop key={d.id} style={{ left: d.left, top: d.top, animationDelay: d.delay }} />
              ))}

              {/* Эффект при сборе */}
              {justCollected && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 60, animation: "collectBurst 2s ease forwards",
                  pointerEvents: "none",
                }}>🌸</div>
              )}
            </div>

            {/* Горшок */}
            <Pot />
          </div>

          {/* Стадии — точки */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14, marginBottom: 8 }}>
            {[1,2,3,4,5].map(s => (
              <div key={s} style={{
                width: s <= data.stage ? 10 : 8,
                height: s <= data.stage ? 10 : 8,
                borderRadius: "50%",
                background: s <= data.stage ? "var(--green-800)" : "var(--border-soft)",
                transition: "all 0.4s",
                alignSelf: "center",
              }} />
            ))}
          </div>

          {/* Прогресс-бар внутри стадии */}
          {!isReady && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                <span>Стадия {data.stage}/5</span>
                <span>{progressPct}%</span>
              </div>
              <div style={{ height: 5, background: "var(--border-soft)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${progressPct}%`,
                  background: "var(--green-800)", borderRadius: 999,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          )}

          {/* Кнопки */}
          {isReady ? (
            <button
              onClick={collect}
              disabled={collecting}
              style={{
                width: "100%", padding: "12px", borderRadius: 14,
                background: "linear-gradient(135deg, var(--green-700), var(--green-900))",
                color: "#fff", fontWeight: 700, fontSize: 14,
                border: "none", cursor: "pointer",
                animation: "growPulse 1.5s ease infinite",
              }}
            >
              🌸 Забрать в коллекцию
            </button>
          ) : (
            <button
              onClick={water}
              disabled={!data.can_water || watering}
              style={{
                width: "100%", padding: "11px", borderRadius: 14,
                background: data.can_water ? "var(--green-800)" : "var(--bg-muted)",
                color: data.can_water ? "#fff" : "var(--text-muted)",
                fontWeight: 600, fontSize: 14,
                border: "none",
                cursor: data.can_water ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              {watering ? "Поливаем…" : data.can_water ? "💧 Полить" : "✓ Полито сегодня"}
            </button>
          )}

          {!isReady && !data.can_water && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                Приходи завтра — можно будет полить снова
              </div>
              <button
                onClick={async () => { const r = await API.resetPlantWatering(); setData(r); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 10, color: "var(--text-muted)", textDecoration: "underline",
                  opacity: 0.5,
                }}
              >
                🔧 сбросить для теста
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

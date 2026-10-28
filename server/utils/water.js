// ─── Капли воды для цветка ───────────────────────────────────────────────────
// Ученик получает капли за задания и тратит их на полив (1 капля, раз в день).
// Так растение растёт только у тех, кто занимается, а полив раз в день
// возвращает ученика на сайт каждый день.
const { run, get, all } = require("../db");

// Сутки считаем по времени Томска (можно поменять через APP_TZ в .env)
function today(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString("sv-SE", { timeZone: process.env.APP_TZ || "Asia/Tomsk" });
}

const REWARDS = {
  test: 1,        // любой пройденный тест
  test_bonus: 1,  // + за результат от 80%
  mock: 3,        // пробник ОГЭ/ЕГЭ вместо обычной капли
  cards: 1,       // пройденный набор карточек
};

function ensurePlant(userId) {
  let plant = get("SELECT * FROM plant_progress WHERE user_id = ?", userId);
  if (!plant) {
    run("INSERT INTO plant_progress (user_id) VALUES (?)", userId);
    plant = get("SELECT * FROM plant_progress WHERE user_id = ?", userId);
  }
  return plant;
}

// Начислить капли; одно и то же задание даёт капли не чаще раза в день
function award(userId, source, refId) {
  const amount = REWARDS[source];
  if (!amount) return 0;
  ensurePlant(userId);
  try {
    run("INSERT INTO water_log (user_id, source, ref_id, day, amount) VALUES (?, ?, ?, ?, ?)",
      userId, source, String(refId), today(), amount);
  } catch (_) {
    return 0; // уже начисляли сегодня за это задание
  }
  run("UPDATE plant_progress SET water_drops = COALESCE(water_drops, 0) + ? WHERE user_id = ?", amount, userId);
  return amount;
}

// Капли за пройденный тест: +1 (пробник +3) и +1 за результат от 80%
function awardForAttempt(userId, testId, score, maxScore, isMock) {
  let total = award(userId, isMock ? "mock" : "test", testId);
  if (maxScore > 0 && score / maxScore >= 0.8) total += award(userId, "test_bonus", testId);
  return total;
}

function earnedToday(userId) {
  return get("SELECT COALESCE(SUM(amount), 0) AS s FROM water_log WHERE user_id = ? AND day = ?", userId, today()).s;
}

module.exports = { today, REWARDS, ensurePlant, award, awardForAttempt, earnedToday };

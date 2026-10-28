const router = require("express").Router();
const { run, get, all } = require("../db");
const { today, REWARDS, ensurePlant, award, earnedToday } = require("../utils/water");

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  next();
}

router.use(requireAuth);

// Очки нужны для каждой стадии (накопительно). 1 полив = 1 очко.
const THRESHOLDS = [0, 1, 2, 3, 5, 7]; // 7 поливов до цветения

const PLANTS = ["sunflower", "rose", "cactus", "fern", "orchid", "tulip", "bamboo", "lavender", "succulent", "chamomile"];

// Через сколько дней без полива цветок «грустит»
const WILT_AFTER_DAYS = 3;

function computeStage(points) {
  let stage = 0;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= THRESHOLDS[i]) { stage = i; break; }
  }
  return Math.min(stage, 5);
}

const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function buildResponse(plant, userId) {
  const now = today();
  const stage = computeStage(plant.water_points);
  const nextThreshold = THRESHOLDS[Math.min(stage + 1, THRESHOLDS.length - 1)];
  const collection = all(
    "SELECT plant_type, collected_at FROM plant_collection WHERE user_id = ? ORDER BY collected_at DESC",
    userId
  );
  const drops = plant.water_drops || 0;
  const wateredToday = plant.last_watered_date === now;
  const daysSince = plant.last_watered_date ? daysBetween(plant.last_watered_date, now) : null;
  // серия жива, если поливали сегодня или вчера
  const streak = daysSince !== null && daysSince <= 1 ? (plant.streak || 0) : 0;
  return {
    plant_type: plant.plant_type,
    stage,
    water_points: plant.water_points,
    thresholds: THRESHOLDS,
    next_threshold: nextThreshold,
    drops,
    can_water: !wateredToday && drops > 0 && stage < 5,
    watered_today: wateredToday,
    streak,
    wilted: stage > 0 && stage < 5 && daysSince !== null && daysSince >= WILT_AFTER_DAYS,
    earned_today: earnedToday(userId),
    rewards: REWARDS,
    collection_count: collection.length,
    collection,
  };
}

// GET /api/plant — текущее состояние
router.get("/plant", (req, res) => {
  const plant = ensurePlant(req.session.user.id);
  res.json(buildResponse(plant, req.session.user.id));
});

// POST /api/plant/water — полить: 1 капля, не чаще раза в день
router.post("/plant/water", (req, res) => {
  const userId = req.session.user.id;
  const now = today();
  const plant = ensurePlant(userId);

  if (plant.last_watered_date === now) return res.status(400).json({ error: "already_watered" });
  if ((plant.water_drops || 0) < 1) return res.status(400).json({ error: "no_drops" });
  if (computeStage(plant.water_points) >= 5) return res.status(400).json({ error: "ready_to_collect" });

  const oldStage = computeStage(plant.water_points);
  const newPoints = plant.water_points + 1;
  const newStage = computeStage(newPoints);
  const streak = plant.last_watered_date === today(-1) ? (plant.streak || 0) + 1 : 1;

  run(
    "UPDATE plant_progress SET water_points = ?, water_drops = water_drops - 1, last_watered_date = ?, streak = ? WHERE user_id = ?",
    newPoints, now, streak, userId
  );

  const updated = get("SELECT * FROM plant_progress WHERE user_id = ?", userId);
  res.json({ ...buildResponse(updated, userId), grew: newStage > oldStage });
});

// POST /api/plant/reward-cards — капля за пройденный набор карточек (раз в день на набор)
router.post("/plant/reward-cards", (req, res) => {
  const setId = Number(req.body.set_id);
  const set = setId ? get("SELECT id FROM flashcard_sets WHERE id = ?", setId) : null;
  if (!set) return res.status(404).json({ error: "Набор не найден" });
  const earned = award(req.session.user.id, "cards", setId);
  res.json({ earned });
});

// POST /api/plant/collect — забрать выросшее растение в коллекцию
router.post("/plant/collect", (req, res) => {
  const userId = req.session.user.id;
  const plant = ensurePlant(userId);
  const stage = computeStage(plant.water_points);

  if (stage < 5) {
    return res.status(400).json({ error: "Растение ещё не выросло" });
  }

  run("INSERT INTO plant_collection (user_id, plant_type) VALUES (?, ?)", userId, plant.plant_type);

  const collectionCount = get(
    "SELECT COUNT(*) as c FROM plant_collection WHERE user_id = ?", userId
  ).c;
  const nextPlant = PLANTS[collectionCount % PLANTS.length];

  // капли и серия сохраняются, новое растение начинается с нуля
  run(
    "UPDATE plant_progress SET plant_type = ?, water_points = 0 WHERE user_id = ?",
    nextPlant, userId
  );

  res.json({ ok: true, collected: plant.plant_type, next: nextPlant });
});

// POST /api/plant/reset-watering — только для проверки репетитором
router.post("/plant/reset-watering", (req, res) => {
  if (!req.session.user.is_admin) return res.status(403).json({ error: "Нет прав" });
  const userId = req.session.user.id;
  run("UPDATE plant_progress SET last_watered_date = NULL WHERE user_id = ?", userId);
  const plant = get("SELECT * FROM plant_progress WHERE user_id = ?", userId);
  res.json(buildResponse(plant || ensurePlant(userId), userId));
});

module.exports = router;

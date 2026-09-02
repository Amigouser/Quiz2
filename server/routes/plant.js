const router = require("express").Router();
const { run, get, all } = require("../db");

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  next();
}

router.use(requireAuth);

// Очки нужны для каждой стадии (накопительно). 1 полив = 1 очко в день.
const THRESHOLDS = [0, 1, 2, 3, 5, 7]; // итого 7 дней до финала

const PLANTS = ["sunflower", "rose", "cactus", "fern", "orchid", "tulip", "bamboo", "lavender", "succulent", "chamomile"];

function computeStage(points) {
  let stage = 0;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= THRESHOLDS[i]) { stage = i; break; }
  }
  return Math.min(stage, 5);
}

function ensurePlant(userId) {
  let plant = get("SELECT * FROM plant_progress WHERE user_id = ?", userId);
  if (!plant) {
    run("INSERT INTO plant_progress (user_id) VALUES (?)", userId);
    plant = get("SELECT * FROM plant_progress WHERE user_id = ?", userId);
  }
  return plant;
}

function buildResponse(plant, userId) {
  const today = new Date().toISOString().slice(0, 10);
  const stage = computeStage(plant.water_points);
  const nextThreshold = THRESHOLDS[Math.min(stage + 1, THRESHOLDS.length - 1)];
  const collection = all(
    "SELECT plant_type, collected_at FROM plant_collection WHERE user_id = ? ORDER BY collected_at DESC",
    userId
  );
  return {
    plant_type: plant.plant_type,
    stage,
    water_points: plant.water_points,
    next_threshold: nextThreshold,
    can_water: plant.last_watered_date !== today,
    collection_count: collection.length,
    collection,
  };
}

// GET /api/plant — текущее состояние
router.get("/plant", (req, res) => {
  const plant = ensurePlant(req.session.user.id);
  res.json(buildResponse(plant, req.session.user.id));
});

// POST /api/plant/water — полить (1 раз в день)
router.post("/plant/water", (req, res) => {
  const userId = req.session.user.id;
  const today = new Date().toISOString().slice(0, 10);
  const plant = ensurePlant(userId);

  if (plant.last_watered_date === today) {
    return res.status(400).json({ error: "already_watered" });
  }

  const oldStage = computeStage(plant.water_points);
  const newPoints = plant.water_points + 1;
  const newStage = computeStage(newPoints);

  run(
    "UPDATE plant_progress SET water_points = ?, last_watered_date = ? WHERE user_id = ?",
    newPoints, today, userId
  );

  const updated = get("SELECT * FROM plant_progress WHERE user_id = ?", userId);
  const resp = buildResponse(updated, userId);
  res.json({ ...resp, grew: newStage > oldStage });
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

  run(
    "UPDATE plant_progress SET plant_type = ?, water_points = 0, last_watered_date = NULL WHERE user_id = ?",
    nextPlant, userId
  );

  res.json({ ok: true, collected: plant.plant_type, next: nextPlant });
});

// POST /api/plant/reset-watering — сброс для тестирования
router.post("/plant/reset-watering", (req, res) => {
  const userId = req.session.user.id;
  run("UPDATE plant_progress SET last_watered_date = NULL WHERE user_id = ?", userId);
  const plant = get("SELECT * FROM plant_progress WHERE user_id = ?", userId);
  res.json(buildResponse(plant || ensurePlant(userId), userId));
});

module.exports = router;

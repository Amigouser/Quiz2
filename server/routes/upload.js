const router = require("express").Router();
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const UPLOADS_DIR = path.join(__dirname, "..", "..", "data", "uploads");
const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  next();
}

router.post("/", requireAuth, (req, res) => {
  const { data, folder } = req.body;
  if (!data || typeof data !== "string") {
    return res.status(400).json({ error: "Нет данных" });
  }

  const match = data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: "Неверный формат. Ожидается data URL." });
  }

  const mimeType = match[1];
  const base64 = match[2];
  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) {
    return res.status(400).json({ error: `Тип ${mimeType} не поддерживается. Допустимы: jpeg, png, gif, webp` });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_SIZE) {
    return res.status(400).json({ error: "Файл слишком большой (макс. 20 МБ)" });
  }

  const subfolder = folder === "flashcards" ? "flashcards" : "questions";
  const dir = path.join(UPLOADS_DIR, subfolder);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer);

  const url = `/api/uploads/${subfolder}/${filename}`;
  res.json({ url });
});

module.exports = router;

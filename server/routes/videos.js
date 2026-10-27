const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { run, get, all } = require("../db");
const { VIDEOS_DIR, enqueue, removeVideoFiles, recoverInterrupted } = require("../utils/videoCompress");

recoverInterrupted();

const MAX_UPLOAD = 2 * 1024 * 1024 * 1024; // 2 ГБ исходник; после сжатия — в разы меньше

// ─── Видео на главной (ссылки на YouTube / Rutube / VK) ────────────────────
// Храним исходную ссылку; плеер для встраивания собирает клиент (client/src/videoEmbed.js).

const ALLOWED_HOSTS = /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com|rutube\.ru|vk\.com|vk\.ru|vkvideo\.ru)$/i;

function isAllowedUrl(raw) {
  try {
    const u = new URL(String(raw).trim());
    return (u.protocol === "https:" || u.protocol === "http:") && ALLOWED_HOSTS.test(u.hostname);
  } catch (_) {
    return false;
  }
}

function requireAdmin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  if (!req.session.user.is_admin) return res.status(403).json({ error: "Нет прав" });
  next();
}

const publicRouter = require("express").Router();
const adminRouter = require("express").Router();

publicRouter.get("/videos", (req, res) => {
  res.json(all("SELECT id, kind, url, title, poster FROM videos WHERE COALESCE(status, 'ready') = 'ready' ORDER BY order_index, id"));
});

adminRouter.get("/videos", requireAdmin, (req, res) => {
  res.json(all("SELECT id, kind, url, title, poster, status, error, size_original, size_final, order_index FROM videos ORDER BY order_index, id"));
});

adminRouter.post("/videos", requireAdmin, (req, res) => {
  const { url, title } = req.body;
  if (!isAllowedUrl(url)) {
    return res.status(400).json({ error: "Нужна ссылка на видео YouTube, Rutube или ВКонтакте" });
  }
  const next = get("SELECT COALESCE(MAX(order_index), -1) + 1 AS n FROM videos").n;
  const r = run("INSERT INTO videos (url, title, order_index) VALUES (?, ?, ?)", String(url).trim(), (title || "").trim() || null, next);
  res.json({ id: r.lastInsertRowid });
});

// Загрузка видеофайла: тело запроса — сам файл (не JSON), ?title=… — подпись.
// Файл пишется на диск потоком, потом в фоне сжимается ffmpeg.
adminRouter.post("/videos/upload", requireAdmin, (req, res) => {
  const type = String(req.headers["content-type"] || "");
  if (!type.startsWith("video/") && type !== "application/octet-stream") {
    return res.status(400).json({ error: "Это не видеофайл" });
  }
  const declared = Number(req.headers["content-length"] || 0);
  if (declared > MAX_UPLOAD) return res.status(413).json({ error: "Файл больше 2 ГБ" });

  const tmp = path.join(VIDEOS_DIR, `upload-${crypto.randomBytes(8).toString("hex")}`);
  const out = fs.createWriteStream(tmp);
  let size = 0, aborted = false;

  const fail = (status, msg) => {
    if (aborted) return;
    aborted = true;
    out.destroy();
    try { fs.unlinkSync(tmp); } catch (_) {}
    if (!res.headersSent) res.status(status).json({ error: msg });
  };

  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > MAX_UPLOAD) { fail(413, "Файл больше 2 ГБ"); req.destroy(); }
  });
  req.on("aborted", () => fail(400, "Загрузка прервана"));
  out.on("error", () => fail(500, "Не удалось сохранить файл"));
  req.pipe(out);

  out.on("finish", () => {
    if (aborted) return;
    if (size === 0) return fail(400, "Пустой файл");
    const next = get("SELECT COALESCE(MAX(order_index), -1) + 1 AS n FROM videos").n;
    const title = String(req.query.title || "").trim().slice(0, 200) || null;
    const id = run(
      "INSERT INTO videos (kind, url, title, order_index, status, size_original) VALUES ('file', '', ?, ?, 'processing', ?)",
      title, next, size
    ).lastInsertRowid;
    run("UPDATE videos SET url = ? WHERE id = ?", `/media/videos/${id}.mp4`, id);
    enqueue(id, tmp);
    res.json({ id, status: "processing" });
  });
});

adminRouter.put("/videos/:id", requireAdmin, (req, res) => {
  const { url, title } = req.body;
  if (url !== undefined && !isAllowedUrl(url)) {
    return res.status(400).json({ error: "Нужна ссылка на видео YouTube, Rutube или ВКонтакте" });
  }
  const v = get("SELECT * FROM videos WHERE id = ?", req.params.id);
  if (!v) return res.status(404).json({ error: "Видео не найдено" });
  run("UPDATE videos SET url = ?, title = ? WHERE id = ?",
    url !== undefined && v.kind !== "file" ? String(url).trim() : v.url,
    title !== undefined ? ((title || "").trim() || null) : v.title,
    v.id);
  res.json({ ok: true });
});

// Порядок: массив id сверху вниз
adminRouter.put("/videos-order", requireAdmin, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids должен быть массивом" });
  ids.forEach((id, i) => run("UPDATE videos SET order_index = ? WHERE id = ?", i, id));
  res.json({ ok: true });
});

adminRouter.delete("/videos/:id", requireAdmin, (req, res) => {
  const v = get("SELECT id, kind FROM videos WHERE id = ?", req.params.id);
  if (v?.kind === "file") removeVideoFiles(v.id);
  run("DELETE FROM videos WHERE id = ?", req.params.id);
  res.json({ ok: true });
});

module.exports = { publicRouter, adminRouter };

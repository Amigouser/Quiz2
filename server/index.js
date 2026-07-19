require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const requestLogger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === "production";

// ── Генерация секрета сессий при первом запуске ──────────────────────────────
const envPath = path.join(__dirname, "..", ".env");
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret === "change-me-to-a-random-secret-in-production" || sessionSecret === "dev-secret-change-me") {
  if (IS_PROD) {
    // В продакшене — генерируем и записываем в .env
    sessionSecret = crypto.randomBytes(32).toString("hex");
    try {
      const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
      if (envContent.includes("SESSION_SECRET=")) {
        fs.writeFileSync(envPath, envContent.replace(/SESSION_SECRET=.*/, `SESSION_SECRET=${sessionSecret}`));
      } else {
        fs.appendFileSync(envPath, `\nSESSION_SECRET=${sessionSecret}\n`);
      }
      console.log("SESSION_SECRET сгенерирован и записан в .env");
    } catch (e) {
      console.error("Не удалось записать SESSION_SECRET в .env:", e.message);
      process.exit(1);
    }
  } else {
    // В dev — просто генерируем для текущего запуска
    sessionSecret = crypto.randomBytes(32).toString("hex");
    console.warn("⚠️  SESSION_SECRET не задан или использует значение по умолчанию. Сгенерирован временный секрет для этого запуска.");
  }
}

app.set("trust proxy", 1);
app.use(requestLogger);
app.use(express.json({ limit: "5mb" }));

// ── Rate-limiter для логина ───────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Слишком много попыток. Попробуйте через 15 минут." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Rate-limiter для админ-эндпоинтов ────────────────────────────────────────
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Слишком много запросов. Подождите минуту." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Rate-limiter для восстановления (тяжёлая операция) ────────────────────────
const restoreLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: { error: "Слишком много восстановлений. Подождите 5 минут." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, "..", "data", "sessions"),
      ttl: 7 * 24 * 60 * 60,
      retries: 1,
      logFn: () => {},
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/tests"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/admin/results", adminLimiter);
app.use("/api/admin/restore", restoreLimiter);
app.use("/api/admin", adminLimiter);
app.use("/api/admin", require("./routes/admin"));
const flashcards = require("./routes/flashcards");
app.use("/api", flashcards.student);
app.use("/api/admin", flashcards.admin);
app.use("/api", require("./routes/plant"));

const uploadsDir = path.join(__dirname, "..", "data", "uploads");
app.use("/api/uploads", express.static(uploadsDir));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(clientDist, "index.html")));

const sessionsDir = path.join(__dirname, "..", "data", "sessions");
function cleanupSessions() {
  try {
    const fs = require("fs");
    const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith(".json"));
    const now = Date.now();
    let cleaned = 0;
    for (const file of files) {
      try {
        const stat = fs.statSync(path.join(sessionsDir, file));
        if (now - stat.mtimeMs > 7 * 24 * 60 * 60 * 1000) {
          fs.unlinkSync(path.join(sessionsDir, file));
          cleaned++;
        }
      } catch (_) {}
    }
    if (cleaned > 0) console.log(`Cleaned ${cleaned} expired sessions`);
  } catch (_) {}
}
setInterval(cleanupSessions, 6 * 60 * 60 * 1000);
cleanupSessions();

const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(() => {
    const { db } = require("./db");
    try { db.close(); } catch (_) {}
    console.log("Server stopped.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

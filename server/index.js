require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");
const rateLimit = require("express-rate-limit");
const requestLogger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);
app.use(requestLogger);
app.use(express.json({ limit: "50mb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Слишком много попыток. Попробуйте через 15 минут." },
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
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/tests"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/admin", require("./routes/admin"));
const flashcards = require("./routes/flashcards");
app.use("/api", flashcards.student);
app.use("/api/admin", flashcards.admin);
app.use("/api", require("./routes/plant"));

const uploadsDir = path.join(__dirname, "..", "data", "uploads");
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

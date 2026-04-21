const router = require("express").Router();
const { run, get } = require("../db");

router.post("/login", (req, res) => {
  const { code } = req.body;
  if (!code || !String(code).trim()) return res.status(400).json({ error: "Код обязателен" });

  const trimmed = String(code).trim();

  // Специальный вход для администратора
  if (trimmed.toLowerCase() === "admin") {
    const admin = get("SELECT * FROM users WHERE is_admin = 1");
    if (!admin) return res.status(404).json({ error: "Администратор не найден" });
    req.session.user = { id: admin.id, name: admin.name, is_admin: admin.is_admin };
    return res.json({ user: req.session.user });
  }

  // Вход ученика по коду
  const user = get("SELECT * FROM users WHERE code = ? AND is_admin = 0", trimmed);
  if (!user) return res.status(404).json({ error: "Код не найден. Попроси код у репетитора." });

  req.session.user = { id: user.id, name: user.name, is_admin: user.is_admin };
  res.json({ user: req.session.user });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Не авторизован" });
  res.json({ user: req.session.user });
});

module.exports = router;

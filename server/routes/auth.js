const router = require("express").Router();
const { run, get } = require("../db");

router.post("/login", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Имя обязательно" });

  const trimmed = name.trim();
  const isAdmin = trimmed.toLowerCase() === "admin" ? 1 : 0;

  let user = get("SELECT * FROM users WHERE name = ?", trimmed);
  if (!user) {
    const r = run("INSERT INTO users (name, is_admin) VALUES (?, ?)", trimmed, isAdmin);
    user = get("SELECT * FROM users WHERE id = ?", r.lastInsertRowid);
  }

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

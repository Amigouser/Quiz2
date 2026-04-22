const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, "..", "data", "sessions"),
      ttl: 7 * 24 * 60 * 60,
      retries: 1,
    }),
    secret: "zhivaya-kletka-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/tests"));
app.use("/api/admin", require("./routes/admin"));
const flashcards = require("./routes/flashcards");
app.use("/api", flashcards.student);
app.use("/api/admin", flashcards.admin);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

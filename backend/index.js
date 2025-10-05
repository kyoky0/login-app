const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");

const app = express();
const db = new sqlite3.Database("./users.db");
const SECRET = "secretkey123"; // JWT用の秘密鍵

app.use(cors());
app.use(express.json());

// ユーザー用テーブル作成
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// 新規登録
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed], function (err) {
    if (err) return res.status(400).json({ error: "ユーザー名が既に存在します" });
    res.json({ success: true });
  });
});

// ログイン
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (!row) return res.status(400).json({ error: "ユーザーが見つかりません" });
    const valid = bcrypt.compareSync(password, row.password);
    if (!valid) return res.status(400).json({ error: "パスワードが違います" });

    // JWT 発行
    const token = jwt.sign({ id: row.id, username: row.username }, SECRET, { expiresIn: "1h" });
    res.json({ success: true, token });
  });
});

// 認証確認用
app.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "認証が必要です" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ error: "無効なトークンです" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


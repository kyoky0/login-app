import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// TODO: デプロイ後にここにRailwayのURLを入れる
const API_URL = "https://YOUR_RAILWAY_URL_HERE"; // 例: https://my-login-app.up.railway.app

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? "register" : "login";

    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        if (!isRegister) {
          localStorage.setItem("token", data.token);
          window.location.href = "/dashboard";
        } else {
          setMessage("登録に成功しました！🎉 ログインしてください");
        }
      } else {
        setMessage(data.error || "エラーが発生しました");
      }
    } catch (err) {
      setMessage("サーバーに接続できません");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>{isRegister ? "新規登録" : "ログイン"}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="ユーザー名" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <input type="password" placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        <button type="submit" style={{ width: "100%", padding: 10, background: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>{isRegister ? "登録" : "ログイン"}</button>
      </form>
      <p style={{ marginTop: 20 }}>
        {isRegister ? "すでにアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}{" "}
        <button onClick={() => { setIsRegister(!isRegister); setMessage(""); }} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>
          {isRegister ? "ログインへ" : "新規登録へ"}
        </button>
      </p>
      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        else window.location.href = "/";
      })
      .catch(() => window.location.href = "/");
  }, []);

  if (!user) return <p>読み込み中…</p>;

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h2>ダッシュボード</h2>
      <p>ようこそ、{user.username}さん！</p>
      <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}>ログアウト</button>
    </div>
  );
}

export default App;

// קומפוננטת התחברות מדברת עם השרת (/api/login)

import { useState } from "react";
import "./LoginForm.css";

const API_URL = "http://localhost:3000/api";

export default function LoginForm({ onLoginSuccess, switchToRegister, errorMsg, setErrorMsg }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "התחברות נכשלה");

      onLoginSuccess({ userId: data.userId, username: data.username, token: data.token });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>התחברות למערכת</h2>
      {errorMsg && <p className="auth-error">{errorMsg}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit" className="login-submit-btn">
          התחבר
        </button>
      </form>
      <p className="auth-switch-text">
        אין לך חשבון?{" "}
        <span onClick={switchToRegister} className="login-switch-link">
          להרשמה
        </span>
      </p>
    </div>
  );
}
// קומפוננטת הרשמה מדברת עם השרת (/api/signup)

import { useState } from "react";
import "./RegisterForm.css";

const API_URL = "http://localhost:3000/api";

export default function RegisterForm({ onRegisterSuccess, switchToLogin, errorMsg, setErrorMsg }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "הרשמה נכשלה");

      alert("נרשמת בהצלחה! כעת התחברי למערכת.");
      onRegisterSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>הרשמה לאתר</h2>
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
        <button type="submit" className="register-submit-btn">
          הירשם
        </button>
      </form>
      <p className="auth-switch-text">
        כבר יש לך חשבון?{" "}
        <span onClick={switchToLogin} className="register-switch-link">
          להתחברות
        </span>
      </p>
    </div>
  );
}
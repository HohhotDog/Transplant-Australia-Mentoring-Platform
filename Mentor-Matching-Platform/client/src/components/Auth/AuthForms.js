// src/components/AuthForms.js
import React, { useState } from "react";

function AuthForms({ onLoginSuccess }) {
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: regUsername, password: regPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert("🎉 Account created! You can now log in.");
        setRegUsername("");
        setRegPassword("");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error registering user");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Logged in successfully!");
        onLoginSuccess(); // Notify parent component
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  }

  return (
    <div className="auth-container">
      <h2>🚀 Create an Account</h2>
      <form onSubmit={handleRegister}>
        <label>Username</label>
        <input
          value={regUsername}
          onChange={(e) => setRegUsername(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={regPassword}
          onChange={(e) => setRegPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>

      <hr />

      <h2>🔑 Log In</h2>
      <form onSubmit={handleLogin}>
        <label>Username</label>
        <input
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default AuthForms;

// src/components/Auth/LoginForm.js
import React, { useState } from "react";



function LoginForm({ onLoginSuccess }) {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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
      
        onLoginSuccess(); 
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
        <button className="bg-btnorange" type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;

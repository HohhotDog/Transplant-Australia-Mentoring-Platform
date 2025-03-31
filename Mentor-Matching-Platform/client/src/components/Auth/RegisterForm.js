// src/components/Auth/RegisterForm.js
import React, { useState } from "react";

function RegisterForm({ onRegisterSuccess }) {
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

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
        onRegisterSuccess(); // Call the function to handle successful registration
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
    </div>
  );
}

export default RegisterForm;

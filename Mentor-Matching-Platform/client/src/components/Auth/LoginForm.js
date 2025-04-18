// src/components/Auth/LoginForm.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../Navigation/NavBar";
import "../../components/Auth/style/Register.css";

function LoginForm({ onLoginSuccess, isLoggedIn, handleLogout }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
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
      <div>
        <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />

        <div className="login-container">
          <div className="login-carousel">
            <div className="carousel-item">
              <img src="/images/login1.jpg" alt="1" />
              <p>Embracing New Beginnings</p>
            </div>
            <div className="carousel-item">
              <img src="/images/login2.jpg" alt="2" />
              <p>Guiding Lights Through the Transplant Journey</p>
            </div>
            <div className="carousel-item">
              <img src="/images/login3.jpg" alt="3" />
              <p>Sharing Stories, Building Connections</p>
            </div>
            <div className="carousel-item">
              <img src="/images/login4.jpg" alt="4" />
              <p>Hope and Resilience</p>
            </div>
          </div>

          <h2 className="login-title">Welcome To Transplant Australia Mentoring Platform</h2>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                  type="email"
                  placeholder="tanya.johnson@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
              />
            </div>
            <div className="login-links">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button type="submit" className="login-btn">Sign in</button>
            <p className="login-footer">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </form>
        </div>
      </div>
  );
}

export default LoginForm;

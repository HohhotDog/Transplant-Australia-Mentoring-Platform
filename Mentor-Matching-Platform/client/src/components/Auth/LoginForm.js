// src/components/Auth/LoginForm.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../components/Auth/style/Login.css";

function LoginForm({ onLoginSuccess, isLoggedIn, handleLogout }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const navigate = useNavigate();

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
        onLoginSuccess(data.account_type, data.avatar_url);

        if (data.account_type === 1) {
          navigate("/admin");
        } else {
          navigate("/sessions");
        }
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  }

  return (
      <div className="login-container">
        <div className="login-carousel">
          <div className="carousel-item">
            <img src="/images/Login/1.jpg" alt="1" />
            <p>Embracing New Beginnings</p>
          </div>
          <div className="carousel-item">
            <img src="/images/Login/2.jpg" alt="2" />
            <p>Guiding Lights Through the Transplant Journey</p>
          </div>
          <div className="carousel-item">
            <img src="/images/Login/3.jpg" alt="3" />
            <p>Sharing Stories, Building Connections</p>
          </div>
          <div className="carousel-item">
            <img src="/images/Login/4.jpg" alt="4" />
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

        {/* Back to Home Button */}
        <div className="flex justify-center mt-6">
          <button
              onClick={() => navigate("/")}
              className="bg-[#ff6f00] hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
  );
}

export default LoginForm;

// src/components/Auth/RegisterForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Navigation/NavBar";
import "../../components/Auth/style/Register.css";

function RegisterForm({ isLoggedIn, handleLogout }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

  async function handleRegister(e) {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert("Password must be at least 6 characters long and include at least one uppercase, one lowercase, one number, and one special character.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          securityQuestion,
          securityAnswer,
        }),
      });

      const data = await res.json();
      if (data.success) {
        navigate("/register-success");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error registering user");
    }
  }

  return (
      <div>
        <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <div className="form-container">
          <h2 className="form-title">Create your account</h2>
          <form onSubmit={handleRegister} className="form-box">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="form-password-toggle">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <span className="toggle-icon" onClick={() => setShowPassword(!showPassword)}>👁️</span>
              </div>
              <small className="form-note">
                Password must be at least 6 characters long with at least one uppercase, one lowercase letter, one number, and one symbol.
              </small>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="form-password-toggle">
                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <span className="toggle-icon" onClick={() => setShowPassword(!showPassword)}>👁️</span>
              </div>
            </div>

            <div className="form-group">
              <label>Select a security question</label>
              <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} required>
                <option value="">-- Choose a question --</option>
                <option value="What is your childhood pet's name?">What is your childhood pet's name?</option>
                <option value="What is the name of your first school?">What is the name of your first school?</option>
                <option value="In what city were you born?">In what city were you born?</option>
                <option value="What is your favorite teacher's name?">What is your favorite teacher's name?</option>
              </select>
            </div>

            <div className="form-group">
              <label>Your Answer</label>
              <input type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required />
            </div>

            <button className="form-btn" type="submit">Next</button>
            <p className="form-footer">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
          </form>
        </div>
      </div>
  );
}

export default RegisterForm;

// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SurveyPage from "./pages/SurveyPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function handleLoginSuccess() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    fetch("/api/logout", { method: "POST", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("👋 Logged out!");
          setIsLoggedIn(false);
        }
      })
      .catch((err) => console.error(err));
  }

  return (
    <Router>
      <div className="container">
        <h1>🧑‍💻 Mentor-Mentee Portal</h1>
        <nav>
          <Link to="/">Home</Link>{" "}
          {isLoggedIn && (
            <>
              | <Link to="/survey">Survey</Link> | <Link to="/profile">Profile</Link> |{" "}
              <Link to="/admin">Admin</Link>
            </>
          )}
        </nav>
        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
        <Routes>
          <Route
            path="/"
            element={<HomePage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

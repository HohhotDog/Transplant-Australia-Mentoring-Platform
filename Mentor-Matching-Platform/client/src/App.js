// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SurveyPage from "./pages/SurveyPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

// Import NavBar component
import NavBar from "./components/Navigation/NavBar";



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
        <h1>👩‍💻 Mentor-Mentee Portal</h1>
        <NavBar isLoggedIn={isLoggedIn} />
        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

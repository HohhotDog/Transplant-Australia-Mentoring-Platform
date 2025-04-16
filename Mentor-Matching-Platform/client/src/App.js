// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import SurveyPage from "./pages/Mentorship/SurveyPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/Admin/AdminPage";
import SessionPage from "./pages/Mentorship/ExploreSessionPage";
import MentorshipSessionDetailPage from './pages/Mentorship/MentorshipSessionDetailPage';


// Import global layout component
import Layout from "./components/Layout";

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
      <Routes>
        {/* Routes using the global layout */}
        <Route
          path="/"
          element={
            <Layout isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
          }
        >
          <Route index element={<HomePage />} />
          <Route path="survey" element={<SurveyPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="session" element={<SessionPage />} />
          <Route path="sessions/:id" element={<MentorshipSessionDetailPage />} />
        </Route>

        {/* Routes without the global layout */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;

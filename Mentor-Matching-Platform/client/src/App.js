// src/App.js
import React, { useState } from "react";
import "./App.css";
import AuthForms from "./components/AuthForms";
import SurveyForm from "./components/SurveyForm";
import MatchResult from "./components/MatchResult";

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
    <div className="container">
      <h1>🧑‍💻 Mentor-Mentee Portal</h1>
      {!isLoggedIn ? (
        <AuthForms onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <SurveyForm />
          <hr />
          <MatchResult />
        </>
      )}
    </div>
  );
}

export default App;

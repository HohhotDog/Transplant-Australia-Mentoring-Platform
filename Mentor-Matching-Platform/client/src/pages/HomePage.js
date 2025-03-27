// src/pages/HomePage.js
import React from "react";
import AuthForms from "../components/Auth/AuthForms";

const HomePage = ({ onLoginSuccess }) => {
  return (
    <div>
      <h2>Welcome to Mentor-Mentee Platform</h2>
      <AuthForms onLoginSuccess={onLoginSuccess} />
    </div>
  );
};

export default HomePage;

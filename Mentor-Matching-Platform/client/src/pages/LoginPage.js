// src/pages/LoginPage.js
import React from "react";
import LoginForm from "../components/Auth/LoginForm";
import { useNavigate } from "react-router-dom";


function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();  // initialize navigate
  // Function to handle successful login
  function handleLoginSuccess() {
    alert("✅ Logged in successfully!");
    onLoginSuccess();  // Call the parent function to update login state
    navigate("/");  // Redirect to home page
  }
  return (
    <div>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default LoginPage;

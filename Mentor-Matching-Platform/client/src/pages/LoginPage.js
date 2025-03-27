// src/pages/LoginPage.js
import React from "react";
import LoginForm from "../components/Auth/LoginForm";

function LoginPage({ onLoginSuccess }) {
  return (
    <div>
      <LoginForm onLoginSuccess={onLoginSuccess} />
    </div>
  );
}

export default LoginPage;

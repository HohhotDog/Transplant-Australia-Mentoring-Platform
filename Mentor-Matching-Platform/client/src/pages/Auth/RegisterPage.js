import React from "react";
import RegisterForm from "../../components/Auth/RegisterForm";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();

  function handleRegisterSuccess() {
    alert("✅ Registered successfully! Redirecting to login...");
    navigate("/login");
  }

  return (
    <div>
      <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
}

export default RegisterPage;

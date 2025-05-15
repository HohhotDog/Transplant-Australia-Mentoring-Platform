// src/pages/Auth/LoginPage.js
import React from "react";
import LoginForm from "../../components/Auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/context/UserContext";

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();  // initialize navigate
  const { setUser } = useUser();  // get setUser from UserContext

  // Function to handle successful login
  function handleLoginSuccess(email, password) {
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetch("/api/me")
            .then((res) => res.json())
            .then((userData) => {
              if (userData.success) {
                setUser({
                  id: userData.id,
                  email: userData.email,
                  account_type: userData.account_type,
                  avatar_url: userData.avatar_url,
                });
                // Now user.id will be available everywhere!
                onLoginSuccess();  // Call the parent function to update login state
                navigate("/");  // Redirect to home page
              }
            });
        } else {
          alert("Login failed.");
        }
      });
  }

  return (
    <div>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default LoginPage;

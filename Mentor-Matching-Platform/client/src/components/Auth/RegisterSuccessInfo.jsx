// src/components/Auth/RegisterSuccessInfo.jsx
import React from "react";
import { Link } from "react-router-dom";
import NavBar from "../Navigation/NavBar";
import "../../components/Auth/style/RegSuccessInfo.css";

function RegisterSuccessInfo({ isLoggedIn, handleLogout }) {
    return (
        <div>
            <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
            <div className="success-container">
                <img
                    src="/images/RegSuccessInfo/1.jpg"
                    alt="Welcome illustration"
                    className="success-image"
                />
                <h2 className="success-title">Welcome to Transplant Australia Mentoring</h2>
                <p className="success-description">
                    Your account has been successfully created! You’re now one step closer to
                    connecting with a mentor who understands your journey. Take a moment to
                    explore your profile settings and complete your mentorship preferences to
                    enhance your experience. We're thrilled to have you aboard!
                </p>
                <Link to="/profile">
                    <button className="form-btn">Go to Log-in Page</button>
                </Link>
                <p className="success-tagline">Embracing the journey, together.</p>
            </div>
        </div>
    );
}

export default RegisterSuccessInfo;

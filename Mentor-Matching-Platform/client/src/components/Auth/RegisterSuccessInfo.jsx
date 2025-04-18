// src/components/Auth/RegisterSuccessInfo.jsx
import React from "react";
import { Link } from "react-router-dom";
import NavBar from "../Navigation/NavBar"; // ✅ 引入 NavBar
import "../../components/Auth/style/Register.css";

function RegisterSuccessInfo({ isLoggedIn, handleLogout }) { // ✅ 接收 props
    return (
        <div>
            {/* ✅ 显示顶部导航栏 */}
            <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />

            <div className="auth-container text-center">
                <img
                    src="/images/success-graphic.png"
                    alt="Welcome illustration"
                    style={{
                        width: "100%",
                        maxWidth: "600px",
                        borderRadius: "12px",
                        margin: "0 auto",
                    }}
                />
                <h2 className="mt-6 font-bold text-xl">
                    Welcome to Transplant Australia Mentoring
                </h2>
                <p className="my-4 text-gray-700">
                    Your account has been successfully created! You’re now one step
                    closer to connecting with a mentor who understands your journey.
                    Take a moment to explore your profile settings and complete your
                    mentorship preferences to enhance your experience. We're thrilled to
                    have you aboard!
                </p>
                <Link to="/">
                    <button className="bg-btnorange">Go to Home</button>
                </Link>
                <p className="mt-2 text-sm text-gray-500">
                    Embracing the journey, together.
                </p>
            </div>
        </div>
    );
}

export default RegisterSuccessInfo;

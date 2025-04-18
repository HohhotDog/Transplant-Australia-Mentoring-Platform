// src/components/Navigation/NavBar.js
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NavBar = ({ isLoggedIn, handleLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isOnRegisterPage = location.pathname === "/register";
    const isOnLoginPage = location.pathname === "/login";
    const handleProfileClick = async () => {
        try {
            const res = await fetch("/api/profile", {
                method: "GET",
                credentials: "include",
            });

            if (res.status === 200) {
                // Profile exists
                navigate("/profile");
            } else if (res.status === 404) {
                // Profile not found
                alert("⚠️ You need to complete your profile first.");
                navigate("/profile-creation");
            } else if (res.status === 401) {
                // Not logged in
                alert("Please log in first.");
                navigate("/login");
            } else {
                // Unexpected response
                alert("Unexpected error.");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Unable to fetch profile info.");
        }
    };


    return (
        <nav className="navbar font-normal flex items-center space-x-4">
            <Link to="/">Home</Link>

            {isLoggedIn && (
                <>
                    {/* Mentorship dropdown */}
                    <div className="relative inline-block group">
            <span className="cursor-pointer px-2 py-1 hover:text-btnorange">
              Mentorship
            </span>
                        <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded z-10">
                            <Link
                                to="/sessions"
                                className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
                            >
                                Explore Sessions
                            </Link>
                            <Link
                                to="/my-sessions"
                                className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
                            >
                                My Sessions
                            </Link>
                        </div>
                    </div>

                    <Link to="/survey">Survey</Link>
                    <Link to="/admin">Admin</Link>
                    <button
                        onClick={handleProfileClick}
                        className="text-black hover:text-btnorange"
                    >
                        Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-2-brown text-black font-normal px-3 py-1 rounded"
                    >
                        Logout
                    </button>
                </>
            )}

            {!isLoggedIn && (
                <>
                    {!isOnLoginPage && <Link to="/login">Login</Link>}
                    {!isOnRegisterPage && <Link to="/register">Register</Link>}
                </>
            )}
        </nav>
    );
};

export default NavBar;

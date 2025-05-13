import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NavBar = ({ isLoggedIn, handleLogout, accountType }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isOnRegisterPage = location.pathname === "/register";
  const isOnLoginPage = location.pathname === "/login";

  const doLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        handleLogout();
        // ✅ Full refresh to reset all layouts and nav state
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed.");
    }
  };

  const handleProfileClick = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 200) {
        navigate("/profile");
      } else if (res.status === 404) {
        alert("⚠️ You need to complete your profile first.");
        navigate("/profile-creation");
      } else if (res.status === 401) {
        alert("Please log in first.");
        navigate("/login");
      } else {
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

      {/* Regular User Menu */}
      {isLoggedIn && (accountType === 0 || accountType === "0") && (
        <>
          <div className="relative inline-block group">
            <span className="cursor-pointer px-2 py-1 hover:text-btnorange">
              Mentorship
            </span>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded z-10">
              <Link to="/sessions" className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap">
                Explore Sessions
              </Link>
              <Link to="/my-sessions" className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap">
                My Sessions
              </Link>
            </div>
          </div>

          <div className="relative inline-block group">
            <span className="cursor-pointer px-2 py-1 hover:text-btnorange">
              Account
            </span>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded z-10">
              <Link
                to="/profile"
                onClick={handleProfileClick}
                className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
              >
                My Profile
              </Link>
              <Link
                to="/account-mentorship-preferences"
                className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
              >
                Mentorship Preferences
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Admin Menu */}
      {isLoggedIn && (accountType === 1 || accountType === "1") && (
        <Link to="/admin">Admin</Link>
      )}

      {/* Logout Button */}
      {isLoggedIn && !isOnLoginPage && (
        <button
          onClick={doLogout}
          className="bg-2-brown text-black font-normal px-3 py-1 rounded"
        >
          Logout
        </button>
      )}

      {/* Login/Register Links */}
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

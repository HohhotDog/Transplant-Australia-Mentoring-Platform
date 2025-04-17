// src/components/Navigation/NavBar.js
import React from "react";
import { Link } from "react-router-dom";

const NavBar = ({ isLoggedIn, handleLogout }) => {
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
            {/*  remove mt-1*/}
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
          <Link to="/profile">Profile</Link>
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
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default NavBar;

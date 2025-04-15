// src/components/Navigation/NavBar.js
import React from "react";
import { Link } from "react-router-dom";

const NavBar = ({ isLoggedIn, handleLogout }) => {
  return (
    <nav className="navbar font-normal">
      <Link to="/">Home</Link>
      {isLoggedIn ? (
        <>
          {" | "}
          <Link to="/survey">Survey</Link>
          {" | "}
          <Link to="/profile">Profile</Link>
          {" | "}
          <Link to="/admin">Admin</Link>
          {" | "}
          <button onClick={handleLogout} className="bg-2-brown text-black font-normal px-3 py-1">
            Logout
          </button>
        </>
      ) : (
        <>
          {" | "}
          <Link to="/login">Login</Link>
          {" | "}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default NavBar;

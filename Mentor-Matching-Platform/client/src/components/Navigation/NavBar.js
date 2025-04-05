// src/components/Navigation/NavBar.js
import React from "react";
import { Link } from "react-router-dom";

function NavBar({ isLoggedIn }) {
  return (
    <nav className="navbar">
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
          <Link to="/enneagram-quiz">Enneagram</Link>
          {" | "}
          <Link to="/matches">Matches</Link>
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
}

export default NavBar;

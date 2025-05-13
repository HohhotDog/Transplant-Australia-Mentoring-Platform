import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../Navigation/NavBar";

/**
 * Global page layout.
 * Redirects to /login if user is not logged in.
 */
const Layout = ({ isLoggedIn, handleLogout, accountType }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-lightbrown">
      {/* Top navigation */}
      <NavBar
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        accountType={accountType}
      />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-center p-4">
        © 2025 Your Company Name
      </footer>
    </div>
  );
};

export default Layout;

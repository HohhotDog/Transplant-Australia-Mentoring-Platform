// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./Navigation/NavBar";

/**
 * Global page layout.
 * Receives session‑related props from <App /> and
 * passes them down to <NavBar /> so it can render
 * the correct menu items.
 */
const Layout = ({ isLoggedIn, handleLogout, accountType }) => {
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
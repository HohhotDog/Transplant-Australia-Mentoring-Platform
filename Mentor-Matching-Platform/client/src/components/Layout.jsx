// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./Navigation/NavBar";

const Layout = ({ isLoggedIn, handleLogout }) => { // 接收 props
  return (
    <div className="min-h-screen flex flex-col bg-lightbrown">
      {/* Pass login state and logout handler to NavBar */}
      <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      
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

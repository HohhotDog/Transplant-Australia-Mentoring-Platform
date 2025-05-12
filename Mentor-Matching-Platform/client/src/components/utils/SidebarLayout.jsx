// src/components/SidebarLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";
import Topbar from "../Navigation/TopBar";

const SidebarLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#fdfbf8]">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Topbar userImage="/images/amrita-avatar.jpg" />
            <main className="flex-1 overflow-y-auto px-8 py-6">
              <Outlet />
            </main>
          </div>
        </div>
      );
};

export default SidebarLayout;

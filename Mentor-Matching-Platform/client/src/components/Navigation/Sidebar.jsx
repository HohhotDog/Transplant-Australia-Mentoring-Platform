import React from "react";
import { NavLink } from "react-router-dom";
import {  FaUser, FaCog, FaSearch } from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BsShieldLock } from "react-icons/bs";

const Sidebar = ({ accountType }) => {
  const isAdmin = accountType === 1;


  return (
    <div className="w-64 min-h-screen bg-white border-r px-6 py-8">
      <div className="text-xl font-bold mb-10 flex items-center gap-2">
        <span className="text-purple-700 text-2xl">🩺</span>
        <span>TransplantAustralia</span>
      </div>

      {!isAdmin && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Mentorship</p>
          <nav className="flex flex-col space-y-1 pl-2">
            <SidebarLink to="/sessions" label="Explore Sessions" icon={<FaSearch />} />
            <SidebarLink to="/my-sessions" label="My Sessions" icon={<HiOutlineUserGroup />} />
          </nav>
        </div>
      )}

      {isAdmin && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Admin</p>
          <nav className="flex flex-col space-y-1 pl-2">
            <SidebarLink to="/admin" label="Mentorship Sessions" icon={<HiOutlineUserGroup />} />
            </nav>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Account</p>
        <nav className="flex flex-col space-y-1 pl-2">
          <SidebarLink to="/profile" label="My Profile" icon={<FaUser />} />
          {!isAdmin && (
            <SidebarLink to="/account-mentorship-preferences" label="Mentorship Preferences" icon={<FaCog />} />
          )}
          <SidebarLink to="/profile-security" label="Security" icon={<BsShieldLock />} />
        </nav>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
        isActive
          ? "bg-gray-100 text-black font-semibold"
          : "text-gray-600 hover:bg-gray-50"
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
);

export default Sidebar;

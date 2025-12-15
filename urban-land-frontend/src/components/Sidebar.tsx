import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaLandmark,
  FaFileAlt,
  FaUserPlus,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../auth/useAuth";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });

  const loc = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const btn = document.getElementById("sidebar-toggle");
    const handler = () =>
      setCollapsed((s) => {
        localStorage.setItem("sidebar_collapsed", s ? "0" : "1");
        return !s;
      });
    btn?.addEventListener("click", handler);
    return () => btn?.removeEventListener("click", handler);
  }, []);

  const links = [
    {
      to: "/",
      label: "Dashboard",
      icon: <FaHome />,
      roles: ["officer", "admin", "owner"],
    },
    {
      to: "/land/create",
      label: "Land Parcels",
      icon: <FaLandmark />,
      roles: ["officer", "admin"],
    },
    {
      to: "/applications",
      label: "Applications",
      icon: <FaFileAlt />,
      roles: ["citizen", "officer", "admin"],
    },
    // Admin/Officer: Search Owners (unified)
    {
      to: "/ownersearch",
      label: "Search Owners",
      icon: <FaSearch />,
      roles: ["admin", "officer"],
    },
    {
      to: "/register-owner",
      label: "Register Owner",
      icon: <FaUserPlus />,
      roles: ["admin", "officer"],
    },
    {
      to: "/register",
      label: "Register Citizen",
      icon: <FaUserPlus />,
      roles: ["admin"],
    },
    // Owner specific links
    {
      to: "/owner",
      label: "My Land",
      icon: <FaLandmark />,
      roles: ["owner"],
    },
    {
      to: "/owners", // Changed from /myprofile to /owners for owners
      label: "My Profile",
      icon: <FaUserCircle />,
      roles: ["owner"],
    },
    // Remove the old /searchowner link since it's now handled by /owners
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-slate-800 text-white h-full transition-all`}
    >
      <div className="p-4">
        <div
          className={`mb-6 text-xl font-bold ${collapsed ? "text-center" : ""}`}
        >
          {collapsed ? "UL" : "ULMS"}
        </div>
        <nav className="space-y-2">
          {links
            .filter((link) => link.roles.includes(user?.role || ""))
            .map((link) => (
              <Link
                key={`${link.to}-${link.label}`}
                to={link.to}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                  loc.pathname.startsWith(link.to)
                    ? "bg-slate-700 text-white"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? link.label : ""}
              >
                <span className="text-lg">{link.icon}</span>
                {!collapsed && <span className="text-sm">{link.label}</span>}
              </Link>
            ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

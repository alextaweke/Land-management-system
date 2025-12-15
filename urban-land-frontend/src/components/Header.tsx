// components/Header.tsx or similar
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { FaUser, FaSearch } from "react-icons/fa";

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Urban Land Management System</h1>

        <div className="flex items-center space-x-4">
          {user?.role === "admin" || user?.role === "officer" ? (
            <button
              onClick={() => navigate("/owners")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaSearch className="mr-2" />
              Search Owners
            </button>
          ) : user?.role === "owner" ? (
            <button
              onClick={() => navigate("/owners")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaUser className="mr-2" />
              My Profile
            </button>
          ) : null}

          {/* User menu, logout, etc. */}
        </div>
      </div>
    </header>
  );
};
export default Header;

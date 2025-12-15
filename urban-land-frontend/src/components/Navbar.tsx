import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync document class and localStorage when isDarkMode changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New parcel registered",
      message: "Your land parcel has been successfully registered",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Document approved",
      message: "Your ownership document has been verified",
      time: "1 day ago",
      read: true,
    },
    {
      id: 3,
      title: "Tax payment due",
      message: "Annual tax payment is due in 7 days",
      time: "2 days ago",
      read: false,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Profile menu items
  const profileMenu = [
    { label: "View Profile", icon: "👤", action: () => navigate("/profile") },
    { label: "Settings", icon: "⚙️", action: () => navigate("/settings") },
    { label: "Help & Support", icon: "❓", action: () => navigate("/help") },
    { label: "Logout", icon: "🚪", action: logout },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              id="sidebar-toggle"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center">
              <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Urban Land Registry
              </h1>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 relative transition-colors"
                aria-label="Notifications"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            !notification.read
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : ""
                          }`}
                        >
                          <div className="flex items-start">
                            <div
                              className={`w-2 h-2 mt-2 rounded-full mr-3 ${
                                notification.read
                                  ? "bg-gray-300 dark:bg-gray-600"
                                  : "bg-blue-500"
                              }`}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => navigate("/notifications")}
                        className="w-full text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-2"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role || "User"}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {user?.username || "User"}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {user?.role || "User"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      {profileMenu.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.action();
                            setIsProfileOpen(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span
                            className={`text-sm ${
                              item.label === "Logout"
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          System Status
                        </span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

     
    </header>
  );
};

export default Navbar;

// pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";

// Define types for our statistics
interface DashboardStats {
  totalLands: number;
  totalUsers: number;
  totalOwners: number;
  activeLands: number;
  inactiveLands: number;
  pendingLands: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentActivities: any[];
  landValue: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentRegistrations: any[];
  userDistribution: {
    owners: number;
    officers: number;
    admins: number;
  };
  ownersWithProfiles: number;
  totalRegisteredOwners: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Use the dashboard stats endpoint
        const statsRes = await api.get("/accounts/dashboard-stats/");
        const stats = statsRes.data;

        setStats({
          totalLands: stats.totalLands || 0,
          totalUsers: stats.totalUsers || 0,
          totalOwners: stats.totalOwners || 0,
          activeLands: stats.activeLands || 0,
          inactiveLands: stats.inactiveLands || 0,
          pendingLands: stats.pendingLands || 0,
          landValue: stats.landValue || 0,
          userDistribution: stats.userDistribution || {
            owners: 0,
            officers: 0,
            admins: 0,
          },
          ownersWithProfiles: stats.ownersWithProfiles || 0,
          totalRegisteredOwners: stats.totalRegisteredOwners || 0,
          recentActivities: stats.recentActivities || [],
          recentRegistrations: stats.recentRegistrations || [],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics");
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Click handlers for cards
  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case "total-users":
        if (user?.role === "admin") {
          navigate("/users");
        } else {
          // For non-admins, maybe show a message or redirect differently
          navigate("/owners");
        }
        break;

      case "total-owners":
        navigate("/owners");
        break;

      case "total-lands":
        navigate("/parcels");
        break;

      case "active-lands":
        // Navigate to lands filtered by active status
        navigate("/parcels?status=Active");
        break;

      case "inactive-lands":
        // Navigate to lands filtered by inactive status
        navigate("/parcels?status=Inactive");
        break;

      case "pending-lands":
        // Navigate to lands filtered by pending status
        navigate("/parcels?status=Pending");
        break;

      case "land-value":
        // Navigate to lands with value filter
        navigate("/parcels?sort=value&order=desc");
        break;

      default:
        break;
    }
  };

  // Function to get user-specific dashboard content
  const getUserDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case "admin":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Quick Actions */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Admin Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/users/register"
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Register New User
                    </p>
                    <p className="text-sm text-gray-600">
                      Create accounts for officers, admins, or owners
                    </p>
                  </div>
                </Link>
                <Link
                  to="/owners"
                  className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Owners</p>
                    <p className="text-sm text-gray-600">
                      Search, view, and edit owner profiles
                    </p>
                  </div>
                </Link>
                <Link
                  to="/land/create"
                  className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Register Land</p>
                    <p className="text-sm text-gray-600">
                      Register new land parcels in the system
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* System Overview */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                System Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">System Status</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="font-medium text-gray-900">
                        All Systems Operational
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Updated just now
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Database Usage</p>
                    <p className="font-semibold text-blue-700 mt-1">64%</p>
                    <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: "64%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Storage Space</p>
                    <p className="font-semibold text-green-700 mt-1">
                      1.2 GB / 10 GB
                    </p>
                    <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{ width: "12%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "officer":
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Officer Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/owners"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">
                    Search Owners
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Find and manage owner profiles
                </p>
              </Link>
              <Link
                to="/register-owner"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center mb-2">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">
                    Register Owner
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Create new owner profiles
                </p>
              </Link>
              <Link
                to="/land/create"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="flex items-center mb-2">
                  <svg
                    className="w-5 h-5 text-purple-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">
                    Register Land
                  </span>
                </div>
                <p className="text-sm text-gray-600">Add new land parcels</p>
              </Link>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-5 h-5 text-yellow-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">
                    Pending Approvals
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  3 documents pending review
                </p>
              </div>
            </div>
          </div>
        );

      case "owner":
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Your Properties
                </h3>
                <p className="text-sm text-gray-600">
                  Manage your land parcels and documents
                </p>
              </div>
              <Link
                to="/my-profile"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Profile
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Owned Land Parcels</p>
                <p className="text-2xl font-bold text-blue-700">5</p>
                <Link
                  to="#"
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                  View Details →
                </Link>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Land Area</p>
                <p className="text-2xl font-bold text-green-700">12.5 acres</p>
                <p className="text-xs text-gray-500 mt-1">
                  Approximate value: $350,000
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="h-16 w-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {user?.username}
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : user?.role === "officer"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : ""}
              </span>
              <button
                onClick={() => navigate("/my-profile")}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </button>
            </div>
          </div>
        </div>

        {/* Main Statistics Cards - CLICKABLE */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Land Card - Clickable */}
            <div
              onClick={() => handleCardClick("total-lands")}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Land
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">
                    {stats.totalLands}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Parcels registered
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium text-green-600">
                      {stats.activeLands}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{
                        width: `${
                          (stats.activeLands / Math.max(stats.totalLands, 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Click to view details
                </span>
                <svg
                  className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Total Users Card - Clickable */}
            <div
              onClick={() => handleCardClick("total-users")}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-green-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-green-600 transition-colors">
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">System accounts</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Owners</span>
                  <span className="font-medium">
                    {stats.userDistribution.owners}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Officers</span>
                  <span className="font-medium">
                    {stats.userDistribution.officers}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Admins</span>
                  <span className="font-medium">
                    {stats.userDistribution.admins}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Click to view users
                </span>
                <svg
                  className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Total Owners Card - Clickable */}
            <div
              onClick={() => handleCardClick("total-owners")}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-purple-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Owners
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-purple-600 transition-colors">
                    {stats.totalOwners}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Profile completed
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-purple-600"
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
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center text-xs text-gray-600">
                    <svg
                      className="w-4 h-4 mr-1 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Profiles completed</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {stats.ownersWithProfiles} / {stats.totalRegisteredOwners}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (stats.ownersWithProfiles /
                          Math.max(stats.totalRegisteredOwners, 1)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-2">
                  {Math.round(
                    (stats.ownersWithProfiles /
                      Math.max(stats.totalRegisteredOwners, 1)) *
                      100
                  )}
                  % completion rate
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalRegisteredOwners - stats.ownersWithProfiles}{" "}
                  profiles pending
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Click to view owners
                </span>
                <svg
                  className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Total Land Value Card - Clickable */}
            <div
              onClick={() => handleCardClick("land-value")}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-yellow-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Land Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-yellow-600 transition-colors">
                    {formatCurrency(stats.landValue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Market valuation</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-xs text-gray-600">
                  <svg
                    className="w-4 h-4 mr-1 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>
                    Average value per parcel:{" "}
                    {formatCurrency(
                      stats.landValue / Math.max(stats.totalLands, 1)
                    )}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Click to view valuable lands
                </span>
                <svg
                  className="w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Status Overview - Also Clickable */}
        {stats && (user?.role === "admin" || user?.role === "officer") && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Active Lands Card - Clickable */}
              <div
                onClick={() => handleCardClick("active-lands")}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-green-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Active Lands</p>
                    <p className="text-2xl font-bold text-green-700 mt-1 group-hover:text-green-600 transition-colors">
                      {stats.activeLands}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Lands currently in use and registered
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Click to view active lands
                  </span>
                  <svg
                    className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Pending Lands Card - Clickable */}
              <div
                onClick={() => handleCardClick("pending-lands")}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-yellow-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 group-hover:bg-yellow-200 transition-colors">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pending Lands</p>
                    <p className="text-2xl font-bold text-yellow-700 mt-1 group-hover:text-yellow-600 transition-colors">
                      {stats.pendingLands}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Awaiting verification or approval
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Click to view pending lands
                  </span>
                  <svg
                    className="w-4 h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Inactive Lands Card - Clickable */}
              <div
                onClick={() => handleCardClick("inactive-lands")}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-red-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Inactive Lands</p>
                    <p className="text-2xl font-bold text-red-700 mt-1 group-hover:text-red-600 transition-colors">
                      {stats.inactiveLands}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Suspended or archived lands
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Click to view inactive lands
                  </span>
                  <svg
                    className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User-specific content */}
        {getUserDashboardContent()}

        {/* Recent Activity and Recent Registrations */}
        {stats && (user?.role === "admin" || user?.role === "officer") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Activity
                </h3>
                <Link
                  to="#"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0">
                      {activity.type === "land_registration" && (
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                      {activity.type === "owner_registration" && (
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                      {activity.type === "land_transfer" && (
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Registrations */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Registrations
                </h3>
                <Link
                  to="#"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                          registration.type === "land"
                            ? "bg-blue-100"
                            : registration.type === "owner"
                            ? "bg-green-100"
                            : "bg-purple-100"
                        }`}
                      >
                        <span
                          className={`text-xs font-medium ${
                            registration.type === "land"
                              ? "text-blue-700"
                              : registration.type === "owner"
                              ? "text-green-700"
                              : "text-purple-700"
                          }`}
                        >
                          {registration.type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {registration.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {registration.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        registration.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {registration.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

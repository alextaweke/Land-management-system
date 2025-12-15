// pages/OwnerSearch.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";
import type { OwnerProfile } from "../types/owner";

const OwnerSearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const [, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<OwnerProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<
    "username" | "national_id" | "name"
  >("username");
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError(`Please enter a ${searchType} to search`);
      return;
    }

    setSearching(true);
    try {
      let query = "";
      switch (searchType) {
        case "username":
          query = `username=${searchValue}`;
          break;
        case "national_id":
          query = `national_id=${searchValue}`;
          break;
        case "name":
          query = `first_name=${searchValue}`;
          break;
      }

      const res = await api.get(`/owners/?${query}`);

      const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];

      setSearchResults(data);
      setError(
        data.length === 0 ? `No owners found with that ${searchType}` : null
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.response?.data?.detail || "Search failed");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectOwner = (owner: OwnerProfile) => {
    navigate(`/owners/${owner.id}`);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "register-user":
        navigate("/users/register");
        break;
      case "register-owner":
        navigate("/register-owner");
        break;
      case "view-all":
        fetchAllOwners();
        break;
      case "dashboard":
        navigate("/");
        break;
      default:
        break;
    }
  };

  const fetchAllOwners = async () => {
    setSearching(true);
    try {
      const res = await api.get("/owners/");

      const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];

      setSearchResults(data);
      setError(data.length === 0 ? "No owners found in the system" : null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.detail || "Failed to fetch owners");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-yellow-100 text-yellow-800";
      case "Deceased":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOwnerTypeColor = (type: string) => {
    switch (type) {
      case "Individual":
        return "bg-blue-100 text-blue-800";
      case "Company":
        return "bg-purple-100 text-purple-800";
      case "Government":
        return "bg-indigo-100 text-indigo-800";
      case "Trust":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (user?.role !== "admin" && user?.role !== "officer") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Owner Management
                </h1>
                <p className="text-blue-100 mt-2">
                  Search, view, and manage land owner profiles
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <span className="text-sm text-white font-medium">
                    {user?.role === "admin" ? "Admin Mode" : "Officer Mode"}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleQuickAction("register-user")}
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Register User
                </button>
                <button
                  onClick={() => handleQuickAction("register-owner")}
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Register Owner
                </button>
                <button
                  onClick={() => handleQuickAction("view-all")}
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-lg hover:bg-white/30 transition-colors"
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  View All Owners
                </button>
                <button
                  onClick={() => navigate("/land/create")}
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-lg hover:bg-white/30 transition-colors"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Register Land
                </button>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Type */}
                <div className="lg:w-1/4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search By
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "username", label: "Username", icon: "👤" },
                      {
                        value: "national_id",
                        label: "National ID",
                        icon: "🆔",
                      },
                      { value: "name", label: "Name", icon: "📝" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setSearchType(type.value as typeof searchType);
                          setSearchValue("");
                          setSearchResults([]);
                          setError(null);
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          searchType === type.value
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Input */}
                <div className="lg:w-2/4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Value
                  </label>
                  <div className="flex">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                      </div>
                      <input
                        type="text"
                        placeholder={`Enter ${
                          searchType === "username"
                            ? "username"
                            : searchType === "national_id"
                            ? "national ID number"
                            : "owner name"
                        }...`}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={searching || !searchValue.trim()}
                      className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-r-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-30"
                    >
                      {searching ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Searching...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
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
                          Search
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {searchType === "username" &&
                      "Search by username (e.g., john_doe)"}
                    {searchType === "national_id" &&
                      "Search by national ID number"}
                    {searchType === "name" && "Search by owner's first name"}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="lg:w-1/4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Stats
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Results Found:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {searchResults.length}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Active Owners:
                      </span>
                      <span className="font-semibold text-green-600">
                        {
                          searchResults.filter((o) => o.status === "Active")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Search Results ({searchResults.length} owners found)
                  </h3>
                  <div className="text-sm text-gray-600">
                    Click on any owner to view full details
                  </div>
                </div>
                <div className="space-y-3">
                  {searchResults.map((owner) => (
                    <div
                      key={owner.id}
                      onClick={() => handleSelectOwner(owner)}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                            {owner.profile_picture_url ? (
                              <img
                                src={owner.profile_picture_url}
                                alt={`${owner.first_name} ${owner.last_name}`}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold text-lg">
                                {owner.first_name?.[0]}
                                {owner.last_name?.[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {owner.first_name} {owner.middle_name}{" "}
                                {owner.last_name}
                              </h4>
                              <div className="ml-3 flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                    owner.status
                                  )}`}
                                >
                                  {owner.status}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getOwnerTypeColor(
                                    owner.owner_type
                                  )}`}
                                >
                                  {owner.owner_type}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-400"
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
                                <span>@{owner.user_username}</span>
                              </div>
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-400"
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
                                <span>ID: {owner.national_id}</span>
                              </div>
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                <span>{owner.contact_phone || "No phone"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg
                            className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform"
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
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults.length === 0 &&
              searchValue &&
              !error &&
              !searching && (
                <div className="text-center py-12">
                  <svg
                    className="h-16 w-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Owners Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No owners found matching your search criteria
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => handleQuickAction("register-owner")}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Register New Owner
                    </button>
                    <button
                      onClick={() => handleQuickAction("view-all")}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View All Owners
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
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
              <h4 className="font-medium text-gray-900">Register Users</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Create new user accounts with different roles (Owner, Officer,
              Admin)
            </p>
            <button
              onClick={() => navigate("/users/register")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to User Registration →
            </button>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
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
              <h4 className="font-medium text-gray-900">Register Owners</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Complete owner profiles with personal information, documents, and
              contact details
            </p>
            <button
              onClick={() => navigate("/register-owner")}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Go to Owner Registration →
            </button>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Register Lands</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Register new land parcels and link them to existing owners in the
              system
            </p>
            <button
              onClick={() => navigate("/land/create")}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Go to Land Registration →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSearch;

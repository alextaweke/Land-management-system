// pages/LandParcels.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/useAuth";

interface LandParcel {
  parcel_id: number; // Changed from 'id' to 'parcel_id'
  cadastral_number: string;
  location: string;
  area: number;
  current_market_value?: number;
  status: string; // Your model uses lowercase status
  land_use_type: string; // Changed from 'land_type' to 'land_use_type'
  land_use_zone?: string;
  registration_date: string;
  registration_number?: string;
  title_deed_number?: string;
  survey_number?: string;
  block_number?: string;
  sector_number?: string;
  mouza_name?: string;
  date_created: string; // Added for sorting
  last_updated: string;
  is_active: boolean;
  development_status?: string;
  annual_tax_value?: number;
  has_structures?: boolean;
  owner_name?: string; // From serializer
}

const LandParcels: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Parse URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get("status");
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const pageParam = searchParams.get("page");

    if (status) setStatusFilter(status);
    if (type) setTypeFilter(type);
    if (search) setSearchTerm(search);
    if (pageParam) setPage(parseInt(pageParam));

    if (sort) {
      if (sort === "value") {
        setSortBy(order === "asc" ? "value_asc" : "value_desc");
      } else if (sort === "area") {
        setSortBy(order === "asc" ? "area_asc" : "area_desc");
      } else if (sort === "date") {
        setSortBy(order === "asc" ? "oldest" : "newest");
      }
    }
  }, [location.search]);

  // Fetch parcels
  const fetchParcels = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, string> = {};

      // Add filters
      if (statusFilter !== "all") {
        // Convert to lowercase to match your model
        params.status = statusFilter.toLowerCase();
      }

      if (typeFilter !== "all") {
        params.land_use_type = typeFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add pagination
      params.page = page.toString();
      params.page_size = "12";

      // Add sorting - using correct field names
      switch (sortBy) {
        case "value_desc":
          params.ordering = "-current_market_value";
          break;
        case "value_asc":
          params.ordering = "current_market_value";
          break;
        case "area_desc":
          params.ordering = "-area";
          break;
        case "area_asc":
          params.ordering = "area";
          break;
        case "newest":
          params.ordering = "-date_created"; // Using date_created instead of registration_date
          break;
        case "oldest":
          params.ordering = "date_created";
          break;
        default:
          params.ordering = "-date_created";
      }

      const queryString = new URLSearchParams(params).toString();
      const res = await api.get(`/parcels/?${queryString}`);

      // Handle paginated response
      if (res.data.results) {
        setParcels(res.data.results);
        setTotalCount(res.data.count || 0);
        setTotalPages(Math.ceil((res.data.count || 0) / 12));
      } else {
        setParcels(res.data);
        setTotalCount(res.data.length);
        setTotalPages(1);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching land parcels:", err);
      setError("Failed to load land parcels");
      setParcels([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchTerm, sortBy, page]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchParcels, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchParcels]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (typeFilter !== "all") {
      params.set("type", typeFilter);
    }

    if (searchTerm) {
      params.set("search", searchTerm);
    }

    if (page > 1) {
      params.set("page", page.toString());
    }

    if (sortBy !== "newest") {
      if (sortBy.startsWith("value")) {
        params.set("sort", "value");
        params.set("order", sortBy === "value_desc" ? "desc" : "asc");
      } else if (sortBy.startsWith("area")) {
        params.set("sort", "area");
        params.set("order", sortBy === "area_desc" ? "desc" : "asc");
      } else if (sortBy === "oldest") {
        params.set("sort", "date");
        params.set("order", "asc");
      }
    }

    const newUrl = params.toString()
      ? `/parcels?${params.toString()}`
      : "/parcels";
    window.history.replaceState({}, "", newUrl);
  }, [statusFilter, typeFilter, searchTerm, sortBy, page]);

  // Handle filter changes
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleTypeFilterChange = (newType: string) => {
    setTypeFilter(newType);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique land use types for filter (from parcels)
  const landTypes = Array.from(
    new Set(parcels.map((p) => p.land_use_type))
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading land parcels...</p>
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
            Error Loading Land Parcels
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
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Land Parcels Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all land parcels in the registry
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              {(user?.role === "admin" || user?.role === "officer") && (
                <button
                  onClick={() => navigate("/land/create")}
                  className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
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
                  Register New Land
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Total Parcels</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Active Parcels</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {
                parcels.filter((p) => p.status?.toLowerCase() === "active")
                  .length
              }
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-600">
              Total Land Value
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {formatCurrency(
                parcels.reduce(
                  (sum, p) => sum + (p.current_market_value || 0),
                  0
                )
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Total Area</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {parcels.reduce((sum, p) => sum + p.area, 0).toLocaleString()} m²
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Parcels
              </label>
              <div className="relative">
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
                  placeholder="Search by cadastral number, location..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Land Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Land Type
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
              >
                <option value="all">All Types</option>
                {landTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="value_desc">Highest Value</option>
                <option value="value_asc">Lowest Value</option>
                <option value="area_desc">Largest Area</option>
                <option value="area_asc">Smallest Area</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parcels Grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Land Parcels ({parcels.length})
              </h3>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages} • {totalCount} total parcels
              </span>
            </div>
          </div>

          {/* Parcels Content */}
          <div className="p-6">
            {parcels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parcels.map((parcel) => (
                  <div
                    key={parcel.parcel_id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-blue-300 group cursor-pointer"
                    onClick={() => navigate(`/parcels/${parcel.parcel_id}`)}
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {parcel.cadastral_number}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {parcel.location}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            parcel.status
                          )}`}
                        >
                          {parcel.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-1 text-gray-400"
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
                        <span className="capitalize">
                          {parcel.land_use_type}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Area</p>
                          <p className="font-medium text-gray-900">
                            {parcel.area.toLocaleString()} m²
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Market Value
                          </p>
                          <p className="font-medium text-blue-600">
                            {formatCurrency(parcel.current_market_value)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Registration Date
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(parcel.registration_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Owner</p>
                          <p className="font-medium text-gray-900">
                            {parcel.owner_name || "No Owner"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="h-16 w-16 text-gray-400 mx-auto mb-3"
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
                  No Land Parcels Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try changing your search or filters"
                    : "No land parcels registered in the system"}
                </p>
                {(user?.role === "admin" || user?.role === "officer") && (
                  <button
                    onClick={() => navigate("/land/create")}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    Register First Land Parcel
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page <= 1}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      page <= 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      page >= totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandParcels;

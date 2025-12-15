import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/useAuth";
import type { OwnerProfile } from "../../types/owner";

interface LandCreateForm {
  location: string;
  area: number;
  land_use_type: string;
  in_north: string;
  in_east: string;
  in_west: string;
  in_south: string;
  parcel_file: File | null;
  cadastral_number: string;
  survey_number: string;
  block_number: string;
  sector_number: string;
  mouza_name: string;
  land_use_zone: string;
  registration_date: string;
  registration_number: string;
  title_deed_number: string;
  current_market_value: number;
  annual_tax_value: number;
  development_status: string;
  has_structures: boolean;
  selected_owner_id?: number;
}

const LandCreate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<LandCreateForm>({
    location: "",
    area: 0,
    land_use_type: "",
    in_north: "",
    in_east: "",
    in_west: "",
    in_south: "",
    parcel_file: null,
    cadastral_number: "",
    survey_number: "",
    block_number: "",
    sector_number: "",
    mouza_name: "",
    land_use_zone: "",
    registration_date: new Date().toISOString().split("T")[0],
    registration_number: "",
    title_deed_number: "",
    current_market_value: 0,
    annual_tax_value: 0,
    development_status: "Undeveloped",
    has_structures: false,
    selected_owner_id: undefined,
  });

  const [currentOwner, setCurrentOwner] = useState<OwnerProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<"owner" | "admin">("owner");

  // Search state for admin mode
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OwnerProfile[]>([]);
  const [selectedOwnerDetails, setSelectedOwnerDetails] =
    useState<OwnerProfile | null>(null);

  // Load data and determine mode
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        if (user.role === "admin" || user.role === "officer") {
          // Admin/Officer mode - can search any owner
          setMode("admin");
          setLoading(false);
        } else if (user.role === "owner") {
          // Owner mode - find this owner's profile
          const ownerRes = await api.get(`/owners/?username=${user.username}`);

          if (ownerRes.data.length > 0) {
            setCurrentOwner(ownerRes.data[0]);
            setForm((prev) => ({
              ...prev,
              selected_owner_id: ownerRes.data[0].id,
            }));
          } else {
            // Owner doesn't have profile
            alert("Please complete your owner profile first!");
            navigate("/register-owner");
            return;
          }
          setLoading(false);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  // Search for owners
  const searchOwners = async () => {
    console.log("Searching for:", searchQuery);

    if (!searchQuery.trim()) {
      console.log("Search query is empty");
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      console.log("Making API call...");
      const response = await api.get(`/owners/`, {
        params: {
          search: searchQuery,
          username: searchQuery,
          user__username: searchQuery,
          q: searchQuery,
        },
      });

      console.log("API Response:", response.data);

      // Handle different response structures
      let results: OwnerProfile[] = [];
      if (Array.isArray(response.data)) {
        results = response.data;
      } else if (
        response.data.results &&
        Array.isArray(response.data.results)
      ) {
        results = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        results = response.data.data;
      }

      console.log("Processed results:", results);
      setSearchResults(results);

      if (!results || results.length === 0) {
        console.log("No results found for query:", searchQuery);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error searching owners:", error);
      console.error("Error details:", error.response?.data || error.message);

      // Try direct search as fallback
      try {
        const fallbackResponse = await api.get(
          `/owners/?username=${searchQuery}`
        );
        const fallbackResults =
          fallbackResponse.data.results || fallbackResponse.data || [];
        setSearchResults(fallbackResults);
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        setSearchResults([]);
      }
    } finally {
      setSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedOwnerDetails(null);
    setForm({ ...form, selected_owner_id: undefined });

    // Clear results if search is empty
    if (!value.trim()) {
      setSearchResults([]);
    }
  };

  // Select an owner from search results
  const handleSelectOwner = (owner: OwnerProfile) => {
    setForm({ ...form, selected_owner_id: owner.id });
    setSelectedOwnerDetails(owner);
    setSearchResults([]);
    console.log("Selected owner:", owner);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.selected_owner_id)
      newErrors.selected_owner_id = "Owner is required";
    if (!form.location) newErrors.location = "Location is required";
    if (!form.area || form.area <= 0) newErrors.area = "Valid area is required";
    if (!form.land_use_type)
      newErrors.land_use_type = "Land use type is required";
    if (!form.cadastral_number)
      newErrors.cadastral_number = "Cadastral number is required";
    if (!form.land_use_zone)
      newErrors.land_use_zone = "Land use zone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.selected_owner_id) {
      alert("Please select an owner!");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // Step 1: Create the land parcel
      const parcelData = new FormData();

      // Add all land parcel fields (except selected_owner_id)
      Object.entries(form).forEach(([key, value]) => {
        if (
          key !== "selected_owner_id" &&
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          if (key === "parcel_file" && value instanceof File) {
            parcelData.append(key, value);
          } else if (typeof value === "boolean") {
            parcelData.append(key, value ? "true" : "false");
          } else {
            parcelData.append(key, value.toString());
          }
        }
      });

      // Create parcel
      const parcelRes = await api.post("/parcels/", parcelData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const parcelId = parcelRes.data.parcel_id || parcelRes.data.id;

      // Step 2: Create ownership record
      const ownershipData = {
        parcel: parcelId,
        owner: form.selected_owner_id,
        ownership_type: "Sole",
        ownership_percentage: 100,
        acquisition_type: "Purchase",
        acquisition_date:
          form.registration_date || new Date().toISOString().split("T")[0],
        is_current_owner: true,
        created_by: user?.id,
      };

      await api.post("/ownership-records/", ownershipData);

      alert("✅ Land parcel registered successfully!");
      navigate("/parcels");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Registration failed:", err.response?.data || err);
      const errorData = err.response?.data;
      if (errorData) {
        const formErrors: Record<string, string> = {};
        Object.keys(errorData).forEach((key) => {
          formErrors[key] = Array.isArray(errorData[key])
            ? errorData[key].join(", ")
            : errorData[key];
        });
        setErrors(formErrors);
      } else {
        alert("❌ Registration failed. Please check your input and try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {mode === "admin"
                  ? "Register Land for Owner"
                  : "Register Your Land"}
              </h1>
              <p className="text-gray-600 mt-1">
                Fill in all required information to register a new land parcel
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {mode === "admin" ? "Admin Mode" : "Owner Mode"}
              </div>
              <button
                onClick={() => navigate("/parcels")}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-linear-to-r from-green-600 to-green-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Land Registration Form
              </h2>
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                {mode === "admin" ? "Admin Registration" : "Owner Registration"}
              </div>
            </div>
          </div>

          <div className="p-6">
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 text-red-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="font-medium text-red-800">
                    Please fix the following errors:
                  </span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Owner Selection/Info Section */}
            {mode === "admin" ? (
              <div className="mb-8 bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-3 border-b border-gray-200">
                  1. Find & Select Owner
                </h3>

                {/* Search Owner by Username */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Owner by Username{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
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
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            searchOwners();
                          }
                        }}
                        placeholder="Enter owner's username..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={searchOwners}
                      disabled={searching || !searchQuery.trim()}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searching ? (
                        <span className="flex items-center">
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
                        </span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>

                  {/* Search Results */}
                  {searching ? (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm text-gray-600">
                        Searching owners...
                      </p>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Search Results ({searchResults.length}):
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((owner) => (
                          <div
                            key={owner.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${
                              form.selected_owner_id === owner.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                            onClick={() => handleSelectOwner(owner)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {owner.first_name} {owner.last_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Username: {owner.user_username || "N/A"} •
                                  National ID: {owner.national_id || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ID: {owner.id} • Email:{" "}
                                  {owner.contact_email || "N/A"}
                                </div>
                              </div>
                              {form.selected_owner_id === owner.id && (
                                <svg
                                  className="h-5 w-5 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : searchQuery && !searching ? (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No owner found with username "{searchQuery}"
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Selected Owner Details */}
                {selectedOwnerDetails && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">
                        Selected Owner:
                      </h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        ✓ Selected
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Full Name:</span>{" "}
                        <span className="font-medium">
                          {selectedOwnerDetails.first_name}{" "}
                          {selectedOwnerDetails.last_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">National ID:</span>{" "}
                        <span className="font-medium">
                          {selectedOwnerDetails.national_id}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Contact:</span>{" "}
                        <span className="font-medium">
                          {selectedOwnerDetails.contact_phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>{" "}
                        <span className="font-medium">
                          {selectedOwnerDetails.contact_email}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Address:</span>{" "}
                        <span className="font-medium">
                          {selectedOwnerDetails.permanent_address}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Error for Owner Selection */}
                {errors.selected_owner_id && !selectedOwnerDetails && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      {errors.selected_owner_id}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Owner mode display
              mode === "owner" &&
              currentOwner && (
                <div className="mb-8 bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">
                        Registering for: {currentOwner.first_name}{" "}
                        {currentOwner.last_name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        National ID: {currentOwner.national_id} • Owner Type:{" "}
                        {currentOwner.owner_type}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Verified Owner
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Land Details Form */}
            <div className="space-y-8">
              {/* Cadastral Information */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-3 border-b border-gray-200">
                  {mode === "admin"
                    ? "2. Cadastral Information"
                    : "1. Cadastral Information"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cadastral Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={form.cadastral_number}
                      onChange={(e) =>
                        setForm({ ...form, cadastral_number: e.target.value })
                      }
                      className={`w-full px-4 py-3 border ${
                        errors.cadastral_number
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="e.g., CAD-2024-001"
                    />
                    {errors.cadastral_number && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cadastral_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Survey Number
                    </label>
                    <input
                      value={form.survey_number}
                      onChange={(e) =>
                        setForm({ ...form, survey_number: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., SUR-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Block Number
                    </label>
                    <input
                      value={form.block_number}
                      onChange={(e) =>
                        setForm({ ...form, block_number: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., BLK-01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector Number
                    </label>
                    <input
                      value={form.sector_number}
                      onChange={(e) =>
                        setForm({ ...form, sector_number: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., SEC-01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mouza Name
                    </label>
                    <input
                      value={form.mouza_name}
                      onChange={(e) =>
                        setForm({ ...form, mouza_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Mouza XYZ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Land Use Zone <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.land_use_zone}
                      onChange={(e) =>
                        setForm({ ...form, land_use_zone: e.target.value })
                      }
                      className={`w-full px-4 py-3 border ${
                        errors.land_use_zone
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white`}
                    >
                      <option value="">Select Zone</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Public">Public</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                    {errors.land_use_zone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.land_use_zone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location and Area */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-3 border-b border-gray-200">
                  3. Location & Area Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      className={`w-full px-4 py-3 border ${
                        errors.location ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="Full address of the land parcel"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (Square Meters){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={form.area}
                      onChange={(e) =>
                        setForm({ ...form, area: Number(e.target.value) })
                      }
                      className={`w-full px-4 py-3 border ${
                        errors.area ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="e.g., 5000"
                    />
                    {errors.area && (
                      <p className="mt-1 text-sm text-red-600">{errors.area}</p>
                    )}
                  </div>
                </div>

                {/* Boundary Directions */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Boundary Directions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        North Boundary
                      </label>
                      <input
                        value={form.in_north}
                        onChange={(e) =>
                          setForm({ ...form, in_north: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="North side"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        East Boundary
                      </label>
                      <input
                        value={form.in_east}
                        onChange={(e) =>
                          setForm({ ...form, in_east: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="East side"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        West Boundary
                      </label>
                      <input
                        value={form.in_west}
                        onChange={(e) =>
                          setForm({ ...form, in_west: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="West side"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        South Boundary
                      </label>
                      <input
                        value={form.in_south}
                        onChange={(e) =>
                          setForm({ ...form, in_south: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="South side"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration & Valuation */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-3 border-b border-gray-200">
                  4. Registration & Valuation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Date
                    </label>
                    <input
                      type="date"
                      value={form.registration_date}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          registration_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <input
                      value={form.registration_number}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          registration_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., REG-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Deed Number
                    </label>
                    <input
                      value={form.title_deed_number}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title_deed_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., TD-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Market Value (USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.current_market_value}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          current_market_value: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., 50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Tax Value (USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.annual_tax_value}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          annual_tax_value: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., 500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Land Use Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={form.land_use_type}
                      onChange={(e) =>
                        setForm({ ...form, land_use_type: e.target.value })
                      }
                      className={`w-full px-4 py-3 border ${
                        errors.land_use_type
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      placeholder="e.g., Agricultural, Residential"
                    />
                    {errors.land_use_type && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.land_use_type}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Development Status & File Upload */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-medium text-gray-800 mb-4 pb-3 border-b border-gray-200">
                  5. Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Development Status
                    </label>
                    <select
                      value={form.development_status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          development_status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="">Select Status</option>
                      <option value="Undeveloped">Undeveloped</option>
                      <option value="Under_Construction">
                        Under Construction
                      </option>
                      <option value="Developed">Developed</option>
                      <option value="Government_Hold">Government Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      <input
                        type="checkbox"
                        checked={form.has_structures}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            has_structures: e.target.checked,
                          })
                        }
                        className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span>Has Existing Structures</span>
                    </label>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Parcel Document
                      </label>
                      <div className="mt-1 flex items-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span className="px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors inline-flex items-center">
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
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            Choose File
                          </span>
                          <input
                            type="file"
                            onChange={(e) =>
                              setForm({
                                ...form,
                                parcel_file: e.target.files?.[0] ?? null,
                              })
                            }
                            className="sr-only"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </label>
                        <span className="ml-3 text-sm text-gray-500">
                          {form.parcel_file
                            ? form.parcel_file.name
                            : "No file chosen"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF, DOC, JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={
                    saving || (mode === "admin" && !selectedOwnerDetails)
                  }
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-linear-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1"
                >
                  {saving ? (
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
                      Registering Parcel...
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
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Register Land Parcel
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                * indicates required field
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandCreate;

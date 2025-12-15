// pages/OwnerProfile.tsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { OwnerProfile } from "../types/owner";

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "lands" | "documents">(
    "info"
  );

  // Fetch profile based on ID or user role
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        if (id) {
          // Fetch specific owner by ID (for admin/officer viewing a specific owner)
          const res = await api.get(`/owners/${id}/`);
          setProfile(res.data);
        } else if (user?.role === "owner") {
          // Owner viewing their own profile
          const res = await api.get(`/owners/?username=${user.username}`);
          if (res.data.length > 0) {
            setProfile(res.data[0]);
          } else {
            setError("No profile found for your account");
          }
        } else {
          // If no ID and not an owner, redirect to appropriate page
          if (user?.role === "admin" || user?.role === "officer") {
            navigate("/owners"); // Redirect to search page
          } else {
            navigate("/"); // Redirect to dashboard
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.detail || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [id, user, navigate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="h-16 w-16 text-red-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profile Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The requested owner profile could not be found.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Profile Display
  const fullName = `${profile.first_name} ${profile.middle_name || ""} ${
    profile.last_name
  }`.trim();
  const profilePictureUrl =
    profile.profile_picture_url ||
    profile.profile_picture ||
    "/default-avatar.png";

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Owner Profile
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.role === "owner" ? "Your profile" : "Owner details"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {(user?.role === "admin" || user?.role === "officer") && (
                <button
                  onClick={() => navigate("/owners")}
                  className="flex items-center px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search Another
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 px-6 py-8 relative">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Profile Image */}
              <div className="relative mb-4 md:mb-0 md:mr-6">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 overflow-hidden bg-white">
                  <img
                    src={profilePictureUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/default-avatar.png";
                    }}
                  />
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-1">
                      {fullName}
                    </h2>
                    <p className="text-blue-100">@{profile.user_username}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                        profile.status
                      )}`}
                    >
                      {profile.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getOwnerTypeColor(
                        profile.owner_type
                      )}`}
                    >
                      {profile.owner_type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-200"
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
                    <span>National ID: {profile.national_id}</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-200"
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
                    <span>{profile.contact_phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{profile.contact_email || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "info"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Personal Information
                </div>
              </button>
              <button
                onClick={() => setActiveTab("lands")}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "lands"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Owned Lands
                </div>
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "documents"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Documents
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "info" && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard label="Full Name" value={fullName} />
                    <InfoCard label="National ID" value={profile.national_id} />
                    <InfoCard
                      label="Date of Birth"
                      value={formatDate(profile.date_of_birth)}
                    />
                    <InfoCard label="Gender" value={profile.gender} />
                    <InfoCard
                      label="Phone"
                      value={profile.contact_phone || "Not provided"}
                    />
                    <InfoCard
                      label="Email"
                      value={profile.contact_email || "Not provided"}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Permanent Address
                      </p>
                      <p className="text-gray-800">
                        {profile.permanent_address}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Current Address
                      </p>
                      <p className="text-gray-800">
                        {profile.current_address || "Same as permanent"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Owner Type
                      </p>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOwnerTypeColor(
                          profile.owner_type
                        )}`}
                      >
                        {profile.owner_type}
                      </span>
                    </div>
                    <InfoCard
                      label="Registration No."
                      value={profile.registration_number || "Not registered"}
                    />
                    <InfoCard
                      label="Tax ID"
                      value={profile.tax_id || "Not provided"}
                    />
                    <InfoCard
                      label="Contact Person"
                      value={profile.contact_person || "Not specified"}
                    />
                    <InfoCard
                      label="Profile Created"
                      value={formatDate(profile.date_created)}
                    />
                    <InfoCard
                      label="Last Updated"
                      value={formatDate(profile.last_updated)}
                    />
                  </div>
                </div>

                {/* Notes */}
                {profile.notes && (
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Notes
                    </h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {profile.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Identity Documents */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Identity Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.id_card_front_url && (
                      <DocumentImage
                        label="ID Card Front"
                        url={profile.id_card_front_url}
                      />
                    )}
                    {profile.id_card_back_url && (
                      <DocumentImage
                        label="ID Card Back"
                        url={profile.id_card_back_url}
                      />
                    )}
                    {profile.signature_url && (
                      <DocumentImage
                        label="Signature"
                        url={profile.signature_url}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "lands" && (
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Owned Lands
                </h3>
                {profile.owned_lands && profile.owned_lands.length > 0 ? (
                  <div className="space-y-4">
                    {profile.owned_lands.map((land, index) => (
                      <LandCard
                        key={index}
                        land={land}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="h-12 w-12 text-gray-400 mx-auto mb-3"
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
                    <p className="text-gray-600">
                      No land ownership records found
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Documents
                </h3>
                <div className="text-center py-8">
                  <svg
                    className="h-12 w-12 text-gray-400 mx-auto mb-3"
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
                  <p className="text-gray-600">
                    No additional documents uploaded
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload documents through the registration form
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const DocumentImage = ({ label, url }: { label: string; url: string }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
    <img
      src={url}
      alt={label}
      className="w-full h-48 object-contain rounded-lg border border-gray-200"
    />
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LandCard = ({ land, formatDate }: any) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-medium text-gray-900">
          {land.parcel.cadastral_number}
        </h4>
        <p className="text-sm text-gray-600">{land.parcel.location}</p>
      </div>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
        {land.ownership_percentage}% Ownership
      </span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <p className="text-gray-500">Area</p>
        <p className="font-medium">{land.parcel.area} m²</p>
      </div>
      <div>
        <p className="text-gray-500">Market Value</p>
        <p className="font-medium">
          ${land.parcel.current_market_value?.toLocaleString() || "N/A"}
        </p>
      </div>
      <div>
        <p className="text-gray-500">Acquired</p>
        <p className="font-medium">{formatDate(land.acquisition_date)}</p>
      </div>
      <div>
        <p className="text-gray-500">Type</p>
        <p className="font-medium">{land.acquisition_type}</p>
      </div>
    </div>
  </div>
);

export default Profile;

// pages/LandDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/useAuth";

interface LandParcel {
  id: number;
  cadastral_number: string;
  location: string;
  area: number;
  area_unit: string;
  current_market_value?: number;
  status: "Active" | "Inactive" | "Pending" | "Sold";
  land_type: string;
  registration_date: string;
  description?: string;
  coordinates?: string;
  zone?: string;
  land_use?: string;
  soil_type?: string;
  topography?: string;
  access_road?: boolean;
  electricity?: boolean;
  water_supply?: boolean;
  created_at: string;
  updated_at: string;
}

interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  national_id: string;
  ownership_percentage: number;
  acquisition_date: string;
  acquisition_type: string;
}

const LandDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  useAuth();
  const navigate = useNavigate();
  const [parcel, setParcel] = useState<LandParcel | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "owners" | "documents"
  >("details");

  useEffect(() => {
    const fetchParcelDetails = async () => {
      if (!id) {
        setError("Parcel ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch parcel details
        const parcelRes = await api.get(`/parcels/${id}/`);
        setParcel(parcelRes.data);

        // Fetch owners for this parcel (you might need to create this endpoint)
        try {
          const ownersRes = await api.get(`/ownership-records/?parcel=${id}`);
          setOwners(ownersRes.data);
        } catch (err) {
          console.log("Could not fetch owners:", err);
          setOwners([]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching parcel details:", err);
        setError("Failed to load parcel details");
      } finally {
        setLoading(false);
      }
    };

    fetchParcelDetails();
  }, [id]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
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
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Sold":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parcel details...</p>
        </div>
      </div>
    );
  }

  if (error || !parcel) {
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
            {error || "Parcel Not Found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {error || "The requested land parcel could not be found."}
          </p>
          <button
            onClick={() => navigate("/parcels")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Back to Land Parcels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Land Parcel Details
              </h1>
              <p className="text-gray-600 mt-1">
                Complete information for {parcel.cadastral_number}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
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
              <button
                onClick={() => navigate("/parcels")}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                View All Parcels
              </button>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Parcel Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {parcel.cadastral_number}
                </h2>
                <p className="text-blue-100 text-lg">{parcel.location}</p>
                <div className="flex items-center mt-4 space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      parcel.status
                    )}`}
                  >
                    {parcel.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white">
                    {parcel.land_type}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <p className="text-blue-100">Market Value</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {formatCurrency(parcel.current_market_value)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "details"
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
                  Parcel Details
                </div>
              </button>
              <button
                onClick={() => setActiveTab("owners")}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "owners"
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Owners ({owners.length})
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
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard
                      label="Cadastral Number"
                      value={parcel.cadastral_number}
                    />
                    <InfoCard label="Location" value={parcel.location} />
                    <InfoCard
                      label="Area"
                      value={`${parcel.area.toLocaleString()} ${
                        parcel.area_unit
                      }`}
                    />
                    <InfoCard label="Land Type" value={parcel.land_type} />
                    <InfoCard label="Zone" value={parcel.zone || "N/A"} />
                    <InfoCard
                      label="Land Use"
                      value={parcel.land_use || "N/A"}
                    />
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Technical Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard
                      label="Soil Type"
                      value={parcel.soil_type || "N/A"}
                    />
                    <InfoCard
                      label="Topography"
                      value={parcel.topography || "N/A"}
                    />
                    <InfoCard
                      label="Coordinates"
                      value={parcel.coordinates || "N/A"}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AmenityCard
                      label="Access Road"
                      value={parcel.access_road}
                    />
                    <AmenityCard
                      label="Electricity"
                      value={parcel.electricity}
                    />
                    <AmenityCard
                      label="Water Supply"
                      value={parcel.water_supply}
                    />
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Current Market Value
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(parcel.current_market_value)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Value per Unit Area
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        {parcel.current_market_value && parcel.area
                          ? formatCurrency(
                              parcel.current_market_value / parcel.area
                            ) +
                            " / " +
                            parcel.area_unit
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Information */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Registration Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard
                      label="Registration Date"
                      value={formatDate(parcel.registration_date)}
                    />
                    <InfoCard
                      label="Created"
                      value={formatDate(parcel.created_at)}
                    />
                    <InfoCard
                      label="Last Updated"
                      value={formatDate(parcel.updated_at)}
                    />
                  </div>
                </div>

                {/* Description */}
                {parcel.description && (
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Description
                    </h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {parcel.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "owners" && (
              <div className="bg-gray-50 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Current Owners
                  </h3>
                  <span className="text-sm text-gray-600">
                    {owners.length} owner(s)
                  </span>
                </div>
                {owners.length > 0 ? (
                  <div className="space-y-4">
                    {owners.map((owner) => (
                      <div
                        key={owner.id}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                              <span className="text-blue-600 font-semibold">
                                {owner.first_name?.[0]}
                                {owner.last_name?.[0]}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {owner.first_name} {owner.last_name}
                              </h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="mr-4">@{owner.username}</span>
                                <span>National ID: {owner.national_id}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {owner.ownership_percentage}% Ownership
                            </span>
                            <p className="text-sm text-gray-600 mt-2">
                              Since {formatDate(owner.acquisition_date)}
                            </p>
                          </div>
                        </div>
                      </div>
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
                      No ownership records found for this parcel
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
                    No documents uploaded for this parcel
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload documents through the ownership record system
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

const AmenityCard = ({ label, value }: { label: string; value?: boolean }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <div className="flex items-center">
      <div
        className={`w-3 h-3 rounded-full mr-2 ${
          value ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
      <span
        className={`font-medium ${value ? "text-green-700" : "text-red-700"}`}
      >
        {value ? "Available" : "Not Available"}
      </span>
    </div>
  </div>
);

export default LandDetail;

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";
import type { OwnerProfile } from "../types/owner";
import type { LandParcel } from "../types/land";
import {
  User,
  FileText,
  Phone,
  Mail,
  Home,
  Building,
  Calendar,
  Percent,
  Navigation,
  Globe,
  MapPin,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  // const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [loading, setLoading] = useState({ profile: true, parcels: true });
  const [stats, setStats] = useState({
    totalParcels: 0,
    totalArea: 0,
    activeParcels: 0,
    averageArea: 0,
  });

  useEffect(() => {
    if (!user?.id) return;

    // Defer setting loading to avoid calling setState synchronously within the effect
    setTimeout(() => setLoading({ profile: true, parcels: true }), 0);

    // Fetch owner profile - FIXED: Use correct endpoint
    api
      .get(`/owners/?username=${user.username}`)
      .then((res) => {
        if (res.data.length > 0) {
          setProfile(res.data[0]);
        }
        setLoading((prev) => ({ ...prev, profile: false }));
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setLoading((prev) => ({ ...prev, profile: false }));
      });

    // Fetch land parcels through ownership records - FIXED
    api
      .get(`/ownership-records/?owner_id=${user.id}&current_only=true`)
      .then((res) => {
        // Get parcel IDs from ownership records
        const ownershipRecords = res.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parcelIds = ownershipRecords.map((record: any) => record.parcel);

        // Fetch details for each parcel
        if (parcelIds.length > 0) {
          return Promise.all(
            parcelIds.map((parcelId: number) =>
              api.get(`/parcels/${parcelId}/`)
            )
          );
        }
        return [];
      })
      .then((parcelResponses) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parcelsData = parcelResponses.map((res: any) => res.data);
        setParcels(parcelsData);

        // Calculate statistics
        const totalArea = parcelsData.reduce(
          (sum: number, parcel: LandParcel) => sum + (parcel.area || 0),
          0
        );
        const activeParcels = parcelsData.filter(
          (p: LandParcel) => p.status === "active" || p.status === "Active"
        ).length;

        setStats({
          totalParcels: parcelsData.length,
          totalArea,
          activeParcels,
          averageArea:
            parcelsData.length > 0 ? totalArea / parcelsData.length : 0,
        });
        setLoading((prev) => ({ ...prev, parcels: false }));
      })
      .catch((err) => {
        console.error("Error fetching parcels:", err);
        setLoading((prev) => ({ ...prev, parcels: false }));
      });
  }, [user]);

  const formatKey = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/Id\b/g, "ID")
      .replace(/Gps\b/g, "GPS");
  };

  const getIconForKey = (key: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      full_name: <User className="w-4 h-4" />,
      national_id: <FileText className="w-4 h-4" />,
      contact_phone: <Phone className="w-4 h-4" />,
      contact_email: <Mail className="w-4 h-4" />,
      permanent_address: <Home className="w-4 h-4" />,
      current_address: <Building className="w-4 h-4" />,
      date_created: <Calendar className="w-4 h-4" />,
      last_updated: <Calendar className="w-4 h-4" />,
      owner_type: <User className="w-4 h-4" />,
      status: <Percent className="w-4 h-4" />,

      cadastral_number: <FileText className="w-4 h-4" />,
      survey_number: <FileText className="w-4 h-4" />,
      block_number: <Building className="w-4 h-4" />,
      sector_number: <Navigation className="w-4 h-4" />,
      mouza_name: <Globe className="w-4 h-4" />,
      full_address: <MapPin className="w-4 h-4" />,
      ward_number: <Building className="w-4 h-4" />,
      municipality: <Building className="w-4 h-4" />,
      city: <Globe className="w-4 h-4" />,
      total_area: <Navigation className="w-4 h-4" />,
      current_market_value: <DollarSign className="w-4 h-4" />,
      annual_tax_value: <DollarSign className="w-4 h-4" />,
      land_use_zone: <MapPin className="w-4 h-4" />,
      registration_date: <Calendar className="w-4 h-4" />,
      registration_number: <FileText className="w-4 h-4" />,
    };

    return iconMap[key] || <FileText className="w-4 h-4" />;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getValueColor = (key: string, value: any) => {
    if (key.includes("status") || key.includes("type")) {
      if (value === "Active" || value === "Verified") return "text-green-600";
      if (value === "Inactive" || value === "Pending") return "text-amber-600";
      if (value === "Rejected" || value === "Cancelled") return "text-red-600";
    }

    if (
      key.includes("value") ||
      key.includes("amount") ||
      key.includes("price")
    ) {
      return "text-blue-600";
    }

    if (key.includes("date")) {
      return "text-purple-600";
    }

    return "text-gray-900";
  };

  if (!profile && !loading.profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-[1.02] transition-transform duration-300">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-r from-rose-100 to-pink-100 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-6">
            You are not registered as a land owner in our system.
          </p>
          <button
            onClick={() => (window.location.href = "/register")}
            className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Register as Owner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Owner Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your land parcels and profile information
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </p>
              </div>
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {profile?.first_name?.charAt(0)?.toUpperCase() ||
                  profile?.last_name?.charAt(0)?.toUpperCase() ||
                  (user?.username?.charAt(0) ?? "").toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Fix CSS classes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Parcels</p>
                <p className="text-2xl font-bold mt-1">{stats.totalParcels}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Area</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.totalArea.toLocaleString()} m²
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active Parcels</p>
                <p className="text-2xl font-bold mt-1">{stats.activeParcels}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
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
            </div>
          </div>

          <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Avg. Area</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.averageArea.toFixed(0)} m²
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Data */}
        <div className="p-6">
          {loading.profile ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : profile ? (
            <div className="space-y-4">
              {Object.entries(profile).map(([key, value]) => {
                if (value === null || value === undefined) return null;

                const formattedKey = formatKey(key);
                const icon = getIconForKey(key);
                const valueColor = getValueColor(key, value);

                return (
                  <div
                    key={key}
                    className="flex items-start gap-4 p-4 bg-linear-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                      <div className="text-blue-600">{icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {formattedKey}
                      </p>
                      <p
                        className={`font-medium ${valueColor} wrap-break-word`}
                      >
                        {typeof value === "string" && value.includes("http") ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                          >
                            {value}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          value.toString()
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No profile data available</p>
            </div>
          )}

          {profile && (
            <button
              onClick={() => (window.location.href = "/profile/edit")}
              className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Edit Profile Information
            </button>
          )}
        </div>

        {/* Land Parcels Card */}

        {/* Land Parcels Card */}
        <div>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-linear-to-r from-emerald-600 to-green-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Land Properties
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    All registered land parcels
                  </p>
                </div>
              </div>
            </div>

            {/* Parcels Data */}
            <div className="p-6">
              {loading.parcels ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : parcels.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No Properties Found
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    You haven't registered any land properties yet.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/parcel/add")}
                    className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Register First Property
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {parcels.map((parcel, index) => (
                    <div
                      key={parcel.parcel_id || index}
                      className="group bg-linear-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Parcel Header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            {parcel.cadastral_number || `Property ${index + 1}`}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {parcel.location || "Address not specified"}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-linear-to-r from-emerald-100 to-green-100 text-emerald-800 text-xs font-semibold rounded-full">
                          {parcel.land_use_zone || "Not Specified"}
                        </span>
                      </div>

                      {/* Parcel Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(parcel).map(([key, value]) => {
                          if (value === null || value === undefined)
                            return null;
                          if (
                            [
                              "parcel_id",
                              "cadastral_number",
                              "full_address",
                              "land_use_zone",
                            ].includes(key)
                          )
                            return null;

                          const formattedKey = formatKey(key);
                          const icon = getIconForKey(key);
                          const valueColor = getValueColor(key, value);

                          return (
                            <div
                              key={key}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
                                <div className="text-emerald-600">{icon}</div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500 truncate">
                                  {formattedKey}
                                </p>
                                <p
                                  className={`text-sm font-medium ${valueColor} truncate`}
                                >
                                  {typeof value === "object"
                                    ? JSON.stringify(value)
                                    : value.toString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                        <button
                          onClick={() =>
                            (window.location.href = `/parcel/${
                              parcel.parcel_id || index
                            }`)
                          }
                          className="flex-1 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = `/parcel/${
                              parcel.parcel_id || index
                            }/documents`)
                          }
                          className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          Documents
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {parcels.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                      Showing{" "}
                      <span className="font-bold text-gray-900">
                        {parcels.length}
                      </span>{" "}
                      propert{parcels.length === 1 ? "y" : "ies"}
                    </p>
                    <button
                      onClick={() => (window.location.href = "/parcels")}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      View All Properties
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-500 to-cyan-400 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Properties</p>
              <p className="text-xl font-bold mt-2">{parcels.length}</p>
            </div>
            <MapPin className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-pink-400 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Profile Status</p>
              <p className="text-lg font-bold mt-2">
                {profile?.status || "Active"}
              </p>
            </div>
            <User className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-amber-500 to-orange-400 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Owner Type</p>
              <p className="text-lg font-bold mt-2">
                {profile?.owner_type || "Individual"}
              </p>
            </div>
            <Building className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-emerald-500 to-green-400 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Last Updated</p>
              <p className="text-sm font-bold mt-2">
                {profile?.last_updated
                  ? new Date(profile.last_updated).toLocaleDateString()
                  : "Today"}
              </p>
            </div>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

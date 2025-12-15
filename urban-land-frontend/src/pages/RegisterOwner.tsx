import React, { useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

interface OwnerForm {
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  national_id: string;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  contact_phone: string;
  contact_email: string;
  permanent_address: string;
  current_address: string;
  owner_type: "Individual" | "Company" | "Government" | "Trust";
  registration_number: string;
  tax_id: string;
  contact_person: string;
  notes: string;
  status: "Active" | "Inactive" | "Deceased";
  // Image fields - optional
  profile_picture?: File | null;
  id_card_front?: File | null;
  id_card_back?: File | null;
  signature?: File | null;
}

// Preview URLs for images
interface ImagePreviews {
  profile_picture: string | null;
  id_card_front: string | null;
  id_card_back: string | null;
  signature: string | null;
}

// Type for image field keys used throughout the component
type ImageField = keyof ImagePreviews;

const RegisterOwner: React.FC = () => {
  const navigate = useNavigate();
const emptyForm: OwnerForm = {
  username: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  national_id: "",
  date_of_birth: "",
  gender: "Male",
  contact_phone: "",
  contact_email: "",
  permanent_address: "",
  current_address: "",
  owner_type: "Individual",
  registration_number: "",
  tax_id: "",
  contact_person: "",
  notes: "",
  status: "Active",
  // Image fields are optional, so we don't need to define them here
};
  const [form, setForm] = useState<OwnerForm>(emptyForm);
  const [previews, setPreviews] = useState<ImagePreviews>({
    profile_picture: null,
    id_card_front: null,
    id_card_back: null,
    signature: null,
  });
  const [existingImageUrls, setExistingImageUrls] = useState<ImagePreviews>({
    profile_picture: null,
    id_card_front: null,
    id_card_back: null,
    signature: null,
  });

  const [userFound, setUserFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Refs for file inputs
 const profilePictureRef = useRef<HTMLInputElement>(null);
 const idCardFrontRef = useRef<HTMLInputElement>(null);
 const idCardBackRef = useRef<HTMLInputElement>(null);
 const signatureRef = useRef<HTMLInputElement>(null);
 const searchUser = async () => {
  if (!form.username.trim()) {
    setSearchError("Please enter the land owner's username");
    return;
  }

  setIsSearching(true);
  setSearchError(null);

  try {
    // First search for user
    const userRes = await api.get(`/users/?username=${form.username}`);
    console.log("User search response:", userRes.data);
    
    // Handle different response structures
    let users = [];
    if (Array.isArray(userRes.data)) {
      users = userRes.data;
    } else if (userRes.data.results && Array.isArray(userRes.data.results)) {
      users = userRes.data.results;
    } else if (userRes.data.data && Array.isArray(userRes.data.data)) {
      users = userRes.data.data;
    }
    
    if (users.length === 0) {
      setSearchError(
        "User not found. The user must be registered in the system first."
      );
      return;
    }

    const user = users[0];
    console.log("Found user:", user);

    // Check if user object exists and has role property
    if (!user) {
      setSearchError("User data is malformed. Please try again.");
      return;
    }

    // Check if user is an owner - now safe to access role
    if (!user.role) {
      setSearchError("User role information is missing.");
      return;
    }

    if (user.role !== "owner") {
      setSearchError(
        `This user has role: "${user.role}". Only users with "owner" role can have owner profiles.`
      );
      return;
    }

    // Try to get existing owner profile
    try {
      const profileRes = await api.get(`/owners/?username=${user.username}`);
      console.log("Profile response:", profileRes.data);

      // Handle profile response structure
      let profileData = [];
      if (Array.isArray(profileRes.data)) {
        profileData = profileRes.data;
      } else if (profileRes.data.results && Array.isArray(profileRes.data.results)) {
        profileData = profileRes.data.results;
      }

      if (profileData.length > 0) {
        // Existing profile found - load it
        const existingProfile = profileData[0];
        setForm({
          ...emptyForm,
          ...existingProfile,
          username: user.username,
          // Explicitly set image fields to undefined since they're not in the API response
          profile_picture: undefined,
          id_card_front: undefined,
          id_card_back: undefined,
          signature: undefined,
        });

        // Store existing image URLs for display
        setExistingImageUrls({
          profile_picture: existingProfile.profile_picture_url || null,
          id_card_front: existingProfile.id_card_front_url || null,
          id_card_back: existingProfile.id_card_back_url || null,
          signature: existingProfile.signature_url || null,
        });

        setSearchError(null);
      } else {
        // No existing profile - start fresh
        setForm({
          ...emptyForm,
          username: user.username,
        });
        setSearchError(null);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (profileError) {
      console.log("No existing profile found, starting fresh");
      setForm({
        ...emptyForm,
        username: user.username,
      });
    }

    setUserFound(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Search error details:", err);
    console.error("Full error:", err.response?.data || err);

    if (err.response?.status === 404) {
      setSearchError(
        "User not found in the system. Please register the user first."
      );
    } else if (err.response?.status === 401) {
      setSearchError("Authentication error. Please login again.");
    } else if (err.message?.includes("Network Error")) {
      setSearchError("Network error. Please check your connection.");
    } else {
      setSearchError(
        `Error: ${
          err.response?.data?.detail || 
          err.response?.data?.message || 
          err.message || 
          "Unknown error occurred"
        }`
      );
    }
  } finally {
    setIsSearching(false);
  }
};

const handleImageChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  field: ImageField // Use ImageField type
) => {
  const file = e.target.files?.[0] || null;

  if (file) {
    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setForm({ ...form, [field]: file });

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviews({ ...previews, [field]: previewUrl });
  }
};


  const removeImage = (field: ImageField) => { // Use ImageField type
  setForm({ ...form, [field]: null });
  setPreviews({ ...previews, [field]: null });
  
  // Clear file input value
  const refs: Record<ImageField, React.RefObject<HTMLInputElement | null>> = {
    profile_picture: profilePictureRef,
    id_card_front: idCardFrontRef,
    id_card_back: idCardBackRef,
    signature: signatureRef,
  };
  
  if (refs[field].current) {
    refs[field].current.value = '';
  }
};
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userFound) {
      alert("Please search and validate owner username first.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add all form fields
      Object.entries(form).forEach(([key, value]) => {
        if (key === "username") {
          formData.append(key, value);
        } else if (value !== null && value !== undefined && value !== "") {
          if (value instanceof File) {
            // Add files
            formData.append(key, value);
          } else if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Check if profile exists by searching with username
      const checkRes = await api.get(`/owners/?username=${form.username}`);

      if (checkRes.data.length > 0) {
        // Update existing
        const profileId = checkRes.data[0].id;
        await api.put(`/owners/${profileId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Owner profile updated successfully!");
      } else {
        // Create new
        await api.post("/owners/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Owner profile created successfully!");
      }

      // Clear form and redirect
      setUserFound(false);
      setForm(emptyForm);
      setPreviews({
        profile_picture: null,
        id_card_front: null,
        id_card_back: null,
        signature: null,
      });
      setExistingImageUrls({
        profile_picture: null,
        id_card_front: null,
        id_card_back: null,
        signature: null,
      });

      setTimeout(() => {
        navigate("/owners");
      }, 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Save error details:", err.response?.data || err);

      if (err.response?.status === 400) {
        const errors = err.response.data;
        let errorMsg = "Validation errors: ";
        Object.keys(errors).forEach((key) => {
          errorMsg += `${key}: ${
            Array.isArray(errors[key]) ? errors[key].join(", ") : errors[key]
          }; `;
        });
        alert(errorMsg);
      } else {
        alert(
          `Error saving owner profile: ${
            err.response?.data?.detail || "Unknown error"
          }`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && form.username.trim()) {
      searchUser();
    }
  };

  // Clean up preview URLs on unmount
  React.useEffect(() => {
    return () => {
      Object.values(previews).forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);
const renderImageUpload = (
  label: string,
  field: ImageField, // Use ImageField type instead of keyof OwnerForm
  ref: React.RefObject<HTMLInputElement | null>, // Accept nullable ref
  description: string
) => {
  // TypeScript now knows that field is only ImageField
  const currentImage = previews[field] || existingImageUrls[field];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <p className="text-xs text-gray-500 mb-3">{description}</p>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="file"
            ref={ref}
            onChange={(e) => handleImageChange(e, field)}
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, GIF, WebP up to 5MB
          </p>
        </div>

        {currentImage && (
          <button
            type="button"
            onClick={() => removeImage(field)}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        )}
      </div>

      {currentImage && (
        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Preview:</p>
          <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={currentImage}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Owner Profile Registration
                </h1>
                <p className="text-blue-100 mt-2">
                  Search for a user and complete their owner profile information
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                  <span className="text-sm text-white font-medium">
                    {userFound ? "User Found" : "Search Required"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Owner by Username
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                    placeholder="Enter username..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                    disabled={isSearching}
                  />
                </div>
                <button
                  type="button"
                  onClick={searchUser}
                  disabled={isSearching || !form.username.trim()}
                  className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-30"
                >
                  {isSearching ? (
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Search & Validate
                    </>
                  )}
                </button>
              </div>

              {searchError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
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
                    <span className="text-sm text-red-700">{searchError}</span>
                  </div>
                </div>
              )}

              {userFound && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-green-700 font-medium">
                      User found! You can now edit the owner profile below.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          {userFound && (
            <form onSubmit={submit} className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Owner Profile Details
                </h2>
                <p className="text-gray-600">
                  Complete all required information for the owner profile
                </p>
              </div>

              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.first_name}
                        onChange={(e) =>
                          setForm({ ...form, first_name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.middle_name}
                        onChange={(e) =>
                          setForm({ ...form, middle_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.last_name}
                        onChange={(e) =>
                          setForm({ ...form, last_name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        National ID *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.national_id}
                        onChange={(e) =>
                          setForm({ ...form, national_id: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.date_of_birth}
                        onChange={(e) =>
                          setForm({ ...form, date_of_birth: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        value={form.gender}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            gender: e.target.value as OwnerForm["gender"],
                          })
                        }
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

              {/* Image Uploads Section */}
<div className="bg-gray-50 p-5 rounded-xl">
  <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
    Identity Documents & Images
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {renderImageUpload(
      "Profile Picture",
      "profile_picture",
      profilePictureRef,
      "Upload a clear photo of the owner (optional)"
    )}
    
    {renderImageUpload(
      "ID Card Front",
      "id_card_front",
      idCardFrontRef,
      "Front side of national ID card (recommended)"
    )}
    
    {renderImageUpload(
      "ID Card Back",
      "id_card_back",
      idCardBackRef,
      "Back side of national ID card (optional)"
    )}
    
    {renderImageUpload(
      "Signature",
      "signature",
      signatureRef,
      "Owner's signature (recommended)"
    )}
  </div>
</div>
                {/* Contact Information Section */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.contact_phone}
                        onChange={(e) =>
                          setForm({ ...form, contact_phone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.contact_email}
                        onChange={(e) =>
                          setForm({ ...form, contact_email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Permanent Address *
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.permanent_address}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            permanent_address: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Address
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.current_address}
                        onChange={(e) =>
                          setForm({ ...form, current_address: e.target.value })
                        }
                        placeholder="If different from permanent address"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information Section */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Type *
                      </label>
                      <select
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        value={form.owner_type}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            owner_type: e.target
                              .value as OwnerForm["owner_type"],
                          })
                        }
                      >
                        <option value="Individual">Individual</option>
                        <option value="Company">Company</option>
                        <option value="Government">Government</option>
                        <option value="Trust">Trust</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.registration_number}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            registration_number: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.tax_id}
                        onChange={(e) =>
                          setForm({ ...form, tax_id: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        value={form.contact_person}
                        onChange={(e) =>
                          setForm({ ...form, contact_person: e.target.value })
                        }
                        placeholder="For company/government entities"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <div className="flex space-x-4">
                        {["Active", "Inactive", "Deceased"].map((status) => (
                          <label
                            key={status}
                            className="inline-flex items-center"
                          >
                            <input
                              type="radio"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              checked={form.status === status}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  status: e.target.value as OwnerForm["status"],
                                })
                              }
                              value={status}
                            />
                            <span className="ml-2 text-gray-700">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Additional Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      placeholder="Enter any additional notes or comments about this owner..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1"
                  >
                    {isSubmitting ? (
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
                        Processing...
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
                        Save Owner Profile
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserFound(false);
                      setForm(emptyForm);
                      setPreviews({
                        profile_picture: null,
                        id_card_front: null,
                        id_card_back: null,
                        signature: null,
                      });
                      setExistingImageUrls({
                        profile_picture: null,
                        id_card_front: null,
                        id_card_back: null,
                        signature: null,
                      });
                      setSearchError(null);
                    }}
                    className="px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Clear Form
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  * indicates required field
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterOwner;

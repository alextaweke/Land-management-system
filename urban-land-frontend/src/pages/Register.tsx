import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Register: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "owner",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  const nav = useNavigate();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      await api.post("/register/", {
        username: form.username,
        password: form.password,
        role: form.role,
      });

      setSuccess(true);
      setTimeout(() => {
        nav("/login");
      }, 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.username?.[0] ||
        "Registration failed. Please try again.";

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-3xl font-bold text-gray-900">
            Land Registry System
          </h1>
          <p className="text-gray-600 mt-2">
            Create your account to get started
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-green-500"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Account Created Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your account has been registered successfully. Redirecting to
                  login...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Create Account
                </h2>

                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
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
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-red-700">
                        {errors.general}
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter your username"
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.username ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        value={form.username}
                        onChange={(e) => {
                          setForm({ ...form, username: e.target.value });
                          if (errors.username)
                            setErrors({ ...errors, username: undefined });
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="Create a strong password"
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.password ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        value={form.password}
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value });
                          if (errors.password)
                            setErrors({ ...errors, password: undefined });
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      At least 6 characters required
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.confirmPassword
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        value={form.confirmPassword}
                        onChange={(e) => {
                          setForm({ ...form, confirmPassword: e.target.value });
                          if (errors.confirmPassword)
                            setErrors({
                              ...errors,
                              confirmPassword: undefined,
                            });
                        }}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                          form.role === "owner"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="owner"
                          checked={form.role === "owner"}
                          onChange={(e) =>
                            setForm({ ...form, role: e.target.value })
                          }
                          className="sr-only"
                          disabled={isLoading}
                        />
                        <div className="text-center">
                          <svg
                            className={`w-6 h-6 mx-auto mb-2 ${
                              form.role === "owner"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
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
                          <span
                            className={`block text-sm font-medium ${
                              form.role === "owner"
                                ? "text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            Land Owner
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Register land properties
                          </span>
                        </div>
                      </label>
                      <label
                        className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                          form.role === "officer"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="officer"
                          checked={form.role === "officer"}
                          onChange={(e) =>
                            setForm({ ...form, role: e.target.value })
                          }
                          className="sr-only"
                          disabled={isLoading}
                        />
                        <div className="text-center">
                          <svg
                            className={`w-6 h-6 mx-auto mb-2 ${
                              form.role === "officer"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
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
                          <span
                            className={`block text-sm font-medium ${
                              form.role === "officer"
                                ? "text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            Officer
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Manage land records
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-linear-to-r from-green-500 to-blue-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
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
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* Terms and Conditions */}
                <p className="mt-6 text-center text-xs text-gray-500">
                  By creating an account, you agree to our{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Privacy Policy
                  </a>
                </p>

                {/* Login Link */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-center text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support@landregistry.gov
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

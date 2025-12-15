import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Eye, EyeOff, User, Lock, AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required = false,
  showPasswordToggle = false,
  onTogglePassword,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`relative flex items-center border rounded-lg transition-all duration-200 ${
          isFocused
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <div className="absolute left-3 text-gray-400">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-10 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {type === "password" ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
    <div className="flex items-center">
      <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
      <div className="flex-1">
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-3 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      )}
    </div>
  </div>
);

interface LoginCardProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  username: string;
  onUsernameChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  error?: string;
  onErrorDismiss?: () => void;
  loading?: boolean;
}

const LoginCard: React.FC<LoginCardProps> = ({
  onSubmit,
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  error,
  onErrorDismiss,
  loading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100 text-sm">
            Sign in to your account to continue
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="px-8 py-6 space-y-6">
        {error && <ErrorAlert message={error} onDismiss={onErrorDismiss} />}

        <FormField
          label="Username"
          type="text"
          value={username}
          onChange={onUsernameChange}
          placeholder="Enter your username"
          icon={<User size={18} />}
          required
        />

        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={onPasswordChange}
          placeholder="Enter your password"
          icon={<Lock size={18} />}
          required
          showPasswordToggle
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          } text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2 fill-current text-gray-800"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const ok = await login(username, password);
      if (ok) {
        navigate("/");
      } else {
        setError("Invalid username or password. Please try again.");
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleErrorDismiss = () => {
    setError("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="w-full max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Hero section */}
          <div className="hidden md:block">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  LandRegistry
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Secure Land Management <br />
                <span className="text-blue-600">Simplified</span>
              </h1>

              <p className="text-lg text-gray-600">
                Access your land registry portal to manage properties, view
                documents, and track transactions securely.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-green-600"
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
                  </div>
                  <span className="text-gray-700">
                    Secure & encrypted access
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-blue-600"
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
                  <span className="text-gray-700">Real-time land records</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-purple-600"
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
                  <span className="text-gray-700">
                    24/7 access to documents
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex justify-center">
            <LoginCard
              onSubmit={handleSubmit}
              username={username}
              onUsernameChange={setUsername}
              password={password}
              onPasswordChange={setPassword}
              error={error}
              onErrorDismiss={handleErrorDismiss}
              loading={loading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} LandRegistry. All rights reserved.{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </a>
            {" · "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </a>
          </p>
          <p className="mt-1">
            Need help?{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

// App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterOwner from "./pages/RegisterOwner";
import { LandCreate } from "./pages/land";
import { useAuth } from "./auth/useAuth";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProfile from "./pages/Profile";
import Users from "./pages/Users";
import LandParcels from "./pages/land/LandParcels";
import LandDetail from "./pages/land/LandDetail";
import OwnerSearch from "./pages/OwnerSearch";
// Protected Route Wrapper
type PrivateRouteProps = { children: React.ReactNode };
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

// Role-based Route Wrapper
type RoleRouteProps = { children: React.ReactNode; roles: string[] };
const RoleRoute = ({ children, roles }: RoleRouteProps) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/users"
        element={
          <Layout>
            <RoleRoute roles={["admin"]}>
              <Users />
            </RoleRoute>
          </Layout>
        }
      />

      {/* Land Parcels Management */}
      <Route
        path="/parcels"
        element={
          <Layout>
            <PrivateRoute>
              <LandParcels />
            </PrivateRoute>
          </Layout>
        }
      />

      {/* Individual Land Parcel Detail */}
      <Route
        path="/parcels/:id"
        element={
          <Layout>
            <PrivateRoute>
              {/* You'll need to create this component */}
              <LandDetail />
            </PrivateRoute>
          </Layout>
        }
      />
      <Route
        path="/"
        element={
          <Layout>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </Layout>
        }
      />

      {/* Land Parcels */}
      <Route
        path="/land/create"
        element={
          <Layout>
            <PrivateRoute>
              <LandCreate />
            </PrivateRoute>
          </Layout>
        }
      />

      {/* Register Owner (admin + officer) */}
      <Route
        path="/register-owner"
        element={
          <Layout>
            <RoleRoute roles={["admin", "officer"]}>
              <RegisterOwner />
            </RoleRoute>
          </Layout>
        }
      />

      {/* Owner Dashboard */}
      <Route
        path="/owner"
        element={
          <Layout>
            <RoleRoute roles={["owner"]}>
              <OwnerDashboard />
            </RoleRoute>
          </Layout>
        }
      />

      {/* Unified Owner Profile Routes */}
      {/* Route for searching (admin/officer) and viewing own profile (owner) */}
      <Route
        path="/owners"
        element={
          <Layout>
            <PrivateRoute>
              <OwnerProfile />
            </PrivateRoute>
          </Layout>
        }
      />

      {/* Route for viewing specific owner profile */}
      <Route
        path="/owners/:id"
        element={
          <Layout>
            <PrivateRoute>
              <OwnerProfile />
            </PrivateRoute>
          </Layout>
        }
      />

      {/* Route for owner to view their own profile (alternative) */}
      <Route
        path="/my-profile"
        element={
          <Layout>
            <RoleRoute roles={["owner"]}>
              <OwnerProfile />
            </RoleRoute>
          </Layout>
        }
      />
      <Route
        path="/ownersearch"
        element={
          <Layout>
            <RoleRoute roles={["admin", "officer"]}>
              <OwnerSearch />
            </RoleRoute>
          </Layout>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;

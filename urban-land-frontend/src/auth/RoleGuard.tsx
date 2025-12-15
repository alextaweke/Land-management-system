import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RoleGuard = ({ children, role }: any) => {
  const { user } = useAuth();
  if (!user || user.role !== role) return <Navigate to="/" />;
  return children;
};

export default RoleGuard;

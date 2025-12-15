import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrivateRoute = ({ children }: any) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default PrivateRoute;

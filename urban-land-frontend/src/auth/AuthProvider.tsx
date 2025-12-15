import { useState, type ReactNode } from "react";
import api from "../api/axios";
import { AuthContext, type AuthContextType, type User } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const res = await api.post("/token/", { username, password });

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      setUser(res.data.user); // user object returned from backend
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.response?.data);
      return false;
    }
  };

  const logout: AuthContextType["logout"] = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

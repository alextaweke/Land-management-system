import { createContext } from "react";

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

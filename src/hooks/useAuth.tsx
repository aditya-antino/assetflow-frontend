import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { User } from "../types";
import * as authService from "../services/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("assetflow_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem("assetflow_token");
        localStorage.removeItem("assetflow_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await authService.login(email, password);
    localStorage.setItem("assetflow_token", token);
    localStorage.setItem("assetflow_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("assetflow_token");
    localStorage.removeItem("assetflow_user");
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

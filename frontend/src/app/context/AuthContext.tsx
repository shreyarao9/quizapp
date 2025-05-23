"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  login: (token: string, isAdmin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("token");
    const admin = localStorage.getItem("isAdmin") === "true";
    if (stored) {
      setToken(stored);
      setIsAdmin(admin);
    }
  }, []);

  const login = (newToken: string, adminFlag: boolean) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("isAdmin", String(adminFlag));
    setToken(newToken);
    setIsAdmin(adminFlag);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

"use client";

import { useEffect, useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role") as "admin" | "user" | null;
    if (t && r) {
      setToken(t);
      setRole(r);
    }
    setLoading(false);
  }, []);

  const login = (token: string, is_admin: boolean) => {
    const role = is_admin ? "admin" : "user";
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setToken(token);
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  return { token, role, login, logout, loading, isAuthenticated: !!token };
}

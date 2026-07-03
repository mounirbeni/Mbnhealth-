"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearTokens, getAccessToken, setTokens } from "./api-client";
import type { AuthenticatedUser, LoginResponse } from "@/types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  verifyMfa: (challengeToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await api.get<Record<string, any>>("/auth/me");
      setUser({
        userId: me.id,
        tenantId: me.tenantId,
        roleId: me.roleId,
        roleName: me.role?.name,
        systemRole: me.role?.systemRole ?? null,
        permissions: me.role?.permissions ?? [],
        email: me.email,
        firstName: me.firstName,
        lastName: me.lastName,
      });
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<LoginResponse>("/auth/login", { email, password }, { skipAuth: true });
    if (res.accessToken && res.refreshToken) {
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user ?? null);
    }
    return res;
  }, []);

  const verifyMfa = useCallback(async (challengeToken: string, code: string) => {
    const res = await api.post<LoginResponse>("/auth/mfa/verify", { challengeToken, code }, { skipAuth: true });
    if (res.accessToken && res.refreshToken) {
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user ?? null);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("mbn_refresh_token");
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch {
      // ignore network errors on logout
    }
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const hasPermission = useCallback((permission: string) => user?.permissions.includes(permission as any) ?? false, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, verifyMfa, logout, hasPermission, refreshMe: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

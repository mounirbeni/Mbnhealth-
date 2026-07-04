"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { portalApi, clearPortalTokens, getPortalAccessToken, getPortalRefreshToken, setPortalTokens } from "./portal-api-client";

export interface PortalPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mrn: string;
}

interface PortalSession {
  accessToken: string;
  refreshToken: string;
  patient: { patientId: string; firstName: string; lastName: string; email: string | null };
}

interface PortalAuthContextValue {
  patient: PortalPatient | null;
  isLoading: boolean;
  activate: (mrn: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextValue | undefined>(undefined);

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PortalPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadPatient = useCallback(async () => {
    const token = getPortalAccessToken();
    if (!token) {
      setPatient(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await portalApi.get<any>("/portal/auth/me");
      setPatient({ id: me.id, firstName: me.firstName, lastName: me.lastName, email: me.email, mrn: me.mrn });
    } catch {
      clearPortalTokens();
      setPatient(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySession = (res: PortalSession) => {
    setPortalTokens(res.accessToken, res.refreshToken);
    setPatient({
      id: res.patient.patientId,
      firstName: res.patient.firstName,
      lastName: res.patient.lastName,
      email: res.patient.email,
      mrn: "",
    });
  };

  const activate = useCallback(async (mrn: string, email: string, password: string) => {
    const res = await portalApi.post<PortalSession>("/portal/auth/activate", { mrn, email, password }, { skipAuth: true });
    applySession(res);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await portalApi.post<PortalSession>("/portal/auth/login", { email, password }, { skipAuth: true });
    applySession(res);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getPortalRefreshToken();
    try {
      if (refreshToken) await portalApi.post("/portal/auth/logout", { refreshToken });
    } catch {
      // ignore network errors on logout
    }
    clearPortalTokens();
    setPatient(null);
    router.push("/portal/login");
  }, [router]);

  return (
    <PortalAuthContext.Provider value={{ patient, isLoading, activate, login, logout }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error("usePortalAuth must be used within PortalAuthProvider");
  return ctx;
}

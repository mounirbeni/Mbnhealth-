"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { patientApi, getPatientToken, setPatientToken, clearPatientToken } from "./patient-api-client";

export interface AuthenticatedPatient {
  patientAccountId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface PatientAuthContextValue {
  patient: AuthenticatedPatient | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const PatientAuthContext = createContext<PatientAuthContextValue | undefined>(undefined);

export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<AuthenticatedPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadMe = useCallback(async () => {
    const token = getPatientToken();
    if (!token) {
      setPatient(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await patientApi.get<{ id: string; email: string; firstName: string; lastName: string }>(
        "/public/patient-auth/me",
      );
      setPatient({ patientAccountId: me.id, email: me.email, firstName: me.firstName, lastName: me.lastName });
    } catch {
      clearPatientToken();
      setPatient(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await patientApi.post<{ accessToken: string; patient: AuthenticatedPatient }>(
      "/public/patient-auth/login",
      { email, password },
      { skipAuth: true },
    );
    setPatientToken(res.accessToken);
    setPatient(res.patient);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await patientApi.post<{ accessToken: string; patient: AuthenticatedPatient }>(
      "/public/patient-auth/register",
      input,
      { skipAuth: true },
    );
    setPatientToken(res.accessToken);
    setPatient(res.patient);
  }, []);

  const logout = useCallback(() => {
    clearPatientToken();
    setPatient(null);
    router.push("/find-a-clinic");
  }, [router]);

  return (
    <PatientAuthContext.Provider value={{ patient, isLoading, login, register, logout }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) throw new Error("usePatientAuth must be used within PatientAuthProvider");
  return ctx;
}

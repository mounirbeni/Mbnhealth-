import { ApiError } from "./api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const PATIENT_TOKEN_KEY = "mbn_patient_access_token";

// Deliberately separate from api-client.ts's staff token storage/refresh
// flow: a patient portal session must never share state with a staff
// session, and the API only accepts a patient token on /public/* routes
// that require auth (see apps/api/src/patient-portal).
export function getPatientToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PATIENT_TOKEN_KEY);
}

export function setPatientToken(token: string) {
  localStorage.setItem(PATIENT_TOKEN_KEY, token);
}

export function clearPatientToken() {
  localStorage.removeItem(PATIENT_TOKEN_KEY);
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

async function patientFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;
  const token = getPatientToken();

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }
    const message =
      (payload as { message?: string | string[] })?.message ?? response.statusText ?? "Request failed";
    throw new ApiError(response.status, Array.isArray(message) ? message.join(", ") : message, payload);
  }

  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) return response.json();
  return response.text() as unknown as T;
}

export const patientApi = {
  get: <T>(path: string, options?: RequestOptions) => patientFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    patientFetch<T>(path, { ...options, method: "POST", body }),
};

export { ApiError };

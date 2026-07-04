import { API_URL, ApiError } from "./api-client";

const ACCESS_TOKEN_KEY = "mbn_portal_access_token";
const REFRESH_TOKEN_KEY = "mbn_portal_refresh_token";

export function getPortalAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getPortalRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setPortalTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearPortalTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshPortalAccessToken(): Promise<string | null> {
  const refreshToken = getPortalRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/v1/portal/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          clearPortalTokens();
          return null;
        }
        const data = await res.json();
        setPortalTokens(data.accessToken, data.refreshToken);
        return data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

export async function portalFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;

  const doFetch = async (): Promise<Response> => {
    const token = getPortalAccessToken();
    return fetch(`${API_URL}/api/v1${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await doFetch();

  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshPortalAccessToken();
    if (newToken) {
      response = await doFetch();
    }
  }

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
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.text() as unknown as T;
}

export const portalApi = {
  get: <T>(path: string, options?: RequestOptions) => portalFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    portalFetch<T>(path, { ...options, method: "POST", body }),
};

export { ApiError };

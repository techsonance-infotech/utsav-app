import { useAuthStore } from "@utsav/stores";

let customApiBaseUrl: string | null = null;

export function setApiBaseUrl(url: string) {
  if (url && !url.endsWith("/api/v1")) {
    customApiBaseUrl = `${url.replace(/\/$/, "")}/api/v1`;
  } else {
    customApiBaseUrl = url;
  }
}

function getApiBaseUrl(): string {
  if (customApiBaseUrl) {
    return customApiBaseUrl;
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return `${window.location.origin}/api/v1`;
  }
  let url = process.env.NEXT_PUBLIC_APP_URL || process.env.EXPO_PUBLIC_API_URL || "https://utsav.app/api/v1";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  if (url && !url.endsWith("/api/v1")) {
    return `${url.replace(/\/$/, "")}/api/v1`;
  }
  return url;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  { params, ...customConfig }: RequestOptions = {}
): Promise<T> {
  const { accessToken, tenantId, userId, refreshToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (tenantId) {
    headers["x-tenant-id"] = tenantId;
  }
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  let url = `${getApiBaseUrl()}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  let response = await fetch(url, config);

  // If response is 401 Unauthorized, try to refresh token and retry
  if (
    !response.ok &&
    response.status === 401 &&
    refreshToken &&
    endpoint !== "/auth/refresh"
  ) {
    try {
      const refreshUrl = `${getApiBaseUrl()}/auth/refresh`;
      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.accessToken;
        const newRefreshToken = refreshData.refreshToken;

        // Update auth store with new tokens
        useAuthStore.getState().setAuth({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        // Retry the original request with the new access token
        const retryHeaders = {
          ...headers,
          "Authorization": `Bearer ${newAccessToken}`,
          ...customConfig.headers,
        };

        const retryConfig: RequestInit = {
          ...customConfig,
          headers: retryHeaders,
        };

        response = await fetch(url, retryConfig);
      } else {
        useAuthStore.getState().clearAuth();
      }
    } catch (refreshErr) {
      console.error("Failed to automatically refresh token:", refreshErr);
      useAuthStore.getState().clearAuth();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

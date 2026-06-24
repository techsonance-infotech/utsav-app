import { useAuthStore } from "@utsav/stores";

const API_BASE_URL = (() => {
  if (typeof window !== "undefined") {
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
})();

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  { params, ...customConfig }: RequestOptions = {}
): Promise<T> {
  const { accessToken, tenantId, userId } = useAuthStore.getState();

  const headers: HeadersInit = {
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

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

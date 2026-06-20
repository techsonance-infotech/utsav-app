import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../client";
import { useAuthStore } from "@utsav/stores";

export function useSignUp() {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      tenantId?: string;
    }) => {
      return apiClient<{
        user: { id: string; email: string; full_name: string };
      }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: { email: string; password?: string; phone?: string; otp?: string; tenantId?: string }) => {
      return apiClient<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string };
        tenant: { id: string; name: string; slug: string; role: string } | null;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },
    onSuccess: (data) => {
      setAuth({
        userId: data.user.id,
        accessToken: data.accessToken,
        tenantId: data.tenant?.id || null,
        tenantName: data.tenant?.name || null,
        tenantSlug: data.tenant?.slug || null,
        role: data.tenant?.role || null,
      });
    },
  });
}

export function useRefreshSession() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (refreshToken: string) => {
      return apiClient<{
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
      }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    },
    onSuccess: (data) => {
      setAuth({ accessToken: data.accessToken });
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      return apiClient("/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      clearAuth();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      return apiClient<{ success: boolean; message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      return apiClient<{ success: boolean }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return apiClient<{ success: boolean }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      return apiClient<{ success: boolean; message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}



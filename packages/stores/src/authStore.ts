import { create } from "zustand";

export interface AuthState {
  userId: string | null;
  tenantId: string | null;
  tenantSlug: string | null;
  tenantName: string | null;
  role: string | null;
  language: "en" | "hi" | "gu";
  accessToken: string | null;
  setAuth: (
    auth: Partial<Omit<AuthState, "setAuth" | "clearAuth" | "setLanguage" | "initialize">>
  ) => void;
  setLanguage: (lang: "en" | "hi" | "gu") => void;
  initialize: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  tenantId: null,
  tenantSlug: null,
  tenantName: null,
  role: null,
  language: "en",
  accessToken: null,
  setAuth: (auth) => set((state) => ({ ...state, ...auth })),
  setLanguage: (language) => set({ language }),
  initialize: () => {
    if (typeof window === "undefined") return;
    const userId = localStorage.getItem("utsav_user_id") || sessionStorage.getItem("utsav_user_id");
    const accessToken = localStorage.getItem("utsav_access_token") || sessionStorage.getItem("utsav_access_token");
    const tenantId = localStorage.getItem("utsav_tenant_id") || sessionStorage.getItem("utsav_tenant_id");
    const tenantSlug = localStorage.getItem("utsav_tenant_slug") || sessionStorage.getItem("utsav_tenant_slug");
    const tenantName = localStorage.getItem("utsav_tenant_name") || sessionStorage.getItem("utsav_tenant_name");
    const role = localStorage.getItem("utsav_role") || sessionStorage.getItem("utsav_role");

    if (userId || accessToken) {
      set({ userId, accessToken, tenantId, tenantSlug, tenantName, role });
    }
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      const keys = ["utsav_user_id", "utsav_access_token", "utsav_tenant_id", "utsav_tenant_slug", "utsav_tenant_name", "utsav_role"];
      keys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }
    set({
      userId: null,
      tenantId: null,
      tenantSlug: null,
      tenantName: null,
      role: null,
      accessToken: null,
    });
  },
}));

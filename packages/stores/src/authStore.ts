import { create } from "zustand";

let asyncStorage: any = null;
try {
  asyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (e) {
  // Catch block to prevent crashes in non-ReactNative environments
}

const persistItem = async (key: string, value: string | null) => {
  try {
    if (asyncStorage) {
      if (value === null) {
        await asyncStorage.removeItem(key);
      } else {
        await asyncStorage.setItem(key, value);
      }
    } else if (typeof window !== "undefined") {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    }
  } catch (err) {
    console.error(`Failed to persist key ${key}`, err);
  }
};

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
  initialize: () => void | Promise<void>;
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
  setAuth: (auth) => {
    set((state) => {
      const newState = { ...state, ...auth };
      Object.entries(auth).forEach(([key, val]) => {
        const storageKey = `utsav_${key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`;
        persistItem(storageKey, val as string | null);
      });
      return newState;
    });
  },
  setLanguage: (language) => set({ language }),
  initialize: async () => {
    if (asyncStorage) {
      try {
        const userId = await asyncStorage.getItem("utsav_user_id");
        const accessToken = await asyncStorage.getItem("utsav_access_token");
        const tenantId = await asyncStorage.getItem("utsav_tenant_id");
        const tenantSlug = await asyncStorage.getItem("utsav_tenant_slug");
        const tenantName = await asyncStorage.getItem("utsav_tenant_name");
        const role = await asyncStorage.getItem("utsav_role");

        if (userId || accessToken) {
          set({ userId, accessToken, tenantId, tenantSlug, tenantName, role });
        }
      } catch (e) {
        console.error("Failed to initialize auth store from AsyncStorage", e);
      }
    } else if (typeof window !== "undefined") {
      const userId = localStorage.getItem("utsav_user_id") || sessionStorage.getItem("utsav_user_id");
      const accessToken = localStorage.getItem("utsav_access_token") || sessionStorage.getItem("utsav_access_token");
      const tenantId = localStorage.getItem("utsav_tenant_id") || sessionStorage.getItem("utsav_tenant_id");
      const tenantSlug = localStorage.getItem("utsav_tenant_slug") || sessionStorage.getItem("utsav_tenant_slug");
      const tenantName = localStorage.getItem("utsav_tenant_name") || sessionStorage.getItem("utsav_tenant_name");
      const role = localStorage.getItem("utsav_role") || sessionStorage.getItem("utsav_role");

      if (userId || accessToken) {
        set({ userId, accessToken, tenantId, tenantSlug, tenantName, role });
      }
    }
  },
  clearAuth: () => {
    if (asyncStorage) {
      const keys = ["utsav_user_id", "utsav_access_token", "utsav_tenant_id", "utsav_tenant_slug", "utsav_tenant_name", "utsav_role"];
      Promise.all(keys.map((key) => asyncStorage.removeItem(key))).catch((err) => {
        console.error("Failed to clear AsyncStorage", err);
      });
    } else if (typeof window !== "undefined") {
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

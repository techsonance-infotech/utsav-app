const QUEUE_KEY = "utsav:offline:mutations";

export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: string;
  body: string;
  timestamp: number;
}

let storage: any = null;

async function getStorage() {
  if (storage) return storage;
  try {
    const AsyncStorageModule = require("@react-native-async-storage/async-storage");
    storage = AsyncStorageModule.default || AsyncStorageModule;
  } catch (e) {
    storage = {
      getItem: async (key: string) => (typeof window !== "undefined" ? window.localStorage.getItem(key) : null),
      setItem: async (key: string, value: string) => (typeof window !== "undefined" ? window.localStorage.setItem(key, value) : null),
    };
  }
  return storage;
}

export async function enqueueMutation(endpoint: string, method: string, body: unknown) {
  const store = await getStorage();
  const existingRaw = await store.getItem(QUEUE_KEY);
  const existing = JSON.parse(existingRaw ?? "[]");

  const mutationId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  existing.push({
    id: mutationId,
    endpoint,
    method,
    body: JSON.stringify(body),
    timestamp: Date.now(),
  });
  await store.setItem(QUEUE_KEY, JSON.stringify(existing));

  // Sync with Zustand store
  let type: "rsvp" | "chat_message" | "notification_read" = "rsvp";
  if (endpoint.includes("/chat/channels/")) {
    type = "chat_message";
  } else if (endpoint === "/notifications" && method === "PATCH") {
    type = "notification_read";
  }

  try {
    const { useOfflineStore } = require("@utsav/stores");
    useOfflineStore.getState().addToQueue({
      type,
      payload: body,
    });
  } catch (e) {
    console.warn("Could not sync mutation to Zustand store:", e);
  }
}

export async function flushMutationQueue(accessToken: string) {
  const store = await getStorage();
  const raw = await store.getItem(QUEUE_KEY);
  if (!raw) return;

  const queue: QueuedMutation[] = JSON.parse(raw);
  if (queue.length === 0) return;

  const remaining: QueuedMutation[] = [];
  
  let baseUrl = process.env.EXPO_PUBLIC_API_URL || "https://utsav.techsonance.co.in";
  if (baseUrl && !baseUrl.endsWith("/api/v1")) {
    baseUrl = `${baseUrl.replace(/\/$/, "")}/api/v1`;
  }

  const { useAuthStore } = require("@utsav/stores");
  const { tenantId, userId } = useAuthStore.getState();

  for (const mutation of queue) {
    try {
      const response = await fetch(`${baseUrl}${mutation.endpoint}`, {
        method: mutation.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "x-tenant-id": tenantId || "",
          "x-user-id": userId || "",
        },
        body: mutation.body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
    } catch (err) {
      console.error(`Failed to flush mutation ${mutation.id}:`, err);
      remaining.push(mutation);
    }
  }

  await store.setItem(QUEUE_KEY, JSON.stringify(remaining));

  // Sync Zustand store
  try {
    const { useOfflineStore } = require("@utsav/stores");
    const offlineStore = useOfflineStore.getState();
    offlineStore.clearQueue();
    for (const rem of remaining) {
      let type: "rsvp" | "chat_message" | "notification_read" = "rsvp";
      if (rem.endpoint.includes("/chat/channels/")) {
        type = "chat_message";
      } else if (rem.endpoint === "/notifications" && rem.method === "PATCH") {
        type = "notification_read";
      }
      offlineStore.addToQueue({
        type,
        payload: JSON.parse(rem.body),
      });
    }
  } catch (e) {
    console.warn("Could not sync remaining mutations to Zustand store:", e);
  }
}

export async function syncOfflineQueueFromStorage() {
  const store = await getStorage();
  const raw = await store.getItem(QUEUE_KEY);
  if (!raw) return;

  try {
    const queue: QueuedMutation[] = JSON.parse(raw);
    const { useOfflineStore } = require("@utsav/stores");
    const offlineStore = useOfflineStore.getState();
    offlineStore.clearQueue();
    for (const item of queue) {
      let type: "rsvp" | "chat_message" | "notification_read" = "rsvp";
      if (item.endpoint.includes("/chat/channels/")) {
        type = "chat_message";
      } else if (item.endpoint === "/notifications" && item.method === "PATCH") {
        type = "notification_read";
      }
      offlineStore.addToQueue({
        type,
        payload: JSON.parse(item.body),
      });
    }
  } catch (e) {
    console.warn("Could not sync queue from AsyncStorage to Zustand:", e);
  }
}

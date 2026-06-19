import { create } from "zustand";

export interface OfflineAction {
  id: string;
  type: "rsvp" | "chat_message" | "notification_read";
  payload: any;
  createdAt: string;
}

export interface OfflineState {
  isOnline: boolean;
  queue: OfflineAction[];
  setOnline: (isOnline: boolean) => void;
  addToQueue: (action: Omit<OfflineAction, "id" | "createdAt">) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: true,
  queue: [],
  setOnline: (isOnline) => set({ isOnline }),
  addToQueue: (action) =>
    set((state) => ({
      queue: [
        ...state.queue,
        {
          ...action,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),
  clearQueue: () => set({ queue: [] }),
}));

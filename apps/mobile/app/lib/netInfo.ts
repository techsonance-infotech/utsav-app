import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineStore, useAuthStore } from "@utsav/stores";
import { flushMutationQueue } from "@utsav/api-client";

export function useNetworkListener() {
  const setOnline = useOfflineStore((state) => state.setOnline);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? true;
      setOnline(online);

      if (online && accessToken) {
        flushMutationQueue(accessToken).catch((err) => {
          console.error("Failed to automatically flush mutation queue on reconnect:", err);
        });
      }
    });

    return unsubscribe;
  }, [setOnline, accessToken]);
}

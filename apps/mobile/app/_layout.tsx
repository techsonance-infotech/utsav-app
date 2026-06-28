import { Stack, SplashScreen, useSegments, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ActivityIndicator, View, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { setApiBaseUrl, syncOfflineQueueFromStorage } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useNetworkListener } from "./lib/netInfo";

// Set base API URL for the client using Metro-injected env variable
const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://utsav.techsonance.co.in";
setApiBaseUrl(apiUrl);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "utsav:query-cache",
  throttleTime: 1000,
});

export default function RootLayout() {
  useNetworkListener();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const segments = useSegments();

  useEffect(() => {
    async function init() {
      try {
        await useAuthStore.getState().initialize();
        await syncOfflineQueueFromStorage();
      } catch (err) {
        console.error("Failed to initialize auth store", err);
      } finally {
        setIsInitialized(true);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!userId) {
      // Session expired or logged out: redirect to welcome
      if (!inAuthGroup) {
        Alert.alert("Session Expired", "Your session has expired. Please sign in again.");
        router.replace("/(auth)/welcome");
      }
    } else {
      // User is logged in: don't allow accessing welcome/login/signup screens
      if (inAuthGroup && segments[1] !== "splash") {
        const { role, tenantId } = useAuthStore.getState();
        if (role === "super_admin") {
          router.replace("/(dashboard)/super-admin-dashboard");
        } else if (tenantId) {
          router.replace("/(dashboard)/home");
        } else {
          router.replace("/(auth)/tenant-setup");
        }
      }
    }
  }, [userId, segments, isInitialized]);

  if ((!fontsLoaded && !fontError) || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FAFAF8" }}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/splash" />
          <Stack.Screen name="(auth)/welcome" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/signup" />
          <Stack.Screen name="(auth)/verify-phone" />
          <Stack.Screen name="(auth)/otp-entry" />
          <Stack.Screen name="(auth)/tenant-setup" />
          <Stack.Screen name="(auth)/invitation-join" />
          <Stack.Screen name="(auth)/expired-invitation" />
          <Stack.Screen name="(auth)/add-phone" />
          <Stack.Screen name="(auth)/account-locked" />
        </Stack>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}


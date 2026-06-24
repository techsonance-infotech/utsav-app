import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";
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

import { setApiBaseUrl } from "@utsav/api-client";

// Set base API URL for the client using Metro-injected env variable
const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://utsav.techsonance.co.in";
setApiBaseUrl(apiUrl);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FAFAF8" }}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}


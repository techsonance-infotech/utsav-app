import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiClient } from "@utsav/api-client";
import Constants from "expo-constants";

// Set default notification handler
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function registerForPushNotifications() {
  if (Platform.OS === "web") return;

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permission for push notifications not granted.");
      return;
    }

    // Try to get token. ProjectId is required.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log("No EAS projectId configured in app.json. Skipping push token retrieval.");
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId }).catch((e: any) => {
      console.log("Expo token retrieval error (common in simulators/dev clients):", e.message);
      return null;
    });

    if (!tokenData || !tokenData.data) {
      return;
    }

    const token = tokenData.data;
    const platform = Platform.OS === "ios" ? "ios" : "android";

    await apiClient("/push-tokens", {
      method: "POST",
      body: JSON.stringify({ token, platform }),
    });
    console.log("Successfully registered Expo Push Token:", token);
  } catch (err: any) {
    console.warn("Error registering push notifications:", err.message);
  }
}

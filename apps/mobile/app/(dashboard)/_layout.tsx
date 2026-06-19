import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";

export default function DashboardLayout() {
  const activeColor = "#FF9500"; // Saffron
  const inactiveColor = "#9CA3AF"; // Gray 400

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "semibold",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>📢</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>🔔</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          title: "Donate",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>💖</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>📅</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>💵</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>💬</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          title: "Vendors",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>🏪</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>🖼️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}

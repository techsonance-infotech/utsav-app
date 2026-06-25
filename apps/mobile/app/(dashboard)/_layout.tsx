import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { colors, fonts } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryBrand,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "rgba(232, 226, 214, 0.4)",
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 30 : 12,
          paddingTop: 10,
          shadowColor: colors.primaryContainer,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.inter.semibold,
        },
        headerShown: false,
      }}
    >
      {/* 5 Main Visible Tabs */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="calendar-month-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          title: "Donate",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="heart-flash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="chat-processing-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden Screens (still register routes for deep links/quick links) */}
      <Tabs.Screen
        name="news"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="event-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="expense-approval"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="invite-member"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="album-grid"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="blog-feed"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat-room"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-update"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="media-viewer"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="news-article"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="upload-media"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="analytics-hub"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="assign-position"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="committee-directory"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-campaign"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="engagement-analytics"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="manage-subscription"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="platform-health"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="portfolio-management"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="regional-insights"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="revenue-analytics"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="super-admin-dashboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="tenant-management"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="upgrade-plan-selection"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="owner-onboarding"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="volunteer-duty-roster"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="duty-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="volunteer-check-in"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="select-amount"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="donation-confirmed"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="record-cash-entry"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="global-user-directory"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="staff-access-management"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="user-platform-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="about-utsav"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="privacy-policy"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="terms-of-service"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="blog-article"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="edit-mandal"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="notification-preferences"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="language-tenant-switcher"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="donation-history"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="financial-reports"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vendor-directory"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-purchase-order"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vendor-invoice-portal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vendor-profile-history"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="member-profile-admin"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="offline-mode"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="about-mandal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="album-masonry"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="help-center"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="volunteer-duty-sign-up"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="configure-report"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="rsvp-confirmed"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="event-waitlist"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="review-event"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

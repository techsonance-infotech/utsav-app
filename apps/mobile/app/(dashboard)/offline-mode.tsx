import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useOfflineStore } from "@utsav/stores";
import { useEvents } from "@utsav/api-client";

export default function OfflineModeScreen() {
  const isOnline = useOfflineStore((state) => state.isOnline);
  const queue = useOfflineStore((state) => state.queue);
  const { data: events = [] } = useEvents();

  const getQueueItemDetails = (item: any) => {
    switch (item.type) {
      case "rsvp":
        return {
          title: "Event RSVP",
          subtitle: `Status: ${
            item.payload.status === "attending"
              ? "Attending"
              : item.payload.status === "maybe"
              ? "Maybe"
              : "Not Attending"
          }`,
          icon: "checkbox-marked-circle-outline",
        };
      case "chat_message":
        return {
          title: `Chat: "${item.payload.text || "Message"}"`,
          subtitle: "Drafted message to channel",
          icon: "chat-outline",
        };
      case "notification_read":
        return {
          title: "Read Notification",
          subtitle: item.payload.id ? `Notification ID: ${item.payload.id}` : "All notifications",
          icon: "bell-check-outline",
        };
      default:
        return {
          title: "Offline Action",
          subtitle: "Pending sync",
          icon: "sync",
        };
    }
  };

  const upcomingEvent = events.length > 0 ? events[0] : null;
  const festivalName = upcomingEvent ? upcomingEvent.title : "Maha Shivratri";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.primaryBrand}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Utsav</Text>
        </View>
        <View style={styles.headerRight}>
          <MaterialIcons
            name={isOnline ? "cloud-queue" : "cloud-off"}
            size={22}
            color={colors.primaryBrand}
            style={styles.offlineIcon}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Warning Banner */}
      <View style={styles.warningBanner}>
        <MaterialCommunityIcons
          name={isOnline ? "check-circle" : "alert-circle"}
          size={18}
          color={colors.onPrimaryContainer}
        />
        <Text style={styles.warningText}>
          {isOnline
            ? "You're online. Actions are syncing in the background."
            : "You're offline. Some features are unavailable."}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Festival Countdown Bento Box */}
        <View style={styles.countdownCard}>
          <View style={styles.countdownOverlay} />
          <View style={styles.countdownContent}>
            <View style={styles.countdownHeader}>
              <Text style={styles.countdownLabel}>Upcoming Festival</Text>
              <View style={styles.cachedBadge}>
                <MaterialCommunityIcons name="cached" size={12} color="#FFFFFF" />
                <Text style={styles.cachedBadgeText}>Cached</Text>
              </View>
            </View>

            <Text style={styles.festivalName}>{festivalName}</Text>

            <View style={styles.countdownDigits}>
              <View style={styles.digitCol}>
                <Text style={styles.digit}>04</Text>
                <Text style={styles.digitLabel}>Days</Text>
              </View>
              <View style={styles.digitCol}>
                <Text style={styles.digit}>12</Text>
                <Text style={styles.digitLabel}>Hrs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cached Events Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Community Events</Text>
            <Text style={styles.offlineIndicatorText}>Showing offline data</Text>
          </View>

          <View style={styles.eventsList}>
            {events.length === 0 ? (
              <View style={styles.emptyEvents}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={colors.outline} />
                <Text style={styles.emptyEventsText}>No cached events found.</Text>
              </View>
            ) : (
              events.slice(0, 3).map((event: any, idx: number) => (
                <View key={event.id || idx} style={styles.eventCardSimple}>
                  <View style={styles.eventIconBg}>
                    <MaterialCommunityIcons name="calendar-month-outline" size={24} color={colors.primaryBrand} />
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.description ? (
                      <Text style={styles.eventDesc} numberOfLines={1}>
                        {event.description}
                      </Text>
                    ) : null}
                    <View style={styles.eventMetaRow}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color={colors.outline} />
                      <Text style={styles.eventMetaText}>
                        {event.event_date ? new Date(event.event_date).toLocaleDateString() : ""} • {event.location || "Mandir Mandap"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Syncing Queue */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.syncHeaderTitle}>
              <MaterialCommunityIcons name="sync" size={18} color={colors.primaryBrand} />
              <Text style={styles.sectionTitle}>Syncing Queue</Text>
            </View>
            <View style={styles.queueCountBadge}>
              <Text style={styles.queueCountText}>
                {queue.length} {queue.length === 1 ? "Action" : "Actions"}
              </Text>
            </View>
          </View>

          <View style={styles.queueList}>
            {queue.length === 0 ? (
              <View style={styles.emptyQueue}>
                <MaterialCommunityIcons name="check-all" size={24} color={colors.tulsiGreen} />
                <Text style={styles.emptyQueueText}>All synced! No pending actions.</Text>
              </View>
            ) : (
              queue.map((item) => {
                const details = getQueueItemDetails(item);
                const timeStr = new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <View key={item.id} style={styles.queueCard}>
                    <View style={styles.queueIconBg}>
                      <MaterialCommunityIcons
                        name={details.icon as any}
                        size={20}
                        color={colors.onSurfaceVariant}
                      />
                    </View>
                    <View style={styles.queueContent}>
                      <Text style={styles.queueTitle} numberOfLines={1}>
                        {details.title}
                      </Text>
                      <Text style={styles.queueSubtitle}>
                        {details.subtitle} • Drafted {timeStr}
                      </Text>
                    </View>
                    <View style={styles.pulseDot} />
                  </View>
                );
              })
            )}
          </View>

          <Text style={styles.syncFooterNote}>
            These actions will automatically sync as soon as you are back online.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Utsav Logo Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.back()}
      >
        <Image
          source={require("../../assets/image-only.png")}
          style={{ width: 28, height: 28, resizeMode: "contain", tintColor: "#FFFFFF" }}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.primaryBrand,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  offlineIcon: { marginRight: 4 },

  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaryContainer,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  warningText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onPrimaryContainer,
    flex: 1,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 100, gap: 24 },

  // Countdown Card
  countdownCard: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.primaryBrand,
    elevation: 4,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(217, 43, 43, 0.4)", // kumkum-red shade overlay
  },
  countdownContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  countdownHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  countdownLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cachedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cachedBadgeText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 10,
    color: "#FFFFFF",
  },
  festivalName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: "#FFFFFF",
    marginTop: 4,
  },
  countdownDigits: { flexDirection: "row", gap: 16 },
  digitCol: { gap: 2 },
  digit: {
    fontFamily: fonts.poppins.bold,
    fontSize: 28,
    color: "#FFFFFF",
  },
  digitLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
  },

  section: { gap: 12 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  offlineIndicatorText: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.outline,
  },

  eventsList: { gap: 12 },
  eventCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    overflow: "hidden",
  },
  eventImagePlaceholder: {
    height: 120,
    backgroundColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
  },
  eventDetails: { padding: 12, gap: 4 },
  eventHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: colors.onSurface,
  },
  goingBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  goingText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.tulsiGreen,
  },
  eventMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  eventMetaText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  eventCardSimple: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  eventIconBg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
  },
  eventDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  syncHeaderTitle: { flexDirection: "row", alignItems: "center", gap: 6 },
  queueCountBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  queueCountText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.onPrimaryContainer,
  },

  queueList: { gap: 10 },
  queueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  queueIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  queueContent: { flex: 1, gap: 2 },
  queueTitle: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  queueSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.outline,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.haldiYellow,
  },
  syncFooterNote: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.outline,
    textAlign: "center",
    fontStyle: "italic",
  },

  emptyQueue: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F9F2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
    gap: 8,
  },
  emptyQueueText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.tulsiGreen,
  },
  emptyEvents: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    gap: 8,
  },
  emptyEventsText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.outline,
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryBrand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

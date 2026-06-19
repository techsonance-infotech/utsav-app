import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAuthStore } from "@utsav/stores";
import { useEvents, useRSVP } from "@utsav/api-client";

export default function MobileEventsScreen() {
  const { data: events = [], isLoading: loadingEvents } = useEvents() as any;
  const rsvpMutation = useRSVP();

  const handleRSVP = async (eventId: string, status: "attending" | "maybe" | "not_attending") => {
    try {
      await rsvpMutation.mutateAsync({ eventId, status });
    } catch (err) {
      console.error("RSVP error:", err);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const rsvpButtonColors = (type: string, active: boolean) => {
    if (!active) {
      return { bg: "#FFFFFF", border: "#E5E7EB", text: "#4B5563" };
    }
    switch (type) {
      case "attending":
        return { bg: "#D1FAE5", border: "#10B981", text: "#047857" };
      case "maybe":
        return { bg: "#FEF3C7", border: "#F59E0B", text: "#B45309" };
      case "not_attending":
        return { bg: "#FEE2E2", border: "#EF4444", text: "#B91C1C" };
      default:
        return { bg: "#FFFFFF", border: "#E5E7EB", text: "#4B5563" };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Calendar & Events</Text>
          <Text style={styles.headerSub}>RSVP & coordinate festival volunteers</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loadingEvents ? (
          <ActivityIndicator color="#FF9500" size="large" style={{ marginTop: 40 }} />
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No events scheduled yet.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {events.map((event: any) => {
              const attendingCount = event.rsvp_summary?.attending || 0;
              const isExpired = event.rsvp_deadline ? new Date(event.rsvp_deadline) < new Date() : false;

              return (
                <View key={event.id} style={styles.card}>
                  {/* Category Tag */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
                    {event.user_rsvp && (
                      <Text style={styles.rsvpBadge}>✓ RSVP: {event.user_rsvp.toUpperCase()}</Text>
                    )}
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>

                  {event.description ? (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  ) : null}

                  {/* Meta Grid */}
                  <View style={styles.metaGrid}>
                    <Text style={styles.metaText}>📅 {formatDate(event.start_at)}</Text>
                    <Text style={styles.metaText}>🕒 {formatTime(event.start_at)}</Text>
                    {event.location_name && (
                      <Text style={styles.metaText} numberOfLines={1}>📍 {event.location_name}</Text>
                    )}
                  </View>

                  {/* RSVP stats */}
                  <View style={styles.statsRow}>
                    <Text style={styles.statsText}>
                      👥 {attendingCount} Going {event.rsvp_summary?.maybe ? `, ${event.rsvp_summary.maybe} Maybe` : ""}
                    </Text>
                  </View>

                  {/* RSVP Interactive Buttons */}
                  <View style={styles.rsvpRow}>
                    {(["attending", "maybe", "not_attending"] as const).map((status) => {
                      const isActive = event.user_rsvp === status;
                      const colors = rsvpButtonColors(status, isActive);
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.rsvpBtn,
                            { backgroundColor: colors.bg, borderColor: colors.border },
                          ]}
                          disabled={isExpired}
                          onPress={() => handleRSVP(event.id, status)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.rsvpBtnText, { color: colors.text, fontWeight: isActive ? "bold" : "normal" }]}>
                            {status === "attending" ? "Going" : status === "maybe" ? "Maybe" : "No"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FF9500",
    letterSpacing: 0.5,
  },
  rsvpBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#10B981",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  eventDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 11,
    color: "#4B5563",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsText: {
    fontSize: 11,
    color: "#6B7280",
  },
  rsvpRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  rsvpBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  rsvpBtnText: {
    fontSize: 12,
  },
});

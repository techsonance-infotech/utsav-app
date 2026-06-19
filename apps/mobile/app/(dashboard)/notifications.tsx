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
import { useNotifications, useMarkNotificationRead } from "@utsav/api-client";
import { router } from "expo-router";

export default function MobileNotificationsScreen() {
  const { data: notifications, isLoading, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkAllRead = () => {
    markRead.mutate({ all: true });
  };

  const handleNotificationPress = (notif: any) => {
    if (!notif.is_read) {
      markRead.mutate({ id: notif.id });
    }

    // Handle deep linking if present
    if (notif.deep_link) {
      try {
        // e.g. deep_link = "/(dashboard)/expenses" or "/(dashboard)/events"
        router.push(notif.deep_link as any);
      } catch (err) {
        console.warn("Invalid deep link:", notif.deep_link);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "donation_received":
      case "payment_received":
        return "💖";
      case "expense_submitted":
      case "expense_status_change":
        return "💵";
      case "event_reminder":
        return "📅";
      case "volunteer_duty_assigned":
        return "🤝";
      default:
        return "📢";
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }
  };

  // Group notifications by date label
  const groupedNotifications = (() => {
    if (!notifications) return [];
    const groups: { [key: string]: any[] } = {};

    notifications.forEach((n) => {
      const label = formatDate(n.created_at);
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(n);
    });

    return Object.keys(groups).map((label) => ({
      label,
      data: groups[label],
    }));
  })();

  const hasUnread = notifications?.some((n) => !n.is_read) || false;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSub}>Stay updated with Mandal activities</Text>
        </View>

        {hasUnread && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead} disabled={markRead.isPending}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9500" />
        </View>
      ) : groupedNotifications.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {groupedNotifications.map((group) => (
            <View key={group.label} style={styles.groupContainer}>
              <Text style={styles.groupLabel}>{group.label}</Text>

              {group.data.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>{getIcon(item.type)}</Text>
                  </View>

                  <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.cardTitle, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
                      {!item.is_read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.cardBody} numberOfLines={3}>
                      {item.body}
                    </Text>

                    <Text style={styles.timeText}>
                      {new Date(item.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyText}>All caught up! No notifications yet.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSub: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  markAllText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FF9500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  groupContainer: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  unreadCard: {
    borderColor: "#FF9500",
    backgroundColor: "#FFFBEB",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 18,
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "bold",
    color: "#1F2937",
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF9500",
  },
  cardBody: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  timeText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 44,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});

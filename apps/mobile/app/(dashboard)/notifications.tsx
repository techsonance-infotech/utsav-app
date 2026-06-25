import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotifications, useMarkNotificationRead } from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

    if (notif.deep_link) {
      try {
        router.push(notif.deep_link as any);
      } catch (err) {
        console.warn("Invalid deep link:", notif.deep_link);
      }
    }
  };

  const getIconInfo = (type: string) => {
    switch (type) {
      case "donation_received":
      case "payment_received":
        return { name: "heart-flash" as const, color: colors.secondaryBrand, bg: colors.secondaryFixed };
      case "expense_submitted":
      case "expense_status_change":
        return { name: "cash-multiple" as const, color: colors.tertiary, bg: colors.tertiaryFixed };
      case "event_reminder":
        return { name: "calendar-month-outline" as const, color: colors.primaryBrand, bg: colors.primaryFixed };
      case "volunteer_duty_assigned":
        return { name: "account-group-outline" as const, color: colors.tulsiGreen, bg: "rgba(34, 197, 94, 0.15)" };
      default:
        return { name: "bell-outline" as const, color: colors.primaryBrand, bg: colors.primaryFixed };
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
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>Stay updated with Mandal activities</Text>
          </View>
        </View>

        {hasUnread && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            disabled={markRead.isPending}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : groupedNotifications.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {groupedNotifications.map((group) => (
            <View key={group.label} style={styles.groupContainer}>
              <Text style={styles.groupLabel}>{group.label}</Text>

              {group.data.map((item) => {
                const iconInfo = getIconInfo(item.type);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
                    onPress={() => handleNotificationPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
                      <MaterialCommunityIcons name={iconInfo.name} size={22} color={iconInfo.color} />
                    </View>

                    <View style={styles.contentContainer}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.cardTitle, !item.is_read && styles.unreadTitle]} numberOfLines={1}>
                          {item.title}
                        </Text>
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
                );
              })}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.outline} />
          </View>
          <Text style={styles.emptyText}>All caught up! No notifications yet.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginTop: -2,
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,149,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,149,0,0.2)",
  },
  markAllText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: spacing.md,
    gap: 20,
  },
  groupContainer: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
    paddingLeft: 4,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    gap: 12,
  },
  unreadCard: {
    borderColor: colors.primaryContainer,
    backgroundColor: "rgba(255,149,0,0.04)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
    flex: 1,
  },
  unreadTitle: {
    color: colors.primaryBrand,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryContainer,
    marginLeft: 8,
  },
  cardBody: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
});

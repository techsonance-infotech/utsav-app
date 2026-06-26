import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import { useFetchDonations, useExpenses } from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ActivityItem {
  id: string;
  type: "donation" | "expense" | "member";
  title: string;
  subtitle: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  time: string;
  rawDate: Date;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Just now";

  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return "Just now";

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRupee(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RecentActivityScreen() {
  const { role } = useAuthStore();
  const { data: donations, isLoading: isDonationsLoading } = useFetchDonations();
  const { data: expenses, isLoading: isExpensesLoading } = useExpenses();

  const isLoading = isDonationsLoading || isExpensesLoading;

  const allActivities: ActivityItem[] = useMemo(() => {
    const list: ActivityItem[] = [];

    if (donations && donations.length > 0) {
      donations.forEach((don: any) => {
        list.push({
          id: `don-${don.id}`,
          type: "donation",
          title: `Donation from ${don.donor_name || "Anonymous Donor"}`,
          subtitle: don.note || don.campaign_name || "General Contribution",
          value: formatRupee(don.amount),
          icon: "plus-circle",
          iconColor: colors.tulsiGreen,
          iconBg: "rgba(34, 197, 94, 0.1)",
          time: formatTimeAgo(new Date(don.created_at)),
          rawDate: new Date(don.created_at),
        });
      });
    }

    if (expenses && expenses.length > 0) {
      expenses.forEach((exp: any) => {
        list.push({
          id: `exp-${exp.id}`,
          type: "expense",
          title: exp.description || exp.title || "Expense Payment",
          subtitle: exp.merchant_name || "Committee expense",
          value: formatRupee(exp.amount),
          icon: "receipt",
          iconColor: colors.kumkumRed,
          iconBg: "rgba(217, 43, 43, 0.1)",
          time: formatTimeAgo(new Date(exp.expense_date || exp.created_at)),
          rawDate: new Date(exp.expense_date || exp.created_at),
        });
      });
    }

    // Sort by most recent first
    list.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    return list;
  }, [donations, expenses]);

  const renderActivityItem = ({ item, index }: { item: ActivityItem; index: number }) => (
    <View style={[styles.activityRow, index === 0 && { borderTopWidth: 0 }]}>
      {/* Timeline connector */}
      <View style={styles.timelineCol}>
        <View style={[styles.timelineDot, { backgroundColor: item.iconBg, borderColor: item.iconColor }]}>
          <MaterialCommunityIcons name={item.icon as any} size={16} color={item.iconColor} />
        </View>
        {index < allActivities.length - 1 && <View style={styles.timelineLine} />}
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
          {item.value ? (
            <Text style={[styles.activityAmount, { color: item.type === "donation" ? colors.tulsiGreen : colors.kumkumRed }]}>
              {item.type === "donation" ? "+" : "-"}{item.value}
            </Text>
          ) : null}
        </View>
        <Text style={styles.activitySubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <View style={styles.activityMeta}>
          <View style={[styles.typeBadge, { backgroundColor: item.iconBg }]}>
            <Text style={[styles.typeBadgeText, { color: item.iconColor }]}>
              {item.type === "donation" ? "Donation" : "Expense"}
            </Text>
          </View>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <MaterialCommunityIcons name="history" size={48} color={colors.outlineVariant} />
      </View>
      <Text style={styles.emptyTitle}>No Recent Activity</Text>
      <Text style={styles.emptySubtitle}>
        Donations and expenses will appear here as they are recorded.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Recent Activity</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>{allActivities.length} entries</Text>
        </View>
      </View>

      {/* Summary Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="plus-circle" size={16} color={colors.tulsiGreen} />
          <Text style={styles.summaryLabel}>
            {allActivities.filter((a) => a.type === "donation").length} Donations
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="receipt" size={16} color={colors.kumkumRed} />
          <Text style={styles.summaryLabel}>
            {allActivities.filter((a) => a.type === "expense").length} Expenses
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
          <Text style={styles.loadingText}>Loading activity feed...</Text>
        </View>
      ) : (
        <FlatList
          data={allActivities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  appBarTitle: {
    fontSize: 17,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
    gap: spacing.lg,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  summaryDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.sandstone,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },
  activityRow: {
    flexDirection: "row",
    paddingVertical: 14,
    gap: 12,
  },
  timelineCol: {
    width: 36,
    alignItems: "center",
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(232, 226, 214, 0.5)",
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  activityTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  activityAmount: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
  },
  activitySubtitle: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activityTime: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 19,
  },
});

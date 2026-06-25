import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFinancialSummary } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

interface OnboardingTask {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  status: "done" | "active" | "pending";
  route?: string;
}

const ONBOARDING_TASKS: OnboardingTask[] = [
  { id: "org", title: "Organisation created", subtitle: "Profile basics are ready", icon: "check-circle", status: "done" },
  { id: "member", title: "First member invited", subtitle: "Collaboration is active", icon: "check-circle", status: "done" },
  { id: "event", title: "First event published", subtitle: "Public visibility is live", icon: "check-circle", status: "done" },
  { id: "campaign", title: "Set up a donation campaign", subtitle: "Enable devotees to contribute", icon: "cash-multiple", status: "active", route: "/(dashboard)/create-campaign" },
  { id: "news", title: "Add a news update", subtitle: "Share latest mandal news", icon: "newspaper", status: "pending", route: "/(dashboard)/create-update" },
];

export default function OwnerOnboardingScreen() {
  const { tenantId } = useAuthStore();
  const { data: summary } = useFinancialSummary(tenantId);
  const completedCount = ONBOARDING_TASKS.filter((t) => t.status === "done").length;
  const totalCount = ONBOARDING_TASKS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Utsav</Text>
        </View>
        <View style={styles.profileAvatar}>
          <Text style={styles.avatarText}>SM</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Namaste, Mandal Owner</Text>
          <Text style={styles.welcomeSubtitle}>
            Welcome to your central management dashboard. Your preparations are underway.
          </Text>
        </View>

        {/* Onboarding Checklist Widget */}
        <View style={styles.checklistCard}>
          {/* Progress Header */}
          <View style={styles.checklistHeader}>
            <Text style={styles.checklistTitle}>Getting Started with Utsav</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>
                {completedCount} of {totalCount} tasks complete{" "}
                <Text style={styles.progressPercent}>({progressPercent}%)</Text>
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {/* Task List */}
          <View style={styles.taskList}>
            {ONBOARDING_TASKS.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskItem,
                  task.status === "done" && styles.taskDone,
                  task.status === "active" && styles.taskActive,
                ]}
                activeOpacity={task.route ? 0.7 : 1}
                onPress={() => task.route && router.push(task.route as any)}
                disabled={!task.route}
              >
                <View
                  style={[
                    styles.taskIcon,
                    task.status === "done" && styles.taskIconDone,
                    task.status === "active" && styles.taskIconActive,
                    task.status === "pending" && styles.taskIconPending,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      task.status === "done"
                        ? "check-circle"
                        : (task.icon as any)
                    }
                    size={20}
                    color={
                      task.status === "done"
                        ? colors.tulsiGreen
                        : task.status === "active"
                        ? colors.primaryBrand
                        : colors.onSurfaceVariant
                    }
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
                </View>
                {task.status === "done" && (
                  <Text style={styles.doneLabel}>DONE</Text>
                )}
                {(task.status === "active" || task.status === "pending") && task.route && (
                  <View style={styles.taskArrow}>
                    <Text style={[styles.taskArrowText, task.status === "active" && { color: colors.primaryBrand }]}>
                      {task.status === "active" ? "Set up" : "Write"}
                    </Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={16}
                      color={task.status === "active" ? colors.primaryBrand : colors.onSurfaceVariant}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Master Badge */}
          <View style={styles.badgeSection}>
            <View style={styles.badgeIcon}>
              <MaterialCommunityIcons name="medal" size={24} color={colors.aartiGold} />
            </View>
            <View>
              <Text style={styles.badgeTitle}>MASTER ONBOARDING</Text>
              <Text style={styles.badgeSubtitle}>Complete all to unlock the Gold Batch Badge.</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {/* Featured Collection Card */}
          <View style={styles.collectionCard}>
            <Text style={styles.collectionLabel}>TOTAL COLLECTIONS</Text>
            <Text style={styles.collectionAmount}>
              ₹ {summary?.total_donations?.toLocaleString("en-IN") ?? "0"}
            </Text>
            <View style={styles.collectionMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Donation Count</Text>
                <Text style={styles.metaValue}>{summary?.donation_count ?? 0}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Expenses</Text>
                <Text style={styles.metaValue}>{summary?.expense_count ?? 0}</Text>
              </View>
            </View>
          </View>

          {/* Small Stat Cards */}
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "rgba(140, 80, 0, 0.1)" }]}>
                <MaterialCommunityIcons name="account-group" size={20} color={colors.primaryBrand} />
              </View>
              <Text style={styles.statLabel}>Member Engagement</Text>
              <Text style={styles.statValue}>84%</Text>
              <View style={styles.miniProgressBg}>
                <View style={[styles.miniProgressFill, { width: "84%" }]} />
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                <MaterialCommunityIcons name="party-popper" size={20} color={colors.tulsiGreen} />
              </View>
              <Text style={styles.statLabel}>Events Active</Text>
              <Text style={styles.statValue}>04</Text>
              <View style={styles.allLiveBadge}>
                <MaterialCommunityIcons name="trending-up" size={14} color={colors.tulsiGreen} />
                <Text style={styles.allLiveText}>All live</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "rgba(250, 250, 248, 0.9)",
  },
  appBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  appBarTitle: {
    fontSize: 32,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.sandstone,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
  checklistCard: {
    backgroundColor: colors.pujaWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  checklistHeader: {
    padding: spacing.lg,
    backgroundColor: "rgba(250, 242, 237, 0.5)",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  checklistTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  progressValue: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  progressPercent: {
    color: "rgba(85, 67, 52, 0.6)",
    fontFamily: fonts.inter.regular,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: colors.sandstone,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primaryBrand,
    borderRadius: 6,
  },
  taskList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  taskDone: {
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    borderColor: "rgba(34, 197, 94, 0.1)",
  },
  taskActive: {
    backgroundColor: "rgba(140, 80, 0, 0.05)",
    borderColor: "rgba(140, 80, 0, 0.2)",
    borderStyle: "dashed",
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  taskIconDone: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  taskIconActive: {
    backgroundColor: "rgba(140, 80, 0, 0.1)",
  },
  taskIconPending: {
    backgroundColor: colors.surfaceContainer,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  taskSubtitle: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  doneLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
    letterSpacing: 0.5,
  },
  taskArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  taskArrowText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  badgeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: "rgba(244, 241, 235, 0.3)",
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(201, 146, 26, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.aartiGold,
    letterSpacing: 1,
  },
  badgeSubtitle: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  statsSection: {
    gap: spacing.lg,
  },
  collectionCard: {
    backgroundColor: colors.charcoal,
    borderRadius: 16,
    padding: spacing.lg,
  },
  collectionLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.aartiGold,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  collectionAmount: {
    fontSize: 40,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
    letterSpacing: -0.8,
    marginBottom: spacing.xl,
  },
  collectionMeta: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  metaItem: {},
  metaLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.outlineVariant,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: 20,
    fontFamily: fonts.inter.regular,
    color: "#FFFFFF",
  },
  metaDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignSelf: "center",
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: colors.sandstone,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: spacing.lg,
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: colors.primaryBrand,
    borderRadius: 2,
  },
  allLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.lg,
  },
  allLiveText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
});

import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFinancialSummary, useFetchMembers, useFetchDonations } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { ScreenHeader } from "../components/ScreenHeader";

export default function AnalyticsHubScreen() {
  const { tenantId } = useAuthStore();
  const { data: summary, isLoading: loadingSummary } = useFinancialSummary(tenantId);
  const { data: members = [], isLoading: loadingMembers } = useFetchMembers();
  const { data: donations = [], isLoading: loadingDonations } = useFetchDonations();

  const formatAmount = (num: number) => {
    if (!num) return "₹0";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const activeMembersCount = members.filter(m => m.status === "active").length;
  const nonGeneralMembersCount = members.filter(m => m.role && m.role !== "member").length;

  const kpis = [
    {
      title: "Total Revenue",
      value: formatAmount(summary?.total_donations || 0),
      subtitle: `Net Balance: ${formatAmount(summary?.net_balance || 0)}`,
      icon: "currency-inr",
      iconColor: colors.tulsiGreen,
      bg: "rgba(34, 197, 94, 0.08)",
    },
    {
      title: "Committee Members",
      value: String(nonGeneralMembersCount),
      subtitle: `${activeMembersCount} active members`,
      icon: "account-multiple",
      iconColor: colors.primaryBrand,
      bg: "rgba(140, 80, 0, 0.08)",
    },
    {
      title: "Donation Count",
      value: String(summary?.donation_count || 0),
      subtitle: `${summary?.expense_count || 0} recorded expenses`,
      icon: "cash-multiple",
      iconColor: colors.aartiGold,
      bg: "rgba(201, 146, 26, 0.08)",
    },
  ];

  const reports = [
    {
      title: "Financial Performance",
      desc: "Detailed cashflows, donations, and expense logs",
      icon: "finance",
      color: colors.kumkumRed,
      route: "/(dashboard)/revenue-analytics",
    },
    {
      title: "User Engagement",
      desc: "App traffic, active sessions, and feature usage",
      icon: "chart-line",
      color: colors.primaryBrand,
      route: "/(dashboard)/engagement-analytics",
    },
    {
      title: "Geographic Insights",
      desc: "Growth clusters, regional metrics, and map distribution",
      icon: "map-marker-radius",
      color: colors.aartiGold,
      route: "/(dashboard)/regional-insights",
    },
    {
      title: "Platform Health Stats",
      desc: "Diagnostics: latency, CPU footprint, nodes status",
      icon: "shield-check",
      color: colors.secondaryBrand,
      route: "/(dashboard)/platform-health",
    },
  ];

  // Dynamic Platform Pulse Calculation: Sum of events (donations + signups) over the last 6 months
  const getPlatformPulseData = () => {
    const now = new Date();
    const months: Date[] = [];
    const chartMonths: string[] = [];
    const counts = [0, 0, 0, 0, 0, 0];

    // Build the last 6 months starting points
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
      chartMonths.push(d.toLocaleDateString("en-IN", { month: "short" }));
    }

    // Count donations in each month bucket
    donations.forEach((d) => {
      if (!d.created_at) return;
      const date = new Date(d.paid_at || d.created_at);
      for (let i = 0; i < 6; i++) {
        const mStart = months[i];
        const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 1);
        if (date >= mStart && date < mEnd) {
          counts[i] += 1;
        }
      }
    });

    // Count members joined in each month bucket
    members.forEach((m) => {
      if (!m.joined_at) return;
      const date = new Date(m.joined_at);
      for (let i = 0; i < 6; i++) {
        const mStart = months[i];
        const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 1);
        if (date >= mStart && date < mEnd) {
          counts[i] += 1;
        }
      }
    });

    // Scale counts to percentage (15% to 95%) for display in the bar chart
    const maxVal = Math.max(...counts, 1);
    const chartData = counts.map((c) => {
      const scaled = (c / maxVal) * 80 + 15;
      return Math.round(scaled);
    });

    return { chartData, chartMonths };
  };

  const { chartData, chartMonths } = getPlatformPulseData();

  if (loadingSummary || loadingMembers || loadingDonations) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primaryBrand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Mandal Analytics"
        rightIcon="information-outline"
        onRightPress={() =>
          Alert.alert(
            "Analytics Hub",
            "Real-time overview of mandal collections, committee members activity, and operational reports."
          )
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subtitle intro */}
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>Real-time Mandal Pulse</Text>
          <Text style={styles.sectionSubtitle}>
            Comprehensive operational and financial metrics for your organization.
          </Text>
        </View>

        {/* KPIs Grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, idx) => (
            <View key={idx} style={styles.kpiCard}>
              <View style={[styles.iconWrapper, { backgroundColor: kpi.bg }]}>
                <MaterialCommunityIcons name={kpi.icon as any} size={22} color={kpi.iconColor} />
              </View>
              <View style={styles.kpiInfo}>
                <Text style={styles.kpiTitle}>{kpi.title}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <View style={styles.trendRow}>
                  <MaterialCommunityIcons name="sync" size={12} color={colors.onSurfaceVariant} style={{ opacity: 0.7 }} />
                  <Text style={styles.trendText}>{kpi.subtitle}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Platform Pulse Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Platform Pulse</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.chartSubtitle}>MAU active connection index (last 6 months)</Text>

          {/* Chart bar visualizer */}
          <View style={styles.chartVisualizer}>
            <View style={styles.chartBarsContainer}>
              {chartData.map((val, idx) => (
                <View key={idx} style={styles.chartBarWrapper}>
                  <View style={styles.barBackground}>
                    <LinearGradient
                      colors={[colors.primaryBrand, colors.primaryContainer]}
                      style={[styles.barFill, { height: `${val}%` }]}
                    />
                  </View>
                  <Text style={styles.chartMonthText}>{chartMonths[idx]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Report Catalog */}
        <View style={styles.reportsSection}>
          <Text style={styles.reportsTitle}>Operational Reports</Text>
          <View style={styles.reportsList}>
            {reports.map((rep, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.reportCard}
                onPress={() => router.push(rep.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.reportIconWrapper, { backgroundColor: `${rep.color}0A` }]}>
                  <MaterialCommunityIcons name={rep.icon as any} size={24} color={rep.color} />
                </View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportCardTitle}>{rep.title}</Text>
                  <Text style={styles.reportCardDesc}>{rep.desc}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    backgroundColor: "rgba(250, 250, 248, 0.9)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  logoAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.primaryBrand,
    backgroundColor: colors.cream,
  },
  logoAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoText: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  infoButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  introSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  kpiGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  kpiInfo: {
    flex: 1,
  },
  kpiTitle: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginVertical: 2,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginLeft: 4,
    opacity: 0.8,
  },
  chartCard: {
    backgroundColor: colors.charcoal,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tulsiGreen,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
  chartSubtitle: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.outlineVariant,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  chartVisualizer: {
    height: 160,
    justifyContent: "flex-end",
  },
  chartBarsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
  },
  chartBarWrapper: {
    alignItems: "center",
    width: 36,
  },
  barBackground: {
    height: 100,
    width: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: borderRadius.full,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: borderRadius.full,
  },
  chartMonthText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.outlineVariant,
    marginTop: 8,
  },
  reportsSection: {
    marginTop: spacing.xs,
  },
  reportsTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  reportsList: {
    gap: spacing.sm,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  reportIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportCardTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  reportCardDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
});

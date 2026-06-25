import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function AnalyticsHubScreen() {
  const kpis = [
    {
      title: "Total Revenue",
      value: "₹4.8 Cr.",
      change: "+12.4%",
      trend: "up",
      icon: "currency-inr",
      iconColor: colors.tulsiGreen,
      bg: "rgba(34, 197, 94, 0.08)",
    },
    {
      title: "Active Users (24h)",
      value: "84.5k",
      change: "+8.2%",
      trend: "up",
      icon: "account-multiple",
      iconColor: colors.primaryBrand,
      bg: "rgba(140, 80, 0, 0.08)",
    },
    {
      title: "Total Organizations",
      value: "1,248",
      change: "+15.0%",
      trend: "up",
      icon: "office-building",
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
      icon: "shield-pulse",
      color: colors.secondaryBrand,
      route: "/(dashboard)/platform-health",
    },
  ];

  // Render a mock line graph using native layout
  const mockChartData = [45, 60, 55, 78, 85, 95];
  const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Hub</Text>
        <TouchableOpacity style={styles.infoButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="information-outline" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subtitle intro */}
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>Real-time Platform Pulse</Text>
          <Text style={styles.sectionSubtitle}>
            Comprehensive operational and financial metrics across all mandals.
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
                  <MaterialCommunityIcons name="trending-up" size={14} color={colors.tulsiGreen} />
                  <Text style={styles.trendText}>{kpi.change} from last month</Text>
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
              {mockChartData.map((val, idx) => (
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
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
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
    color: colors.tulsiGreen,
    marginLeft: 4,
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

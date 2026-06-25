import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EngagementAnalyticsScreen() {
  const [timeframe, setTimeframe] = useState("Weekly");

  const cards = [
    { label: "Screen Views", val: "1.2M", icon: "file-eye-outline", color: colors.primaryBrand },
    { label: "Avg Session", val: "8m 42s", icon: "clock-outline", color: colors.aartiGold },
    { label: "Chat Activities", val: "42.8k", icon: "chat-processing-outline", color: colors.tulsiGreen },
    { label: "Media Uploads", val: "5,810", icon: "cloud-upload-outline", color: colors.kumkumRed },
  ];

  const features = [
    { name: "Live Darshan Streaming", percent: 88, count: "74.3k views" },
    { name: "Donations Gateway", percent: 74, count: "12.8k conversions" },
    { name: "Mandal Community Chat", percent: 65, count: "5.4k active users" },
    { name: "Events Calendar & RSVPs", percent: 52, count: "8.1k registrations" },
  ];

  // Visual layout representation of user growth
  const chartBars = [
    { day: "Mon", count: 420 },
    { day: "Tue", count: 510 },
    { day: "Wed", count: 480 },
    { day: "Thu", count: 680 },
    { day: "Fri", count: 850 },
    { day: "Sat", count: 1200 },
    { day: "Sun", count: 990 },
  ];

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
        <Text style={styles.headerTitle}>User Engagement</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Options */}
      <View style={styles.filterSection}>
        {["Daily", "Weekly", "Monthly"].map((tf) => (
          <TouchableOpacity
            key={tf}
            style={[styles.filterBtn, timeframe === tf && styles.activeFilterBtn]}
            onPress={() => setTimeframe(tf)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, timeframe === tf && styles.activeFilterBtnText]}>
              {tf}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {cards.map((c, idx) => (
            <View key={idx} style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiLabel}>{c.label}</Text>
                <MaterialCommunityIcons name={c.icon as any} size={20} color={c.color} />
              </View>
              <Text style={styles.kpiVal}>{c.val}</Text>
            </View>
          ))}
        </View>

        {/* Traffic Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Active Traffic</Text>
          <Text style={styles.chartSubtitle}>Visitor count fluctuations this week</Text>
          <View style={styles.barsContainer}>
            {chartBars.map((item, idx) => {
              // Calculate percent relative to maximum (1200)
              const heightPercent = (item.count / 1200) * 100;
              return (
                <View key={idx} style={styles.barColumn}>
                  <Text style={styles.barValText}>{item.count}</Text>
                  <View style={styles.barBacking}>
                    <View style={[styles.barFilling, { height: `${heightPercent}%` }]} />
                  </View>
                  <Text style={styles.barDayLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Feature Adoption Matrix */}
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Feature Adoption Matrix</Text>
          <View style={styles.featureList}>
            {features.map((f, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={styles.featureRowHeader}>
                  <Text style={styles.featureName}>{f.name}</Text>
                  <Text style={styles.featureCount}>{f.count}</Text>
                </View>
                {/* Progress bar */}
                <View style={styles.progressBack}>
                  <View style={[styles.progressFill, { width: `${f.percent}%` }]} />
                </View>
              </View>
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  filterSection: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    justifyContent: "center",
    gap: spacing.md,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  activeFilterBtn: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryBrand,
  },
  filterBtnText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  activeFilterBtnText: {
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  kpiCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  kpiLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  kpiVal: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  chartSubtitle: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 150,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
  },
  barValText: {
    fontSize: 9,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  barBacking: {
    height: 100,
    width: 12,
    backgroundColor: colors.pujaWhite,
    borderRadius: borderRadius.full,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFilling: {
    width: "100%",
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.full,
  },
  barDayLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  featureList: {
    gap: spacing.md,
  },
  featureRow: {
    gap: spacing.xs,
  },
  featureRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featureName: {
    fontSize: 13,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  featureCount: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  progressBack: {
    height: 8,
    backgroundColor: colors.pujaWhite,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
  },
});

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SuperAdminDashboardScreen() {
  const adminStats = [
    { label: "Total Organizations", val: "1,248", change: "+15.0%", icon: "office-building", color: colors.primaryBrand },
    { label: "Monthly Active Users", val: "84.5k", change: "+8.2%", icon: "account-multiple", color: colors.aartiGold },
    { label: "Platform Cashflow", val: "₹4.8 Cr", change: "+14.7%", icon: "currency-inr", color: colors.tulsiGreen },
    { label: "System Health", val: "99.98%", change: "Optimal", icon: "shield-check-outline", color: colors.secondaryBrand },
  ];

  const recentUpgrades = [
    { tenant: "Siddhivinayak Mandal", plan: "Premium Tier", amount: "₹5,898.82", time: "2 hrs ago" },
    { tenant: "Lalbaugcha Raja Samiti", plan: "Enterprise Custom", amount: "₹48,000.00", time: "5 hrs ago" },
    { tenant: "Ganesh Utsav Mandal Pune", plan: "Basic Tier", amount: "₹1,180.00", time: "1 day ago" },
  ];

  const managementLinks = [
    { title: "Tenant Directory", desc: "Approve, moderate, or suspend mandals", icon: "domain", route: "/(dashboard)/tenant-management", color: colors.primaryBrand },
    { title: "Platform Diagnostics", desc: "Live latency, memory stats, CPU checks", icon: "shield-pulse", route: "/(dashboard)/platform-health", color: colors.secondaryBrand },
    { title: "Regional Growth insights", desc: "Geographic density heatmap", icon: "map-marker-distance", route: "/(dashboard)/regional-insights", color: colors.aartiGold },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(dashboard)/settings")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Super Admin Portal</Text>
        <TouchableOpacity style={styles.profileBadge} activeOpacity={0.8}>
          <Text style={styles.profileText}>SA</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.welcomeTitle}>Platform Overview</Text>
          <Text style={styles.welcomeSubtitle}>Realtime cross-tenant telemetry and billing metrics.</Text>
        </View>

        {/* stats grid */}
        <View style={styles.statsGrid}>
          {adminStats.map((s, idx) => (
            <View key={idx} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <MaterialCommunityIcons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statVal}>{s.val}</Text>
              <View style={styles.changeRow}>
                <MaterialCommunityIcons name="trending-up" size={14} color={colors.tulsiGreen} />
                <Text style={styles.changeText}>{s.change} vs last month</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Management routes list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management Modules</Text>
          <View style={styles.modulesList}>
            {managementLinks.map((link, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.moduleCard}
                onPress={() => router.push(link.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.moduleIconBg, { backgroundColor: `${link.color}0A` }]}>
                  <MaterialCommunityIcons name={link.icon as any} size={24} color={link.color} />
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleCardTitle}>{link.title}</Text>
                  <Text style={styles.moduleCardDesc}>{link.desc}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.outline} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent upgrades list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Subscription Upgrades</Text>
          <View style={styles.upgradesCard}>
            {recentUpgrades.map((u, idx) => (
              <View key={idx}>
                {idx > 0 && <View style={styles.separator} />}
                <View style={styles.upgradeRow}>
                  <View>
                    <Text style={styles.upgradeTenant}>{u.tenant}</Text>
                    <Text style={styles.upgradeTime}>{u.time} • {u.plan}</Text>
                  </View>
                  <Text style={styles.upgradeAmount}>{u.amount}</Text>
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
  profileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryBrand,
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  introSection: {
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  statVal: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  changeText: {
    fontSize: 10,
    fontFamily: fonts.inter.medium,
    color: colors.tulsiGreen,
    marginLeft: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  modulesList: {
    gap: spacing.sm,
  },
  moduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  moduleIconBg: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleCardTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  moduleCardDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  upgradesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingHorizontal: spacing.md,
  },
  upgradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  upgradeTenant: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  upgradeTime: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  upgradeAmount: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.tulsiGreen,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.4)",
  },
});

import React, { useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import { useAuthStore } from "@utsav/stores";
import { useFinancialSummary, useFetchCampaigns } from "@utsav/api-client";
import { router } from "expo-router";
import { registerForPushNotifications } from "../lib/notifications";

export default function MobileHomeScreen() {
  const { tenantId, tenantName, role } = useAuthStore();
  const { data: summary, isLoading: isSummaryLoading } = useFinancialSummary(tenantId);
  const { data: campaigns, isLoading: isCampaignsLoading } = useFetchCampaigns();

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const hasFinanceAccess = ["owner", "admin", "treasurer", "committee_member"].includes(role || "");

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste,</Text>
            <Text style={styles.userName}>Utsav Member</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role || "Member"}</Text>
          </View>
        </View>

        {/* Welcome Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🪔</Text>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>{tenantName || "Utsav Mandal"}</Text>
            <Text style={styles.bannerSub}>Welcome to your digital mandal workspace feed.</Text>
          </View>
        </View>

        {/* Financial Section (Restricted) */}
        {hasFinanceAccess ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mandal Finances</Text>
              <Text style={styles.liveIndicator}>● Live</Text>
            </View>
            {isSummaryLoading ? (
              <ActivityIndicator size="small" color="#FF9500" style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.kpiContainer}>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Total Donations</Text>
                  <Text style={styles.kpiValue}>{formatRupee(summary?.total_donations || 0)}</Text>
                  <Text style={styles.kpiSub}>{summary?.donation_count || 0} collections</Text>
                </View>
                <View style={[styles.kpiCard, styles.kpiCardHighlight]}>
                  <Text style={[styles.kpiLabel, styles.kpiLabelHighlight]}>Net Balance</Text>
                  <Text style={[styles.kpiValue, styles.kpiValueHighlight]}>{formatRupee(summary?.net_balance || 0)}</Text>
                  <Text style={[styles.kpiSub, styles.kpiSubHighlight]}>Surplus funds</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📢 Financial ledgers are visible to the Mandal Committee members only. Regular updates will be posted soon.
            </Text>
          </View>
        )}

        {/* Active Campaigns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Campaigns</Text>
          {isCampaignsLoading ? (
            <ActivityIndicator size="small" color="#FF9500" style={{ marginVertical: 20 }} />
          ) : campaigns && campaigns.length > 0 ? (
            campaigns.map((camp) => (
              <TouchableOpacity
                key={camp.id}
                style={styles.campaignCard}
                onPress={() => router.push({ pathname: "/(dashboard)/donate", params: { campaign_id: camp.id } })}
                activeOpacity={0.9}
              >
                <View style={styles.campaignInfo}>
                  <Text style={styles.campaignName}>{camp.name}</Text>
                  <Text style={styles.campaignDesc} numberOfLines={2}>
                    {camp.description || "Help support this community activity."}
                  </Text>
                </View>
                {camp.target_amount && (
                  <View style={styles.campaignTargetContainer}>
                    <Text style={styles.campaignTargetLabel}>Target</Text>
                    <Text style={styles.campaignTargetValue}>{formatRupee(camp.target_amount)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No active campaigns.</Text>
          )}
        </View>

        {/* Quick Links / Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.shortcutsGrid}>
            <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push("/(dashboard)/donate")} activeOpacity={0.8}>
              <Text style={styles.shortcutIcon}>💖</Text>
              <Text style={styles.shortcutLabel}>Donate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push("/(dashboard)/members")} activeOpacity={0.8}>
              <Text style={styles.shortcutIcon}>👥</Text>
              <Text style={styles.shortcutLabel}>Directory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push("/(dashboard)/settings")} activeOpacity={0.8}>
              <Text style={styles.shortcutIcon}>⚙️</Text>
              <Text style={styles.shortcutLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6", // Puja Ivory White
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "System",
  },
  roleBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  roleText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  banner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  bannerEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  bannerSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "System",
  },
  liveIndicator: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#10B981",
    textTransform: "uppercase",
  },
  kpiContainer: {
    flexDirection: "row",
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  kpiCardHighlight: {
    borderColor: "#FF9500",
    backgroundColor: "#FFFBEB",
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kpiLabelHighlight: {
    color: "#D97706",
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  kpiValueHighlight: {
    color: "#B45309",
  },
  kpiSub: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 6,
  },
  kpiSubHighlight: {
    color: "#D97706",
  },
  infoBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    color: "#B45309",
    lineHeight: 18,
  },
  campaignCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 10,
  },
  campaignInfo: {
    flex: 1,
    marginRight: 16,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
  },
  campaignDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 16,
  },
  campaignTargetContainer: {
    alignItems: "flex-end",
  },
  campaignTargetLabel: {
    fontSize: 9,
    color: "#9CA3AF",
  },
  campaignTargetValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FF9500",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  shortcutsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  shortcutIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  shortcutLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4B5563",
  },
});

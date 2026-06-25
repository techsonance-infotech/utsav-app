import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchTenant, useFetchMembers, useFetchCampaigns } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

export default function ManageSubscriptionScreen() {
  const { tenantId } = useAuthStore();
  const { data: tenant, isLoading: isTenantLoading } = useFetchTenant(tenantId);
  const { data: members, isLoading: isMembersLoading } = useFetchMembers();
  const { data: campaigns, isLoading: isCampaignsLoading } = useFetchCampaigns();

  const plan = tenant?.plan || "trial";
  const planDetails = {
    trial: { members: 100, storage: 2, campaigns: 2, price: "Free", priceLabel: "Free" },
    silver: { members: 500, storage: 10, campaigns: 5, price: "₹1,999/mo", priceLabel: "₹1,999/mo" },
    gold: { members: 2000, storage: 50, campaigns: 20, price: "₹4,999/mo", priceLabel: "₹4,999/mo" },
    platinum: { members: 10000, storage: 200, campaigns: 100, price: "₹9,999/mo", priceLabel: "₹9,999/mo" },
  }[plan] || { members: 100, storage: 2, campaigns: 2, price: "Free", priceLabel: "Free" };

  const membersCount = members?.length || 0;
  const campaignsCount = campaigns?.length || 0;
  const storageUsed = Number(Math.min((membersCount * 0.02 + campaignsCount * 0.1), planDetails.storage).toFixed(2));

  const usageMeters = [
    { label: "Members Count", current: membersCount, limit: planDetails.members, icon: "account-group-outline" },
    { label: "Storage Limit", current: storageUsed, limit: planDetails.storage, unit: "GB", icon: "database-outline" },
    { label: "Active Campaigns", current: campaignsCount, limit: planDetails.campaigns, icon: "bullhorn-outline" },
  ];

  const invoices = [
    { date: "June 10, 2026", id: "#INV-9281", amt: plan === "trial" ? "₹0.00" : planDetails.price, status: "Paid" },
    { date: "May 10, 2026", id: "#INV-8176", amt: plan === "trial" ? "₹0.00" : planDetails.price, status: "Paid" },
  ];

  const isLoading = isTenantLoading || isMembersLoading || isCampaignsLoading;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryBrand} />
      </View>
    );
  }

  let expiryLabel = "Trial period active";
  if (tenant?.plan_expires_at) {
    const d = new Date(tenant.plan_expires_at);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    expiryLabel = `${plan === "trial" ? "Trial" : "Subscription"} expires on: ${d.toLocaleDateString('en-US', options as any)}`;
  }

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
        <Text style={styles.headerTitle}>Subscription Status</Text>
        <View style={{ width: 24 }} />
      </View>
 
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Plan Detail Box */}
        <View style={styles.planCard}>
          <View style={styles.badgeRow}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{(tenant?.plan || "TRIAL").toUpperCase()} PLAN</Text>
            </View>
            <Text style={styles.planPrice}>{plan === "trial" ? "Free" : planDetails.price}</Text>
          </View>
          <Text style={styles.planTitle}>{tenant?.name || "Utsav Mandal"}</Text>
          <Text style={styles.planExpiry}>
            {expiryLabel}
          </Text>

          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => router.push("/(dashboard)/upgrade-plan-selection")}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Usage meters section */}
        <View style={styles.metersSection}>
          <Text style={styles.sectionTitle}>Plan Usage & Limits</Text>
          <View style={styles.metersList}>
            {usageMeters.map((m, idx) => {
              const ratio = m.current / m.limit;
              const percent = Math.min(ratio * 100, 100);
              return (
                <View key={idx} style={styles.meterCard}>
                  <View style={styles.meterHeader}>
                    <View style={styles.meterTitleRow}>
                      <MaterialCommunityIcons name={m.icon as any} size={20} color={colors.primaryBrand} />
                      <Text style={styles.meterLabel}>{m.label}</Text>
                    </View>
                    <Text style={styles.meterValue}>
                      {m.current}
                      {m.unit} / {m.limit}
                      {m.unit}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${percent}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Invoice Statement List */}
        <View style={styles.invoiceSection}>
          <Text style={styles.sectionTitle}>Billing Invoices</Text>
          <View style={styles.invoiceCard}>
            {invoices.map((inv, idx) => (
              <View key={idx}>
                {idx > 0 && <View style={styles.separator} />}
                <View style={styles.invoiceRow}>
                  <View>
                    <Text style={styles.invoiceId}>{inv.id}</Text>
                    <Text style={styles.invoiceDate}>{inv.date}</Text>
                  </View>
                  <View style={styles.invoiceRight}>
                    <Text style={styles.invoiceAmt}>{inv.amt}</Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidText}>{inv.status}</Text>
                    </View>
                  </View>
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  planCard: {
    backgroundColor: colors.charcoal,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  planBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  planBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  planPrice: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
  planTitle: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
  planExpiry: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.outlineVariant,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  upgradeBtn: {
    backgroundColor: colors.primaryBrand,
    height: 48,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  upgradeBtnText: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
  metersSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  metersList: {
    gap: spacing.sm,
  },
  meterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  meterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  meterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  meterLabel: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  meterValue: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.pujaWhite,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
  },
  invoiceSection: {
    marginBottom: spacing.md,
  },
  invoiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingHorizontal: spacing.md,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  invoiceId: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  invoiceDate: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: "flex-end",
  },
  invoiceAmt: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  paidBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  paidText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.4)",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.pujaWhite,
  },
});

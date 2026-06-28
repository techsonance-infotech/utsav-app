import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFinancialSummary, useFetchDonations } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { ScreenHeader } from "../components/ScreenHeader";

export default function RevenueAnalyticsScreen() {
  const { tenantId } = useAuthStore();
  const { data: summary, isLoading: loadingSummary } = useFinancialSummary(tenantId);
  const { data: donations = [], isLoading: loadingDonations } = useFetchDonations();

  const formatAmount = (num: number) => {
    if (!num) return "₹0";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const getDonorRetention = () => {
    const donorCounts: Record<string, number> = {};
    donations.forEach(d => {
      if (d.donor_name) {
        donorCounts[d.donor_name] = (donorCounts[d.donor_name] || 0) + 1;
      }
    });
    const totalDonors = Object.keys(donorCounts).length;
    if (totalDonors === 0) return "0.0%";
    const repeatDonors = Object.values(donorCounts).filter(c => c > 1).length;
    return `${((repeatDonors / totalDonors) * 100).toFixed(1)}%`;
  };

  // Calculations for KPIs
  const confirmedDonations = donations.filter(d => d.status === "confirmed");
  const onlineAmt = confirmedDonations.filter(d => d.mode !== "cash").reduce((acc, d) => acc + d.amount, 0);
  const cashAmt = confirmedDonations.filter(d => d.mode === "cash").reduce((acc, d) => acc + d.amount, 0);

  const summaries = [
    {
      label: "Total Collection",
      val: formatAmount(summary?.total_donations || 0),
      sub: `Net Balance: ${formatAmount(summary?.net_balance || 0)}`,
      icon: "cash-multiple",
      color: colors.tulsiGreen
    },
    {
      label: "Online Gateways",
      val: formatAmount(onlineAmt),
      sub: "Razorpay/UPI payments",
      icon: "credit-card-outline",
      color: colors.primaryBrand
    },
    {
      label: "Cash Receipts",
      val: formatAmount(cashAmt),
      sub: "Manual box contributions",
      icon: "wallet-outline",
      color: colors.aartiGold
    },
    {
      label: "Donor Retention",
      val: getDonorRetention(),
      sub: "Repeat sponsors ratio",
      icon: "account-heart-outline",
      color: colors.kumkumRed
    },
  ];

  // Distribution calculations
  const totalConfirmedAmt = confirmedDonations.reduce((acc, d) => acc + d.amount, 0) || 1; // avoid divide by zero
  const upiAmt = confirmedDonations.filter(d => d.mode === "online").reduce((acc, d) => acc + d.amount, 0);
  const upiPct = Math.round((upiAmt / totalConfirmedAmt) * 100);
  const cashPct = Math.round((cashAmt / totalConfirmedAmt) * 100);
  const otherPct = Math.max(0, 100 - upiPct - cashPct);

  // Recent transactions list
  const getRecentTransactions = () => {
    return donations
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map(d => {
        const formattedDate = new Date(d.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
        return {
          donor: d.is_anonymous ? "Anonymous" : d.donor_name,
          amt: `₹${d.amount.toLocaleString("en-IN")}`,
          via: d.mode === "online" ? "UPI Gateway" : d.mode.charAt(0).toUpperCase() + d.mode.slice(1),
          date: formattedDate,
          state: d.status === "confirmed" ? "Success" : d.status.charAt(0).toUpperCase() + d.status.slice(1),
        };
      });
  };

  const recentTransactions = getRecentTransactions();

  if (loadingSummary || loadingDonations) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primaryBrand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Revenue Analytics" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {summaries.map((s, idx) => (
            <View key={idx} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiLabel}>{s.label}</Text>
                <MaterialCommunityIcons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.kpiVal}>{s.val}</Text>
              <Text style={styles.kpiSub}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* Payment Gateway Distribution Chart block */}
        <View style={styles.distributionCard}>
          <Text style={styles.cardTitle}>Gateway Distribution</Text>
          <Text style={styles.cardSubtitle}>Collection breakdown by donation modes</Text>

          {/* Saffron and Green indicator bars */}
          <View style={styles.distBarsContainer}>
            <View style={styles.distRow}>
              <View style={styles.distRowLabel}>
                <Text style={styles.distName}>UPI Payments</Text>
                <Text style={styles.distAmt}>{formatAmount(upiAmt)} ({upiPct}%)</Text>
              </View>
              <View style={styles.barBack}>
                <View style={[styles.barFill, { width: `${upiPct}%`, backgroundColor: colors.tulsiGreen }]} />
              </View>
            </View>

            <View style={styles.distRow}>
              <View style={styles.distRowLabel}>
                <Text style={styles.distName}>Cash Contributions</Text>
                <Text style={styles.distAmt}>{formatAmount(cashAmt)} ({cashPct}%)</Text>
              </View>
              <View style={styles.barBack}>
                <View style={[styles.barFill, { width: `${cashPct}%`, backgroundColor: colors.aartiGold }]} />
              </View>
            </View>

            <View style={styles.distRow}>
              <View style={styles.distRowLabel}>
                <Text style={styles.distName}>Other Payment Modes</Text>
                <Text style={styles.distAmt}>{formatAmount(totalConfirmedAmt - upiAmt - cashAmt)} ({otherPct}%)</Text>
              </View>
              <View style={styles.barBack}>
                <View style={[styles.barFill, { width: `${otherPct}%`, backgroundColor: colors.primaryBrand }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Transactions log list */}
        <View style={styles.txSection}>
          <Text style={styles.sectionTitle}>Recent Contributions</Text>
          <View style={styles.txCard}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, idx) => (
                <View key={idx}>
                  {idx > 0 && <View style={styles.separator} />}
                  <View style={styles.txRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txDonor}>{tx.donor}</Text>
                      <Text style={styles.txDate}>{tx.date} • via {tx.via}</Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={styles.txAmt}>{tx.amt}</Text>
                      <View
                        style={[
                          styles.successBadge,
                          tx.state !== "Success" && { backgroundColor: "rgba(234, 179, 8, 0.1)" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.successText,
                            tx.state !== "Success" && { color: colors.aartiGold },
                          ]}
                        >
                          {tx.state}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: spacing.lg, alignItems: "center" }}>
                <Text style={{ fontFamily: fonts.inter.medium, color: colors.outline, fontSize: 13 }}>
                  No donations recorded yet.
                </Text>
              </View>
            )}
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
  kpiHeader: {
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
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  kpiSub: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.outline,
    marginTop: 4,
  },
  distributionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  distBarsContainer: {
    gap: spacing.md,
  },
  distRow: {
    gap: spacing.xs,
  },
  distRowLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distName: {
    fontSize: 13,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  distAmt: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  barBack: {
    height: 8,
    backgroundColor: colors.pujaWhite,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  txSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  txCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingHorizontal: spacing.md,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  txDonor: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  txDate: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmt: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  successBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  successText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.4)",
  },
});

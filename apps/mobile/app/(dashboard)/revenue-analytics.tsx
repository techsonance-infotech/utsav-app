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

export default function RevenueAnalyticsScreen() {
  const summaries = [
    { label: "Total Collection", val: "₹18.4 Lakhs", sub: "+12.4% vs last year", icon: "cash-multiple", color: colors.tulsiGreen },
    { label: "Online Gateways", val: "₹14.2 Lakhs", sub: "Razorpay/UPI payments", icon: "credit-card-outline", color: colors.primaryBrand },
    { label: "Cash Receipts", val: "₹4.2 Lakhs", sub: "Manual box contributions", icon: "wallet-outline", color: colors.aartiGold },
    { label: "Donor Retention", val: "72.4%", sub: "Repeat sponsors ratio", icon: "account-heart-outline", color: colors.kumkumRed },
  ];

  const recentTransactions = [
    { donor: "Ramesh Chandar", amt: "₹11,000", via: "UPI Gateway", date: "Today, 10:14 AM", state: "Success" },
    { donor: "Suresh Patil", amt: "₹500", via: "Cash", date: "Today, 09:30 AM", state: "Success" },
    { donor: "Anjali Gupta", amt: "₹25,000", via: "Net Banking", date: "Yesterday, 08:24 PM", state: "Success" },
    { donor: "Anonymous", amt: "₹1,500", via: "UPI Gateway", date: "Yesterday, 04:12 PM", state: "Success" },
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
        <Text style={styles.headerTitle}>Revenue Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

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
                <Text style={styles.distAmt}>₹8.5L (60%)</Text>
              </View>
              <View style={styles.barBack}>
                <View style={[styles.barFill, { width: "60%", backgroundColor: colors.tulsiGreen }]} />
              </View>
            </View>

            <View style={styles.distRow}>
              <View style={styles.distRowLabel}>
                <Text style={styles.distName}>Credit/Debit Cards</Text>
                <Text style={styles.distAmt}>₹5.7L (25%)</Text>
              </View>
              <View style={styles.barBack}>
                <View style={[styles.barFill, { width: "25%", backgroundColor: colors.primaryBrand }]} />
              </View>
            </View>

            <View style={styles.distRow}>
              <View style={styles.distRowLabel}>
                <Text style={styles.distName}>Cash Contributions</Text>
                <Text style={styles.distAmt}>₹4.2L (15%)</Text>
              </View>
              <View style={styles.barBack}>
                <View style={[styles.barFill, { width: "15%", backgroundColor: colors.aartiGold }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Transactions log list */}
        <View style={styles.txSection}>
          <Text style={styles.sectionTitle}>Recent Contributions</Text>
          <View style={styles.txCard}>
            {recentTransactions.map((tx, idx) => (
              <View key={idx}>
                {idx > 0 && <View style={styles.separator} />}
                <View style={styles.txRow}>
                  <View>
                    <Text style={styles.txDonor}>{tx.donor}</Text>
                    <Text style={styles.txDate}>{tx.date} • via {tx.via}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={styles.txAmt}>{tx.amt}</Text>
                    <View style={styles.successBadge}>
                      <Text style={styles.successText}>{tx.state}</Text>
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

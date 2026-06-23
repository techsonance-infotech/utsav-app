import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useFinancialSummary } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function FinancialReportsScreen() {
  const { data: summary, isLoading } = useFinancialSummary();
  const [filterPeriod, setFilterPeriod] = useState<"festival" | "30days">("festival");

  // Simulated leaderboard data matching html
  const topBenefactors = [
    {
      id: "b1",
      name: "Rahul Deshmukh",
      tier: "Aarti Gold Tier",
      amount: "₹ 2,50,000",
      type: "Corp. Sponsor",
      tierColor: colors.aartiGold,
    },
    {
      id: "b2",
      name: "Anjali Kulkarni",
      tier: "Silver Patron",
      amount: "₹ 1,25,000",
      type: "Family Donation",
      tierColor: colors.outline,
    },
    {
      id: "b3",
      name: "Vinayak Bhat",
      tier: "Silver Patron",
      amount: "₹ 95,000",
      type: "Individual",
      tierColor: colors.outline,
    },
    {
      id: "b4",
      name: "Prakash Mehra",
      tier: "Member",
      amount: "₹ 50,000",
      type: "Online",
      tierColor: colors.onSurfaceVariant,
    },
  ];

  // Expense categories
  const expenseCategories = [
    { name: "Mandap & Decoration", amount: "₹ 1,85,400", pct: "45%", color: "rgba(140, 80, 0, 0.4)" },
    { name: "Catering & Prasadam", amount: "₹ 1,03,000", pct: "25%", color: "rgba(185, 13, 24, 0.4)" },
    { name: "Cultural Events", amount: "₹ 61,800", pct: "15%", color: "rgba(234, 179, 8, 0.4)" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.primaryBrand}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Financials</Text>
            <Text style={styles.headerSubtitle}>Real-time Treasury Reporting</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="download"
            size={24}
            color={colors.primaryBrand}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector Tabs */}
        <View style={styles.periodTabsWrapper}>
          <View style={styles.periodTabs}>
            <TouchableOpacity
              style={[styles.periodTab, filterPeriod === "festival" && styles.periodTabActive]}
              onPress={() => setFilterPeriod("festival")}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodTabText, filterPeriod === "festival" && styles.periodTabTextActive]}>
                This Festival
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodTab, filterPeriod === "30days" && styles.periodTabActive]}
              onPress={() => setFilterPeriod("30days")}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodTabText, filterPeriod === "30days" && styles.periodTabTextActive]}>
                Last 30 Days
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.calendarBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* KPI Bento Cards */}
        <View style={styles.kpiContainer}>
          {/* Total Collections */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="trending-up" size={18} color={colors.primaryBrand} />
              <Text style={styles.kpiLabel}>Total Collections</Text>
            </View>
            <Text style={styles.kpiValue}>₹ 12,45,800</Text>
            <Text style={styles.kpiTrending}>
              <MaterialCommunityIcons name="arrow-up" size={12} color={colors.tulsiGreen} />
              <Text style={{ color: colors.tulsiGreen, fontWeight: "600" }}> +12.5%</Text> from last year
            </Text>
          </View>

          {/* Total Expenses */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="receipt" size={18} color={colors.secondaryBrand} />
              <Text style={styles.kpiLabel}>Total Expenses</Text>
            </View>
            <Text style={styles.kpiValue}>₹ 4,12,000</Text>
            <Text style={styles.kpiSubtext}>33% of total revenue</Text>
          </View>

          {/* Net Balance */}
          <View style={[styles.kpiCard, styles.kpiCardHighlighted]}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="wallet-outline" size={18} color={colors.primaryBrand} />
              <Text style={[styles.kpiLabel, { color: colors.onPrimaryContainer }]}>Net Balance</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.primaryBrand }]}>₹ 8,33,800</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>AVAILABLE FUNDS</Text>
            </View>
          </View>
        </View>

        {/* Revenue vs Expenses Trend Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue vs Expenses Trend</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.primaryContainer }]} />
              <Text style={styles.legendText}>Donations</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.secondaryBrand }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>

          {/* Simulated chart bars */}
          <View style={styles.chartVisualization}>
            {/* Week 1 */}
            <View style={styles.chartCol}>
              <View style={styles.chartBarGroup}>
                <View style={[styles.chartBar, { height: "40%", backgroundColor: colors.primaryContainer }]} />
                <View style={[styles.chartBar, { height: "15%", backgroundColor: colors.secondaryBrand, opacity: 0.6 }]} />
              </View>
              <Text style={styles.chartColLabel}>W1</Text>
            </View>
            {/* Week 2 */}
            <View style={styles.chartCol}>
              <View style={styles.chartBarGroup}>
                <View style={[styles.chartBar, { height: "65%", backgroundColor: colors.primaryContainer }]} />
                <View style={[styles.chartBar, { height: "25%", backgroundColor: colors.secondaryBrand, opacity: 0.6 }]} />
              </View>
              <Text style={styles.chartColLabel}>W2</Text>
            </View>
            {/* Week 3 */}
            <View style={styles.chartCol}>
              <View style={styles.chartBarGroup}>
                <View style={[styles.chartBar, { height: "85%", backgroundColor: colors.primaryContainer }]} />
                <View style={[styles.chartBar, { height: "10%", backgroundColor: colors.secondaryBrand, opacity: 0.6 }]} />
              </View>
              <Text style={styles.chartColLabel}>W3</Text>
            </View>
            {/* Week 4 */}
            <View style={styles.chartCol}>
              <View style={styles.chartBarGroup}>
                <View style={[styles.chartBar, { height: "55%", backgroundColor: colors.primaryContainer }]} />
                <View style={[styles.chartBar, { height: "45%", backgroundColor: colors.secondaryBrand, opacity: 0.6 }]} />
              </View>
              <Text style={styles.chartColLabel}>W4</Text>
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <MaterialCommunityIcons name="information" size={16} color={colors.primaryBrand} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>Treasurer's Note</Text>
              <Text style={styles.noteDesc}>
                Collections peaked during week 2 of Ganesh Chaturthi. Week 4 expenses reflect mandap dismantling.
              </Text>
            </View>
          </View>
        </View>

        {/* Top Benefactors Leaderboard */}
        <View style={styles.leaderboardCard}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>Top Benefactors</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leaderboardList}>
            {topBenefactors.map((item, idx) => (
              <View key={item.id} style={styles.leaderboardItem}>
                <View style={styles.leaderboardLeft}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{idx + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.benefactorName}>{item.name}</Text>
                    <View style={styles.tierRow}>
                      <View style={[styles.tierIndicator, { backgroundColor: item.tierColor }]} />
                      <Text style={[styles.tierText, { color: item.tierColor }]}>{item.tier}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.leaderboardRight}>
                  <Text style={styles.benefactorAmount}>{item.amount}</Text>
                  <Text style={styles.benefactorType}>{item.type}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Expense Categories */}
        <View style={styles.expensesCard}>
          <Text style={styles.expensesTitle}>Expense Categories</Text>
          <View style={styles.categoriesList}>
            {expenseCategories.map((cat, idx) => (
              <View key={idx} style={styles.categoryRow}>
                <View style={[styles.categoryBarFill, { width: cat.pct as any, backgroundColor: cat.color }]} />
                <View style={styles.categoryInfoRow}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryAmt}>{cat.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Smart Assistant Card */}
        <View style={styles.assistantCard}>
          <View style={styles.assistantHeader}>
            <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
            <Text style={styles.assistantTitle}>Smart Assistant</Text>
          </View>
          <Text style={styles.assistantDesc}>
            You have 12 pending donation receipts to verify. Automate this process?
          </Text>
          <View style={styles.assistantActions}>
            <TouchableOpacity style={styles.primaryActionBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="flash" size={16} color={colors.primaryBrand} />
              <Text style={styles.primaryActionBtnText}>Verify All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryActionBtn} activeOpacity={0.8}>
              <Text style={styles.secondaryActionBtnText}>Review Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.primaryBrand,
  },
  headerSubtitle: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: -2,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: 20 },

  periodTabsWrapper: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  periodTabs: {
    flexDirection: "row",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: colors.pujaWhite,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  periodTabText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  periodTabTextActive: {
    color: colors.primaryBrand,
  },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
  },

  kpiContainer: { gap: 12 },
  kpiCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  kpiCardHighlighted: {
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  kpiHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  kpiLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  kpiValue: {
    fontFamily: fonts.poppins.bold,
    fontSize: 28,
    color: colors.charcoal,
  },
  kpiTrending: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  kpiSubtext: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  statusBadge: {
    backgroundColor: colors.primaryBrand,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: "#FFFFFF",
  },

  chartCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  chartTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.charcoal,
  },
  legendRow: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendColor: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  chartVisualization: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    paddingBottom: 8,
  },
  chartCol: { flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center", gap: 6 },
  chartBarGroup: { flex: 1, width: "100%", justifyContent: "flex-end", gap: 4 },
  chartBar: { width: "100%", borderRadius: 4 },
  chartColLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 11,
    color: colors.outline,
  },
  noteBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  noteTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },
  noteDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },

  leaderboardCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    overflow: "hidden",
  },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    backgroundColor: "rgba(244, 241, 235, 0.3)",
  },
  leaderboardTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.charcoal,
  },
  viewAllText: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    color: colors.primaryBrand,
  },
  leaderboardList: { paddingVertical: 8 },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
  },
  leaderboardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.charcoal,
  },
  benefactorName: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  tierRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  tierIndicator: { width: 6, height: 6, borderRadius: 3 },
  tierText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    textTransform: "uppercase",
  },
  leaderboardRight: { alignItems: "flex-end" },
  benefactorAmount: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.charcoal,
  },
  benefactorType: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  expensesCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  expensesTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.charcoal,
  },
  categoriesList: { gap: 12 },
  categoryRow: {
    height: 36,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    borderRadius: 18,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
  },
  categoryBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 18,
  },
  categoryInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  categoryName: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },
  categoryAmt: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    color: colors.charcoal,
  },

  assistantCard: {
    backgroundColor: colors.charcoal,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  assistantHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  assistantTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: "#FFFFFF",
  },
  assistantDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: "rgba(250, 250, 248, 0.75)",
    lineHeight: 20,
  },
  assistantActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  primaryActionBtn: {
    flex: 1,
    height: 40,
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  primaryActionBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 13,
    color: colors.onPrimaryContainer,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(250, 250, 248, 0.2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250, 250, 248, 0.1)",
  },
  secondaryActionBtnText: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 13,
    color: "#FFFFFF",
  },
});

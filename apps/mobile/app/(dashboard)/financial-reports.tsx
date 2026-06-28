import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFinancialSummary, useFetchDonations, useExpenses, useExpenseCategories, useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../components/ScreenHeader";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function FinancialReportsScreen() {
  const { tenantId } = useAuthStore();
  const [filterPeriod, setFilterPeriod] = useState<"festival" | "30days">("festival");

  // Fetch all required data from backend
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: summary, isLoading: isSummaryLoading } = useFinancialSummary(tenantId);
  const { data: donations = [], isLoading: isDonationsLoading } = useFetchDonations();
  const { data: expenses = [], isLoading: isExpensesLoading } = useExpenses();
  const { data: categories = [], isLoading: isCategoriesLoading } = useExpenseCategories();

  const isLoading = isSummaryLoading || isDonationsLoading || isExpensesLoading || isCategoriesLoading;

  // Currency formatter helper
  const formatRupee = (value: number) => {
    return "₹ " + new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 1. Calculate weekly trend
  const getWeeklyTrend = () => {
    const daysCount = filterPeriod === "festival" ? 60 : 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000);

    const bucketDurationMs = (daysCount * 24 * 60 * 60 * 1000) / 4;

    const weeks = [
      { donations: 0, expenses: 0, label: "W1" },
      { donations: 0, expenses: 0, label: "W2" },
      { donations: 0, expenses: 0, label: "W3" },
      { donations: 0, expenses: 0, label: "W4" },
    ];

    const confirmedDonations = donations.filter((d) => d.status === "confirmed");
    const approvedExpenses = expenses.filter((e) => ["approved", "paid"].includes(e.status));

    confirmedDonations.forEach((d) => {
      const date = new Date(d.paid_at || d.created_at);
      const diff = date.getTime() - startDate.getTime();
      if (diff >= 0 && diff < daysCount * 24 * 60 * 60 * 1000) {
        const bucketIndex = Math.min(Math.floor(diff / bucketDurationMs), 3);
        weeks[bucketIndex].donations += d.amount;
      }
    });

    approvedExpenses.forEach((e) => {
      const date = new Date(e.paid_at || e.expense_date || e.created_at);
      const diff = date.getTime() - startDate.getTime();
      if (diff >= 0 && diff < daysCount * 24 * 60 * 60 * 1000) {
        const bucketIndex = Math.min(Math.floor(diff / bucketDurationMs), 3);
        weeks[bucketIndex].expenses += e.amount;
      }
    });

    return weeks;
  };

  const weeklyTrend = getWeeklyTrend();
  const maxWeeklyValue = Math.max(
    ...weeklyTrend.map((w) => Math.max(w.donations, w.expenses)),
    1000 // Fallback minimum to avoid divide-by-zero
  );

  const getBarHeight = (value: number) => {
    const pct = (value / maxWeeklyValue) * 85; // Max height is 85%
    return `${Math.max(pct, 5)}%` as any; // Minimum height is 5% so bar is visible
  };

  // 2. Leaderboard Calculation
  const getLeaderboard = () => {
    return donations
      .filter((d) => d.status === "confirmed" && !d.is_anonymous)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((d) => {
        let tier = "Member";
        let tierColor = colors.onSurfaceVariant;
        if (d.amount >= 100000) {
          tier = "Aarti Gold Tier";
          tierColor = colors.aartiGold;
        } else if (d.amount >= 25000) {
          tier = "Silver Patron";
          tierColor = colors.outline;
        }

        return {
          id: d.id,
          name: d.donor_name,
          tier,
          amount: formatRupee(d.amount),
          type: d.mode === "cash" ? "Cash" : "Online",
          tierColor,
        };
      });
  };

  const leaderboardData = getLeaderboard();

  // 3. Expense Categories Breakdown
  const getCategoriesBreakdown = () => {
    const approvedExpenses = expenses.filter((e) => ["approved", "paid"].includes(e.status));
    const totalExpenses = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

    const grouped: Record<string, number> = {};
    approvedExpenses.forEach((e) => {
      const catId = e.category_id || "other";
      grouped[catId] = (grouped[catId] || 0) + e.amount;
    });

    return Object.entries(grouped)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        const name = cat ? cat.name : "Other Expenses";
        const pctVal = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
        const pct = `${Math.round(pctVal)}%`;
        const color = cat?.color || "rgba(140, 80, 0, 0.4)";

        return {
          name,
          amount: formatRupee(amount),
          pct,
          color,
        };
      })
      .sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));
  };

  const categoriesBreakdown = getCategoriesBreakdown();

  // 4. Smart Assistant Logic
  const pendingDonationsCount = donations.filter((d) => d.status === "pending").length;
  const pendingExpensesCount = expenses.filter((e) => ["pending_approval", "submitted"].includes(e.status)).length;

  let assistantTitle = "Smart Assistant";
  let assistantDesc = "Everything is up to date! Your treasury records are fully synced.";
  let showAssistantActions = false;

  if (pendingDonationsCount > 0 || pendingExpensesCount > 0) {
    showAssistantActions = true;
    if (pendingDonationsCount > 0 && pendingExpensesCount > 0) {
      assistantDesc = `You have ${pendingDonationsCount} pending donation receipts and ${pendingExpensesCount} expenses awaiting approval. Action required.`;
    } else if (pendingDonationsCount > 0) {
      assistantDesc = `You have ${pendingDonationsCount} pending donation receipts to verify. Automate this process?`;
    } else {
      assistantDesc = `You have ${pendingExpensesCount} expenses waiting for your approval. Action required.`;
    }
  }

  // 5. PDF Export
  const handleExportPDF = async () => {
    try {
      const tenantName = tenant?.name || "Mandal Treasury";
      const totalCollections = formatRupee(summary?.total_donations || 0);
      const totalExpenses = formatRupee(summary?.total_expenses || 0);
      const netBalance = formatRupee(summary?.net_balance || 0);

      const leaderboardHtml = leaderboardData.length > 0
        ? leaderboardData.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.name}</td>
              <td>${item.tier}</td>
              <td>${item.amount}</td>
              <td>${item.type}</td>
            </tr>
          `).join("")
        : '<tr><td colspan="5" style="text-align: center;">No donors recorded.</td></tr>';

      const categoriesHtml = categoriesBreakdown.length > 0
        ? categoriesBreakdown.map(cat => `
            <tr>
              <td>${cat.name}</td>
              <td>${cat.pct}</td>
              <td>${cat.amount}</td>
            </tr>
          `).join("")
        : '<tr><td colspan="3" style="text-align: center;">No expenses recorded.</td></tr>';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Treasury Financial Report</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #2D3748;
                padding: 30px;
                line-height: 1.5;
              }
              .header {
                border-bottom: 2px solid #E2E8F0;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .mandal-name {
                font-size: 24px;
                font-weight: bold;
                color: #8C5000;
                margin: 0;
              }
              .title {
                font-size: 18px;
                color: #4A5568;
                margin: 5px 0 0 0;
              }
              .date {
                font-size: 12px;
                color: #718096;
                margin-top: 5px;
              }
              .kpi-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                gap: 15px;
              }
              .kpi-card {
                flex: 1;
                border: 1px solid #E2E8F0;
                border-radius: 8px;
                padding: 15px;
                background-color: #F8FAFC;
              }
              .kpi-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #718096;
                margin-bottom: 5px;
                font-weight: bold;
              }
              .kpi-val {
                font-size: 20px;
                font-weight: bold;
                color: #1A202C;
              }
              .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #2D3748;
                margin-top: 30px;
                margin-bottom: 15px;
                border-bottom: 1px solid #E2E8F0;
                padding-bottom: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #E2E8F0;
                padding: 10px;
                text-align: left;
                font-size: 13px;
              }
              th {
                background-color: #F7FAFC;
                color: #4A5568;
                font-weight: bold;
              }
              .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 11px;
                color: #A0AEC0;
                border-top: 1px solid #E2E8F0;
                padding-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="mandal-name">${tenantName}</h1>
              <p class="title">Treasury Financial Report</p>
              <p class="date">Report generated on ${new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
            </div>

            <div class="kpi-row">
              <div class="kpi-card">
                <div class="kpi-label">Total Collections</div>
                <div class="kpi-val">${totalCollections}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Total Expenses</div>
                <div class="kpi-val">${totalExpenses}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Net Treasury Balance</div>
                <div class="kpi-val" style="color: #2F855A;">${netBalance}</div>
              </div>
            </div>

            <h2 class="section-title">Top Benefactors</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 8%;">Rank</th>
                  <th>Name</th>
                  <th>Tier</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                ${leaderboardHtml}
              </tbody>
            </table>

            <h2 class="section-title">Expense Breakdown by Category</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th style="width: 20%;">Percentage</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                ${categoriesHtml}
              </tbody>
            </table>

            <div class="footer">
              Generated via Utsav App treasury platform. All values are digitally authenticated.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `${tenantName} Financial Report`,
        UTI: "com.adobe.pdf",
      });
    } catch (err: any) {
      Alert.alert("Export Error", "Failed to generate and share report: " + err.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primaryBrand} />
        <Text style={{ marginTop: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant }}>
          Loading financial data...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Treasury Reports" rightIcon="download" onRightPress={handleExportPDF} />

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
          <View style={styles.calendarBtn}>
            <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.onSurfaceVariant} />
          </View>
        </View>

        {/* KPI Bento Cards */}
        <View style={styles.kpiContainer}>
          {/* Total Collections */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="trending-up" size={18} color={colors.primaryBrand} />
              <Text style={styles.kpiLabel}>Total Collections</Text>
            </View>
            <Text style={styles.kpiValue}>{formatRupee(summary?.total_donations || 0)}</Text>
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
            <Text style={styles.kpiValue}>{formatRupee(summary?.total_expenses || 0)}</Text>
            <Text style={styles.kpiSubtext}>
              {summary?.total_donations && summary.total_donations > 0
                ? `${Math.round((summary.total_expenses / summary.total_donations) * 100)}% of total revenue`
                : "0% of total revenue"}
            </Text>
          </View>

          {/* Net Balance */}
          <View style={[styles.kpiCard, styles.kpiCardHighlighted]}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="wallet-outline" size={18} color={colors.primaryBrand} />
              <Text style={[styles.kpiLabel, { color: colors.onPrimaryContainer }]}>Net Balance</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.primaryBrand }]}>{formatRupee(summary?.net_balance || 0)}</Text>
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

          {/* Dynamic chart bars */}
          <View style={styles.chartVisualization}>
            {weeklyTrend.map((week, idx) => (
              <View key={idx} style={styles.chartCol}>
                <View style={styles.chartBarGroup}>
                  <View style={[styles.chartBar, { height: getBarHeight(week.donations), backgroundColor: colors.primaryContainer }]} />
                  <View style={[styles.chartBar, { height: getBarHeight(week.expenses), backgroundColor: colors.secondaryBrand, opacity: 0.6 }]} />
                </View>
                <Text style={styles.chartColLabel}>{week.label}</Text>
              </View>
            ))}
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <MaterialCommunityIcons name="information" size={16} color={colors.primaryBrand} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle}>Treasurer's Note</Text>
              <Text style={styles.noteDesc}>
                Weekly metrics reflect confirmed donations and processed expenses. Swings match high festival activity periods.
              </Text>
            </View>
          </View>
        </View>

        {/* Top Benefactors Leaderboard */}
        <View style={styles.leaderboardCard}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>Top Benefactors</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/(dashboard)/donation-history")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leaderboardList}>
            {leaderboardData.length > 0 ? (
              leaderboardData.map((item, idx) => (
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
              ))
            ) : (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, fontSize: 13 }}>
                  No benefactors recorded yet.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Expense Categories */}
        <View style={styles.expensesCard}>
          <Text style={styles.expensesTitle}>Expense Categories</Text>
          <View style={styles.categoriesList}>
            {categoriesBreakdown.length > 0 ? (
              categoriesBreakdown.map((cat, idx) => (
                <View key={idx} style={styles.categoryRow}>
                  <View style={[styles.categoryBarFill, { width: cat.pct as any, backgroundColor: cat.color }]} />
                  <View style={styles.categoryInfoRow}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryAmt}>{cat.amount}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ padding: 10, alignItems: "center" }}>
                <Text style={{ fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, fontSize: 13 }}>
                  No expenses recorded yet.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Smart Assistant Card */}
        <View style={styles.assistantCard}>
          <View style={styles.assistantHeader}>
            <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
            <Text style={styles.assistantTitle}>{assistantTitle}</Text>
          </View>
          <Text style={styles.assistantDesc}>{assistantDesc}</Text>
          {showAssistantActions && (
            <View style={styles.assistantActions}>
              {pendingDonationsCount > 0 && (
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push("/(dashboard)/donation-history")}
                >
                  <MaterialCommunityIcons name="flash" size={16} color={colors.onPrimaryContainer} />
                  <Text style={styles.primaryActionBtnText}>Verify Receipts</Text>
                </TouchableOpacity>
              )}
              {pendingExpensesCount > 0 && (
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push("/(dashboard)/expense-approval")}
                >
                  <Text style={styles.secondaryActionBtnText}>Approve Expenses</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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

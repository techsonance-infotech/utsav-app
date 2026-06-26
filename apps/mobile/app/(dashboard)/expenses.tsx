import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import {
  useExpenses,
  useApproveExpense,
  useRejectExpense,
  usePayExpense,
} from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import DatePickerModal from "../components/DatePickerModal";

const { width } = Dimensions.get("window");

export default function MobileExpensesScreen() {
  const { role, userFullName } = useAuthStore();
  const { data: expenses = [], isLoading: loadingExpenses, refetch } = useExpenses() as any;

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const payMutation = usePayExpense();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | null>(null);
  const [startDateStr, setStartDateStr] = useState(""); // YYYY-MM-DD
  const [endDateStr, setEndDateStr] = useState(""); // YYYY-MM-DD
  const [showFilters, setShowFilters] = useState(false);

  // DatePicker Visibilities
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const hasAdminAccess = ["owner", "admin", "treasurer"].includes(role || "");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Actions
  const handleApprove = async (id: string) => {
    Alert.alert("Approve Expense", "Are you sure you want to approve this expense voucher?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            await approveMutation.mutateAsync(id);
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to approve expense");
          }
        },
      },
    ]);
  };

  const handleReject = async (id: string) => {
    Alert.prompt(
      "Reject Expense",
      "Please enter a review note describing the reason for rejection:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async (note) => {
            try {
              await rejectMutation.mutateAsync({ id, review_note: note || "Rejected from mobile app." });
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to reject expense");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handlePay = async (id: string) => {
    Alert.alert("Record Payment", "Disburse cash and mark this expense voucher as paid?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Paid",
        onPress: async () => {
          try {
            await payMutation.mutateAsync(id);
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to record payment");
          }
        },
      },
    ]);
  };

  // Helper formatting functions
  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusPillColors = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "rgba(34, 197, 94, 0.1)", text: colors.tulsiGreen, border: "rgba(34, 197, 94, 0.2)" };
      case "approved":
        return { bg: "rgba(59, 130, 246, 0.1)", text: "#2563EB", border: "rgba(59, 130, 246, 0.2)" };
      case "rejected":
        return { bg: "rgba(239, 68, 68, 0.1)", text: colors.kumkumRed, border: "rgba(239, 68, 68, 0.2)" };
      default: // pending_approval
        return { bg: "rgba(234, 179, 8, 0.1)", text: colors.haldiYellow, border: "rgba(234, 179, 8, 0.2)" };
    }
  };

  // Filtered dataset
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp: any) => {
      // 1. Text Search query matching title, vendor or category
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = exp.title?.toLowerCase().includes(query);
        const matchesCategory = exp.category?.name?.toLowerCase().includes(query);
        const matchesVendor = exp.vendor?.business_name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesVendor) return false;
      }

      // 2. Payment Mode filter
      if (selectedModeFilter) {
        if (exp.payment_mode !== selectedModeFilter) return false;
      }

      // 3. Month Filter
      if (selectedMonthFilter !== null && exp.expense_date) {
        const dateObj = new Date(exp.expense_date);
        if (!isNaN(dateObj.getTime())) {
          if (dateObj.getMonth() !== selectedMonthFilter) return false;
        }
      }

      // 4. Date Range Filter
      if (startDateStr && exp.expense_date) {
        if (exp.expense_date < startDateStr) return false;
      }
      if (endDateStr && exp.expense_date) {
        if (exp.expense_date > endDateStr) return false;
      }

      return true;
    });
  }, [expenses, searchQuery, selectedModeFilter, selectedMonthFilter, startDateStr, endDateStr]);

  // Recalculate dynamic KPIs based on active filtered dataset
  const kpis = useMemo(() => {
    let totalPaid = 0;
    let pendingApprovalCount = 0;
    let approvedUnpaidTotal = 0;

    filteredExpenses.forEach((exp: any) => {
      const amount = parseFloat(exp.amount) || 0;
      if (exp.status === "paid") {
        totalPaid += amount;
      } else if (exp.status === "pending_approval") {
        pendingApprovalCount += 1;
      } else if (exp.status === "approved") {
        approvedUnpaidTotal += amount;
      }
    });

    return { totalPaid, pendingApprovalCount, approvedUnpaidTotal };
  }, [filteredExpenses]);

  // Export PDF Report function
  const handleExportPDF = async () => {
    if (filteredExpenses.length === 0) {
      Alert.alert("No Data", "There are no expenses in the filtered list to export.");
      return;
    }

    const rowsHtml = filteredExpenses
      .map(
        (exp: any, index: number) => `
        <tr style="background-color: ${index % 2 === 0 ? "#FFFFFF" : "#FDFBF7"}; border-bottom: 1px solid #EAE6DF;">
          <td style="padding: 10px; font-size: 11px; color: #1E1B18;">${exp.expense_date || "-"}</td>
          <td style="padding: 10px; font-size: 11px; font-weight: bold; color: #1E1B18;">${exp.title || "-"}</td>
          <td style="padding: 10px; font-size: 11px; color: #5C5549;">${exp.category?.name || "General"}</td>
          <td style="padding: 10px; font-size: 11px; color: #5C5549;">${exp.vendor?.business_name || "None"}</td>
          <td style="padding: 10px; font-size: 11px; text-transform: uppercase; font-weight: bold; color: ${
            exp.status === "paid" ? "#22C55E" : exp.status === "approved" ? "#2563EB" : exp.status === "rejected" ? "#EF4444" : "#EAB308"
          };">${exp.status}</td>
          <td style="padding: 10px; font-size: 11px; text-align: right; font-weight: bold; color: #1E1B18;">₹${(parseFloat(exp.amount) || 0).toLocaleString("en-IN")}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1E1B18; padding: 20px; background-color: #FCFBF9; }
            .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #D3BFA7; padding-bottom: 15px; margin-bottom: 20px; }
            .mandal-title { font-size: 22px; font-weight: bold; color: #8C5000; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
            .mandal-sub { font-size: 12px; color: #5C5549; margin: 4px 0 0 0; }
            .report-title { font-size: 14px; font-weight: bold; color: #A8201A; text-align: right; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .meta-date { font-size: 11px; color: #8C8270; text-align: right; margin-top: 4px; }
            .kpi-grid { display: flex; gap: 15px; margin-bottom: 25px; }
            .kpi-card { flex: 1; background-color: #FFFFFF; border: 1px solid #EAE6DF; border-radius: 8px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            .kpi-title { font-size: 10px; font-weight: bold; color: #8C8270; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px; }
            .kpi-value { font-size: 18px; font-weight: bold; color: #8C5000; margin: 0; }
            .kpi-count { font-size: 16px; font-weight: bold; color: #A8201A; margin: 0; }
            table { width: 100%; border-collapse: collapse; background-color: #FFFFFF; margin-top: 10px; }
            th { background-color: #8C5000; color: #FFFFFF; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 10px; text-align: left; letter-spacing: 0.5px; }
            td { border-bottom: 1px solid #EAE6DF; }
            .footer { margin-top: 40px; border-top: 1px solid #EAE6DF; padding-top: 15px; display: flex; justify-content: space-between; font-size: 10px; color: #8C8270; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="mandal-title">UTSAV Mandal Expenses</h1>
              <p class="mandal-sub">Official Festival Expenditure & Disbursement Ledger</p>
            </div>
            <div>
              <h2 class="report-title">Financial Report</h2>
              <p class="meta-date">Exported on: ${new Date().toLocaleDateString("en-IN")} | By: ${userFullName || "Mandal Administrator"}</p>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <p class="kpi-title">Total Disbursed (Paid)</p>
              <p class="kpi-value">₹${kpis.totalPaid.toLocaleString("en-IN")}</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-title">Approved (Unpaid)</p>
              <p class="kpi-value" style="color: #2563EB;">₹${kpis.approvedUnpaidTotal.toLocaleString("en-IN")}</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-title">Pending Approvals</p>
              <p class="kpi-count">${kpis.pendingApprovalCount} Vouchers</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Date</th>
                <th style="width: 25%;">Voucher Title</th>
                <th style="width: 20%;">Category</th>
                <th style="width: 15%;">Vendor</th>
                <th style="width: 12%;">Status</th>
                <th style="width: 13%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated via UTSAV Mandal Mobile Client</p>
            <p>Page 1 of 1</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Export Expenses Report" });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate report file.");
    }
  };

  const renderExpenseItem = ({ item }: { item: any }) => {
    const statusTheme = statusPillColors(item.status);
    const categoryName = item.category?.name || "None / General";
    const vendorName = item.vendor?.business_name || null;
    const categoryColor = item.category?.color || colors.primaryBrand;

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {/* Category Avatar Box */}
            <View style={[styles.avatarCircle, { backgroundColor: `${categoryColor}15` }]}>
              <MaterialCommunityIcons
                name={(item.category?.icon as any) || "cash-register"}
                size={20}
                color={categoryColor}
              />
            </View>
            <View style={styles.infoWrapper}>
              <Text style={styles.rowName} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.rowCategory}>{categoryName}</Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.rowAmount}>{formatRupee(item.amount)}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusTheme.bg, borderColor: statusTheme.border }]}>
              <Text style={[styles.statusText, { color: statusTheme.text }]}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <Text style={styles.rowDate}>📅 {item.expense_date}</Text>
            {vendorName && (
              <>
                <Text style={styles.bulletDot}>•</Text>
                <View style={styles.vendorTag}>
                  <Text style={styles.vendorTagText} numberOfLines={1}>🏬 {vendorName}</Text>
                </View>
              </>
            )}
          </View>
          {item.payment_mode && (
            <View style={styles.modeBadge}>
              <MaterialCommunityIcons name="wallet-outline" size={12} color={colors.onSurfaceVariant} />
              <Text style={styles.modeBadgeText}>{item.payment_mode.replace("_", " ").toUpperCase()}</Text>
            </View>
          )}
        </View>

        {item.description ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText} numberOfLines={2}>📝 {item.description}</Text>
          </View>
        ) : null}

        {/* Action Rows */}
        {hasAdminAccess && item.status === "pending_approval" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleApprove(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleReject(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasAdminAccess && item.status === "approved" && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => handlePay(item.id)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="check-decagram" size={16} color="#FFFFFF" />
            <Text style={styles.payBtnText}>Record Cash Disbursement</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.logoText}>Mandal Expenses</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(dashboard)/add-expense")}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listScroll}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* KPI Cards section */}
            <View style={styles.kpiRow}>
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.08)", "rgba(34, 197, 94, 0.03)"]}
                style={styles.kpiCard}
              >
                <View style={styles.kpiCardHeader}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.tulsiGreen} />
                  <Text style={styles.kpiTitle}>Total Paid</Text>
                </View>
                <Text style={styles.kpiValue} numberOfLines={1}>{formatRupee(kpis.totalPaid)}</Text>
              </LinearGradient>

              <LinearGradient
                colors={["rgba(59, 130, 246, 0.08)", "rgba(59, 130, 246, 0.03)"]}
                style={styles.kpiCard}
              >
                <View style={styles.kpiCardHeader}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color="#2563EB" />
                  <Text style={styles.kpiTitle}>Approved</Text>
                </View>
                <Text style={[styles.kpiValue, { color: "#2563EB" }]} numberOfLines={1}>
                  {formatRupee(kpis.approvedUnpaidTotal)}
                </Text>
              </LinearGradient>

              <LinearGradient
                colors={["rgba(234, 179, 8, 0.08)", "rgba(234, 179, 8, 0.03)"]}
                style={styles.kpiCard}
              >
                <View style={styles.kpiCardHeader}>
                  <MaterialCommunityIcons name="alert-decagram-outline" size={18} color={colors.haldiYellow} />
                  <Text style={styles.kpiTitle}>Pending</Text>
                </View>
                <Text style={[styles.kpiValue, { color: colors.haldiYellow }]} numberOfLines={1}>
                  {kpis.pendingApprovalCount}
                </Text>
              </LinearGradient>
            </View>

            {/* Actions Bar (Export & Toggle Filters) */}
            <View style={styles.actionsBar}>
              <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF} activeOpacity={0.8}>
                <MaterialCommunityIcons name="file-pdf-box" size={18} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Export PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterToggleBtn, showFilters && styles.filterToggleBtnActive]}
                onPress={() => setShowFilters(!showFilters)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="filter-variant"
                  size={18}
                  color={showFilters ? "#FFFFFF" : colors.primaryBrand}
                />
                <Text style={[styles.filterToggleText, showFilters && styles.filterToggleTextActive]}>
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search title, category, or vendor..."
                placeholderTextColor={colors.onSurfaceVariant}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <View style={styles.filtersPanel}>
                <Text style={styles.panelSectionTitle}>Payment Mode</Text>
                <View style={styles.filterChipsRow}>
                  <TouchableOpacity
                    style={[styles.filterChip, !selectedModeFilter && styles.filterChipActive]}
                    onPress={() => setSelectedModeFilter(null)}
                  >
                    <Text style={[styles.filterChipText, !selectedModeFilter && styles.filterChipTextActive]}>All Modes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, selectedModeFilter === "cash" && styles.filterChipActive]}
                    onPress={() => setSelectedModeFilter("cash")}
                  >
                    <Text style={[styles.filterChipText, selectedModeFilter === "cash" && styles.filterChipTextActive]}>Cash</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, selectedModeFilter === "bank_transfer" && styles.filterChipActive]}
                    onPress={() => setSelectedModeFilter("bank_transfer")}
                  >
                    <Text style={[styles.filterChipText, selectedModeFilter === "bank_transfer" && styles.filterChipTextActive]}>Bank</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, selectedModeFilter === "upi" && styles.filterChipActive]}
                    onPress={() => setSelectedModeFilter("upi")}
                  >
                    <Text style={[styles.filterChipText, selectedModeFilter === "upi" && styles.filterChipTextActive]}>UPI</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.panelSectionTitle, { marginTop: 12 }]}>Filter by Month</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[{ name: "All", index: null }, ...months.map((m, i) => ({ name: m, index: i }))]}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.horizontalMonthList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.monthChip, selectedMonthFilter === item.index && styles.monthChipActive]}
                      onPress={() => setSelectedMonthFilter(item.index)}
                    >
                      <Text style={[styles.monthChipText, selectedMonthFilter === item.index && styles.monthChipTextActive]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <Text style={[styles.panelSectionTitle, { marginTop: 12 }]}>Date Range</Text>
                <View style={styles.dateInputsRow}>
                  <TouchableOpacity
                    style={styles.dateInputButton}
                    onPress={() => setShowStartDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateInputButtonText, startDateStr ? styles.dateInputButtonTextActive : null]}>
                      {startDateStr ? startDateStr : "Start Date"}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={16} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  <View style={styles.dateInputDivider}>
                    <Text style={styles.dateInputDividerText}>to</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dateInputButton}
                    onPress={() => setShowEndDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateInputButtonText, endDateStr ? styles.dateInputButtonTextActive : null]}>
                      {endDateStr ? endDateStr : "End Date"}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={16} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.clearFiltersBtn}
                  onPress={() => {
                    setSelectedModeFilter(null);
                    setSelectedMonthFilter(null);
                    setStartDateStr("");
                    setEndDateStr("");
                    setSearchQuery("");
                  }}
                >
                  <Text style={styles.clearFiltersText}>Reset All Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loadingExpenses ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primaryContainer} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💵</Text>
              <Text style={styles.emptyText}>No expenses match the filter criteria.</Text>
            </View>
          )
        }
      />

      <DatePickerModal
        visible={showStartDatePicker}
        value={startDateStr}
        onSelect={(date) => setStartDateStr(date)}
        onClose={() => setShowStartDatePicker(false)}
        title="Select Start Date"
      />

      <DatePickerModal
        visible={showEndDatePicker}
        value={endDateStr}
        onSelect={(date) => setEndDateStr(date)}
        onClose={() => setShowEndDatePicker(false)}
        title="Select End Date"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  appBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  logoText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  addButton: {
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  listScroll: {
    paddingBottom: 110,
    gap: spacing.sm,
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  kpiRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    backgroundColor: "#FFFFFF",
  },
  kpiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  kpiTitle: {
    fontSize: 9,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.tulsiGreen,
    marginTop: 4,
  },
  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  exportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.kumkumRed,
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    gap: 6,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.inter.bold,
  },
  filterToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryBrand,
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: "#FFFFFF",
  },
  filterToggleBtnActive: {
    backgroundColor: colors.primaryBrand,
  },
  filterToggleText: {
    color: colors.primaryBrand,
    fontSize: 13,
    fontFamily: fonts.inter.bold,
  },
  filterToggleTextActive: {
    color: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
    paddingVertical: 8,
  },
  filtersPanel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  panelSectionTitle: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onSurface,
    marginBottom: 4,
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.primaryBrand,
    borderColor: colors.primaryBrand,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  horizontalMonthList: {
    gap: 6,
    paddingVertical: 4,
  },
  monthChip: {
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  monthChipActive: {
    backgroundColor: colors.aartiGold,
    borderColor: colors.aartiGold,
  },
  monthChipText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  monthChipTextActive: {
    color: "#FFFFFF",
  },
  dateInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  dateInputDivider: {
    paddingHorizontal: 4,
  },
  dateInputDividerText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
  },
  dateInputButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.pujaWhite,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
  },
  dateInputButtonText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  dateInputButtonTextActive: {
    color: colors.onSurface,
    fontFamily: fonts.inter.bold,
  },
  clearFiltersBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.kumkumRed,
  },
  cardItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.2,
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoWrapper: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.bold,
  },
  rowCategory: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    marginTop: 1,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
    flex: 0.8,
    gap: 4,
  },
  rowAmount: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  statusText: {
    fontSize: 8,
    fontFamily: fonts.inter.bold,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1.2,
  },
  rowDate: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  bulletDot: {
    color: colors.onSurfaceVariant,
    fontSize: 8,
  },
  vendorTag: {
    backgroundColor: "rgba(140, 80, 0, 0.05)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
    maxWidth: 120,
  },
  vendorTagText: {
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  modeBadgeText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  notesContainer: {
    backgroundColor: colors.pujaWhite,
    padding: 8,
    borderRadius: borderRadius.md,
    marginTop: 4,
  },
  notesText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: colors.primaryBrand,
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  rejectBtnText: {
    color: colors.kumkumRed,
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
  },
  payBtn: {
    backgroundColor: colors.tulsiGreen,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    textAlign: "center",
  },
});

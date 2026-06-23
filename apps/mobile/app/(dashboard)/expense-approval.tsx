import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useExpenses, useApproveExpense, useRejectExpense } from "@utsav/api-client";
import { LinearGradient } from "expo-linear-gradient";

export default function ExpenseApprovalScreen() {
  const { data: expenses = [], isLoading } = useExpenses("pending_approval") as any;
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  // Selected expense details modal state
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);

  // Reject dialog state
  const [rejectingExpense, setRejectingExpense] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate sums
  const totalPendingAmount = useMemo(() => {
    return expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
  }, [expenses]);

  const highPriorityCount = useMemo(() => {
    // Arbitrary metric: expenses > 10,000 are high priority
    return expenses.filter((exp: any) => exp.amount > 10000).length;
  }, [expenses]);

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      Alert.alert("Approved", "Expense approved successfully.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to approve expense");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingExpense) return;
    try {
      await rejectMutation.mutateAsync({
        id: rejectingExpense.id,
        review_note: rejectReason.trim() || "Rejected from mobile app.",
      });
      setRejectingExpense(null);
      setRejectReason("");
      Alert.alert("Rejected", "Expense has been rejected.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to reject expense");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Treasurer approvals</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Financial Overview Card */}
        <LinearGradient
          colors={[colors.primaryContainer, colors.tertiaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overviewCard}
        >
          <View style={styles.overviewLeft}>
            <Text style={styles.overviewLabel}>Financial Overview</Text>
            <Text style={styles.overviewAmount}>{formatRupee(totalPendingAmount)}</Text>
            <Text style={styles.overviewSub}>Total Pending Approvals</Text>
          </View>
          <View style={styles.overviewBadgeRow}>
            <View style={styles.overviewBadge}>
              <MaterialCommunityIcons name="history" size={14} color="#FFFFFF" />
              <Text style={styles.overviewBadgeText}>{expenses.length} In Review</Text>
            </View>
            <View style={styles.overviewBadge}>
              <MaterialCommunityIcons name="alert-decagram-outline" size={14} color="#FFFFFF" />
              <Text style={styles.overviewBadgeText}>{highPriorityCount} High Priority</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Approval</Text>
          <Text style={styles.seeAllText}>See All ({expenses.length})</Text>
        </View>

        {/* Expenses List */}
        {isLoading ? (
          <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginTop: 24 }} />
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color={colors.tulsiGreen} />
            <Text style={styles.emptyText}>All caught up! No pending approvals.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {expenses.map((expense: any) => {
              const isHighPriority = expense.amount > 10000;
              return (
                <View key={expense.id} style={styles.expenseCard}>
                  {/* Top Line Submitter and Priority */}
                  <View style={styles.cardHeader}>
                    <View style={styles.submitterRow}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                          {expense.title.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.cardTitle}>{expense.title}</Text>
                        <Text style={styles.cardSubmitter}>
                          By {expense.submitted_by_name || "Mandal Member"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        isHighPriority ? styles.badgeHigh : styles.badgeNormal,
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          isHighPriority ? styles.textHigh : styles.textNormal,
                        ]}
                      >
                        {isHighPriority ? "High" : "Normal"}
                      </Text>
                    </View>
                  </View>

                  {/* Info Row: Category & Amount */}
                  <View style={styles.amountBox}>
                    <View>
                      <Text style={styles.amountLabel}>AMOUNT</Text>
                      <Text style={styles.amountVal}>{formatRupee(expense.amount)}</Text>
                    </View>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>
                        {expense.category_name || "General"}
                      </Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => setSelectedExpense(expense)}
                    >
                      <Text style={styles.detailBtnText}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApprove(expense.id)}
                      disabled={approveMutation.isPending}
                    >
                      <MaterialCommunityIcons name="check-circle" size={14} color={colors.tulsiGreen} />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => setRejectingExpense(expense)}
                    >
                      <MaterialCommunityIcons name="close-circle" size={14} color={colors.kumkumRed} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Reject Reason input dialog */}
      <Modal visible={rejectingExpense !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Reject Expense</Text>
            <Text style={styles.dialogSub}>
              Please provide a reason for rejecting "{rejectingExpense?.title}".
            </Text>
            <TextInput
              style={styles.dialogInput}
              placeholder="e.g. Missing receipt or incorrect amount"
              placeholderTextColor={colors.outline}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => {
                  setRejectingExpense(null);
                  setRejectReason("");
                }}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogConfirmBtn}
                onPress={handleRejectSubmit}
                disabled={rejectMutation.isPending}
              >
                <Text style={styles.dialogConfirmText}>Reject Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Details View overlay */}
      <Modal visible={selectedExpense !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.detailsModalTitle}>Expense Details</Text>
              <TouchableOpacity onPress={() => setSelectedExpense(null)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            {selectedExpense && (
              <ScrollView style={{ padding: 20 }}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsTitle}>{selectedExpense.title}</Text>
                  <Text style={styles.detailsAmount}>{formatRupee(selectedExpense.amount)}</Text>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Category:</Text>
                    <Text style={styles.detailsVal}>{selectedExpense.category_name || "General"}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Submitted By:</Text>
                    <Text style={styles.detailsVal}>{selectedExpense.submitted_by_name || "Mandal Member"}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Date:</Text>
                    <Text style={styles.detailsVal}>{selectedExpense.expense_date}</Text>
                  </View>
                </View>

                {selectedExpense.description ? (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.detailsLabel}>Notes:</Text>
                    <Text style={styles.detailsDesc}>{selectedExpense.description}</Text>
                  </View>
                ) : null}

                {/* Receipt Preview */}
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.detailsLabel}>Receipt Attachment:</Text>
                  {selectedExpense.receipt_url ? (
                    <Image
                      source={{ uri: selectedExpense.receipt_url }}
                      style={styles.receiptPreviewImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.noReceiptBox}>
                      <MaterialCommunityIcons name="file-hidden" size={24} color={colors.outline} />
                      <Text style={styles.noReceiptText}>No receipt attachment uploaded</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.approveBtnLarge, { marginTop: 32 }]}
                  onPress={() => {
                    handleApprove(selectedExpense.id);
                    setSelectedExpense(null);
                  }}
                >
                  <Text style={styles.approveBtnLargeText}>Approve Expense</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  overviewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: spacing.md,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  overviewLeft: {
    gap: 4,
  },
  overviewLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  overviewAmount: {
    fontSize: 28,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
  overviewSub: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: "rgba(255, 255, 255, 0.8)",
  },
  overviewBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  overviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  overviewBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 10,
  },
  listContainer: {
    gap: spacing.md,
  },
  expenseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 16,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  submitterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  cardSubmitter: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeHigh: {
    backgroundColor: "rgba(219, 43, 43, 0.08)",
    borderColor: "rgba(219, 43, 43, 0.15)",
  },
  badgeNormal: {
    backgroundColor: "rgba(232, 226, 214, 0.4)",
    borderColor: colors.sandstone,
  },
  priorityText: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
  },
  textHigh: {
    color: colors.kumkumRed,
  },
  textNormal: {
    color: colors.outline,
  },
  amountBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    borderRadius: 12,
    padding: 12,
  },
  amountLabel: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
    letterSpacing: 0.5,
  },
  amountVal: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryContainer,
    marginTop: 2,
  },
  categoryTag: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
  },
  detailBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  approveBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.15)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  approveBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
  rejectBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: "rgba(217, 43, 43, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(217, 43, 43, 0.15)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  rejectBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.kumkumRed,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  dialogTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  dialogSub: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    height: 72,
    textAlignVertical: "top",
    fontFamily: fonts.inter.regular,
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  dialogCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dialogCancelText: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.outline,
  },
  dialogConfirmBtn: {
    backgroundColor: colors.kumkumRed,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dialogConfirmText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
  detailsModalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    height: "75%",
    marginTop: "auto",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  detailsModalTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    flex: 1,
    marginRight: 12,
  },
  detailsAmount: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryContainer,
  },
  detailsGrid: {
    backgroundColor: colors.pujaWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 14,
    gap: 10,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  detailsVal: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onSurface,
  },
  detailsDesc: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 18,
  },
  receiptPreviewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginTop: 8,
    backgroundColor: colors.cream,
  },
  noReceiptBox: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  noReceiptText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 6,
  },
  approveBtnLarge: {
    backgroundColor: colors.primaryContainer,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  approveBtnLargeText: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
});

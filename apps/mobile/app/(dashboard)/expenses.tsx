import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from "react-native";
import { useAuthStore } from "@utsav/stores";
import {
  useExpenses,
  useExpenseCategories,
  useCreateExpense,
  useApproveExpense,
  useRejectExpense,
  usePayExpense,
} from "@utsav/api-client";
import { router } from "expo-router";

export default function MobileExpensesScreen() {
  const { role } = useAuthStore();
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses() as any;
  const { data: categories = [] } = useExpenseCategories();

  const createMutation = useCreateExpense();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const payMutation = usePayExpense();

  // Dialog & Submission States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "bank_transfer" | "upi" | "cheque">("cash");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const hasAdminAccess = ["owner", "admin", "treasurer"].includes(role || "");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!title) return setErrorMsg("Title is required");
    if (!amount || parseFloat(amount) <= 0) return setErrorMsg("Enter a positive amount");

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        title,
        amount: parseFloat(amount),
        category_id: categoryId || undefined,
        description: description || undefined,
        payment_mode: paymentMode,
        expense_date: expenseDate,
        receipt_url: receiptUrl || undefined,
        gst_amount: 0,
      });

      // Reset
      setTitle("");
      setAmount("");
      setCategoryId("");
      setDescription("");
      setReceiptUrl("");
      setShowSubmitModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id, review_note: "Rejected from mobile app." });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await payMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  };

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusPillColors = (status: string) => {
    switch (status) {
      case "approved":
        return { bg: "#EFF6FF", text: "#1D4ED8", border: "#DBEAFE" };
      case "rejected":
        return { bg: "#FEF2F2", text: "#B91C1C", border: "#FEE2E2" };
      case "paid":
        return { bg: "#ECFDF5", text: "#047857", border: "#D1FAE5" };
      default:
        return { bg: "#FEF3C7", text: "#D97706", border: "#FEF3C7" };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mandal Expenses</Text>
          <Text style={styles.headerSub}>Verify receipts & pay cash vouchers</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowSubmitModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loadingExpenses ? (
          <ActivityIndicator color="#FF9500" size="large" style={{ marginTop: 40 }} />
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💵</Text>
            <Text style={styles.emptyText}>No expenses logged yet.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {expenses.map((expense: any) => {
              const colors = statusPillColors(expense.status);
              return (
                <View key={expense.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardTitle}>{expense.title}</Text>
                      <View style={[styles.statusPill, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                        <Text style={[styles.statusText, { color: colors.text }]}>{expense.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardAmount}>{formatRupee(expense.amount)}</Text>
                  </View>

                  <View style={styles.cardDetails}>
                    <Text style={styles.detailText}>📅 Date: {expense.expense_date}</Text>
                    {expense.description && (
                      <Text style={styles.detailText}>📝 Note: {expense.description}</Text>
                    )}
                  </View>

                  {/* Inline Treasurer Approval Workflow */}
                  {hasAdminAccess && expense.status === "pending_approval" && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleApprove(expense.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleReject(expense.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Inline Record payment workflow */}
                  {hasAdminAccess && expense.status === "approved" && (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => handlePay(expense.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.payBtnText}>Record Cash Disbursement</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* NEW EXPENSE MODAL */}
      <Modal visible={showSubmitModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Expense Voucher</Text>
              <TouchableOpacity onPress={() => setShowSubmitModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Flower decorations"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount (INR) *</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="e.g. 5000"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Expense Category</Text>
                <View style={styles.categoryPicker}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catChip, categoryId === cat.id && styles.catChipActive]}
                      onPress={() => setCategoryId(cat.id)}
                    >
                      <Text style={[styles.catChipText, categoryId === cat.id && styles.catChipTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Items or vendor details..."
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity style={styles.submitBtnLarge} onPress={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnLargeText}>Submit For Verification</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#FF9500",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardMeta: {
    gap: 6,
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "System",
  },
  cardDetails: {
    gap: 4,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
  },
  detailText: {
    fontSize: 12,
    color: "#4B5563",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: "#FF9500",
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rejectBtnText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "bold",
  },
  payBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FAF9F6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeIcon: {
    fontSize: 18,
    color: "#6B7280",
  },
  modalForm: {
    padding: 20,
    gap: 16,
  },
  errorText: {
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  catChipActive: {
    borderColor: "#FF9500",
    backgroundColor: "#FFFBEB",
  },
  catChipText: {
    fontSize: 12,
    color: "#4B5563",
  },
  catChipTextActive: {
    color: "#FF9500",
    fontWeight: "bold",
  },
  submitBtnLarge: {
    backgroundColor: "#FF9500",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnLargeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

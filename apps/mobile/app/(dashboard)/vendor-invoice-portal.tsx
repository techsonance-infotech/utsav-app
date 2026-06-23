import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useFetchVendorInvoices, useCreateVendorInvoice, useFetchPurchaseOrders } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function VendorInvoicePortalScreen() {
  const { data: invoices, isLoading } = useFetchVendorInvoices();
  const { data: pos } = useFetchPurchaseOrders();
  const createInvoice = useCreateVendorInvoice();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [dueDate, setDueDate] = useState("2024-10-15");
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const samplePOs = [
    {
      id: "po1",
      po_number: "PO-2024-081",
      title: "Floral Decorations",
      total_amount: 45000,
      expected_delivery_date: "2024-09-22",
      payment_terms: "30% ADVANCE PAID",
    },
    {
      id: "po2",
      po_number: "PO-2024-094",
      title: "Catering (Day 1-3)",
      total_amount: 180000,
      expected_delivery_date: "2024-09-28",
      payment_terms: "NEW CONTRACT",
    },
  ];

  const sampleInvoices = [
    {
      id: "inv1",
      invoice_number: "INV-4420",
      title: "Sound System Hire",
      amount: 22000,
      status: "paid",
      created_at: "2024-09-15",
    },
    {
      id: "inv2",
      invoice_number: "INV-4458",
      title: "Security Services",
      amount: 95500,
      status: "pending",
      created_at: "2024-09-18",
    },
    {
      id: "inv3",
      invoice_number: "INV-4462",
      title: "Lighting Setup",
      amount: 47000,
      status: "approved",
      created_at: "2024-09-19",
    },
  ];

  const displayedPOs = pos || samplePOs;
  const displayedInvoices = invoices || sampleInvoices;

  const handleSubmitInvoice = () => {
    if (!invoiceNumber.trim() || !invoiceAmount.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    createInvoice.mutate(
      {
        vendor_id: "v1", // Simulated vendor context
        purchase_order_id: selectedPoId || undefined,
        invoice_number: invoiceNumber,
        amount: Number(invoiceAmount) || 0,
        due_date: dueDate,
        notes: invoiceNotes,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Invoice submitted successfully!");
          setModalVisible(false);
          setInvoiceNumber("");
          setInvoiceAmount("");
          setInvoiceNotes("");
        },
        onError: (err) => {
          Alert.alert("Error", err.message || "Failed to submit invoice.");
        },
      }
    );
  };

  const getStatusDetails = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return { label: "PAID", bg: "rgba(34, 197, 94, 0.1)", color: colors.tulsiGreen };
      case "pending":
      case "submitted":
        return { label: "SUBMITTED", bg: "rgba(234, 179, 8, 0.1)", color: colors.haldiYellow };
      case "approved":
        return { label: "APPROVED", bg: "rgba(255, 149, 0, 0.1)", color: colors.primaryBrand };
      default:
        return { label: "REJECTED", bg: "rgba(217, 43, 43, 0.1)", color: colors.kumkumRed };
    }
  };

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
          <Text style={styles.headerTitle}>Vendor Invoices</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons
            name="file-upload-outline"
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
        {/* KPI Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Payments Pending</Text>
            <Text style={styles.statsValue}>₹1,42,500</Text>
            <View style={styles.statsBottomRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color={colors.haldiYellow} />
              <Text style={[styles.statsSubtext, { color: colors.haldiYellow }]}>
                3 Invoices awaiting approval
              </Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Total Earned (Festival)</Text>
            <Text style={[styles.statsValue, { color: colors.tulsiGreen }]}>₹12,85,000</Text>
            <View style={styles.statsBottomRow}>
              <MaterialCommunityIcons name="trending-up" size={14} color={colors.tulsiGreen} />
              <Text style={[styles.statsSubtext, { color: colors.tulsiGreen }]}>
                +14% from last year
              </Text>
            </View>
          </View>
        </View>

        {/* Messaging Quick Card */}
        <View style={styles.messagingCard}>
          <View>
            <Text style={styles.msgLabel}>Active Support</Text>
            <Text style={styles.msgTitle}>Direct Line to Treasurer</Text>
          </View>
          <TouchableOpacity style={styles.msgBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="message-outline" size={16} color={colors.primaryBrand} />
            <Text style={styles.msgBtnText}>Message Mandal</Text>
          </TouchableOpacity>
        </View>

        {/* Active POs */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active POs</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>2 NEW</Text>
            </View>
          </View>

          <View style={styles.posList}>
            {displayedPOs.map((po: any) => (
              <View key={po.id} style={styles.poCard}>
                <View style={styles.poCardHeader}>
                  <View>
                    <Text style={styles.poNumber}>#{po.po_number}</Text>
                    <Text style={styles.poTitle}>{po.title}</Text>
                  </View>
                  <Text style={styles.poAmount}>₹{po.total_amount.toLocaleString("en-IN")}</Text>
                </View>

                <View style={styles.poCardMeta}>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="calendar" size={14} color={colors.onSurfaceVariant} />
                    <Text style={styles.metaText}>Deadline: {po.expected_delivery_date}</Text>
                  </View>
                  <Text style={styles.poTerms}>{po.payment_terms || "PENDING TERMS"}</Text>
                </View>

                <TouchableOpacity
                  style={styles.submitInvoiceBtn}
                  onPress={() => {
                    setSelectedPoId(po.id);
                    setInvoiceAmount(po.total_amount.toString());
                    setModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="upload" size={16} color={colors.onPrimaryContainer} />
                  <Text style={styles.submitInvoiceText}>Submit Invoice</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Invoice History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice History</Text>
          <View style={styles.invoiceList}>
            {displayedInvoices.map((inv: any) => {
              const statusDetails = getStatusDetails(inv.status);
              return (
                <View key={inv.id} style={styles.invoiceRow}>
                  <View style={styles.invoiceRowHeader}>
                    <View>
                      <Text style={styles.invoiceNumText}>{inv.invoice_number} - {inv.title || "Services"}</Text>
                      <Text style={styles.invoiceDateText}>Submitted on {inv.created_at}</Text>
                    </View>
                    <Text style={styles.invoiceAmountText}>₹{inv.amount.toLocaleString("en-IN")}</Text>
                  </View>

                  <View style={styles.invoiceRowFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusDetails.color }]}>
                        {statusDetails.label}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.downloadReceiptBtn} activeOpacity={0.7}>
                      <Text style={styles.downloadReceiptText}>Download Receipt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Submit Invoice Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Invoice</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} keyboardShouldPersistTaps="handled">
              {/* Drag Box Simulator */}
              <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={40} color={colors.outline} />
                <Text style={styles.uploadTitle}>Upload PDF or Image of Bill</Text>
                <Text style={styles.uploadSubtitle}>Supported formats: JPG, PNG, PDF (Max 10MB)</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Invoice Number</Text>
                <TextInput
                  style={styles.modalInput}
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                  placeholder="e.g. INV-4458"
                  placeholderTextColor={colors.outline}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount (₹)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={invoiceAmount}
                  onChangeText={setInvoiceAmount}
                  placeholder="Enter amount..."
                  placeholderTextColor={colors.outline}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={invoiceNotes}
                  onChangeText={setInvoiceNotes}
                  placeholder="Payment details, bank details, etc."
                  placeholderTextColor={colors.outline}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitInvoice}
                activeOpacity={0.8}
                disabled={createInvoice.isPending}
              >
                {createInvoice.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Send to Treasurer</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    color: colors.primaryBrand,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: 20 },

  statsGrid: { flexDirection: "row", gap: 12 },
  statsCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  statsLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  statsValue: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.primaryBrand,
  },
  statsBottomRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  statsSubtext: {
    fontFamily: fonts.inter.medium,
    fontSize: 10,
  },

  messagingCard: {
    backgroundColor: colors.primaryBrand,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  msgLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.75)",
    textTransform: "uppercase",
  },
  msgTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  msgBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  msgBtnText: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.primaryBrand,
  },

  section: { gap: 12 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.onSurface,
  },
  newBadge: {
    backgroundColor: "rgba(140, 80, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.primaryBrand,
  },

  posList: { gap: 12 },
  poCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  poCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  poNumber: {
    fontFamily: fonts.inter.semibold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  poTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: colors.onSurface,
    marginTop: 2,
  },
  poAmount: {
    fontFamily: fonts.inter.bold,
    fontSize: 15,
    color: colors.primaryBrand,
  },
  poCardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    padding: 10,
    borderRadius: 8,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  poTerms: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
  },
  submitInvoiceBtn: {
    height: 48,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  submitInvoiceText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: colors.onPrimaryContainer,
  },

  invoiceList: { gap: 12 },
  invoiceRow: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  invoiceRowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  invoiceNumText: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  invoiceDateText: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  invoiceAmountText: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.onSurface,
  },
  invoiceRowFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
  },
  downloadReceiptBtn: {
    paddingVertical: 4,
  },
  downloadReceiptText: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.primaryBrand,
  },

  // Modal Styles
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.charcoal,
  },
  modalForm: { gap: 16, paddingBottom: 40 },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
  },
  uploadTitle: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  uploadSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurface,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  submitBtn: {
    height: 52,
    backgroundColor: colors.primaryBrand,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  inputGroup: { gap: 6 },
  label: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    paddingLeft: 4,
  },
});

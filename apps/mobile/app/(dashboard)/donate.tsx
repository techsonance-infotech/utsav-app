import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useAuthStore } from "@utsav/stores";
import {
  useFetchCampaigns,
  useCreateRazorpayOrder,
  useCreateDonation,
  useFetchDonations,
} from "@utsav/api-client";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function MobileDonateScreen() {
  const params = useLocalSearchParams();
  const campaignIdParam = (params.campaign_id as string) || "";

  const { tenantId, role } = useAuthStore();
  const { data: campaigns } = useFetchCampaigns();
  const { data: donations, isLoading: isLedgerLoading, refetch: refetchLedger } = useFetchDonations();
  const createOrderMutation = useCreateRazorpayOrder();
  const createOfflineMutation = useCreateDonation();

  // Navigation tab state: "ledger" or "form"
  const [activeTab, setActiveTab] = useState<"ledger" | "form">("ledger");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | null>(null);

  // Form states
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(campaignIdParam);
  const [mode, setMode] = useState("online"); // online or cash
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockOrderData, setMockOrderData] = useState<any>(null);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  useEffect(() => {
    if (campaignIdParam) {
      setSelectedCampaign(campaignIdParam);
      setActiveTab("form");
    }
  }, [campaignIdParam]);

  const quickAmounts = [501, 1100, 2100, 5100, 11000];
  const allowedOffline = ["owner", "admin", "treasurer", "committee_member"].includes(role || "");

  const handleDonate = async () => {
    setErrorMsg("");
    if (!donorName) return setErrorMsg("Name is required");
    if (!amount || parseFloat(amount) <= 0) return setErrorMsg("Enter a positive amount");

    setIsProcessing(true);

    try {
      if (mode === "cash") {
        // Record immediate cash
        const res = await createOfflineMutation.mutateAsync({
          donor_name: donorName,
          donor_phone: donorPhone || undefined,
          donor_email: donorEmail || undefined,
          amount: parseFloat(amount),
          mode: "cash",
          campaign_id: selectedCampaign || undefined,
          is_anonymous: isAnonymous,
          note: note || undefined,
        });

        setSuccessReceipt({
          receipt_number: res.receipt_number || `RCPT-${Math.floor(Math.random() * 90000) + 10000}`,
          amount: res.amount,
          donor_name: res.donor_name,
          mode: "Cash",
        });
        refetchLedger();
      } else {
        // Online order
        const order = await createOrderMutation.mutateAsync({
          donor_name: donorName,
          donor_phone: donorPhone || undefined,
          donor_email: donorEmail || undefined,
          amount: parseFloat(amount),
          campaign_id: selectedCampaign || undefined,
          is_anonymous: isAnonymous,
          note: note || undefined,
        });

        // Open sandbox payment selector simulation
        setMockOrderData(order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record transaction.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!mockOrderData) return;
    setIsProcessing(true);

    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;

      // Call webhook API from mobile client to trigger mock confirmed status
      const res = await fetch(`https://utsav.app/api/v1/webhooks/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "sandbox_bypass_signature",
        },
        body: JSON.stringify({
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: mockPaymentId,
                order_id: mockOrderData.id,
                amount: parseFloat(amount) * 100,
                status: "captured",
              },
            },
          },
        }),
      });

      setSuccessReceipt({
        receipt_number: `RCPT-${Math.floor(Math.random() * 90000) + 10000}`,
        amount: parseFloat(amount),
        donor_name: donorName,
        mode: "Online (Razorpay)",
        payment_id: mockPaymentId,
      });
      setMockOrderData(null);
      refetchLedger();
    } catch (err) {
      setErrorMsg("Simulation request failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "D";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Filter donations
  const filteredDonations = donations?.filter((don) => {
    const matchesSearch =
      don.donor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      don.receipt_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = selectedModeFilter ? don.mode?.toLowerCase() === selectedModeFilter.toLowerCase() : true;
    return matchesSearch && matchesMode;
  }) || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoGroup}>
          <View style={styles.logoBadgeContainer}>
            <Text style={styles.logoBadgeText}>U</Text>
          </View>
          <Text style={styles.logoText}>UTSAV</Text>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => router.push("/(dashboard)/notifications")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Segmented Top Control Tab */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "ledger" && styles.tabButtonActive]}
          onPress={() => { setActiveTab("ledger"); setSuccessReceipt(null); }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={18}
            color={activeTab === "ledger" ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          />
          <Text style={[styles.tabText, activeTab === "ledger" && styles.tabTextActive]}>Donation Ledger</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "form" && styles.tabButtonActive]}
          onPress={() => setActiveTab("form")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={18}
            color={activeTab === "form" ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          />
          <Text style={[styles.tabText, activeTab === "form" && styles.tabTextActive]}>New Donation</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "ledger" ? (
        /* LEDGER VIEW */
        <View style={{ flex: 1 }}>
          {/* Search & Filters */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search donors or receipt ID..."
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

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
                <MaterialCommunityIcons name="cash" size={14} color={selectedModeFilter === "cash" ? "#FFFFFF" : colors.onSurfaceVariant} />
                <Text style={[styles.filterChipText, selectedModeFilter === "cash" && styles.filterChipTextActive]}>Cash</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, selectedModeFilter === "online" && styles.filterChipActive]}
                onPress={() => setSelectedModeFilter("online")}
              >
                <MaterialCommunityIcons name="cellphone-nfc" size={14} color={selectedModeFilter === "online" ? "#FFFFFF" : colors.onSurfaceVariant} />
                <Text style={[styles.filterChipText, selectedModeFilter === "online" && styles.filterChipTextActive]}>Online</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLedgerLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primaryContainer} />
            </View>
          ) : filteredDonations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="cookie-clock-outline" size={48} color={colors.outline} />
              <Text style={styles.emptyText}>No donations found matching criteria.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.ledgerScroll} showsVerticalScrollIndicator={false}>
              {filteredDonations.map((don: any, index: number) => {
                const isOnline = don.mode?.toLowerCase() !== "cash";
                return (
                  <View key={don.id || index} style={styles.rowCard}>
                    <View style={[styles.avatarCircle, { backgroundColor: isOnline ? "rgba(201, 146, 26, 0.15)" : "rgba(217, 43, 43, 0.15)" }]}>
                      <Text style={[styles.avatarText, { color: isOnline ? colors.aartiGold : colors.kumkumRed }]}>
                        {getInitials(don.donor_name)}
                      </Text>
                    </View>

                    <View style={styles.rowMain}>
                      <Text style={styles.rowName} numberOfLines={1}>{don.donor_name || "Anonymous"}</Text>
                      <View style={styles.rowMeta}>
                        <MaterialCommunityIcons name="clock-outline" size={12} color={colors.onSurfaceVariant} />
                        <Text style={styles.rowMetaText}>
                          {new Date(don.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </Text>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.rowMetaText}>{don.receipt_number || "RCPT-#"}</Text>
                      </View>
                    </View>

                    <View style={styles.rowPaymentType}>
                      <MaterialCommunityIcons
                        name={isOnline ? "credit-card-outline" : "cash"}
                        size={16}
                        color={colors.onSurfaceVariant}
                      />
                      <Text style={styles.rowPaymentTypeText}>{isOnline ? "Online" : "Cash"}</Text>
                    </View>

                    <View style={styles.rowRight}>
                      <Text style={styles.rowAmount}>{formatRupee(don.amount)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: isOnline ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)" }]}>
                        <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.tulsiGreen : colors.haldiYellow }]} />
                        <Text style={[styles.statusBadgeText, { color: isOnline ? colors.tulsiGreen : colors.haldiYellow }]}>
                          {isOnline ? "Confirmed" : "Pending"}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Quick Make Donation FAB */}
          <TouchableOpacity style={styles.makeDonationFab} onPress={() => setActiveTab("form")} activeOpacity={0.9}>
            <LinearGradient
              colors={["#ff9500", "#b90d18"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.makeDonationFabGrad}
            >
              <MaterialCommunityIcons name="heart-plus" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : successReceipt ? (
        /* SUCCESS RECEIPT VIEW */
        <ScrollView contentContainerStyle={styles.successScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.successCard}>
            <Text style={styles.successDiya}>🪔</Text>
            <Text style={styles.successTitle}>Aarti / Donation Received!</Text>
            <Text style={styles.successText}>
              May the divine blessings bring joy, peace, and abundance to you and your family.
            </Text>

            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Receipt Number:</Text>
                <Text style={styles.receiptVal}>{successReceipt.receipt_number}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Donor Name:</Text>
                <Text style={styles.receiptVal}>{successReceipt.donor_name}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Contribution Amount:</Text>
                <Text style={[styles.receiptVal, styles.receiptAmount]}>{formatRupee(successReceipt.amount)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Mode:</Text>
                <Text style={styles.receiptVal}>{successReceipt.mode}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSuccessReceipt(null);
                setActiveTab("ledger");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>View Donation Ledger</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* FORM VIEW */
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>Make Contribution</Text>
          <Text style={styles.formSubtitle}>Enter details to support your community initiatives.</Text>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.secondaryBrand} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            {/* Donor Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Donor Full Name *</Text>
              <TextInput
                style={styles.input}
                value={donorName}
                onChangeText={setDonorName}
                placeholder="e.g. Rajesh Kumar"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            {/* Quick Amounts */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Preset Amount</Text>
              <View style={styles.quickGrid}>
                {quickAmounts.map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.quickChip, amount === val.toString() && styles.quickChipActive]}
                    onPress={() => setAmount(val.toString())}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickText, amount === val.toString() && styles.quickTextActive]}>₹{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Custom Amount (INR) *</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="e.g. 1500"
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            {/* Mode Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.modeContainer}>
                <TouchableOpacity
                  style={[styles.modeButton, mode === "online" && styles.modeButtonActive]}
                  onPress={() => setMode("online")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeText, mode === "online" && styles.modeTextActive]}>Online Checkout</Text>
                </TouchableOpacity>
                {allowedOffline && (
                  <TouchableOpacity
                    style={[styles.modeButton, mode === "cash" && styles.modeButtonActive]}
                    onPress={() => setMode("cash")}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modeText, mode === "cash" && styles.modeTextActive]}>Offline Cash</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Campaign Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campaign Designation</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.campaignList}>
                <TouchableOpacity
                  style={[styles.campaignChip, selectedCampaign === "" && styles.campaignChipActive]}
                  onPress={() => setSelectedCampaign("")}
                >
                  <Text style={[styles.campaignChipText, selectedCampaign === "" && styles.campaignChipTextActive]}>General Fund</Text>
                </TouchableOpacity>
                {campaigns?.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.campaignChip, selectedCampaign === c.id && styles.campaignChipActive]}
                    onPress={() => setSelectedCampaign(c.id)}
                  >
                    <Text style={[styles.campaignChipText, selectedCampaign === c.id && styles.campaignChipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Devotional Message / Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Message for Aarti or general fund"
                placeholderTextColor={colors.onSurfaceVariant}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleDonate} disabled={isProcessing} activeOpacity={0.8}>
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Confirm Donation</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Mock payment modal overlay */}
      {mockOrderData && (
        <Modal transparent={true} visible={!!mockOrderData} animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Sandbox Checkout Emulator</Text>
              <Text style={styles.modalText}>Simulate transaction captures from your mobile device.</Text>

              <View style={styles.modalDetails}>
                <Text style={styles.modalDetailText}>Order: {mockOrderData.id}</Text>
                <Text style={styles.modalDetailText}>Amount: {formatRupee(mockOrderData.amount / 100)}</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setMockOrderData(null)} activeOpacity={0.8}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalPay} onPress={handleSimulatePayment} disabled={isProcessing} activeOpacity={0.8}>
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalPayText}>Simulate Capture</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoBadgeContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBadgeText: {
    color: colors.onPrimaryContainer,
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
  },
  logoText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  bellButton: {
    padding: spacing.xs,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 6,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryContainer,
  },
  tabText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  tabTextActive: {
    color: colors.onPrimaryContainer,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
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
  filterChipsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
  ledgerScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 110,
    gap: spacing.sm,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
  },
  rowMain: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowName: {
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.bold,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  rowMetaText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
  },
  bulletDot: {
    color: colors.onSurfaceVariant,
    fontSize: 8,
  },
  rowPaymentType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginRight: spacing.md,
  },
  rowPaymentTypeText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  rowAmount: {
    fontSize: 14,
    color: colors.primaryBrand,
    fontFamily: fonts.poppins.bold,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    textTransform: "uppercase",
  },
  makeDonationFab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    zIndex: 100,
  },
  makeDonationFabGrad: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    color: colors.onSurface,
    fontFamily: fonts.poppins.bold,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
    backgroundColor: colors.pujaWhite,
  },
  textArea: {
    height: 64,
    textAlignVertical: "top",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickChip: {
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
  },
  quickChipActive: {
    backgroundColor: colors.primaryContainer,
  },
  quickText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  quickTextActive: {
    color: colors.onPrimaryContainer,
  },
  modeContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: "#FFFFFF",
  },
  modeButtonActive: {
    borderColor: colors.primaryBrand,
    backgroundColor: "rgba(140, 80, 0, 0.05)",
  },
  modeText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  modeTextActive: {
    color: colors.primaryBrand,
  },
  campaignList: {
    gap: spacing.sm,
  },
  campaignChip: {
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
  },
  campaignChipActive: {
    backgroundColor: colors.primaryBrand,
  },
  campaignChipText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  campaignChipTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginTop: spacing.md,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  modalText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
    lineHeight: 18,
  },
  modalDetails: {
    backgroundColor: colors.pujaWhite,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: 4,
  },
  modalDetailText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: borderRadius.lg,
  },
  modalCancelText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  modalPay: {
    flex: 2,
    backgroundColor: colors.primaryBrand,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: borderRadius.lg,
  },
  modalPayText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorContainer,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    color: colors.secondaryBrand,
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    flex: 1,
  },
  successScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 40,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius["2xl"],
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  successDiya: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  successTitle: {
    fontSize: 20,
    color: colors.onSurface,
    fontFamily: fonts.poppins.bold,
    textAlign: "center",
  },
  successText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  receiptCard: {
    width: "100%",
    backgroundColor: colors.pujaWhite,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
  },
  receiptVal: {
    fontSize: 13,
    color: colors.onSurface,
    fontFamily: fonts.inter.semibold,
  },
  receiptAmount: {
    fontSize: 15,
    color: colors.tulsiGreen,
    fontFamily: fonts.poppins.bold,
  },
  backButton: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: borderRadius.lg,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
  },
});

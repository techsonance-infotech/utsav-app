import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import { useAuthStore } from "@utsav/stores";
import { useFetchCampaigns, useCreateRazorpayOrder, useCreateDonation } from "@utsav/api-client";
import { useLocalSearchParams, router } from "expo-router";

export default function MobileDonateScreen() {
  const params = useLocalSearchParams();
  const campaignIdParam = (params.campaign_id as string) || "";

  const { tenantId, role } = useAuthStore();
  const { data: campaigns } = useFetchCampaigns();
  const createOrderMutation = useCreateRazorpayOrder();
  const createOfflineMutation = useCreateDonation();

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

  return (
    <SafeAreaView style={styles.container}>
      {successReceipt ? (
        /* SUCCESS VIEW */
        <View style={styles.successContainer}>
          <Text style={styles.successDiya}>🪔</Text>
          <Text style={styles.successTitle}>Aarti / Donation Received!</Text>
          <Text style={styles.successText}>May the divine blessings bring joy, peace, and abundance to you and your family.</Text>

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

          <TouchableOpacity style={styles.backButton} onPress={() => { setSuccessReceipt(null); router.push("/(dashboard)/home"); }} activeOpacity={0.8}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* FORM VIEW */
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Make Contribution</Text>
          <Text style={styles.subtitle}>Enter details to support your community initiatives.</Text>

          {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

          <View style={styles.formCard}>
            {/* Donor Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Donor Full Name *</Text>
              <TextInput
                style={styles.input}
                value={donorName}
                onChangeText={setDonorName}
                placeholder="e.g. Rajesh Kumar"
                placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Mode Selector (Role Restricted for Cash) */}
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
              <View style={styles.selectWrapper}>
                <Text style={styles.selectText}>
                  {selectedCampaign
                    ? campaigns?.find((c) => c.id === selectedCampaign)?.name || "Selected Campaign"
                    : "General Fund"}
                </Text>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Devotional Message / Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Message for Aarti or general fund"
                placeholderTextColor="#9CA3AF"
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
              <TouchableOpacity style={styles.modalConfirm} onPress={handleSimulatePayment} activeOpacity={0.8}>
                <Text style={styles.modalConfirmText}>Simulate Success</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 20,
  },
  errorText: {
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickChip: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickChipActive: {
    backgroundColor: "#FF9500",
    borderColor: "#FF9500",
  },
  quickText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4B5563",
  },
  quickTextActive: {
    color: "#FFFFFF",
  },
  modeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  modeButtonActive: {
    borderColor: "#FF9500",
    backgroundColor: "#FFFBEB",
  },
  modeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  modeTextActive: {
    color: "#FF9500",
  },
  selectWrapper: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  selectText: {
    fontSize: 14,
    color: "#1F2937",
  },
  submitButton: {
    backgroundColor: "#FF9500",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successDiya: {
    fontSize: 72,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  successText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  receiptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    width: "100%",
    gap: 12,
    marginBottom: 30,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  receiptAmount: {
    color: "#FF9500",
    fontWeight: "bold",
    fontSize: 14,
  },
  backButton: {
    backgroundColor: "#1F2937",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    gap: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
  modalDetails: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    width: "100%",
    gap: 4,
  },
  modalDetailText: {
    fontSize: 10,
    color: "#4B5563",
    fontFamily: "System",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "bold",
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: "#FF9500",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

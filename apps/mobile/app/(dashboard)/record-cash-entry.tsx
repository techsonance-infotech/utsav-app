import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCreateDonation, useFetchCampaigns } from "@utsav/api-client";

export default function RecordCashEntryScreen() {
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("general");
  const [receiptRef, setReceiptRef] = useState("");
  const [notes, setNotes] = useState("");

  const { data: campaigns } = useFetchCampaigns();
  const createDonationMutation = useCreateDonation();

  const handleConfirm = async () => {
    if (!amount || !donorName) return;

    try {
      await createDonationMutation.mutateAsync({
        donor_name: donorName,
        donor_phone: mobile ? `+91${mobile}` : undefined,
        amount: parseFloat(amount),
        mode: "cash",
        campaign_id: selectedCampaign === "general" ? undefined : selectedCampaign,
        note: notes || undefined,
      });

      alert("Donation Recorded Successfully! Opening digital receipt preview...");
      router.back();
    } catch (err) {
      alert("Error recording donation. Please check details and try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="menu" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Record Cash Donation</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Transaction Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.bannerLeft}>
            <View style={styles.paymentModeIcon}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color={colors.primaryContainer} />
            </View>
            <View>
              <Text style={styles.bannerLabel}>Payment Mode</Text>
              <Text style={styles.bannerValue}>CASH PAYMENT</Text>
            </View>
          </View>
          <View style={styles.fixedBadge}>
            <Text style={styles.fixedBadgeText}>Fixed</Text>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Amount (Rupees) <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.requiredHint}>Required</Text>
          </View>
          <View style={styles.amountInputWrap}>
            <Text style={styles.rupeePrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.outline}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* Donor Details Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-outline" size={22} color={colors.aartiGold} />
            <Text style={styles.cardTitle}>Donor Information</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Rajesh Kumar"
              placeholderTextColor={colors.outline}
              value={donorName}
              onChangeText={setDonorName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mobile Number (Optional)</Text>
            <View style={styles.phoneInputWrap}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="98765 43210"
                placeholderTextColor={colors.outline}
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
              />
            </View>
          </View>
        </View>

        {/* Allocation & Admin Details */}
        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Campaign Selector</Text>
            <View style={styles.dropdownWrap}>
              <Text style={styles.dropdownSelected}>
                {selectedCampaign === "general"
                  ? "General Fund"
                  : campaigns?.find((c) => c.id === selectedCampaign)?.name ?? "General Fund"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.outline} />
            </View>
            {/* Quick campaign selectors below */}
            <View style={styles.campaignList}>
              <TouchableOpacity
                style={[
                  styles.campaignChip,
                  selectedCampaign === "general" && styles.campaignChipActive,
                ]}
                onPress={() => setSelectedCampaign("general")}
              >
                <Text style={styles.campaignChipText}>General Fund</Text>
              </TouchableOpacity>
              {campaigns?.slice(0, 3).map((campaign) => (
                <TouchableOpacity
                  key={campaign.id}
                  style={[
                    styles.campaignChip,
                    selectedCampaign === campaign.id && styles.campaignChipActive,
                  ]}
                  onPress={() => setSelectedCampaign(campaign.id)}
                >
                  <Text style={styles.campaignChipText}>{campaign.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Receipt Book Reference (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Book A / Page 42"
              placeholderTextColor={colors.outline}
              value={receiptRef}
              onChangeText={setReceiptRef}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Additional details or specific puja request..."
              placeholderTextColor={colors.outline}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        {/* Action Button Area */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.confirmBtn}
            activeOpacity={0.85}
            onPress={handleConfirm}
            disabled={createDonationMutation.isPending || !amount || !donorName}
          >
            {createDonationMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.onPrimaryContainer} />
            ) : (
              <>
                <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={colors.onPrimaryContainer} />
                <Text style={styles.confirmBtnText}>Confirm & Issue Receipt</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.disclaimerText}>
            A digital receipt will be sent via SMS if mobile is provided.
          </Text>
        </View>
      </ScrollView>

      {/* Decorative Background Glows */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "rgba(250, 250, 248, 0.9)",
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
  appBarTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 64,
  },
  statusBanner: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  paymentModeIcon: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    padding: spacing.sm,
    borderRadius: 8,
  },
  bannerLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  bannerValue: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  fixedBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  fixedBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
    textTransform: "uppercase",
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  required: {
    color: colors.kumkumRed,
  },
  requiredHint: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  amountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
  },
  rupeePrefix: {
    fontSize: 24,
    fontFamily: fonts.inter.regular,
    color: colors.outline,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: fonts.inter.regular,
    color: colors.primaryBrand,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
  },
  formCard: {
    backgroundColor: "rgba(244, 241, 235, 0.5)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  phoneInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
  },
  phonePrefix: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
  },
  formSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dropdownWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownSelected: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  campaignList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  campaignChip: {
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  campaignChipActive: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderColor: colors.primaryContainer,
  },
  campaignChipText: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  actionSection: {
    gap: spacing.sm,
  },
  confirmBtn: {
    height: 56,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    textAlign: "center",
  },
  glowTopRight: {
    position: "absolute",
    top: 64,
    right: -32,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 149, 0, 0.04)",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: 32,
    left: -32,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(201, 146, 26, 0.04)",
  },
});

import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCreateDonation, useFetchCampaigns, useFetchMyProfile, useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

export default function RecordCashEntryScreen() {
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("general");
  const [receiptRef, setReceiptRef] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"confirmed" | "pending">("confirmed");

  const { tenantId, userFullName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: myProfile } = useFetchMyProfile();

  const { data: campaigns } = useFetchCampaigns();
  const createDonationMutation = useCreateDonation();

  const handleConfirm = async () => {
    if (!amount) {
      Alert.alert("Error", "Please enter a donation amount.");
      return;
    }
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      Alert.alert("Error", "Please enter a valid donation amount.");
      return;
    }
    if (!donorName.trim()) {
      Alert.alert("Error", "Please enter the donor name.");
      return;
    }
    let formattedPhone: string | undefined = undefined;
    if (mobile) {
      const cleaned = mobile.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        Alert.alert("Error", "Please enter a valid 10-digit mobile number.");
        return;
      }
      formattedPhone = cleaned;
    }

    try {
      await createDonationMutation.mutateAsync({
        donor_name: donorName,
        donor_phone: formattedPhone,
        amount: donationAmount,
        mode: "cash",
        campaign_id: selectedCampaign === "general" ? undefined : selectedCampaign,
        note: notes ? `${notes} (Ref: ${receiptRef})` : receiptRef ? `Ref: ${receiptRef}` : undefined,
        status,
      });

      Alert.alert("Success", "Cash donation recorded successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to record cash donation. Please try again.");
    }
  };

  const profileName = myProfile?.full_name || userFullName || "Admin";
  const avatarUrl = myProfile?.avatar_url || null;
  const initials = profileName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <View style={styles.logoAvatarWrapper}>
            <Image
              style={styles.logoAvatar}
              source={require("../../assets/image-only.png")}
            />
          </View>
          <Text style={styles.logoText}>UTSAV</Text>
        </View>
        <View style={styles.profileAvatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.headerAvatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Record Cash</Text>
          <Text style={styles.sectionSubtitle}>
            Manually enter a physical cash donation collected at the Mandal desk.
          </Text>
        </View>

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
          <View style={{ flexDirection: "row", gap: 6 }}>
            <TouchableOpacity
              onPress={() => setStatus("confirmed")}
              style={[
                styles.statusSelectBadge,
                status === "confirmed" ? styles.statusSelectBadgeActiveConfirmed : styles.statusSelectBadgeInactive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.statusSelectBadgeText,
                  status === "confirmed" && styles.statusSelectBadgeTextActive,
                ]}
              >
                PAID
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStatus("pending")}
              style={[
                styles.statusSelectBadge,
                status === "pending" ? styles.statusSelectBadgeActivePending : styles.statusSelectBadgeInactive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.statusSelectBadgeText,
                  status === "pending" && styles.statusSelectBadgeTextActive,
                ]}
              >
                DUE
              </Text>
            </TouchableOpacity>
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
                activeOpacity={0.8}
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
                  activeOpacity={0.8}
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
              placeholder="e.g. Book A / Page 42"
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
            A digital receipt SMS notification will be sent if mobile is provided.
          </Text>
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
  logoAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.primaryBrand,
    backgroundColor: colors.cream,
  },
  logoAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoText: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.sandstone,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },

  scrollContent: {
    padding: spacing.md,
    paddingBottom: 64,
  },
  introSection: {
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginTop: 4,
  },

  statusBanner: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
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
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  fixedBadgeText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
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
    fontSize: 28,
    fontFamily: fonts.inter.regular,
    color: colors.primaryBrand,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
  },
  formCard: {
    backgroundColor: "rgba(244, 241, 235, 0.5)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 20,
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
  statusSelectBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusSelectBadgeActiveConfirmed: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderColor: colors.tulsiGreen,
  },
  statusSelectBadgeActivePending: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    borderColor: colors.haldiYellow,
  },
  statusSelectBadgeInactive: {
    backgroundColor: "transparent",
    borderColor: colors.sandstone,
  },
  statusSelectBadgeText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
    letterSpacing: 0.5,
  },
  statusSelectBadgeTextActive: {
    color: colors.onSurface,
  },
});

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  Image,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchCampaigns, useCreateRazorpayOrder } from "@utsav/api-client";

const AMOUNT_CHIPS = [
  { value: 101, label: "Shagun" },
  { value: 251, label: undefined },
  { value: 501, label: undefined },
  { value: 1001, label: "Aarti" },
  { value: 2101, label: undefined },
  { value: 5001, label: "Pooja Seva" },
];

export default function SelectAmountScreen() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [dedicateToggle, setDedicateToggle] = useState(false);
  const { data: campaigns } = useFetchCampaigns();
  const razorpayMutation = useCreateRazorpayOrder();

  const activeCampaign = campaigns?.[0];

  const displayAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : 0);

  const handleChipSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(String(amount));
  };

  const handleCustomInput = (text: string) => {
    setCustomAmount(text);
    setSelectedAmount(null);
  };

  const handleDonate = async () => {
    if (displayAmount <= 0) return;
    try {
      await razorpayMutation.mutateAsync({
        donor_name: "User",
        amount: displayAmount,
        campaign_id: activeCampaign?.id,
      });
      router.push("/(dashboard)/donation-confirmed");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Make a Donation</Text>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="information-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Campaign Progress Card */}
        <View style={styles.campaignCard}>
          <View style={styles.campaignHeader}>
            <View style={styles.campaignIcon}>
              <MaterialCommunityIcons name="flower-tulip" size={28} color={colors.primaryBrand} />
            </View>
            <View style={styles.campaignInfo}>
              <Text style={styles.campaignName}>{activeCampaign?.name ?? "Shree Sai Ganpati Mandal"}</Text>
              <Text style={styles.campaignSubtitle}>{activeCampaign?.description ?? "Mandal Reconstruction Fund"}</Text>
            </View>
            <View style={styles.diyaPulse}>
              <MaterialCommunityIcons name="candle" size={20} color={colors.primaryContainer} />
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressRaised}>
                Raised <Text style={styles.progressAmount}>₹12,50,000</Text>
              </Text>
              <Text style={styles.progressTarget}>Target: ₹20,00,000</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "62.5%" }]} />
            </View>
            <View style={styles.progressMeta}>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>62.5% Complete</Text>
              </View>
              <Text style={styles.donorCount}>1,240 community donors</Text>
            </View>
          </View>
        </View>

        {/* Amount Selection */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Choose Amount</Text>
          <Text style={styles.sectionSubtitle}>
            Every contribution supports our ritual traditions and community seva.
          </Text>

          {/* Quick-Select Chips */}
          <View style={styles.chipGrid}>
            {AMOUNT_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip.value}
                style={[
                  styles.amountChip,
                  selectedAmount === chip.value && styles.amountChipActive,
                ]}
                onPress={() => handleChipSelect(chip.value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipAmount,
                    selectedAmount === chip.value && styles.chipAmountActive,
                  ]}
                >
                  ₹{chip.value.toLocaleString("en-IN")}
                </Text>
                {chip.label && (
                  <Text
                    style={[
                      styles.chipLabel,
                      selectedAmount === chip.value && styles.chipLabelActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount */}
          <View style={styles.customAmountSection}>
            <Text style={styles.customLabel}>Custom Contribution Amount</Text>
            <View style={styles.customInputWrap}>
              <Text style={styles.rupeePrefixLarge}>₹</Text>
              <TextInput
                style={styles.customInput}
                value={customAmount}
                onChangeText={handleCustomInput}
                placeholder="0.00"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.secureRow}>
              <MaterialCommunityIcons name="check-decagram" size={14} color={colors.aartiGold} />
              <Text style={styles.secureText}>Secure 128-bit encrypted payment gateway</Text>
            </View>
          </View>
        </View>

        {/* Dedication Toggle */}
        <View style={styles.dedicationRow}>
          <View style={styles.dedicationLeft}>
            <MaterialCommunityIcons name="hand-heart" size={22} color={colors.primaryBrand} />
            <View>
              <Text style={styles.dedicationTitle}>Donate in someone's name</Text>
              <Text style={styles.dedicationSubtitle}>Add a prayer or dedication</Text>
            </View>
          </View>
          <Switch
            value={dedicateToggle}
            onValueChange={setDedicateToggle}
            trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Final Donation</Text>
          <Text style={styles.footerAmount}>
            ₹{displayAmount ? displayAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.donateBtn}
          activeOpacity={0.85}
          onPress={handleDonate}
          disabled={razorpayMutation.isPending || displayAmount <= 0}
        >
          <MaterialCommunityIcons name="lock" size={20} color={colors.onPrimaryContainer} />
          <Text style={styles.donateBtnText}>
            {razorpayMutation.isPending ? "Processing..." : "Donate Online (Razorpay)"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerDisclaimer}>
          By donating, you agree to Utsav's Terms of Service.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  appBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.md, height: 56,
    backgroundColor: "rgba(250, 250, 248, 0.85)", borderBottomWidth: 1, borderBottomColor: colors.sandstone,
  },
  appBarLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  backBtn: { padding: spacing.xs },
  appBarTitle: { fontSize: 24, fontFamily: fonts.poppins.semibold, color: colors.primaryBrand },
  scrollContent: { padding: spacing.md, paddingBottom: 200 },
  campaignCard: {
    backgroundColor: "#FFFFFF", borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.sandstone,
    padding: spacing.lg, marginBottom: spacing.lg,
    shadowColor: "rgba(255, 149, 0, 0.15)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 20, elevation: 3,
  },
  campaignHeader: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, marginBottom: spacing.md },
  campaignIcon: {
    width: 48, height: 48, borderRadius: 8, backgroundColor: "rgba(255, 149, 0, 0.1)",
    alignItems: "center", justifyContent: "center",
  },
  campaignInfo: { flex: 1 },
  campaignName: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.onSurface },
  campaignSubtitle: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, letterSpacing: 0.5, textTransform: "uppercase" },
  diyaPulse: { padding: spacing.xs },
  progressSection: { gap: spacing.sm },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  progressRaised: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant },
  progressAmount: { fontSize: 18, fontFamily: fonts.inter.bold, color: colors.primaryBrand },
  progressTarget: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  progressBarBg: { height: 12, backgroundColor: colors.cream, borderRadius: 6, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: colors.primaryContainer, borderRadius: 6 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  percentBadge: { backgroundColor: "rgba(34, 197, 94, 0.1)", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  percentText: { fontSize: 12, fontFamily: fonts.inter.semibold, color: colors.tulsiGreen },
  donorCount: { fontSize: 12, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, fontStyle: "italic" },
  amountSection: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.onSurface, marginBottom: spacing.xs },
  sectionSubtitle: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, marginBottom: spacing.lg },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  amountChip: {
    width: "31%", paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    backgroundColor: colors.cream, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.sandstone,
    alignItems: "center",
  },
  amountChipActive: { backgroundColor: "rgba(255, 149, 0, 0.1)", borderColor: colors.primaryContainer },
  chipAmount: { fontSize: 16, fontFamily: fonts.inter.bold, color: colors.onSurface },
  chipAmountActive: { color: colors.primaryBrand },
  chipLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, marginTop: 4 },
  chipLabelActive: { color: colors.primaryContainer },
  customAmountSection: { gap: spacing.sm },
  customLabel: { fontSize: 14, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, marginLeft: 4 },
  customInputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.sandstone, borderRadius: borderRadius.xl, paddingHorizontal: spacing.md },
  rupeePrefixLarge: { fontSize: 32, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant },
  customInput: { flex: 1, fontSize: 32, fontFamily: fonts.inter.regular, color: colors.onSurface, paddingVertical: spacing.lg, paddingLeft: spacing.sm },
  secureRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingLeft: spacing.xs },
  secureText: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  dedicationRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: spacing.md, borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.sandstone,
  },
  dedicationLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  dedicationTitle: { fontSize: 14, fontFamily: fonts.inter.medium, color: colors.onSurface },
  dedicationSubtitle: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(250, 250, 248, 0.85)", padding: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.sandstone,
    shadowColor: "rgba(255, 149, 0, 0.08)", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm, paddingHorizontal: 4 },
  footerLabel: { fontSize: 14, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  footerAmount: { fontSize: 24, fontFamily: fonts.poppins.semibold, color: colors.primaryBrand },
  donateBtn: {
    height: 56, backgroundColor: colors.primaryContainer, borderRadius: borderRadius.xl,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    shadowColor: colors.primaryContainer, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  donateBtnText: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.onPrimaryContainer },
  footerDisclaimer: { fontSize: 12, fontFamily: fonts.inter.medium, color: "rgba(85, 67, 52, 0.7)", textAlign: "center", marginTop: spacing.sm },
});

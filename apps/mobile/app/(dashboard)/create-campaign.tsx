import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCreateCampaign, useFetchCampaigns, useFetchDonations, useFetchTenant, useFetchMyProfile } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CreateCampaignScreen() {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-09-10");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1545232979-8bf34eb9757b");

  const { tenantId, userFullName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: myProfile } = useFetchMyProfile();
  
  const createCampaignMutation = useCreateCampaign();
  const { data: campaigns = [], isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useFetchCampaigns();
  const { data: donations = [], isLoading: isLoadingDonations } = useFetchDonations();

  const handleLaunchCampaign = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please fill in the campaign name.");
      return;
    }
    const target = parseFloat(targetAmount) || 0;
    if (target <= 0) {
      Alert.alert("Error", "Please enter a valid target amount.");
      return;
    }

    try {
      await createCampaignMutation.mutateAsync({
        name,
        description,
        target_amount: target,
        start_date: startDate,
        end_date: endDate,
      });

      Alert.alert(
        "Campaign Launched!",
        `"${name}" campaign is now live for sponsorships and general donations.`,
        [{ text: "OK", onPress: () => {
          setName("");
          setTargetAmount("");
          setDescription("");
          refetchCampaigns();
        }}]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to launch campaign.");
    }
  };

  const getCampaignRaisedAmount = (campaignId: string) => {
    return donations
      .filter((d: any) => d.campaign_id === campaignId && d.status === "confirmed")
      .reduce((sum: number, d: any) => sum + Number(d.amount), 0);
  };

  const profileName = myProfile?.full_name || userFullName || "Mandal Owner";
  const avatarUrl = myProfile?.avatar_url || null;
  const initials = profileName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const covers = [
    "https://images.unsplash.com/photo-1545232979-8bf34eb9757b",
    "https://images.unsplash.com/photo-1609137882641-5a9e334df568",
    "https://images.unsplash.com/photo-1561571994-3c61c554181a",
  ];

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
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Campaign Hub</Text>
          <Text style={styles.sectionSubtitle}>
            Launch and monitor targeted donation drives for temple renovations, logistics, or operations.
          </Text>
        </View>

        {/* Launch Campaign Section */}
        <View style={styles.cardSection}>
          <Text style={styles.cardSectionTitle}>Launch New Campaign</Text>
          <View style={styles.form}>
            <Text style={styles.label}>Campaign Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Aarti sponsorship, Mandap Decoration"
              placeholderTextColor="rgba(85, 67, 52, 0.4)"
            />

            <Text style={styles.label}>Target Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="e.g. 150000"
              keyboardType="numeric"
              placeholderTextColor="rgba(85, 67, 52, 0.4)"
            />

            <Text style={styles.label}>Description / Purpose</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what the funds will be used for..."
              multiline={true}
              numberOfLines={4}
              placeholderTextColor="rgba(85, 67, 52, 0.4)"
            />

            {/* Date range inputs */}
            <View style={styles.dateRow}>
              <View style={styles.dateCol}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(85, 67, 52, 0.4)"
                />
              </View>
              <View style={styles.dateCol}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(85, 67, 52, 0.4)"
                />
              </View>
            </View>

            {/* Cover image options */}
            <Text style={styles.label}>Select Banner Theme</Text>
            <View style={styles.coversGrid}>
              {covers.map((c, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.coverOption,
                    coverUrl === c && styles.activeCoverOption,
                  ]}
                  onPress={() => setCoverUrl(c)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.coverColorBlock, { backgroundColor: idx === 0 ? colors.primaryContainer : idx === 1 ? colors.secondaryBrand : colors.aartiGold }]} />
                  <Text style={styles.coverText}>Theme {idx + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLaunchCampaign}
            disabled={createCampaignMutation.isPending}
            activeOpacity={0.8}
          >
            {createCampaignMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="rocket-launch-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Launch Live Campaign</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Running Campaigns List */}
        <View style={styles.campaignListSection}>
          <Text style={styles.cardSectionTitle}>Running Campaigns</Text>

          {isLoadingCampaigns || isLoadingDonations ? (
            <View style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primaryBrand} />
            </View>
          ) : campaigns.length > 0 ? (
            campaigns.map((camp: any) => {
              const raised = getCampaignRaisedAmount(camp.id);
              const target = camp.target_amount || 0;
              const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;

              return (
                <View key={camp.id} style={styles.campaignCard}>
                  <View style={styles.campHeader}>
                    <View style={styles.campTitleCol}>
                      <Text style={styles.campName}>{camp.name}</Text>
                      {camp.description ? (
                        <Text style={styles.campDesc} numberOfLines={2}>
                          {camp.description}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.statusIndicator, { backgroundColor: camp.is_active ? "rgba(76, 175, 80, 0.1)" : "rgba(158, 158, 158, 0.1)" }]}>
                      <Text style={[styles.statusText, { color: camp.is_active ? colors.tulsiGreen : colors.outline }]}>
                        {camp.is_active ? "ACTIVE" : "INACTIVE"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressMeta}>
                      <Text style={styles.raisedLabel}>Raised: <Text style={styles.raisedVal}>₹{raised.toLocaleString()}</Text></Text>
                      <Text style={styles.targetLabel}>Goal: ₹{target.toLocaleString()}</Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                    </View>

                    <View style={styles.campFooter}>
                      <Text style={styles.percentText}>{percent}% Raised</Text>
                      <Text style={styles.dateRangeText}>
                        {camp.start_date ? new Date(camp.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Start"} - {camp.end_date ? new Date(camp.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Ongoing"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCampaigns}>
              <MaterialCommunityIcons name="bullhorn-outline" size={48} color={colors.outline} />
              <Text style={styles.emptyCampaignsText}>No active donation campaigns running</Text>
            </View>
          )}
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
  avatarImage: {
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
    paddingBottom: 100,
    gap: spacing.lg,
  },
  introSection: {
    marginBottom: spacing.xs,
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
  cardSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardSectionTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    backgroundColor: colors.pujaWhite,
    color: colors.charcoal,
  },
  textArea: {
    height: 96,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  dateRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dateCol: {
    flex: 1,
  },
  coversGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  coverOption: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    backgroundColor: colors.pujaWhite,
  },
  activeCoverOption: {
    borderColor: colors.primaryBrand,
    backgroundColor: "rgba(240, 117, 33, 0.05)",
  },
  coverColorBlock: {
    width: "100%",
    height: 36,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  coverText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  submitBtn: {
    height: 52,
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },

  campaignListSection: {
    gap: spacing.md,
  },
  campaignCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  campHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  campTitleCol: {
    flex: 1,
    gap: 4,
  },
  campName: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  campDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    letterSpacing: 0.5,
  },
  progressSection: {
    gap: spacing.sm,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  raisedLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  raisedVal: {
    fontSize: 13,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  targetLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.sandstone,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.tulsiGreen,
    borderRadius: 3,
  },
  campFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  percentText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
  dateRangeText: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  emptyCampaigns: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: spacing.xs,
  },
  emptyCampaignsText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
});

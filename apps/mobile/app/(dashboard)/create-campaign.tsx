import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCreateCampaign } from "@utsav/api-client";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CreateCampaignScreen() {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-09-10");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1545232979-8bf34eb9757b");

  const createCampaignMutation = useCreateCampaign();

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
        [{ text: "OK", onPress: () => router.replace("/(dashboard)/settings") }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to launch campaign.");
    }
  };

  const covers = [
    "https://images.unsplash.com/photo-1545232979-8bf34eb9757b",
    "https://images.unsplash.com/photo-1609137882641-5a9e334df568",
    "https://images.unsplash.com/photo-1561571994-3c61c554181a",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Launch Campaign</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <View style={styles.introSection}>
          <Text style={styles.sectionSubtitle}>
            Launch a new targeted donation drive for temple renovations, logistics, or operations.
          </Text>
        </View>

        {/* Form Fields */}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  introSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
    backgroundColor: colors.pujaWhite,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
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
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  coverOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  activeCoverOption: {
    borderColor: colors.primaryBrand,
    backgroundColor: "rgba(140, 80, 0, 0.05)",
  },
  coverColorBlock: {
    width: "100%",
    height: 40,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  coverText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  submitBtn: {
    height: 52,
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
});

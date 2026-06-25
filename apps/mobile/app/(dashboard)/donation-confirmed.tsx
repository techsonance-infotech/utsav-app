import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchDonation, useFetchMyProfile, useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

export default function DonationConfirmedScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: donation } = useFetchDonation(id ?? "");
  const { tenantId, userFullName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: myProfile } = useFetchMyProfile();

  const diyaScale = useRef(new Animated.Value(0.9)).current;
  const diyaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(diyaScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(diyaOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const profileName = myProfile?.full_name || userFullName || "Devotee";
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
        {/* Hero Section with Diya Glow */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.diyaGlow,
              {
                opacity: diyaOpacity,
                transform: [{ scale: diyaScale }],
              },
            ]}
          >
            <MaterialCommunityIcons name="gift" size={40} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.heroTitle}>Jai Ganesh!</Text>
          <Text style={styles.heroSubtitle}>Donation Successful</Text>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.confirmedBadgeWrap}>
            <View style={styles.confirmedBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.tulsiGreen} />
              <Text style={styles.confirmedBadgeText}>Payment Confirmed</Text>
            </View>
          </View>

          <Text style={styles.confirmationMsg}>
            Your donation of{" "}
            <Text style={styles.amountHighlight}>
              ₹{donation?.amount ? donation.amount.toLocaleString("en-IN") : "5,001"}
            </Text>{" "}
            is confirmed. Thank you for your contribution to the community!
          </Text>

          <View style={styles.receiptDetails}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Receipt No</Text>
              <Text style={styles.receiptValue}>{donation?.receipt_number ?? "SAIG-25-00247"}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date</Text>
              <Text style={styles.receiptValue}>
                {donation?.created_at
                  ? new Date(donation.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "12 Sep 2025"}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Payment Mode</Text>
              <Text style={styles.receiptValue}>
                {donation?.mode ? donation.mode.toUpperCase() : "UPI / PHONEPE"}
              </Text>
            </View>
          </View>

          {/* Auspicious Message */}
          <View style={styles.auspiciousDivider} />
          <Text style={styles.auspiciousText}>
            "May the divine blessings of Ganesha bring prosperity to your home."
          </Text>
        </View>

        {/* Action Stack */}
        <View style={styles.actionStack}>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="download" size={20} color={colors.onPrimaryContainer} />
            <Text style={styles.primaryBtnText}>Download Receipt (PDF)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
            <Text style={styles.secondaryBtnText}>Share on WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={() => router.push("/(dashboard)/home")}
          >
            <MaterialCommunityIcons name="arrow-left" size={16} color={colors.primaryBrand} />
            <Text style={styles.tertiaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Temple Accent Image */}
        <View style={styles.templeAccentWrap}>
          <Image
            style={styles.templeAccentImage}
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzdzbOBXh0yTfDHVa_QkX50wyqCEUDCEW3eLGqC9Gua-7WxQHODFgsag4RWOSLTTpbZvEceYzRKEr9qLpP7jZkGpGKmingEvsr6SFY46kreIWVbRSxByRcYR9pEQaSAZ_EeiqAyG1BW8nl_0zyu28jiKLy5ghhG_VfvWYln5-QqkW-hLaNMXAY7QK0524cQSMM3nDRQKNpUkwGAUY-j-Te9TrP38dPZgke4FiBBMQOJJYBNRoc2X4W",
            }}
          />
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
    paddingBottom: 64,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  diyaGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginHorizontal: spacing.md,
    marginTop: -20,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmedBadgeWrap: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  confirmedBadgeText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
  confirmationMsg: {
    fontSize: 16,
    fontFamily: fonts.inter.regular,
    color: colors.charcoal,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  amountHighlight: {
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  receiptDetails: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  receiptValue: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  auspiciousDivider: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.5)",
    marginVertical: spacing.lg,
  },
  auspiciousText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    fontStyle: "italic",
  },
  actionStack: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  primaryBtn: {
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
  primaryBtnText: {
    fontSize: 16,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  secondaryBtn: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.sandstone,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: fonts.inter.bold,
    color: colors.onSurface,
  },
  tertiaryBtn: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  tertiaryBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  templeAccentWrap: {
    alignItems: "center",
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  templeAccentImage: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    opacity: 0.8,
  },
});

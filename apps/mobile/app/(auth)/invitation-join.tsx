import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchInvite, useAcceptInvite } from "@utsav/api-client";

export default function InvitationJoinScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { data: invite, isLoading, error } = useFetchInvite(token ?? null);
  const acceptMutation = useAcceptInvite();

  const handleAccept = async () => {
    if (!token) return;
    try {
      const result = await acceptMutation.mutateAsync(token);
      if (result.success) {
        router.replace("/(dashboard)/home");
      }
    } catch {
      // Error handled by mutation state
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
          <Text style={styles.loadingText}>Loading invitation…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !invite) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <MaterialCommunityIcons name="link-off" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Invalid Invitation</Text>
          <Text style={styles.errorSubtitle}>
            This invitation link may have expired or been revoked.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/(auth)/welcome")}
          >
            <Text style={styles.backBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>Utsav</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
      </View>

      {/* Decorative Glows */}
      <View style={styles.glowYellow} />
      <View style={styles.glowSaffron} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Invite Card */}
        <View style={styles.inviteCard}>
          {/* Mandal Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="account-group"
                size={56}
                color={colors.primaryContainer}
              />
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.onPrimary} />
            </View>
          </View>

          {/* Invite Headline */}
          <View style={styles.inviteHeadline}>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={colors.onPrimaryContainer} />
              <Text style={styles.roleBadgeText}>{invite.role || "Volunteer"}</Text>
            </View>

            <Text style={styles.inviteTitle}>
              You've been invited to join{" "}
              <Text style={styles.inviteMandal}>{invite.tenant?.name || "Mandal"}</Text>
            </Text>

            {invite.tenant?.city && (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.locationText}>
                  {invite.tenant.city}
                  {invite.tenant.state ? `, ${invite.tenant.state}` : ""}
                </Text>
              </View>
            )}
          </View>

          {/* Context Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <MaterialCommunityIcons name="calendar-check" size={22} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Active Festival</Text>
                <Text style={styles.infoValue}>Open for Enrolment</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <MaterialCommunityIcons name="account-group" size={22} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Mandal Size</Text>
                <Text style={styles.infoValue}>Active community</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.85}
              onPress={handleAccept}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.googleIcon}>
                    <MaterialCommunityIcons name="google" size={18} color={colors.primaryBrand} />
                  </View>
                  <Text style={styles.googleBtnText}>Join with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emailBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/signup")}
            >
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.outline} />
              <Text style={styles.emailBtnText}>Register with Email or Phone</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.signInLink}>
                Already have an account?{" "}
                <Text style={styles.signInBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
            <View style={styles.encryptedRow}>
              <MaterialCommunityIcons name="lock" size={12} color={colors.onSurfaceVariant} />
              <Text style={styles.encryptedText}>SECURE ENCRYPTED ENROLLMENT</Text>
            </View>
          </View>
        </View>

        {/* Trust Markers */}
        <View style={styles.trustMarkers}>
          <View style={styles.trustItem}>
            <MaterialCommunityIcons name="shield-check" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.trustText}>Privacy Guaranteed</Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialCommunityIcons name="bank" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.trustText}>Official Organization</Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialCommunityIcons name="hand-heart" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.trustText}>Community Powered</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Gradient Bar */}
      <View style={styles.bottomBar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 24,
  },
  backBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onPrimary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "rgba(250, 250, 248, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  headerLogo: {
    fontSize: 32,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  helpBtn: {
    padding: spacing.xs,
  },
  glowYellow: {
    position: "absolute",
    top: -24,
    left: -24,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(234, 179, 8, 0.06)",
  },
  glowSaffron: {
    position: "absolute",
    top: 40,
    right: -24,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    flexGrow: 1,
    justifyContent: "center",
  },
  inviteCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: colors.pujaWhite,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.lg,
    alignItems: "center",
    shadowColor: "rgba(255, 149, 0, 0.1)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 5,
  },
  logoSection: {
    position: "relative",
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: colors.aartiGold,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryBrand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteHeadline: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  roleBadgeText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onPrimaryContainer,
  },
  inviteTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    textAlign: "center",
    lineHeight: 32,
  },
  inviteMandal: {
    color: colors.primaryBrand,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  locationText: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  infoGrid: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
    marginBottom: spacing.xxl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderWidth: 0.5,
    borderColor: "rgba(232, 226, 214, 0.5)",
  },
  infoIcon: {
    backgroundColor: "rgba(140, 80, 0, 0.1)",
    padding: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  actions: {
    width: "100%",
    maxWidth: 320,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  googleBtn: {
    height: 56,
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  googleBtnText: {
    fontSize: 20,
    fontFamily: fonts.poppins.semibold,
    color: colors.pujaWhite,
  },
  emailBtn: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  emailBtnText: {
    fontSize: 16,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  cardFooter: {
    alignItems: "center",
    gap: spacing.sm,
  },
  signInLink: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  signInBold: {
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  encryptedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    opacity: 0.5,
    marginTop: spacing.xs,
  },
  encryptedText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  trustMarkers: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xl,
    marginTop: spacing.xl,
    opacity: 0.6,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  trustText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  bottomBar: {
    height: 2,
    width: "100%",
    backgroundColor: colors.primaryContainer,
    opacity: 0.6,
  },
});

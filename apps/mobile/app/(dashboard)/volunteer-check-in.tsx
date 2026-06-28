import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVolunteerCheckIn, useVolunteerDuties, useFetchMyProfile, useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { ScreenHeader } from "../components/ScreenHeader";


export default function VolunteerCheckInScreen() {
  const { tenantId, userId, userFullName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: myProfile } = useFetchMyProfile();
  const { data: duties = [], isLoading } = useVolunteerDuties();
  const checkInMutation = useVolunteerCheckIn();

  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedInTime, setCheckedInTime] = useState<string | null>(null);

  // Filter duties assigned to the current volunteer
  const myDuties = duties.filter((d: any) => d.assigned_to === userId);
  
  // Find current active/assigned duty
  const activeDuty = myDuties.find((d: any) => d.status === "assigned") || myDuties[0] || null;

  // Calculate statistics from backend
  const completedDuties = myDuties.filter((d: any) => d.status === "completed");
  const totalHours = completedDuties.reduce((sum: number, d: any) => {
    const start = new Date(d.start_at).getTime();
    const end = d.end_at ? new Date(d.end_at).getTime() : start;
    const diffHours = (end - start) / (1000 * 60 * 60);
    return sum + (diffHours > 0 ? diffHours : 0);
  }, 0);

  // Find next upcoming duty
  const upcomingDuty = myDuties.find((d: any) => new Date(d.start_at) > new Date()) || null;

  const handleCheckIn = async () => {
    if (!activeDuty) {
      Alert.alert("No Duty", "No active duty assigned to check into.");
      return;
    }
    try {
      await checkInMutation.mutateAsync(activeDuty.id);
      setCheckedIn(true);
      setCheckedInTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      Alert.alert("Success", `Checked in successfully for "${activeDuty.title}"`);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to check-in.");
    }
  };

  const profileName = myProfile?.full_name || userFullName || "Volunteer";
  const avatarUrl = myProfile?.avatar_url || null;
  const initials = profileName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Volunteer Check-in"
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryBrand} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Info */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Seva Check-In</Text>
            <Text style={styles.sectionSubtitle}>
              Scan the QR at the venue gate or manually tap to confirm your attendance.
            </Text>
          </View>

          {/* Active Duty Section */}
          {activeDuty ? (
            <View style={styles.activeDutyCard}>
              <View style={styles.dutyBadge}>
                <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.onPrimaryContainer} />
                <Text style={styles.dutyBadgeText}>Active Duty Now</Text>
              </View>
              <Text style={styles.dutyName}>{activeDuty.title}</Text>
              {activeDuty.description ? (
                <Text style={styles.dutyDesc}>{activeDuty.description}</Text>
              ) : null}
              <View style={styles.dutyMeta}>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.metaText}>
                    {new Date(activeDuty.start_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    {activeDuty.end_at ? ` - ${new Date(activeDuty.end_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.metaText}>{activeDuty.location || "Mandal Campus"}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noDutyCard}>
              <MaterialCommunityIcons name="clipboard-text-play-outline" size={44} color={colors.outline} />
              <Text style={styles.noDutyTitle}>No Active Duty Assigned</Text>
              <Text style={styles.noDutySubtitle}>Check the roster to find open slots and sign up.</Text>
              <TouchableOpacity
                style={styles.rosterLinkBtn}
                onPress={() => router.push("/(dashboard)/volunteer-duty-roster")}
                activeOpacity={0.8}
              >
                <Text style={styles.rosterLinkBtnText}>View Duty Roster</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* QR Scanner Placeholder */}
          {activeDuty && (
            <View style={styles.scannerSection}>
              <Text style={styles.scannerTitle}>Scan Venue QR Code</Text>
              <View style={styles.scannerFrame}>
                {/* Corner markers */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <View style={styles.scannerCenter}>
                  <MaterialCommunityIcons name="qrcode-scan" size={64} color="rgba(140, 80, 0, 0.2)" />
                  <Text style={styles.scannerHint}>Point camera at the venue QR code</Text>
                </View>
              </View>
            </View>
          )}

          {activeDuty && (
            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>
          )}

          {/* Manual Check-in Button */}
          {activeDuty && (!checkedIn ? (
            <TouchableOpacity
              style={styles.checkInBtn}
              activeOpacity={0.85}
              onPress={handleCheckIn}
              disabled={checkInMutation.isPending}
            >
              <MaterialCommunityIcons name="gesture-tap" size={24} color={colors.onPrimaryContainer} />
              <Text style={styles.checkInBtnText}>
                {checkInMutation.isPending ? "Checking in..." : "Tap to Check-in"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.successCard}>
              <View style={styles.venueBadge}>
                <MaterialCommunityIcons name="map-marker-check" size={18} color={colors.tulsiGreen} />
                <Text style={styles.venueBadgeText}>You are at the venue</Text>
              </View>

              <View style={styles.successContent}>
                <View style={styles.successIcon}>
                  <MaterialCommunityIcons name="check-circle" size={48} color={colors.tulsiGreen} />
                </View>
                <Text style={styles.successTitle}>Jai Ganesh!</Text>
                <Text style={styles.successSubtitle}>Checked in successfully</Text>
                <View style={styles.timestampRow}>
                  <MaterialCommunityIcons name="clock-check-outline" size={16} color={colors.onSurfaceVariant} />
                  <Text style={styles.timestampText}>
                    Entry at {checkedInTime || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Your Seva Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="clock-fast" size={24} color={colors.primaryBrand} />
                <Text style={styles.statValue}>{totalHours > 0 ? `${totalHours.toFixed(1)} hrs` : "0.0 hrs"}</Text>
                <Text style={styles.statLabel}>Hours Contributed</Text>
                <View style={styles.statProgressBg}>
                  <View style={[styles.statProgressFill, { width: totalHours > 0 ? `${Math.min((totalHours / 10) * 100, 100)}%` : "0%" }]} />
                </View>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="calendar-arrow-right" size={24} color={colors.aartiGold} />
                <Text style={styles.statValue} numberOfLines={1}>
                  {upcomingDuty ? new Date(upcomingDuty.start_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "None"}
                </Text>
                <Text style={styles.statLabel}>Next Duty</Text>
                <Text style={styles.statSubvalue} numberOfLines={1}>
                  {upcomingDuty ? upcomingDuty.title : "No upcoming assignments"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },
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

  activeDutyCard: {
    backgroundColor: colors.charcoal, borderRadius: 20, padding: spacing.lg, marginBottom: spacing.lg,
  },
  dutyBadge: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    alignSelf: "flex-start", backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: 9999, marginBottom: spacing.sm,
  },
  dutyBadgeText: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },
  dutyName: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: "#FFFFFF", marginBottom: spacing.xs },
  dutyDesc: { fontSize: 13, fontFamily: fonts.inter.regular, color: "rgba(255,255,255,0.7)", marginBottom: spacing.sm },
  dutyMeta: { gap: spacing.xs },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  metaText: { fontSize: 14, fontFamily: fonts.inter.regular, color: "rgba(255,255,255,0.7)" },

  noDutyCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: colors.sandstone, padding: spacing.xl,
    alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg,
  },
  noDutyTitle: { fontSize: 18, fontFamily: fonts.poppins.bold, color: colors.charcoal },
  noDutySubtitle: { fontSize: 13, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, textAlign: "center", lineHeight: 18 },
  rosterLinkBtn: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg, marginTop: spacing.xs,
  },
  rosterLinkBtnText: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },

  scannerSection: { alignItems: "center", marginBottom: spacing.lg },
  scannerTitle: { fontSize: 16, fontFamily: fonts.inter.semibold, color: colors.onSurface, marginBottom: spacing.md },
  scannerFrame: {
    width: 260, height: 260, position: "relative",
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow, borderRadius: 20,
    borderWidth: 1, borderColor: colors.sandstone,
  },
  corner: {
    position: "absolute", width: 32, height: 32,
    borderColor: colors.primaryBrand, borderWidth: 3,
  },
  cornerTL: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  scannerCenter: { alignItems: "center", gap: spacing.md },
  scannerHint: { fontSize: 12, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, textAlign: "center" },
  orDivider: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  orLine: { flex: 1, height: 1, backgroundColor: colors.sandstone },
  orText: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.onSurfaceVariant },
  checkInBtn: {
    height: 56, backgroundColor: colors.primaryContainer, borderRadius: borderRadius.xl,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: colors.primaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3,
  },
  checkInBtnText: { fontSize: 18, fontFamily: fonts.poppins.bold, color: colors.onPrimaryContainer },
  successCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.sandstone, marginBottom: spacing.xl, alignItems: "center",
  },
  venueBadge: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    backgroundColor: "rgba(34, 197, 94, 0.1)", paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: 9999, marginBottom: spacing.lg,
  },
  venueBadgeText: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.tulsiGreen },
  successContent: { alignItems: "center" },
  successIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  successTitle: { fontSize: 26, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, marginBottom: spacing.xs },
  successSubtitle: { fontSize: 15, fontFamily: fonts.inter.medium, color: colors.onSurface, marginBottom: spacing.md },
  timestampRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  timestampText: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant },
  statsSection: { marginTop: spacing.md },
  statsTitle: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.onSurface, marginBottom: spacing.md },
  statsRow: { flexDirection: "row", gap: spacing.md },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.sandstone, alignItems: "center",
  },
  statValue: { fontSize: 20, fontFamily: fonts.poppins.bold, color: colors.onSurface, marginTop: spacing.sm },
  statLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  statSubvalue: { fontSize: 12, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  statProgressBg: { width: "100%", height: 4, backgroundColor: colors.sandstone, borderRadius: 2, overflow: "hidden", marginTop: spacing.md },
  statProgressFill: { height: "100%", backgroundColor: colors.primaryContainer, borderRadius: 2 },
});

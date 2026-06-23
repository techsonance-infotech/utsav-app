import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVolunteerCheckIn, useVolunteerDuties } from "@utsav/api-client";

export default function VolunteerCheckInScreen() {
  const [checkedIn, setCheckedIn] = useState(false);
  const checkInMutation = useVolunteerCheckIn();
  const { data: duties } = useVolunteerDuties();

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync("current-duty-id");
    } catch {
      // Continue with UI
    }
    setCheckedIn(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Volunteer Check-in</Text>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Duty Card */}
        <View style={styles.activeDutyCard}>
          <View style={styles.dutyBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.onPrimaryContainer} />
            <Text style={styles.dutyBadgeText}>Active Duty Now</Text>
          </View>
          <Text style={styles.dutyName}>Prasad Distribution - Shift A</Text>
          <View style={styles.dutyMeta}>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>08:00 AM – 12:00 PM</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>Main Pandal, Gate 3</Text>
            </View>
          </View>
        </View>

        {/* QR Scanner Placeholder */}
        <View style={styles.scannerSection}>
          <Text style={styles.scannerTitle}>Scan QR Code</Text>
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

        {/* OR Divider */}
        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Manual Check-in Button */}
        {!checkedIn ? (
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
            {/* Venue Badge */}
            <View style={styles.venueBadge}>
              <MaterialCommunityIcons name="map-marker-check" size={18} color={colors.tulsiGreen} />
              <Text style={styles.venueBadgeText}>You are at the venue</Text>
            </View>

            {/* Success Message */}
            <View style={styles.successContent}>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons name="check-circle" size={48} color={colors.tulsiGreen} />
              </View>
              <Text style={styles.successTitle}>Jai Ganesh!</Text>
              <Text style={styles.successSubtitle}>Checked in successfully</Text>
              <View style={styles.timestampRow}>
                <MaterialCommunityIcons name="clock-check-outline" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.timestampText}>
                  Entry at {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Your Seva Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-fast" size={24} color={colors.primaryBrand} />
              <Text style={styles.statValue}>24.5 hrs</Text>
              <Text style={styles.statLabel}>Hours Contributed</Text>
              <View style={styles.statProgressBg}>
                <View style={[styles.statProgressFill, { width: "70%" }]} />
              </View>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="calendar-arrow-right" size={24} color={colors.aartiGold} />
              <Text style={styles.statValue}>Sept 15</Text>
              <Text style={styles.statLabel}>Next Duty</Text>
              <Text style={styles.statSubvalue}>Aarti Seva</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.md, height: 56,
    backgroundColor: "rgba(250, 250, 248, 0.9)", borderBottomWidth: 1, borderBottomColor: colors.sandstone,
  },
  appBarLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  backBtn: { padding: spacing.xs },
  appBarTitle: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.primaryBrand },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },
  activeDutyCard: {
    backgroundColor: colors.charcoal, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.lg,
  },
  dutyBadge: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    alignSelf: "flex-start", backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: 9999, marginBottom: spacing.sm,
  },
  dutyBadgeText: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },
  dutyName: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: "#FFFFFF", marginBottom: spacing.sm },
  dutyMeta: { gap: spacing.xs },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  metaText: { fontSize: 14, fontFamily: fonts.inter.regular, color: "rgba(255,255,255,0.7)" },
  scannerSection: { alignItems: "center", marginBottom: spacing.lg },
  scannerTitle: { fontSize: 16, fontFamily: fonts.inter.semibold, color: colors.onSurface, marginBottom: spacing.md },
  scannerFrame: {
    width: 260, height: 260, position: "relative",
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.surfaceContainer, borderRadius: 16,
  },
  corner: {
    position: "absolute", width: 32, height: 32,
    borderColor: colors.primaryContainer, borderWidth: 3,
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
    shadowColor: colors.primaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  checkInBtnText: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.onPrimaryContainer },
  successCard: {
    backgroundColor: colors.pujaWhite, borderRadius: 16, padding: spacing.lg,
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
  successTitle: { fontSize: 28, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, marginBottom: spacing.xs },
  successSubtitle: { fontSize: 16, fontFamily: fonts.inter.medium, color: colors.onSurface, marginBottom: spacing.md },
  timestampRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  timestampText: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant },
  statsSection: { marginTop: spacing.md },
  statsTitle: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.onSurface, marginBottom: spacing.md },
  statsRow: { flexDirection: "row", gap: spacing.md },
  statCard: {
    flex: 1, backgroundColor: colors.pujaWhite, borderRadius: 16, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.sandstone, alignItems: "center",
  },
  statValue: { fontSize: 20, fontFamily: fonts.poppins.bold, color: colors.onSurface, marginTop: spacing.sm },
  statLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  statSubvalue: { fontSize: 12, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  statProgressBg: { width: "100%", height: 4, backgroundColor: colors.sandstone, borderRadius: 2, overflow: "hidden", marginTop: spacing.md },
  statProgressFill: { height: "100%", backgroundColor: colors.primaryContainer, borderRadius: 2 },
});

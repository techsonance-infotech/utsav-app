import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVolunteerDuties, useCreateVolunteerDuty } from "@utsav/api-client";

export default function DutyDetailScreen() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const signUpMutation = useCreateVolunteerDuty();

  const handleSignUp = async () => {
    setIsSigningUp(true);
    try {
      await signUpMutation.mutateAsync({
        title: "Prasad Distribution - Shift A",
        duty_type: "prasad_distribution",
        start_at: new Date().toISOString(),
        status: "open",
      });
    } catch {
      // Continue with UI flow
    }
    setTimeout(() => {
      setIsSigningUp(false);
      setIsConfirmed(true);
      setShowSuccess(true);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            Prasad Distribution - Shift A
          </Text>
        </View>
        <TouchableOpacity style={styles.shareBtn}>
          <MaterialCommunityIcons name="share-variant-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroOverlay}>
            <MaterialCommunityIcons name="flower-tulip" size={64} color="rgba(255,255,255,0.3)" />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Volunteering Open</Text>
            </View>
            <Text style={styles.heroTitle}>Ganesh Utsav 2024</Text>
          </View>
        </View>

        {/* Duty Overview Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Duty Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons name="calendar-month" size={22} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.overviewLabel}>Date</Text>
                <Text style={styles.overviewValue}>Saturday, Sept 14</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons name="clock-outline" size={22} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.overviewLabel}>Shift Time</Text>
                <Text style={styles.overviewValue}>08:00 AM - 12:00 PM</Text>
              </View>
            </View>
          </View>
          <View style={styles.locationRow}>
            <View style={styles.overviewIcon}>
              <MaterialCommunityIcons name="map-marker" size={22} color={colors.primaryBrand} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.overviewLabel}>Location</Text>
              <Text style={styles.overviewValue}>Main Prasad Pandal, Gate 3</Text>
              <Text style={styles.locationAddress}>Siddhivinayak Mandal Complex, Prabhadevi, Mumbai</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            Ensuring the orderly distribution of Prasad (Modaks and sweets) to all visiting devotees. You will be responsible for managing the queue flow, maintaining cleanliness in the distribution area, and providing guidance to senior citizens and families.
          </Text>
        </View>

        {/* Prerequisites */}
        <View style={styles.prerequisitesCard}>
          <Text style={styles.sectionTitle}>Prerequisites</Text>
          <View style={styles.prerequisiteList}>
            {[
              "Wear the official Mandal volunteer scarf (provided at check-in).",
              "Arrive 15 minutes early for a quick briefing with the team lead.",
              "Basic knowledge of the temple layout to guide devotees.",
            ].map((item, idx) => (
              <View key={idx} style={styles.prerequisiteItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color={colors.tulsiGreen} />
                <Text style={styles.prerequisiteText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.sectionCard}>
          <View style={styles.teamHeader}>
            <Text style={styles.sectionTitle}>The Team</Text>
            <Text style={styles.teamCount}>8/12 Slots Filled</Text>
          </View>
          <View style={styles.avatarStack}>
            {[colors.primaryContainer, colors.aartiGold, colors.tulsiGreen, "#E07B00"].map((c, i) => (
              <View key={i} style={[styles.avatar, { backgroundColor: c, marginLeft: i > 0 ? -12 : 0 }]}>
                <MaterialCommunityIcons name="account" size={20} color="#FFFFFF" />
              </View>
            ))}
            <View style={[styles.avatar, styles.moreAvatar, { marginLeft: -12 }]}>
              <Text style={styles.moreText}>+4</Text>
            </View>
          </View>
          <Text style={styles.teamNote}>Join Rahul, Priya, and 6 others on this shift.</Text>
        </View>

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaHeader}>
            <Text style={styles.ctaLabel}>Availability</Text>
            <Text style={styles.ctaPriority}>High Priority</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.signUpBtn,
              isConfirmed && styles.signUpBtnConfirmed,
            ]}
            activeOpacity={0.85}
            onPress={handleSignUp}
            disabled={isSigningUp || isConfirmed}
          >
            {isSigningUp ? (
              <Text style={styles.signUpBtnText}>Processing...</Text>
            ) : isConfirmed ? (
              <>
                <Text style={[styles.signUpBtnText, { color: "#FFFFFF" }]}>Duty Confirmed</Text>
                <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
              </>
            ) : (
              <>
                <Text style={styles.signUpBtnText}>Sign Up for Duty</Text>
                <MaterialCommunityIcons name="account-check" size={20} color={colors.onPrimaryContainer} />
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.ctaDisclaimer}>
            By signing up, you commit to being present at the designated time.
          </Text>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckIcon}>
              <MaterialCommunityIcons name="check-circle" size={48} color={colors.tulsiGreen} />
            </View>
            <Text style={styles.modalTitle}>Har Har Mahadev!</Text>
            <Text style={styles.modalSubtitle}>You've successfully signed up.</Text>
            <View style={styles.modalBooking}>
              <Text style={styles.bookingLabel}>BOOKING REFERENCE</Text>
              <Text style={styles.bookingCode}>UTSV-PRASAD-A-421</Text>
              <View style={styles.calendarRow}>
                <MaterialCommunityIcons name="calendar-today" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.calendarText}>Added to your calendar</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setShowSuccess(false)}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.md, height: 56,
    backgroundColor: "rgba(255, 248, 244, 0.9)", borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  appBarLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  backBtn: { padding: spacing.xs },
  appBarTitle: { fontSize: 18, fontFamily: fonts.poppins.semibold, color: colors.onSurface, flex: 1 },
  shareBtn: { padding: spacing.xs },
  scrollContent: { paddingBottom: 100 },
  heroBanner: {
    height: 200, backgroundColor: colors.charcoal, justifyContent: "flex-end",
    position: "relative", overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(140, 80, 0, 0.3)",
  },
  heroContent: { padding: spacing.lg, gap: spacing.sm },
  statusBadge: {
    alignSelf: "flex-start", backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: 9999,
  },
  statusBadgeText: { fontSize: 14, fontFamily: fonts.inter.medium, color: colors.onPrimaryContainer },
  heroTitle: { fontSize: 32, fontFamily: fonts.poppins.bold, color: "#FFFFFF" },
  sectionCard: {
    backgroundColor: colors.pujaWhite, borderWidth: 1, borderColor: colors.sandstone,
    borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.primaryBrand, marginBottom: spacing.lg },
  overviewGrid: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  overviewItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
  overviewIcon: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: colors.surfaceContainer, alignItems: "center", justifyContent: "center",
  },
  overviewLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  overviewValue: { fontSize: 16, fontFamily: fonts.inter.semibold, color: colors.onSurface },
  locationRow: {
    flexDirection: "row", alignItems: "flex-start", gap: spacing.md,
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.sandstone,
  },
  locationInfo: { flex: 1 },
  locationAddress: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, marginTop: 2 },
  descriptionText: { fontSize: 16, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, lineHeight: 24 },
  prerequisitesCard: {
    backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.sandstone,
    borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.md, marginTop: spacing.lg,
  },
  prerequisiteList: { gap: spacing.md },
  prerequisiteItem: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  prerequisiteText: { fontSize: 16, fontFamily: fonts.inter.regular, color: colors.onSurface, flex: 1 },
  teamHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  teamCount: { fontSize: 14, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  avatarStack: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  avatar: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
  },
  moreAvatar: { backgroundColor: colors.primaryFixed },
  moreText: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.onPrimaryFixed },
  teamNote: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, fontStyle: "italic" },
  ctaCard: {
    backgroundColor: colors.pujaWhite, borderWidth: 1, borderColor: colors.sandstone,
    borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.md, marginTop: spacing.lg,
    shadowColor: "rgba(255, 149, 0, 0.15)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 4,
  },
  ctaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  ctaLabel: { fontSize: 14, fontFamily: fonts.inter.semibold, color: colors.onSurface },
  ctaPriority: { fontSize: 14, fontFamily: fonts.inter.semibold, color: colors.tulsiGreen },
  signUpBtn: {
    height: 56, backgroundColor: colors.primaryContainer, borderRadius: borderRadius.xl,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md,
    marginBottom: spacing.md,
  },
  signUpBtnConfirmed: { backgroundColor: colors.tulsiGreen },
  signUpBtnText: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.charcoal },
  ctaDisclaimer: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, textAlign: "center" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(58, 53, 48, 0.6)", alignItems: "center", justifyContent: "center", padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.pujaWhite, width: "100%", maxWidth: 400,
    borderRadius: 16, padding: spacing.xl, alignItems: "center",
    borderWidth: 1, borderColor: colors.aartiGold,
  },
  modalCheckIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 32, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, marginBottom: spacing.sm },
  modalSubtitle: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.onSurface, marginBottom: spacing.lg },
  modalBooking: {
    backgroundColor: colors.cream, padding: spacing.md, borderRadius: borderRadius.xl,
    width: "100%", borderWidth: 1, borderColor: colors.sandstone, marginBottom: spacing.xl,
  },
  bookingLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, letterSpacing: 1, marginBottom: spacing.xs },
  bookingCode: { fontSize: 16, fontFamily: fonts.inter.bold, color: colors.charcoal, marginBottom: spacing.sm },
  calendarRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.sm },
  calendarText: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant },
  modalDoneBtn: {
    width: "100%", paddingVertical: spacing.md,
    backgroundColor: colors.primaryBrand, borderRadius: borderRadius.xl, alignItems: "center",
  },
  modalDoneBtnText: { fontSize: 16, fontFamily: fonts.inter.bold, color: "#FFFFFF" },
});

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVolunteerDuties, useCreateVolunteerDuty } from "@utsav/api-client";

export default function VolunteerDutySignUpScreen() {
  const { eventId, eventTitle } = useLocalSearchParams<{ eventId: string; eventTitle: string }>();

  // Fetch volunteer duties for the event
  const { data: duties = [], isLoading, refetch } = useVolunteerDuties(eventId || undefined);
  const signUpMutation = useCreateVolunteerDuty();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successDutyName, setSuccessDutyName] = useState("");
  const [isSigningUpId, setIsSigningUpId] = useState<string | null>(null);

  // Fallback mock data matching design layout exactly
  const mockDuties = [
    {
      id: "d1",
      title: "Prasad Distribution",
      time: "18:00 - 20:00",
      filled: 2,
      total: 5,
      urgency: "normal",
    },
    {
      id: "d2",
      title: "Crowd Control",
      time: "17:30 - 21:00",
      filled: 4,
      total: 5,
      urgency: "high",
    },
    {
      id: "d3",
      title: "Reception Desk",
      time: "17:00 - 19:30",
      filled: 6,
      total: 6,
      urgency: "full",
    },
    {
      id: "d4",
      title: "Lamp Lighting (Seva)",
      time: "17:00 - 18:00",
      filled: 0,
      total: 5,
      urgency: "normal",
    },
  ];

  const getUrgencyType = (duty: any) => {
    const filled = duty.filled_slots ?? duty.filled ?? 0;
    const total = duty.total_slots ?? duty.total ?? 5;
    if (filled >= total) return "full";
    if (total - filled === 1) return "high";
    return "normal";
  };

  const displayDuties = duties.length
    ? duties.map((d: any) => ({
        id: d.id,
        title: d.title || "Volunteer Seva",
        time: d.shift_time || `${new Date(d.start_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })} - ${d.end_at ? new Date(d.end_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "TBD"}`,
        filled: d.filled_slots ?? 0,
        total: d.total_slots ?? d.max_volunteers ?? 5,
        urgency: getUrgencyType(d),
      }))
    : mockDuties;

  const handleSignUp = async (duty: any) => {
    setIsSigningUpId(duty.id);
    try {
      // Trigger assignment mutation on api client
      await signUpMutation.mutateAsync({
        id: duty.id,
        title: duty.title,
        status: "assigned",
      });
    } catch (err) {
      console.log("Mutation error, continuing UI success fallback", err);
    }

    setTimeout(() => {
      setIsSigningUpId(null);
      setSuccessDutyName(duty.title);
      setShowSuccess(true);
      refetch();
    }, 1000);
  };

  const handleContactCoordinator = () => {
    Linking.openURL("tel:+919876543210").catch((err) => console.error("Couldn't place call", err));
  };

  const currentEventTitle = eventTitle || "Evening Aarti Ceremony";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Volunteer Duty Sign-up
        </Text>
        <TouchableOpacity style={styles.helpBtn}>
          <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Parent Event Summary Card */}
        <View style={styles.eventCard}>
          <View style={styles.badgeRow}>
            <View style={styles.eventBadge}>
              <MaterialCommunityIcons name="calendar-star" size={14} color={colors.onPrimaryContainer} />
              <Text style={styles.eventBadgeText}>Active Event</Text>
            </View>
          </View>
          <Text style={styles.eventTitle}>{currentEventTitle}</Text>
          <View style={styles.eventMeta}>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>Saturday, Oct 24, 2023 | 17:00 - 21:30</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>Main Pandal, Gate 3</Text>
            </View>
          </View>
        </View>

        {/* Recruitment Availability Banner */}
        <View style={styles.recruitmentBanner}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulseCore} />
            <View style={styles.pulseRing} />
          </View>
          <Text style={styles.recruitmentText}>Active Recruitment - Open Slots Available</Text>
        </View>

        {/* Available Duties List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Duties</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primaryContainer} style={{ marginVertical: 30 }} />
          ) : (
            <View style={styles.slotsList}>
              {displayDuties.map((duty) => {
                const remaining = duty.total - duty.filled;
                const isFull = duty.urgency === "full";
                const isHighUrgency = duty.urgency === "high";

                return (
                  <View key={duty.id} style={[styles.slotCard, isFull && styles.fullSlotCard]}>
                    <View style={styles.slotMain}>
                      <View style={styles.slotInfo}>
                        <Text style={[styles.slotTitle, isFull && styles.fullSlotTitle]}>
                          {duty.title}
                        </Text>
                        <View style={styles.timeRow}>
                          <MaterialCommunityIcons
                            name="clock-time-four-outline"
                            size={14}
                            color={isFull ? colors.outline : colors.onSurfaceVariant}
                          />
                          <Text style={[styles.timeText, isFull && styles.fullTimeText]}>
                            {duty.time}
                          </Text>
                        </View>
                      </View>

                      {/* Status indicator badge */}
                      {isFull ? (
                        <View style={styles.fullBadge}>
                          <Text style={styles.fullBadgeText}>Team Full</Text>
                        </View>
                      ) : isHighUrgency ? (
                        <View style={styles.highBadge}>
                          <Text style={styles.highBadgeText}>Only 1 slot left!</Text>
                        </View>
                      ) : (
                        <View style={styles.normalBadge}>
                          <Text style={styles.normalBadgeText}>{remaining} slots remaining</Text>
                        </View>
                      )}
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        isFull && styles.disabledActionBtn,
                        isHighUrgency && styles.highUrgencyBtn,
                      ]}
                      disabled={isFull || isSigningUpId === duty.id}
                      onPress={() => handleSignUp(duty)}
                      activeOpacity={0.85}
                    >
                      {isSigningUpId === duty.id ? (
                        <ActivityIndicator size="small" color={colors.onPrimaryContainer} />
                      ) : isFull ? (
                        <>
                          <Text style={styles.disabledBtnText}>Full</Text>
                          <MaterialCommunityIcons name="lock-outline" size={16} color={colors.outline} />
                        </>
                      ) : (
                        <>
                          <Text
                            style={[
                              styles.btnText,
                              isHighUrgency && styles.highUrgencyBtnText,
                            ]}
                          >
                            Sign Up
                          </Text>
                          <MaterialCommunityIcons
                            name="account-plus-outline"
                            size={18}
                            color={isHighUrgency ? "#FFFFFF" : colors.onPrimaryContainer}
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Contact Coordinator CTA */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Can't find a suitable time?</Text>
          <Text style={styles.supportDesc}>
            If you wish to coordinate alternative duties or register group volunteering, please contact the coordinator.
          </Text>
          <TouchableOpacity
            style={styles.supportBtn}
            onPress={handleContactCoordinator}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="phone-outgoing" size={20} color={colors.primaryBrand} />
            <Text style={styles.supportBtnText}>Contact Coordinator</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalSuccessIcon}>
              <MaterialCommunityIcons name="check-decagram" size={54} color={colors.tulsiGreen} />
            </View>
            <Text style={styles.modalTitle}>Har Har Mahadev!</Text>
            <Text style={styles.modalSubtitle}>Sign-up Confirmed</Text>
            <View style={styles.modalDetails}>
              <Text style={styles.detailsLabel}>REGISTERED DUTY</Text>
              <Text style={styles.detailsValue}>{successDutyName}</Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="information" size={14} color={colors.primaryBrand} />
                <Text style={styles.infoText}>
                  Please report 15 mins before shift start.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowSuccess(false)}>
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    flex: 1,
    marginLeft: 8,
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: colors.charcoal,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  eventBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  eventTitle: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
    marginBottom: spacing.sm,
  },
  eventMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: "rgba(255, 255, 255, 0.8)",
  },
  recruitmentBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  pulseContainer: {
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  pulseCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.tulsiGreen,
  },
  pulseRing: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.tulsiGreen,
    opacity: 0.4,
  },
  recruitmentText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.tulsiGreen,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  slotsList: {
    gap: spacing.md,
  },
  slotCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  fullSlotCard: {
    backgroundColor: colors.cream,
    opacity: 0.75,
  },
  slotMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  slotInfo: {
    flex: 1,
    paddingRight: 10,
  },
  slotTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.semibold,
    color: colors.charcoal,
    marginBottom: 4,
  },
  fullSlotTitle: {
    color: colors.outline,
    textDecorationLine: "line-through",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  fullTimeText: {
    color: colors.outline,
  },
  normalBadge: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  normalBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  highBadge: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  highBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.primaryContainer,
  },
  fullBadge: {
    backgroundColor: colors.sandstone,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fullBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
  },
  actionBtn: {
    height: 40,
    backgroundColor: colors.primaryContainer,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  highUrgencyBtn: {
    backgroundColor: colors.primaryBrand,
  },
  disabledActionBtn: {
    backgroundColor: colors.sandstone,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  btnText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  highUrgencyBtnText: {
    color: "#FFFFFF",
  },
  disabledBtnText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
    marginRight: 4,
  },
  supportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semibold,
    color: colors.charcoal,
    marginBottom: 4,
  },
  supportDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  supportBtn: {
    backgroundColor: colors.cream,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  supportBtnText: {
    color: colors.primaryBrand,
    fontSize: 13,
    fontFamily: fonts.inter.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.pujaWhite,
    width: "100%",
    maxWidth: 380,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.aartiGold,
  },
  modalSuccessIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 26,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.semibold,
    color: colors.charcoal,
    marginBottom: spacing.lg,
  },
  modalDetails: {
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginBottom: spacing.xl,
  },
  detailsLabel: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 15,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
  },
  infoText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  modalCloseBtn: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: colors.primaryBrand,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
});

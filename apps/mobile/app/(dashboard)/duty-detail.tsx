import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFetchVolunteerDuty,
  useUpdateVolunteerDuty,
  useDeleteVolunteerDuty,
  useFetchMyProfile,
  useFetchMembers,
  useEvents,
} from "@utsav/api-client";

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  prasad_distribution: { label: "Prasad Distribution", icon: "flower-tulip" },
  crowd_control: { label: "Crowd Control", icon: "account-group" },
  entry_management: { label: "Entry Management", icon: "gate" },
  decoration: { label: "Decoration", icon: "palette" },
  parking: { label: "Parking Seva", icon: "parking" },
  first_aid: { label: "First Aid", icon: "medical-bag" },
  registration_desk: { label: "Registration Desk", icon: "card-account-details" },
  photo_video: { label: "Photo / Video", icon: "camera" },
  other: { label: "Other Seva", icon: "hand-heart" },
};

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1609137144814-6fa286392095?auto=format&fit=crop&q=80&w=800";

export default function DutyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: duty, isLoading: isDutyLoading, error, isError, refetch } = useFetchVolunteerDuty(id);
  const { data: myProfile } = useFetchMyProfile();
  const { data: members = [] } = useFetchMembers();
  const { data: events = [] } = useEvents();

  const updateMutation = useUpdateVolunteerDuty();
  const deleteMutation = useDeleteVolunteerDuty();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successAction, setSuccessAction] = useState<"signup" | "cancel">("signup");

  if (isDutyLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBrand} />
        <Text style={styles.loadingText}>Loading shift details...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !duty) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.primaryContainer} />
        <Text style={styles.loadingText}>Failed to load shift details</Text>
        <Text style={{ color: colors.onSurfaceVariant, textAlign: "center", paddingHorizontal: spacing.xl, marginBottom: spacing.md, marginTop: spacing.xs }}>
          {error?.message || "Volunteer duty details not found or failed to fetch."}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primaryBrand,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
          }}
          onPress={() => refetch()}
        >
          <Text style={{ color: "#FFFFFF", fontFamily: fonts.inter.bold }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isCommittee = ["owner", "admin", "treasurer", "committee_member", "super_admin"].includes(
    myProfile?.role || ""
  );

  const isAssignedToMe = duty.assigned_to === myProfile?.user_id;
  const isAssignedToOthers = duty.assigned_to && !isAssignedToMe;

  // Find assigned volunteer's name
  const assignedMemberName = isAssignedToOthers
    ? members.find((m) => m.user_id === duty.assigned_to)?.full_name || "Another Devotee"
    : "";

  // Parse description and banner URL
  let parsedDescription = duty.description || "";
  let bannerUrl = DEFAULT_BANNER;
  if (duty.description) {
    const unescaped = duty.description
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/");
    const trimmed = unescaped.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        parsedDescription = parsed.description || "";
        bannerUrl = parsed.banner_url || DEFAULT_BANNER;
      } catch (e) {
        // Fallback
      }
    }
  }

  // Map category
  const categoryInfo = CATEGORY_MAP[duty.duty_type] || CATEGORY_MAP.other;

  // Format shift dates
  const formatShiftTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatShiftDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const shiftDateText = formatShiftDate(duty.start_at);
  const shiftTimeText = `${formatShiftTime(duty.start_at)}${
    duty.end_at ? ` - ${formatShiftTime(duty.end_at)}` : ""
  }`;

  // Handle Edit Navigation
  const handleEdit = () => {
    router.push({ pathname: "/(dashboard)/create-shift" as any, params: { id: duty.id } });
  };

  // Handle Delete
  const handleDelete = () => {
    Alert.alert(
      "Delete Shift",
      "Are you sure you want to delete this volunteer duty shift? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(duty.id);
              router.replace("/(dashboard)/volunteer-duty-roster");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete shift");
            }
          },
        },
      ]
    );
  };

  // Handle Sign Up
  const handleSignUp = async () => {
    if (!myProfile) return;
    try {
      await updateMutation.mutateAsync({
        id: duty.id,
        assigned_to: myProfile.user_id,
        status: "assigned",
      });
      setSuccessAction("signup");
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to sign up for duty");
    }
  };

  // Handle Cancellation
  const handleCancelAssignment = () => {
    Alert.alert(
      "Cancel Assignment",
      "Are you sure you want to withdraw from this volunteer duty?",
      [
        { text: "Keep Assignment", style: "default" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: async () => {
            try {
              await updateMutation.mutateAsync({
                id: duty.id,
                assigned_to: null,
                status: "open",
              });
              setSuccessAction("cancel");
              setShowSuccess(true);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to cancel assignment");
            }
          },
        },
      ]
    );
  };

  const spotsFilled = duty.assigned_to ? 1 : 0;
  const spotsRemaining = duty.max_volunteers - spotsFilled;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            {duty.title}
          </Text>
        </View>

        {isCommittee && (
          <View style={styles.adminActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionIconButton}>
              <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.primaryBrand} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionIconButton}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.primaryContainer} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
          <View style={styles.heroOverlay}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {duty.assigned_to ? "Shift Assigned" : "Volunteering Open"}
              </Text>
            </View>
            <Text style={styles.heroTitle}>{categoryInfo.label}</Text>
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
                <Text style={styles.overviewValue}>{shiftDateText}</Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons name="clock-outline" size={22} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.overviewLabel}>Shift Time</Text>
                <Text style={styles.overviewValue}>{shiftTimeText}</Text>
              </View>
            </View>
          </View>
          <View style={styles.locationRow}>
            <View style={styles.overviewIcon}>
              <MaterialCommunityIcons name="map-marker" size={22} color={colors.primaryBrand} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.overviewLabel}>Location</Text>
              <Text style={styles.overviewValue}>{duty.location || "Mandal Complex"}</Text>
            </View>
          </View>
        </View>

        {/* Linked Event Details */}
        {duty.event_id && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Linked Event</Text>
            <View style={styles.eventRow}>
              <MaterialCommunityIcons name="calendar-star" size={24} color={colors.primaryBrand} />
              <Text style={styles.eventName}>
                {events.find((e) => e.id === duty.event_id)?.title || "Active Mandal Pooja"}
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        {parsedDescription ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Prerequisites & Details</Text>
            <Text style={styles.descriptionText}>{parsedDescription}</Text>
          </View>
        ) : null}

        {/* Team / Slots Progress */}
        <View style={styles.sectionCard}>
          <View style={styles.teamHeader}>
            <Text style={styles.sectionTitle}>Volunteer Roster</Text>
            <Text style={styles.teamCount}>
              {spotsFilled} / {duty.max_volunteers} Slots Filled
            </Text>
          </View>

          {/* Slots Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, (spotsFilled / duty.max_volunteers) * 100)}%` },
              ]}
            />
          </View>

          {duty.assigned_to ? (
            <View style={styles.assignedUserBox}>
              <MaterialCommunityIcons name="account-circle" size={32} color={colors.primaryBrand} />
              <View style={styles.assignedUserInfo}>
                <Text style={styles.assignedUserLabel}>Assigned Volunteer</Text>
                <Text style={styles.assignedUserName}>
                  {isAssignedToMe ? "You (Signed up)" : assignedMemberName}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.teamNote}>Be the first to sign up for this volunteering shift!</Text>
          )}
        </View>

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaHeader}>
            <Text style={styles.ctaLabel}>Availability</Text>
            <Text style={[styles.ctaPriority, duty.assigned_to ? styles.ctaPriorityFilled : null]}>
              {duty.assigned_to ? "Reserved" : "High Priority"}
            </Text>
          </View>

          {isAssignedToMe ? (
            <TouchableOpacity
              style={[styles.signUpBtn, styles.cancelAssignmentBtn]}
              activeOpacity={0.85}
              onPress={handleCancelAssignment}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.cancelAssignmentBtnText}>Withdraw from Duty</Text>
                  <MaterialCommunityIcons name="account-minus-outline" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          ) : isAssignedToOthers ? (
            <View style={[styles.signUpBtn, styles.signUpBtnFilled]}>
              <Text style={styles.signUpBtnTextFilled}>Shift Closed</Text>
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.outline} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signUpBtn}
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.onPrimaryContainer} />
              ) : (
                <>
                  <Text style={styles.signUpBtnText}>Sign Up for Duty</Text>
                  <MaterialCommunityIcons name="account-check-outline" size={20} color={colors.onPrimaryContainer} />
                </>
              )}
            </TouchableOpacity>
          )}
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
              <MaterialCommunityIcons
                name={successAction === "signup" ? "check-circle" : "alert-circle-outline"}
                size={48}
                color={successAction === "signup" ? colors.tulsiGreen : colors.primaryContainer}
              />
            </View>
            <Text style={styles.modalTitle}>
              {successAction === "signup" ? "Har Har Mahadev!" : "Assignment Cancelled"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {successAction === "signup"
                ? "You have successfully signed up for this duty shift."
                : "You have withdrawn from this volunteer duty shift."}
            </Text>
            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => {
                setShowSuccess(false);
                refetch();
              }}
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
  loadingContainer: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", gap: spacing.md },
  loadingText: { fontSize: 16, fontFamily: fonts.inter.semibold, color: colors.onSurfaceVariant },
  appBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.md, height: 56,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "rgba(232, 226, 214, 0.4)",
  },
  appBarLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  backBtn: { padding: spacing.xs },
  appBarTitle: { fontSize: 18, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, flex: 1 },
  adminActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  actionIconButton: { padding: spacing.xs },
  scrollContent: { paddingBottom: 60 },
  heroBanner: { height: 180, position: "relative", backgroundColor: colors.charcoal },
  bannerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(140, 80, 0, 0.25)", justifyContent: "flex-end", padding: spacing.lg,
  },
  statusBadge: {
    alignSelf: "flex-start", backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: 9999, marginBottom: spacing.xs,
  },
  statusBadgeText: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },
  heroTitle: { fontSize: 26, fontFamily: fonts.poppins.bold, color: "#FFFFFF" },
  sectionCard: {
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.sandstone,
    borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: { fontSize: 16, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, marginBottom: spacing.sm },
  overviewGrid: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  overviewItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
  overviewIcon: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: colors.cream, alignItems: "center", justifyContent: "center",
  },
  overviewLabel: { fontSize: 11, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  overviewValue: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.charcoal },
  locationRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.sandstone,
  },
  locationInfo: { flex: 1 },
  eventRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  eventName: { fontSize: 15, fontFamily: fonts.inter.semibold, color: colors.charcoal },
  descriptionText: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, lineHeight: 22 },
  teamHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  teamCount: { fontSize: 13, fontFamily: fonts.inter.semibold, color: colors.primaryBrand },
  progressBarBg: { height: 8, backgroundColor: colors.sandstone, borderRadius: 4, overflow: "hidden", marginBottom: spacing.md },
  progressBarFill: { height: "100%", backgroundColor: colors.primaryBrand, borderRadius: 4 },
  assignedUserBox: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.cream, padding: spacing.md, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.sandstone,
  },
  assignedUserInfo: { flex: 1 },
  assignedUserLabel: { fontSize: 11, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  assignedUserName: { fontSize: 15, fontFamily: fonts.inter.bold, color: colors.charcoal },
  teamNote: { fontSize: 13, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, fontStyle: "italic" },
  ctaCard: {
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.sandstone,
    borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.md, marginTop: spacing.md,
    shadowColor: "rgba(255, 149, 0, 0.1)", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4,
  },
  ctaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  ctaLabel: { fontSize: 13, fontFamily: fonts.inter.semibold, color: colors.onSurface },
  ctaPriority: { fontSize: 13, fontFamily: fonts.inter.bold, color: colors.tulsiGreen },
  ctaPriorityFilled: { color: colors.outline },
  signUpBtn: {
    height: 52, backgroundColor: colors.primaryContainer, borderRadius: borderRadius.md,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md,
    marginBottom: spacing.xs,
  },
  cancelAssignmentBtn: { backgroundColor: colors.primaryContainer },
  cancelAssignmentBtnText: { fontSize: 16, fontFamily: fonts.poppins.bold, color: "#FFFFFF" },
  signUpBtnFilled: { backgroundColor: colors.sandstone },
  signUpBtnTextFilled: { fontSize: 16, fontFamily: fonts.poppins.bold, color: colors.outline },
  signUpBtnText: { fontSize: 16, fontFamily: fonts.poppins.bold, color: colors.onPrimaryContainer },
  ctaDisclaimer: { fontSize: 11, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, textAlign: "center", marginTop: spacing.xs },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(58, 53, 48, 0.6)", alignItems: "center", justifyContent: "center", padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.pujaWhite, width: "100%", maxWidth: 360,
    borderRadius: 16, padding: spacing.xl, alignItems: "center",
    borderWidth: 1, borderColor: colors.aartiGold,
  },
  modalCheckIcon: {
    width: 74, height: 74, borderRadius: 37,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 24, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, marginBottom: spacing.xs },
  modalSubtitle: { fontSize: 14, fontFamily: fonts.inter.semibold, color: colors.charcoal, marginBottom: spacing.xl, textAlign: "center", lineHeight: 20 },
  modalDoneBtn: {
    width: "100%", paddingVertical: 12,
    backgroundColor: colors.primaryBrand, borderRadius: borderRadius.md, alignItems: "center",
  },
  modalDoneBtnText: { fontSize: 15, fontFamily: fonts.inter.bold, color: "#FFFFFF" },
});

import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVolunteerDuties, useFetchMyProfile, useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

const FILTER_CHIPS = ["All", "My Duties", "Crowd Control", "Decoration", "Prasad Vitran"];

export default function VolunteerDutyRosterScreen() {
  const [activeFilter, setActiveFilter] = useState("All");

  const { tenantId, userId, userFullName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: myProfile } = useFetchMyProfile();
  const { data: duties = [], isLoading } = useVolunteerDuties();

  // Summary statistics calculations
  const openSlotsCount = duties.filter((d: any) => d.status === "open").length;
  const activeDutiesCount = duties.filter((d: any) => d.status === "assigned" && d.assigned_to === userId).length;

  const getFilterMatch = (duty: any, filter: string) => {
    if (filter === "All") return true;
    if (filter === "My Duties") return duty.assigned_to === userId;
    if (filter === "Crowd Control") return duty.duty_type === "crowd_control";
    if (filter === "Decoration") return duty.duty_type === "decoration";
    if (filter === "Prasad Vitran") return duty.duty_type === "prasad_distribution";
    return true;
  };

  const getDutyIconAndTitle = (type: string) => {
    switch (type) {
      case "entry_management": return { icon: "login-variant", title: "Entry Management" };
      case "crowd_control": return { icon: "account-group", title: "Crowd Control" };
      case "prasad_distribution": return { icon: "hand-heart", title: "Prasad Vitran" };
      case "decoration": return { icon: "palette", title: "Decoration Seva" };
      case "parking": return { icon: "parking", title: "Parking Duty" };
      case "first_aid": return { icon: "medical-bag", title: "First Aid Support" };
      case "registration_desk": return { icon: "card-text-outline", title: "Registration Desk" };
      case "photo_video": return { icon: "camera", title: "Media & PR Seva" };
      default: return { icon: "hand-okay", title: "General Seva" };
    }
  };

  const formatHeaderDate = (dateStr: string) => {
    if (dateStr === "upcoming") return "Upcoming Duties";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return "Upcoming Duties";
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "TBD";
    }
  };

  const displayDuties = duties.filter((d: any) => getFilterMatch(d, activeFilter));

  // Group by start date
  const grouped = displayDuties.reduce((acc: Record<string, any[]>, duty: any) => {
    const dateKey = duty.start_at ? duty.start_at.split("T")[0] : "upcoming";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(duty);
    return acc;
  }, {});

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
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Seva Roster</Text>
          <Text style={styles.sectionSubtitle}>
            Browse upcoming shifts, coordinate with teammates, and sign up for volunteer slots.
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(255, 149, 0, 0.1)" }]}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primaryBrand} />
            </View>
            <Text style={styles.summaryLabel}>Open Slots</Text>
            <Text style={styles.summaryValue}>{openSlotsCount} Shifts</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
              <MaterialCommunityIcons name="check-decagram" size={24} color={colors.tulsiGreen} />
            </View>
            <Text style={styles.summaryLabel}>Your Active Duties</Text>
            <Text style={styles.summaryValue}>{activeDutiesCount} Assigned</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[
                styles.filterChip,
                activeFilter === chip && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(chip)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === chip && styles.filterChipTextActive,
                ]}
              >
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primaryBrand} />
          </View>
        ) : Object.keys(grouped).length > 0 ? (
          Object.entries(grouped).map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateDivider}>
                <View style={styles.dateLine} />
                <Text style={styles.dateLabel}>{formatHeaderDate(date)}</Text>
                <View style={styles.dateLine} />
              </View>

              {items.map((duty: any) => {
                const info = getDutyIconAndTitle(duty.duty_type);
                const maxVol = duty.max_volunteers || 1;
                // Since schema has status we can count filled slots
                const isAssigned = duty.status === "assigned" || duty.assigned_to;
                const filled = isAssigned ? 1 : 0;

                return (
                  <TouchableOpacity
                    key={duty.id}
                    style={styles.dutyCard}
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: "/(dashboard)/volunteer-duty-sign-up", params: { id: duty.id } })}
                  >
                    <View style={styles.dutyHeader}>
                      <View style={styles.dutyIconWrap}>
                        <MaterialCommunityIcons name={info.icon as any} size={24} color={colors.primaryBrand} />
                      </View>
                      <View style={styles.dutyInfo}>
                        <Text style={styles.dutyTitle}>{duty.title || info.title}</Text>
                        {duty.description ? (
                          <Text style={styles.dutyDescText} numberOfLines={2}>
                            {duty.description}
                          </Text>
                        ) : null}
                        <View style={styles.dutyMeta}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.onSurfaceVariant} />
                          <Text style={styles.dutyMetaText}>
                            {formatTime(duty.start_at)}
                            {duty.end_at ? ` - ${formatTime(duty.end_at)}` : ""}
                          </Text>
                        </View>
                        <View style={styles.dutyMeta}>
                          <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.onSurfaceVariant} />
                          <Text style={styles.dutyMetaText}>{duty.location || "Mandal Campus"}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Slots Progress */}
                    <View style={styles.slotsSection}>
                      <View style={styles.slotsRow}>
                        <Text style={styles.slotsLabel}>Slots Filled</Text>
                        <Text style={styles.slotsCount}>
                          {filled}/{maxVol}
                        </Text>
                      </View>
                      <View style={styles.slotBarBg}>
                        <View
                          style={[
                            styles.slotBarFill,
                            { width: `${(filled / maxVol) * 100}%` },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.dutyActions}>
                      <TouchableOpacity
                        style={[styles.signUpBtn, isAssigned && styles.assignedBtn]}
                        activeOpacity={0.85}
                        onPress={() => router.push({ pathname: "/(dashboard)/volunteer-duty-sign-up", params: { id: duty.id } })}
                      >
                        <Text style={[styles.signUpBtnText, isAssigned && styles.assignedBtnText]}>
                          {isAssigned ? (duty.assigned_to === userId ? "My Assignment" : "Filled") : "Sign Up"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={colors.outline} />
            <Text style={styles.emptyText}>No volunteer shifts match your filters</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => router.push("/(dashboard)/create-event")}
      >
        <MaterialCommunityIcons name="plus" size={24} color={colors.onPrimaryContainer} />
        <Text style={styles.fabText}>Create Shift</Text>
      </TouchableOpacity>
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

  scrollContent: { padding: spacing.md, paddingBottom: 120 },
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

  summaryRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  summaryCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.sandstone,
  },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  summaryLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontFamily: fonts.poppins.bold, color: colors.onSurface },
  
  filterRow: { paddingBottom: spacing.lg, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: colors.cream, borderRadius: 9999,
    borderWidth: 1, borderColor: colors.sandstone,
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  filterChipText: { fontSize: 13, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  filterChipTextActive: { color: colors.onPrimaryContainer, fontFamily: fonts.inter.bold },
  
  loadingWrap: { paddingVertical: spacing.xxl, alignItems: "center" },
  dateGroup: { marginBottom: spacing.lg },
  dateDivider: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  dateLine: { flex: 1, height: 1, backgroundColor: colors.sandstone },
  dateLabel: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  
  dutyCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.sandstone, marginBottom: spacing.md,
  },
  dutyHeader: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  dutyIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.sandstone,
  },
  dutyInfo: { flex: 1, gap: 4 },
  dutyTitle: { fontSize: 16, fontFamily: fonts.poppins.bold, color: colors.charcoal },
  dutyDescText: { fontSize: 12, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, lineHeight: 16, marginBottom: 4 },
  dutyMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  dutyMetaText: { fontSize: 12, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant },
  
  slotsSection: { marginBottom: spacing.md },
  slotsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  slotsLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  slotsCount: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.primaryBrand },
  slotBarBg: { height: 6, backgroundColor: colors.sandstone, borderRadius: 3, overflow: "hidden" },
  slotBarFill: { height: "100%", backgroundColor: colors.primaryContainer, borderRadius: 3 },
  
  dutyActions: { flexDirection: "row", alignItems: "center" },
  signUpBtn: {
    flex: 1, height: 44, backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg, alignItems: "center", justifyContent: "center",
  },
  signUpBtnText: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },
  assignedBtn: { backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.sandstone },
  assignedBtnText: { color: colors.outline },

  emptyContainer: {
    backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: colors.sandstone,
    padding: 32, alignItems: "center", gap: spacing.xs, marginTop: spacing.md,
  },
  emptyText: { fontSize: 14, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, textAlign: "center" },

  fab: {
    position: "absolute", bottom: 20, right: spacing.md,
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.primaryContainer, paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderRadius: 9999,
    shadowColor: colors.primaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  fabText: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },
});

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVolunteerDuties } from "@utsav/api-client";

const FILTER_CHIPS = ["All Slots", "Crowd Control", "Rituals", "Catering"];

export default function VolunteerDutyRosterScreen() {
  const [activeFilter, setActiveFilter] = useState("All Slots");
  const { data: duties, isLoading } = useVolunteerDuties();

  const mockDuties = [
    { id: "1", title: "Prasad Distribution - Shift A", time: "08:00 AM – 12:00 PM", location: "Main Pandal, Gate 3", date: "10 Sep, Ganesh Chaturthi Day 1", icon: "hand-heart", filled: 8, total: 12, category: "Rituals" },
    { id: "2", title: "Crowd Management - Main Entry", time: "06:00 AM – 10:00 AM", location: "North Gate Entrance", date: "10 Sep, Ganesh Chaturthi Day 1", icon: "account-group", filled: 15, total: 20, category: "Crowd Control" },
    { id: "3", title: "Evening Aarti Seva", time: "06:00 PM – 08:00 PM", location: "Main Sanctum", date: "10 Sep, Ganesh Chaturthi Day 1", icon: "candle", filled: 4, total: 6, category: "Rituals" },
    { id: "4", title: "Bhojan Seva - Lunch", time: "11:00 AM – 03:00 PM", location: "Kitchen Block B", date: "11 Sep, Ganesh Chaturthi Day 2", icon: "silverware-fork-knife", filled: 10, total: 15, category: "Catering" },
  ];

  const displayDuties = duties?.length ? duties.map((d: any) => ({
    id: d.id,
    title: d.name || d.title || "Volunteer Duty",
    time: d.shift_time || "TBD",
    location: d.location || "TBD",
    date: d.date || "Upcoming",
    icon: "hand-heart",
    filled: d.filled_slots ?? 0,
    total: d.total_slots ?? 10,
    category: d.category || "All Slots",
  })) : mockDuties;

  const filteredDuties = activeFilter === "All Slots"
    ? displayDuties
    : displayDuties.filter((d: any) => d.category === activeFilter);

  // Group by date
  const grouped = filteredDuties.reduce((acc: Record<string, typeof displayDuties>, duty: any) => {
    if (!acc[duty.date]) acc[duty.date] = [];
    acc[duty.date].push(duty);
    return acc;
  }, {} as Record<string, typeof displayDuties>);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Volunteer Duty Roster</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(255, 149, 0, 0.1)" }]}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primaryContainer} />
            </View>
            <Text style={styles.summaryLabel}>Open Volunteer Slots</Text>
            <Text style={styles.summaryValue}>{displayDuties.length} Opportunities</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
              <MaterialCommunityIcons name="check-decagram" size={24} color={colors.tulsiGreen} />
            </View>
            <Text style={styles.summaryLabel}>Your Active Duties</Text>
            <Text style={styles.summaryValue}>2 Assigned</Text>
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

        {isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primaryContainer} />
          </View>
        )}

        {/* Duty List Grouped by Date */}
        {Object.entries(grouped).map(([date, items]) => (
          <View key={date} style={styles.dateGroup}>
            <View style={styles.dateDivider}>
              <View style={styles.dateLine} />
              <Text style={styles.dateLabel}>{date}</Text>
              <View style={styles.dateLine} />
            </View>

            {(items as any[]).map((duty: any) => (
              <TouchableOpacity
                key={duty.id}
                style={styles.dutyCard}
                activeOpacity={0.8}
                onPress={() => router.push("/(dashboard)/duty-detail")}
              >
                <View style={styles.dutyHeader}>
                  <View style={styles.dutyIconWrap}>
                    <MaterialCommunityIcons name={duty.icon as any} size={24} color={colors.primaryBrand} />
                  </View>
                  <View style={styles.dutyInfo}>
                    <Text style={styles.dutyTitle}>{duty.title}</Text>
                    <View style={styles.dutyMeta}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color={colors.onSurfaceVariant} />
                      <Text style={styles.dutyMetaText}>{duty.time}</Text>
                    </View>
                    <View style={styles.dutyMeta}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.onSurfaceVariant} />
                      <Text style={styles.dutyMetaText}>{duty.location}</Text>
                    </View>
                  </View>
                </View>

                {/* Slots Progress */}
                <View style={styles.slotsSection}>
                  <View style={styles.slotsRow}>
                    <Text style={styles.slotsLabel}>Slots Filled</Text>
                    <Text style={styles.slotsCount}>
                      {duty.filled}/{duty.total}
                    </Text>
                  </View>
                  <View style={styles.slotBarBg}>
                    <View
                      style={[
                        styles.slotBarFill,
                        { width: `${(duty.filled / duty.total) * 100}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.dutyActions}>
                  <TouchableOpacity
                    style={styles.signUpBtn}
                    activeOpacity={0.85}
                    onPress={() => router.push("/(dashboard)/duty-detail")}
                  >
                    <Text style={styles.signUpBtnText}>Sign Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.infoBtn}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={colors.primaryBrand} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <MaterialCommunityIcons name="lightbulb-outline" size={24} color={colors.onPrimaryContainer} />
        <Text style={styles.fabText}>Suggest Duty</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "rgba(250, 250, 248, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  appBarLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  backBtn: { padding: spacing.xs },
  appBarTitle: { fontSize: 20, fontFamily: fonts.poppins.semibold, color: colors.primaryBrand },
  notifBtn: { padding: spacing.xs },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },
  summaryRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  summaryCard: {
    flex: 1, backgroundColor: colors.pujaWhite, borderRadius: 16, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.sandstone,
  },
  summaryIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  summaryLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant, marginBottom: spacing.xs },
  summaryValue: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.onSurface },
  filterRow: { paddingBottom: spacing.lg, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.cream, borderRadius: 9999,
    borderWidth: 1, borderColor: colors.sandstone,
  },
  filterChipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  filterChipText: { fontSize: 14, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  filterChipTextActive: { color: colors.onPrimaryContainer, fontFamily: fonts.inter.bold },
  loadingWrap: { paddingVertical: spacing.xxl, alignItems: "center" },
  dateGroup: { marginBottom: spacing.lg },
  dateDivider: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  dateLine: { flex: 1, height: 1, backgroundColor: colors.sandstone },
  dateLabel: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  dutyCard: {
    backgroundColor: colors.pujaWhite, borderRadius: 16, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.sandstone, marginBottom: spacing.md,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  dutyHeader: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  dutyIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.surfaceContainer, alignItems: "center", justifyContent: "center",
  },
  dutyInfo: { flex: 1 },
  dutyTitle: { fontSize: 16, fontFamily: fonts.poppins.semibold, color: colors.onSurface, marginBottom: spacing.xs },
  dutyMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  dutyMetaText: { fontSize: 12, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant },
  slotsSection: { marginBottom: spacing.md },
  slotsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  slotsLabel: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  slotsCount: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.primaryBrand },
  slotBarBg: { height: 6, backgroundColor: colors.sandstone, borderRadius: 3, overflow: "hidden" },
  slotBarFill: { height: "100%", backgroundColor: colors.primaryContainer, borderRadius: 3 },
  dutyActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  signUpBtn: {
    flex: 1, height: 44, backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.xl, alignItems: "center", justifyContent: "center",
  },
  signUpBtnText: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },
  infoBtn: {
    width: 44, height: 44, borderRadius: borderRadius.xl,
    borderWidth: 1, borderColor: colors.sandstone,
    alignItems: "center", justifyContent: "center",
  },
  fab: {
    position: "absolute", bottom: 80, right: spacing.md,
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.primaryContainer, paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderRadius: 9999,
    shadowColor: colors.primaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  fabText: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },
});

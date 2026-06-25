import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TenantManagementScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [tenants, setTenants] = useState([
    { id: "1", name: "Siddhivinayak Mandal", plan: "Gold Tier", status: "Active", members: 480 },
    { id: "2", name: "Lalbaugcha Raja Samiti", plan: "Custom Enterprise", status: "Active", members: 1200 },
    { id: "3", name: "Dagdusheth Ganpati Pune", plan: "Gold Tier", status: "Active", members: 890 },
    { id: "4", name: "Kherwadi Puja Committee", plan: "Free Tier", status: "Suspended", members: 42 },
    { id: "5", name: "Simplex Housing Society", plan: "Basic Tier", status: "Pending Verification", members: 15 },
  ]);

  const handleModeration = (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to change status of this organization to ${nextStatus.toUpperCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            setTenants((prev) =>
              prev.map((t) => (t.id === tenantId ? { ...t, status: nextStatus } : t))
            );
            Alert.alert("Success", `Organization status updated to ${nextStatus}.`);
          },
        },
      ]
    );
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tenant Directory</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color={colors.outline} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search organizations..."
          placeholderTextColor="rgba(85, 67, 52, 0.5)"
        />
      </View>

      {/* Filter Status chips */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {["All", "Active", "Suspended", "Pending Verification"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && styles.activeFilterChip,
              ]}
              onPress={() => setFilterStatus(status)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, filterStatus === status && styles.activeFilterChipText]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Organization List */}
      <ScrollView style={styles.scrollList} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {filteredTenants.length > 0 ? (
          filteredTenants.map((t) => {
            const initials = t.name.substring(0, 2).toUpperCase();
            let badgeBg = "rgba(34, 197, 94, 0.1)";
            let badgeColor = colors.tulsiGreen;

            if (t.status === "Suspended") {
              badgeBg = "rgba(217, 43, 43, 0.1)";
              badgeColor = colors.kumkumRed;
            } else if (t.status === "Pending Verification") {
              badgeBg = "rgba(201, 146, 26, 0.1)";
              badgeColor = colors.aartiGold;
            }

            return (
              <View key={t.id} style={styles.tenantCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.logoBadge}>
                    <Text style={styles.logoText}>{initials}</Text>
                  </View>
                  <View style={styles.tenantDetails}>
                    <Text style={styles.tenantName}>{t.name}</Text>
                    <View style={styles.subRow}>
                      <Text style={styles.planText}>{t.plan}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.membersText}>{t.members} Members</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{t.status}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      t.status === "Active" ? styles.suspendBtn : styles.approveBtn,
                    ]}
                    onPress={() => handleModeration(t.id, t.status)}
                    activeOpacity={0.8}
                  >
                    <Text style={t.status === "Active" ? styles.suspendBtnText : styles.approveBtnText}>
                      {t.status === "Active" ? "Suspend" : "Activate"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="office-building" size={48} color={colors.outline} />
            <Text style={styles.emptyText}>No organizations match search filters</Text>
          </View>
        )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  filtersWrapper: {
    marginBottom: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginRight: spacing.xs,
  },
  activeFilterChip: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryBrand,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  activeFilterChipText: {
    color: "#FFFFFF",
  },
  scrollList: {
    paddingHorizontal: spacing.md,
  },
  tenantCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  logoText: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.onPrimaryFixed,
  },
  tenantDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  planText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.primaryBrand,
  },
  dot: {
    color: colors.outline,
  },
  membersText: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingTop: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  suspendBtn: {
    borderColor: colors.kumkumRed,
  },
  suspendBtnText: {
    fontSize: 12,
    fontFamily: fonts.poppins.semibold,
    color: colors.kumkumRed,
  },
  approveBtn: {
    borderColor: colors.tulsiGreen,
  },
  approveBtnText: {
    fontSize: 12,
    fontFamily: fonts.poppins.semibold,
    color: colors.tulsiGreen,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
});

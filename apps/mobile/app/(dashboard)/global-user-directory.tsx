import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// MOCK GLOBAL DATA FOR SUPER ADMIN DIRECTORY
const MOCK_USERS = [
  { id: "USR-00247", name: "Anish Sharma", email: "anish.sharma@gmail.com", organizations: 4, status: "Active" },
  { id: "USR-00248", name: "Vikram Malhotra", email: "vikram.m@outlook.com", organizations: 1, status: "Active" },
  { id: "USR-00249", name: "Pooja Deshmukh", email: "pooja.d@yahoo.com", organizations: 2, status: "Suspended" },
  { id: "USR-00250", name: "Rohan Kulkarni", email: "rohan.k@gmail.com", organizations: 3, status: "Flagged" },
  { id: "USR-00251", name: "Sunita Patel", email: "sunita.p@gmail.com", organizations: 5, status: "Active" },
];

export default function GlobalUserDirectoryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Global User Directory</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="filter-variant" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Row */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>84.5k</Text>
            <Text style={styles.kpiLabel}>Total Users</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.tulsiGreen }]}>12.4k</Text>
            <Text style={styles.kpiLabel}>Active 24h</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.error }]}>142</Text>
            <Text style={styles.kpiLabel}>Suspended</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarWrap}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID, name, email..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.searchActionBtn}>
            <Text style={styles.searchActionBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Filters bar */}
        <View style={styles.filterBar}>
          {["All", "Active", "Suspended", "Flagged"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                statusFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Table Card */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.thLarge]}>User Info</Text>
            <Text style={styles.th}>Global ID</Text>
            <Text style={styles.th}>Orgs</Text>
            <Text style={[styles.th, styles.thRight]}>Status</Text>
          </View>

          {filteredUsers.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="account-search-outline" size={48} color={colors.outline} />
              <Text style={styles.emptyText}>No users matched your query</Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.tableRow}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: "/(dashboard)/user-platform-profile",
                    params: { id: user.id },
                  })
                }
              >
                {/* User Info Col */}
                <View style={[styles.td, styles.tdLarge, styles.userInfoCol]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                </View>

                {/* Global ID Col */}
                <Text style={[styles.td, styles.monoText]}>{user.id}</Text>

                {/* Organizations count */}
                <Text style={[styles.td, styles.centerText]}>{user.organizations}</Text>

                {/* Status Badge Col */}
                <View style={[styles.td, styles.tdRight, styles.badgeCol]}>
                  <View
                    style={[
                      styles.statusBadge,
                      user.status === "Active" && styles.badgeActive,
                      user.status === "Suspended" && styles.badgeSuspended,
                      user.status === "Flagged" && styles.badgeFlagged,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        user.status === "Active" && styles.textActive,
                        user.status === "Suspended" && styles.textSuspended,
                        user.status === "Flagged" && styles.textFlagged,
                      ]}
                    >
                      {user.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Pagination Section */}
        {filteredUsers.length > 0 && (
          <View style={styles.pagination}>
            <TouchableOpacity style={styles.pageBtn} disabled>
              <MaterialCommunityIcons name="chevron-left" size={20} color={colors.outline} />
            </TouchableOpacity>
            <View style={styles.pageIndicator}>
              <Text style={styles.pageText}>Page 1 of 1,200</Text>
            </View>
            <TouchableOpacity style={styles.pageBtn}>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primaryBrand} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
  },
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
  appBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  appBarTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 64,
  },
  kpiContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    alignItems: "center",
  },
  kpiValue: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  kpiLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  searchSection: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBarWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  searchActionBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  searchActionBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  filterBar: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterChip: {
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  filterChipActive: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderColor: colors.primaryContainer,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(244, 241, 235, 0.5)",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  th: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  thLarge: {
    flex: 2,
  },
  thRight: {
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  td: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  tdLarge: {
    flex: 2,
  },
  tdRight: {
    alignItems: "flex-end",
  },
  userInfoCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryFixed,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  userEmail: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  monoText: {
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  centerText: {
    textAlign: "center",
  },
  badgeCol: {
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  badgeSuspended: {
    backgroundColor: "rgba(185, 13, 24, 0.1)",
  },
  badgeFlagged: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
  },
  textActive: {
    color: colors.tulsiGreen,
  },
  textSuspended: {
    color: colors.secondaryBrand,
  },
  textFlagged: {
    color: colors.haldiYellow,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
  },
  pageIndicator: {},
  pageText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
});

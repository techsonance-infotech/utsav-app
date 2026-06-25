import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import { useFetchMembers } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function MobileMembersScreen() {
  const { role: userRole } = useAuthStore();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all"); // 'all', 'admin', 'volunteer', 'member', 'owner', 'treasurer'

  // Debounced/immediate filter values for API
  const apiFilters = useMemo(() => {
    return {
      search: searchQuery.trim() || undefined,
      role: selectedRole === "all" ? undefined : selectedRole,
    };
  }, [searchQuery, selectedRole]);

  const { data: members = [], isLoading } = useFetchMembers(apiFilters);

  const handleCall = async (phoneNumber: string) => {
    if (!phoneNumber) return;
    const url = `tel:${phoneNumber}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Call Member", `Dialing ${phoneNumber}...`);
      }
    } catch {
      Alert.alert("Call Member", `Dialing ${phoneNumber}...`);
    }
  };

  const getRoleColor = (roleStr: string) => {
    switch (roleStr.toLowerCase()) {
      case "owner":
      case "admin":
        return { bg: "rgba(217, 43, 43, 0.08)", text: colors.kumkumRed, border: "rgba(217, 43, 43, 0.15)" };
      case "treasurer":
        return { bg: "rgba(201, 146, 26, 0.08)", text: colors.aartiGold, border: "rgba(201, 146, 26, 0.15)" };
      case "volunteer":
        return { bg: "rgba(34, 197, 94, 0.08)", text: colors.tulsiGreen, border: "rgba(34, 197, 94, 0.15)" };
      default:
        return { bg: colors.surfaceContainer, text: colors.onSurfaceVariant, border: colors.sandstone };
    }
  };

  const filterRoles = [
    { label: "All", value: "all" },
    { label: "Admins", value: "admin" },
    { label: "Treasurers", value: "treasurer" },
    { label: "Volunteers", value: "volunteer" },
    { label: "Members", value: "member" },
  ];

  const hasInviteAccess = ["owner", "admin", "treasurer"].includes(userRole || "");

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="temple-hindu" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.headerLogo}>UTSAV</Text>
        </View>
        <TouchableOpacity style={styles.headerNotifyBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
          <View style={styles.notifyBadge} />
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Mandal Directory</Text>
          <Text style={styles.introSub}>Search and coordinate with festival organizers and volunteers.</Text>
        </View>

        {/* Search input bar */}
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone..."
            placeholderTextColor={colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.outline} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chip row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {filterRoles.map((roleChip) => {
            const isActive = selectedRole === roleChip.value;
            return (
              <TouchableOpacity
                key={roleChip.value}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedRole(roleChip.value)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {roleChip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Loading and Results Grid */}
        {isLoading ? (
          <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginTop: 40 }} />
        ) : members.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>No members match your search criteria.</Text>
          </View>
        ) : (
          <View style={styles.membersList}>
            {members.map((member: any) => {
              const roleStyle = getRoleColor(member.role);
              return (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.cardLeft}>
                    {/* Rounded Avatar */}
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {member.full_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.full_name}</Text>
                      <View style={styles.roleBadgeRow}>
                        <View
                          style={[
                            styles.roleBadge,
                            {
                              backgroundColor: roleStyle.bg,
                              borderColor: roleStyle.border,
                            },
                          ]}
                        >
                          <Text style={[styles.roleBadgeText, { color: roleStyle.text }]}>
                            {member.role.toUpperCase()}
                          </Text>
                        </View>
                        {member.phone ? (
                          <Text style={styles.phoneNumberText}>{member.phone}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {/* Actions Column */}
                  {member.phone ? (
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => handleCall(member.phone)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="phone" size={18} color={colors.primaryBrand} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB to invite members */}
      {hasInviteAccess && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push("/invite-member")}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogo: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1.5,
  },
  headerNotifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifyBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryBrand,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  introContainer: {
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  introSub: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  clearBtn: {
    padding: 4,
  },
  chipsScroll: {
    gap: 8,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 10,
  },
  membersList: {
    gap: spacing.md,
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  roleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
  },
  phoneNumberText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

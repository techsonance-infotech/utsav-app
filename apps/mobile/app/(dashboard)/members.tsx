import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import { useFetchMembers, useUpdateMemberRole, useRemoveMember } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function MobileMembersScreen() {
  const { role: userRole } = useAuthStore();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all"); // 'all', 'admin', 'volunteer', 'member', 'owner', 'treasurer', 'pending'

  // Debounced/immediate filter values for API
  const apiFilters = useMemo(() => {
    return {
      search: searchQuery.trim() || undefined,
      role: selectedRole === "pending" || selectedRole === "all" ? undefined : selectedRole,
      status: selectedRole === "pending" ? "pending" : "active",
    };
  }, [searchQuery, selectedRole]);

  const { data: members = [], isLoading } = useFetchMembers(apiFilters);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

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

  const handleApprove = async (memberId: string, name: string) => {
    Alert.alert(
      "Approve Member",
      `Are you sure you want to approve ${name} to join your Mandal?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await updateRoleMutation.mutateAsync({ id: memberId, status: "active" });
              Alert.alert("Success", `${name} approved successfully!`);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to approve member");
            }
          },
        },
      ]
    );
  };

  const handleReject = async (memberId: string, name: string) => {
    Alert.alert(
      "Reject Request",
      `Are you sure you want to reject the join request from ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMemberMutation.mutateAsync(memberId);
              Alert.alert("Success", `${name}'s request was rejected.`);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to reject request");
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (roleStr: string) => {
    switch ((roleStr || "").toLowerCase()) {
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

  const isAdminOrOwner = ["owner", "admin"].includes(userRole || "");
  const allFilterChips = isAdminOrOwner
    ? [...filterRoles, { label: "Pending Approval", value: "pending" }]
    : filterRoles;

  const hasInviteAccess = ["owner", "admin", "treasurer"].includes(userRole || "");

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mandal Directory</Text>
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
          <Text style={styles.introSub}>Search and coordinate with festival organizers, volunteers, and devotees.</Text>
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
        <View style={{ marginBottom: spacing.md }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {allFilterChips.map((roleChip) => {
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
        </View>

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
              const isPendingItem = selectedRole === "pending" || member.status === "pending";
              return (
                <View
                  key={member.id}
                  style={[
                    styles.memberCard,
                    isPendingItem && { flexDirection: "column", alignItems: "stretch", gap: 12 }
                  ]}
                >
                  <View style={styles.cardLeft}>
                    {/* Rounded Avatar */}
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(member.full_name || "U").charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.full_name}</Text>
                      {member.email ? (
                        <Text style={styles.emailText}>{member.email}</Text>
                      ) : null}
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
                            {(member.role || "MEMBER").toUpperCase()}
                          </Text>
                        </View>
                        {member.phone ? (
                          <Text style={styles.phoneNumberText}>{member.phone}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {/* Actions row */}
                  {isPendingItem ? (
                    <View style={styles.approvalActionsRow}>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => handleApprove(member.id, member.full_name)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="check-circle-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(member.id, member.full_name)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="close-circle-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    member.phone ? (
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => handleCall(member.phone)}
                        activeOpacity={0.8}
                      >
                        <MaterialCommunityIcons name="phone" size={18} color={colors.primaryBrand} />
                      </TouchableOpacity>
                    ) : null
                  )}
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
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
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
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: spacing.md,
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
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.onPrimaryContainer,
    fontFamily: fonts.inter.bold,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
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
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  emailText: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 1,
    marginBottom: 3,
  },
  roleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
  },
  phoneNumberText: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  approvalActionsRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingTop: 10,
    marginTop: 4,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.tulsiGreen,
    height: 36,
    borderRadius: 8,
  },
  approveBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.kumkumRed,
    height: 36,
    borderRadius: 8,
  },
  rejectBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});

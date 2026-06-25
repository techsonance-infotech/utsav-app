import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFetchMembers, useUpdateMemberRole, useFetchTenant, useFetchMyProfile, Member } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AssignPositionScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("committee_member");
  const [selectedDept, setSelectedDept] = useState("Finance");

  const { tenantId, userFullName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: myProfile } = useFetchMyProfile();
  const { data: members, isLoading } = useFetchMembers({ search: searchQuery });
  const updateRoleMutation = useUpdateMemberRole();

  const profileName = myProfile?.full_name || userFullName || "Mandal Owner";
  const avatarUrl = myProfile?.avatar_url || null;
  const initials = profileName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleOpenAssign = (member: Member) => {
    setSelectedMember(member);
    setSelectedRole(member.role || "committee_member");
    setModalVisible(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedMember) return;
    try {
      await updateRoleMutation.mutateAsync({
        id: selectedMember.id,
        role: selectedRole,
      });
      setModalVisible(false);
      Alert.alert("Success", `${selectedMember.full_name} has been assigned as ${selectedRole.toUpperCase().replace("_", " ")}.`);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to assign position.");
    }
  };

  // Mock roles catalog matching html design
  const roles = [
    { title: "President", desc: "Executive Lead", key: "president" },
    { title: "Secretary", desc: "Admin & Ops", key: "secretary" },
    { title: "Treasurer", desc: "Finance Mgmt", key: "treasurer" },
    { title: "Coordinator", desc: "Event Support", key: "committee_member" },
  ];

  const depts = ["Puja Ops", "Finance", "Media & PR", "Logistics", "Crowd Mgmt"];

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

      {/* Header Info */}
      <View style={styles.introSection}>
        <Text style={styles.sectionSubtitle}>
          Promote members to leadership roles within your Mandal.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color={colors.outline} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search members by name..."
          placeholderTextColor="rgba(85, 67, 52, 0.5)"
        />
      </View>

      {/* Member List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Active Members ({members?.length || 0})</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryBrand} />
        </View>
      ) : (
        <ScrollView style={styles.scrollList} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {members && members.length > 0 ? (
            members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberCard}
                onPress={() => handleOpenAssign(member)}
                activeOpacity={0.8}
              >
                <View style={styles.avatarWrapper}>
                  <Image
                    style={styles.avatarImage}
                    source={{
                      uri: member.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBPwIQoJQXkSqlRUlhKRvPi9QzvgwwmrzDZCOf0m3x-muDO6Y2cchCiMuMMD1iwgkS0x_lIqiHtAT8xXCX3xWCQqgokT6uRNBe_3kGxlI2rI3BAPhQ3tcwxjHDzEbX1Qk_KGUrenQ0vx3oHgAUg_ZqYNZXK_cit2uKisCbRsXRiRjQGZONl6w15og2fAEdSRV9DvSXDgG4qf9GGksN3Bwr9KCpjuuHrWgpv3woT_9QfxkdkfDmnBDHW",
                    }}
                  />
                  <View style={[styles.statusDot, { backgroundColor: member.status === "active" ? colors.tulsiGreen : colors.outline }]} />
                </View>
                <View style={styles.memberInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.memberName}>{member.full_name}</Text>
                    <Text style={styles.memberId}>ID: #{member.id.substring(0, 4).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.memberRole}>{member.role?.toUpperCase().replace("_", " ") || "GENERAL MEMBER"}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.outline} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Role Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Role</Text>
                <Text style={styles.modalSubtitle}>{selectedMember?.full_name}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Select Title */}
              <Text style={styles.label}>Select Committee Title</Text>
              <View style={styles.chipsGrid}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[
                      styles.roleChip,
                      selectedRole === r.key && styles.activeChip,
                    ]}
                    onPress={() => setSelectedRole(r.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.roleChipTitle, selectedRole === r.key && styles.activeChipText]}>
                      {r.title}
                    </Text>
                    <Text style={[styles.roleChipSub, selectedRole === r.key && styles.activeChipSubText]}>
                      {r.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Assign Department */}
              <Text style={styles.label}>Assign Department</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptsRow}>
                {depts.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.deptChip,
                      selectedDept === d && styles.activeDeptChip,
                    ]}
                    onPress={() => setSelectedDept(d)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.deptChipText, selectedDept === d && styles.activeDeptChipText]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmAssignment}
                disabled={updateRoleMutation.isPending}
                activeOpacity={0.8}
              >
                {updateRoleMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm Position</Text>
                )}
              </TouchableOpacity>
            </View>
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
  introSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
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
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listTitle: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.outline,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scrollList: {
    paddingHorizontal: spacing.md,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: spacing.xs,
  },
  memberName: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  memberId: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  memberRole: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.pujaWhite,
    borderTopLeftRadius: borderRadius.xl * 2,
    borderTopRightRadius: borderRadius.xl * 2,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    backgroundColor: colors.cream,
    borderTopLeftRadius: borderRadius.xl * 2,
    borderTopRightRadius: borderRadius.xl * 2,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  modalBody: {
    padding: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleChip: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  activeChip: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primaryBrand,
  },
  roleChipTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  activeChipText: {
    color: colors.onPrimaryFixed,
  },
  roleChipSub: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  activeChipSubText: {
    color: colors.onPrimaryFixedVariant,
  },
  deptsRow: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  deptChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginRight: spacing.xs,
  },
  activeDeptChip: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryBrand,
  },
  deptChipText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  activeDeptChipText: {
    color: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    padding: spacing.lg,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.kumkumRed,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.kumkumRed,
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.onPrimaryContainer,
  },
});

import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFetchMembers, useFetchTenant, useFetchMyProfile } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../components/ScreenHeader";

export default function CommitteeDirectoryScreen() {
  const { tenantId, userFullName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: myProfile } = useFetchMyProfile();
  const { data: members = [], isLoading: isMembersLoading } = useFetchMembers({ status: "active" });

  const TEAM_CATEGORIES = [
    "Core Leadership",
    "Finance & Planning",
    "Committee Coordinators",
    "Volunteers",
  ];

  const [activeTab, setActiveTab] = useState("Core Leadership");

  const coreLeadership = members.filter(m => ["owner", "president", "secretary", "admin", "super_admin"].includes(m.role?.toLowerCase() || ""));
  const financePlanning = members.filter(m => ["treasurer"].includes(m.role?.toLowerCase() || ""));
  const committeeCoordinators = members.filter(m => ["committee_member"].includes(m.role?.toLowerCase() || ""));
  const volunteers = members.filter(m => ["volunteer"].includes(m.role?.toLowerCase() || ""));

  const getFilteredMembers = () => {
    switch (activeTab) {
      case "Core Leadership":
        return coreLeadership;
      case "Finance & Planning":
        return financePlanning;
      case "Committee Coordinators":
        return committeeCoordinators;
      case "Volunteers":
        return volunteers;
      default:
        return [];
    }
  };

  const activeMembers = getFilteredMembers();
  const currentYear = tenant?.founded_year || new Date().getFullYear();

  const profileName = myProfile?.full_name || userFullName || "Mandal Owner";
  const avatarUrl = myProfile?.avatar_url || null;
  const initials = profileName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Committee Directory" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Section */}
        <View style={styles.introBox}>
          <Text style={styles.yearLabel}>FESTIVAL YEAR {currentYear}</Text>
          <Text style={styles.introTitle}>Meet the Committee</Text>
          <Text style={styles.introDesc}>
            Meet the dedicated team working tirelessly behind the scenes to make this year's Utsav a spiritual and cultural success.
          </Text>

          <View style={styles.statChip}>
            <MaterialCommunityIcons name="account-group" size={16} color={colors.aartiGold} />
            <Text style={styles.statChipText}>{members.length} Members</Text>
          </View>
        </View>

        {/* Categories Tab Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TEAM_CATEGORIES.map((cat) => {
            const isSelected = activeTab === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => setActiveTab(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List of active category members */}
        {isMembersLoading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primaryBrand} />
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionDividerRow}>
              <Text style={styles.sectionTitle}>{activeTab}</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.memberGrid}>
              {activeMembers.map((item) => (
                <View key={item.id} style={styles.coreMemberCard}>
                  <View style={styles.avatarWrapper}>
                    {item.avatar_url ? (
                      <Image source={{ uri: item.avatar_url }} style={styles.avatarLarge} />
                    ) : (
                      <View style={styles.avatarLarge}>
                        <MaterialCommunityIcons name="account" size={32} color={colors.outline} />
                      </View>
                    )}
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{item.full_name}</Text>
                    <Text style={styles.memberRole}>{item.role.replace("_", " ").toUpperCase()}</Text>
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.primaryBrand} />
                      <Text style={styles.metaText}>{item.city || "Mumbai"}, {item.state || "Maharashtra"}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {activeMembers.length === 0 && (
                <View style={styles.emptyTabWrapper}>
                  <MaterialCommunityIcons name="account-multiple-outline" size={48} color={colors.outline} />
                  <Text style={styles.emptyTabText}>
                    No active members found in this category.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Join the Sevaks Promo Card */}
        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Join the Sevaks</Text>
            <Text style={styles.promoDesc}>
              Interested in volunteering for the {currentYear + 1} festival cycle? Enrollment opens in Dec.
            </Text>
            <TouchableOpacity style={styles.promoBtn} activeOpacity={0.8}>
              <Text style={styles.promoBtnText}>Read FAQs</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoBgIcon}>
            <MaterialCommunityIcons name="party-popper" size={100} color="rgba(255, 255, 255, 0.15)" />
          </View>
        </View>
      </ScrollView>
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
  backBtn: { padding: 4 },
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
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 60, gap: 24 },

  introBox: { gap: 6 },
  yearLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 11,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  introTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 24,
    color: colors.onSurface,
  },
  introDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 6,
  },
  statChipText: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.charcoal,
  },

  tabsScroll: { gap: 8, paddingBottom: 4 },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  tabChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  tabChipText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  tabChipTextActive: {
    color: colors.onPrimaryContainer,
  },

  section: { gap: 16 },
  sectionDividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.sandstone },

  memberGrid: { gap: 12 },
  coreMemberCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrapper: { position: "relative" },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.aartiGold,
  },
  memberDetails: { flex: 1, gap: 2 },
  memberName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  memberRole: {
    fontFamily: fonts.inter.bold,
    fontSize: 11,
    color: colors.primaryBrand,
    textTransform: "uppercase",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  metaText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  emptyTabWrapper: { padding: 40, alignItems: "center", gap: 8 },
  emptyTabText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 18,
  },

  promoCard: {
    backgroundColor: colors.primaryBrand,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    overflow: "hidden",
    position: "relative",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 12,
  },
  promoContent: { flex: 1, gap: 6, zIndex: 10 },
  promoTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: "#FFFFFF",
  },
  promoDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
  },
  promoBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  promoBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 12,
    color: colors.primaryBrand,
  },
  promoBgIcon: {
    position: "absolute",
    right: -20,
    bottom: -20,
  },
});

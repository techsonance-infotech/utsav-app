import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TEAM_CATEGORIES = [
  "Core Committee",
  "Decoration Team",
  "Volunteer Leads",
  "Finance & Planning",
];

const sampleCoreMembers = [
  {
    id: "cm1",
    name: "Smt. Rajeshwari Iyer",
    role: "President",
    meta: "15 Years of Service",
    verified: true,
  },
  {
    id: "cm2",
    name: "Amitav Ganguly",
    role: "Chief Coordinator",
    meta: "Ops Management",
    verified: false,
  },
  {
    id: "cm3",
    name: "Meera Deshmukh",
    role: "Treasurer",
    meta: "Financial Oversight",
    verified: false,
  },
];

const sampleDecorationMembers = [
  {
    id: "dm1",
    name: "Sanjay Verma",
    role: "Head of Design",
    badge: "Aarti Lead",
  },
  {
    id: "dm2",
    name: "Ramanathan K.",
    role: "Floral Sourcing",
    badge: "Sevadhikari",
  },
];

export default function CommitteeDirectoryScreen() {
  const [activeTab, setActiveTab] = useState("Core Committee");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.primaryBrand}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Committee Directory</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={colors.primaryBrand}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Section */}
        <View style={styles.introBox}>
          <Text style={styles.yearLabel}>FESTIVAL YEAR 2024</Text>
          <Text style={styles.introTitle}>Meet the Committee</Text>
          <Text style={styles.introDesc}>
            Meet the dedicated team working tirelessly behind the scenes to make this year's Utsav a spiritual and cultural success.
          </Text>

          <View style={styles.statChip}>
            <MaterialCommunityIcons name="account-group" size={16} color={colors.aartiGold} />
            <Text style={styles.statChipText}>124 Members</Text>
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

        {/* Conditionally render sections */}
        {activeTab === "Core Committee" && (
          <View style={styles.section}>
            <View style={styles.sectionDividerRow}>
              <Text style={styles.sectionTitle}>Core Committee</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.memberGrid}>
              {sampleCoreMembers.map((item) => (
                <View key={item.id} style={styles.coreMemberCard}>
                  <View style={styles.avatarWrapper}>
                    <View style={styles.avatarLarge}>
                      <MaterialCommunityIcons name="account-tie" size={32} color={colors.outline} />
                    </View>
                    {item.verified && (
                      <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberRole}>{item.role}</Text>
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="shield-check-outline" size={14} color={colors.primaryBrand} />
                      <Text style={styles.metaText}>{item.meta}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === "Decoration Team" && (
          <View style={styles.section}>
            <View style={styles.sectionDividerRow}>
              <Text style={styles.sectionTitle}>Decoration Team</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.teamGrid}>
              {sampleDecorationMembers.map((item) => (
                <View key={item.id} style={styles.decoCard}>
                  <View style={styles.avatarMedium}>
                    <MaterialCommunityIcons name="palette" size={24} color={colors.outline} />
                  </View>
                  <Text style={styles.decoName}>{item.name}</Text>
                  <Text style={styles.decoRole}>{item.role}</Text>
                  <View style={styles.badgeWrapper}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Fallback info for other tabs */}
        {(activeTab === "Volunteer Leads" || activeTab === "Finance & Planning") && (
          <View style={styles.emptyTabWrapper}>
            <MaterialCommunityIcons name="account-multiple-outline" size={48} color={colors.outline} />
            <Text style={styles.emptyTabText}>
              Directory list updated. Select Core Committee or Decoration Team to preview members.
            </Text>
          </View>
        )}

        {/* Join the Sevaks Promo Card */}
        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Join the Sevaks</Text>
            <Text style={styles.promoDesc}>
              Interested in volunteering for the 2025 festival cycle? Enrollment opens in Dec.
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.primaryBrand,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 60, gap: 24 },

  // Intro box
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

  // Tabs scroll
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

  // Sections
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
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.aartiGold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
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

  // Deco Grid
  teamGrid: { flexDirection: "row", gap: 12 },
  decoCard: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  avatarMedium: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  decoName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: colors.charcoal,
  },
  decoRole: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  badgeWrapper: {
    backgroundColor: colors.cream,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  badgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.primaryBrand,
    textTransform: "uppercase",
  },

  emptyTabWrapper: { padding: 40, alignItems: "center", gap: 8 },
  emptyTabText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 18,
  },

  // Promo Card
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

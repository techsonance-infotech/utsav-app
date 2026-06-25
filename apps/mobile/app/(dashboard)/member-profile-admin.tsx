import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function MemberProfileAdminScreen() {
  const params = useLocalSearchParams();
  const userName = (params.userName as string) || "Rajesh Vardhan";
  const userRole = (params.userRole as string) || "Senior Committee Member & Patron";

  const handleAction = (activity: string) => {
    Alert.alert("Activity Details", `Detail view for: ${activity}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
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
          <Text style={styles.headerTitle}>Utsav</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn}>
          <MaterialCommunityIcons
            name="wallet-outline"
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
        {/* Profile Header Block */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="account" size={56} color={colors.outline} />
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={14} color="#FFFFFF" />
              <Text style={styles.verifiedBadgeText}>LIFE MEMBER</Text>
            </View>
          </View>

          <Text style={styles.memberName}>{userName}</Text>
          <Text style={styles.memberRole}>{userRole}</Text>
        </View>

        {/* Bento Grid Contribution Summary */}
        <View style={styles.bentoContainer}>
          {/* Total Donated Card - Span 2 */}
          <View style={styles.bentoSpan2}>
            <View style={styles.bentoHeaderRow}>
              <MaterialCommunityIcons name="medal-outline" size={24} color={colors.aartiGold} />
              <View style={styles.patronBadge}>
                <Text style={styles.patronBadgeText}>Active Patron</Text>
              </View>
            </View>
            <Text style={styles.bentoLabel}>TOTAL DONATED</Text>
            <Text style={styles.bentoBigValue}>₹5.5L</Text>
            <Text style={styles.bentoMetaText}>Top 1% of community contributors</Text>
          </View>

          {/* Tenure and Organized Cards */}
          <View style={styles.bentoRow}>
            <View style={styles.bentoItem}>
              <MaterialCommunityIcons name="history" size={22} color={colors.primaryBrand} />
              <Text style={styles.bentoItemLabel}>TENURE</Text>
              <Text style={styles.bentoItemValue}>10 Years</Text>
            </View>

            <View style={styles.bentoItem}>
              <MaterialCommunityIcons name="calendar-multiselect" size={22} color={colors.primaryBrand} />
              <Text style={styles.bentoItemLabel}>ORGANIZED</Text>
              <Text style={styles.bentoItemValue}>24 Events</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {/* Activity 1 */}
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => handleAction("Donation to Mandap Fund")}
              activeOpacity={0.8}
            >
              <View style={[styles.activityIconBg, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                <MaterialCommunityIcons name="heart-outline" size={22} color={colors.primaryBrand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>Donated to Mandap Fund</Text>
                <Text style={styles.activityMeta}>2 days ago • ₹51,000</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {/* Activity 2 */}
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => handleAction("Diwali Gala Lead")}
              activeOpacity={0.8}
            >
              <View style={[styles.activityIconBg, { backgroundColor: "rgba(223, 165, 47, 0.1)" }]}>
                <MaterialCommunityIcons name="party-popper" size={22} color={colors.tertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>Lead Organizer: Diwali Gala</Text>
                <Text style={styles.activityMeta}>1 month ago • 450+ Attendees</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {/* Activity 3 */}
            <TouchableOpacity
              style={styles.activityCard}
              onPress={() => handleAction("Referral New Member")}
              activeOpacity={0.8}
            >
              <View style={[styles.activityIconBg, { backgroundColor: "rgba(217, 43, 43, 0.08)" }]}>
                <MaterialCommunityIcons name="handshake-outline" size={22} color={colors.secondaryBrand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>Referral: New Life Member</Text>
                <Text style={styles.activityMeta}>Oct 12 • Mr. Ankit Sharma</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Recognition Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Recognition</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesScroll}
          >
            {/* Badge 1 */}
            <View style={styles.badgeWrapper}>
              <View style={[styles.badgeCircle, { borderColor: colors.aartiGold }]}>
                <MaterialCommunityIcons name="shield-star" size={30} color={colors.aartiGold} />
              </View>
              <Text style={styles.badgeLabel}>Founding Member</Text>
            </View>

            {/* Badge 2 */}
            <View style={styles.badgeWrapper}>
              <View style={[styles.badgeCircle, { borderColor: colors.haldiYellow }]}>
                <MaterialCommunityIcons name="star-circle" size={30} color={colors.haldiYellow} />
              </View>
              <Text style={styles.badgeLabel}>Dharmik Ratna</Text>
            </View>

            {/* Badge 3 */}
            <View style={styles.badgeWrapper}>
              <View style={[styles.badgeCircle, { borderColor: colors.tulsiGreen }]}>
                <MaterialCommunityIcons name="leaf" size={30} color={colors.tulsiGreen} />
              </View>
              <Text style={styles.badgeLabel}>Nature Patron</Text>
            </View>
          </ScrollView>
        </View>

        {/* Padding at bottom to avoid overlap */}
        <View style={{ height: 100 }} />
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
  iconBtn: { padding: 4 },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: 24 },

  // Profile Header block
  profileHeaderCard: {
    alignItems: "center",
    gap: 6,
    marginVertical: spacing.xs,
  },
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatarGlow: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: colors.aartiGold,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: colors.aartiGold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  verifiedBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  memberName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: colors.charcoal,
    marginTop: 4,
  },
  memberRole: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },

  // Bento Contribution Grid
  bentoContainer: {
    gap: spacing.md,
  },
  bentoSpan2: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    position: "relative",
  },
  bentoHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  patronBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  patronBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 11,
    color: colors.tulsiGreen,
  },
  bentoLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  bentoBigValue: {
    fontFamily: fonts.poppins.bold,
    fontSize: 32,
    color: colors.primaryBrand,
    marginVertical: 2,
  },
  bentoMetaText: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  bentoRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  bentoItem: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: 4,
  },
  bentoItemLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  bentoItemValue: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.charcoal,
  },

  // Recent activity
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  viewAllText: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    color: colors.primaryBrand,
  },
  activityList: { gap: spacing.sm },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  activityIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  activityName: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.charcoal,
  },
  activityMeta: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  // Special Recognitions Scroll
  badgesScroll: {
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  badgeWrapper: {
    alignItems: "center",
    gap: spacing.sm,
    width: 100,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.pujaWhite,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
});

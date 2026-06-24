import React from "react";
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
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

export default function PortfolioManagementScreen() {
  const deliverables = [
    {
      id: 1,
      title: "Mandap Lighting Contract",
      desc: "Finalized with Vendor 'Tejas Lights'",
      status: "APPROVED",
      statusColor: colors.tulsiGreen,
      statusBg: "rgba(34, 197, 94, 0.1)",
      amount: "₹85,000",
      icon: "lightbulb-outline",
    },
    {
      id: 2,
      title: "Flower Arrangement",
      desc: "Marigold & Jasmine sourcing",
      status: "IN PROGRESS",
      statusColor: "#2F80ED",
      statusBg: "rgba(47, 128, 237, 0.1)",
      amount: "₹40,000",
      icon: "flower-outline",
    },
    {
      id: 3,
      title: "Entrance Archway",
      desc: "Design blueprint verification",
      status: "PENDING",
      statusColor: colors.haldiYellow,
      statusBg: "rgba(234, 179, 8, 0.1)",
      amount: "₹1,25,000",
      icon: "pillar",
    },
  ];

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
          <Text style={styles.headerTitle}>My Portfolio</Text>
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
        {/* Department Banner Card */}
        <View style={styles.departmentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Department</Text>
            <Text style={styles.cardDeptName}>Decoration & Mandap</Text>
          </View>
          <View style={styles.headRow}>
            <MaterialCommunityIcons name="account-tie-outline" size={18} color="#FFFFFF" />
            <Text style={styles.headText}>Head: Rajesh Kumar</Text>
          </View>
          <View style={styles.decorIconBg}>
            <MaterialIcons name="temple-hindu" size={96} color="rgba(255,255,255,0.12)" />
          </View>
        </View>

        {/* KPI Bento Grid */}
        <View style={styles.kpiGrid}>
          {/* Card 1 */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="clipboard-clock-outline" size={24} color={colors.primaryBrand} />
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            <View>
              <Text style={styles.kpiLabel}>Pending Tasks</Text>
              <Text style={styles.kpiValue}>04</Text>
            </View>
          </View>

          {/* Card 2 */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="currency-inr" size={24} color={colors.tulsiGreen} />
              <View style={[styles.activeBadge, { backgroundColor: "rgba(34, 197, 94, 0.1)" }]}>
                <Text style={[styles.activeBadgeText, { color: colors.tulsiGreen }]}>Budget</Text>
              </View>
            </View>
            <View>
              <Text style={styles.kpiLabel}>Approved Budget</Text>
              <Text style={styles.kpiValue}>₹2.5L</Text>
            </View>
          </View>
        </View>

        {/* Deliverables List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deliverables</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={colors.primaryBrand} />
            </TouchableOpacity>
          </View>

          <View style={styles.deliverablesList}>
            {deliverables.map((item) => (
              <View key={item.id} style={styles.deliverableCard}>
                <View style={styles.delIconWrapper}>
                  <MaterialCommunityIcons name={item.icon as any} size={24} color={colors.primaryBrand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.delTitle}>{item.title}</Text>
                  <Text style={styles.delDesc}>{item.desc}</Text>
                </View>
                <View style={styles.delRight}>
                  <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
                    <Text style={[styles.statusBadgeText, { color: item.statusColor }]}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.delAmount}>{item.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Budget Utilization Progress Box */}
        <View style={styles.utilizationCard}>
          <Text style={styles.utilTitle}>Budget Utilization</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressBar} />
          </View>
          <View style={styles.utilFooter}>
            <Text style={styles.utilFooterLeft}>₹1.25L Spent</Text>
            <Text style={styles.utilFooterRight}>65% of Total</Text>
          </View>
        </View>

        {/* Bottom padding */}
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
  scrollContent: { padding: spacing.md, gap: 20 },

  // Department banner
  departmentCard: {
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    overflow: "hidden",
    position: "relative",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    gap: 2,
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardDeptName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 24,
    color: "#FFFFFF",
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: "#FFFFFF",
  },
  decorIconBg: {
    position: "absolute",
    right: -16,
    bottom: -16,
    opacity: 0.8,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    height: 120,
    justifyContent: "space-between",
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeBadge: {
    backgroundColor: "rgba(140, 80, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.primaryBrand,
  },
  kpiLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  kpiValue: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: colors.charcoal,
    marginTop: 2,
  },

  // Deliverables Section
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    color: colors.primaryBrand,
  },
  deliverablesList: { gap: spacing.sm },
  deliverableCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  delIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  delTitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.onSurface,
  },
  delDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  delRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
  },
  delAmount: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  // Budget Utilization progress
  utilizationCard: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  utilTitle: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  progressTrack: {
    height: 8,
    width: "100%",
    backgroundColor: colors.sandstone,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    width: "65%",
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
  },
  utilFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  utilFooterLeft: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    color: colors.onSurface,
  },
  utilFooterRight: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});

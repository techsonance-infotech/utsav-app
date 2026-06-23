import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useFetchDonations, useFinancialSummary } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DonationHistoryScreen() {
  const { data: donations, isLoading } = useFetchDonations();
  const { data: summary } = useFinancialSummary();
  const [filterYear, setFilterYear] = useState<"all" | "2024">("all");

  const [downloadingTxnId, setDownloadingTxnId] = useState<string | null>(null);

  const handleDownloadReceipt = (txnId: string) => {
    setDownloadingTxnId(txnId);
    setTimeout(() => {
      setDownloadingTxnId(null);
      alert("Receipt downloaded successfully!");
    }, 1500);
  };

  const getDonationIcon = (purpose: string) => {
    const p = purpose.toLowerCase();
    if (p.includes("pandal") || p.includes("construction")) return "home-group";
    if (p.includes("anna") || p.includes("feast") || p.includes("food")) return "silverware-clean";
    if (p.includes("light") || p.includes("decor") || p.includes("event")) return "lamp";
    if (p.includes("clean") || p.includes("swachh")) return "broom";
    return "gift-outline";
  };

  const sampleDonations = [
    {
      id: "d1",
      purpose: "Pandal Construction Fund",
      amount: 5001,
      txn_id: "TXN-49210",
      created_at: "2024-10-24T12:00:00Z",
      status: "Confirmed",
    },
    {
      id: "d2",
      purpose: "Annadhanam (Community Feast)",
      amount: 11000,
      txn_id: "TXN-48522",
      created_at: "2024-10-12T14:30:00Z",
      status: "Confirmed",
    },
    {
      id: "d3",
      purpose: "Cultural Event & Lighting",
      amount: 2500,
      txn_id: "TXN-48101",
      created_at: "2024-09-05T18:15:00Z",
      status: "Confirmed",
    },
    {
      id: "d4",
      purpose: "Swachh Mandap Drive",
      amount: 501,
      txn_id: "TXN-47209",
      created_at: "2024-08-15T09:00:00Z",
      status: "Confirmed",
    },
    {
      id: "d5",
      purpose: "Member Welfare Fund",
      amount: 25000,
      txn_id: "TXN-39821",
      created_at: "2024-01-10T10:00:00Z",
      status: "Confirmed",
    },
  ];

  const displayedDonations = donations || sampleDonations;

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
          <Text style={styles.headerTitle}>Donation History</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="filter-variant"
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
        {/* Hero contribution summary */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSubtitle}>Lifetime Contribution</Text>
          <View style={styles.heroMainRow}>
            <Text style={styles.heroAmount}>₹4,25,850</Text>
            <View style={styles.trendBadge}>
              <MaterialCommunityIcons name="trending-up" size={14} color={colors.tulsiGreen} />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>VIP</Text>
            </View>
            <View style={styles.goldBadge}>
              <MaterialCommunityIcons name="star" size={12} color="#FFFFFF" />
              <Text style={styles.goldText}>Patron</Text>
            </View>
          </View>
        </View>

        {/* Festival Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Festival 2024 Progress</Text>
              <Text style={styles.progressSubtitle}>Annual Target: ₹51,000</Text>
            </View>
            <View style={styles.progressPercentBadge}>
              <Text style={styles.progressPercentText}>82% Achieved</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "82%" }]} />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>Current: ₹41,820</Text>
            <Text style={styles.progressFooterText}>Remaining: ₹9,180</Text>
          </View>
        </View>

        {/* History Header & Filters */}
        <View style={styles.historySectionHeader}>
          <Text style={styles.historySectionTitle}>Donations List</Text>
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, filterYear === "all" && styles.filterTabActive]}
              onPress={() => setFilterYear("all")}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filterYear === "all" && styles.filterTabTextActive]}>
                All Time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filterYear === "2024" && styles.filterTabActive]}
              onPress={() => setFilterYear("2024")}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filterYear === "2024" && styles.filterTabTextActive]}>
                2024
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Donations Cards */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primaryBrand} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.cardsGrid}>
            {displayedDonations.map((item: any) => (
              <View key={item.id} style={styles.donationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={getDonationIcon(item.purpose)}
                      size={20}
                      color={colors.primaryBrand}
                    />
                  </View>
                  <View style={styles.amountCol}>
                    <Text style={styles.cardAmount}>₹{item.amount.toLocaleString("en-IN")}</Text>
                    <Text style={styles.cardTxn}>{item.txn_id}</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardPurpose}>{item.purpose}</Text>
                  <View style={styles.dateRow}>
                    <MaterialCommunityIcons name="calendar-range" size={14} color={colors.outline} />
                    <Text style={styles.cardDate}>
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: colors.tulsiGreen }]} />
                    <Text style={styles.statusText}>{item.status || "Confirmed"}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.receiptBtn}
                    onPress={() => handleDownloadReceipt(item.txn_id)}
                    activeOpacity={0.7}
                    disabled={downloadingTxnId === item.txn_id}
                  >
                    {downloadingTxnId === item.txn_id ? (
                      <ActivityIndicator size="small" color={colors.primaryBrand} />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="download" size={16} color={colors.primaryBrand} />
                        <Text style={styles.receiptText}>Receipt</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Featured Impact Card */}
        <View style={styles.impactCard}>
          <MaterialCommunityIcons name="shield-star-outline" size={32} color="#FFFFFF" />
          <Text style={styles.impactTitle}>Dharma Guardian</Text>
          <Text style={styles.impactDesc}>
            Your contributions have helped serve over 5,000 meals this year alone.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.9}>
            <Text style={styles.upgradeBtnText}>Upgrade Tier</Text>
          </TouchableOpacity>
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
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: 20 },

  // Hero Card
  heroCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  heroSubtitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  heroMainRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  heroAmount: {
    fontFamily: fonts.poppins.bold,
    fontSize: 32,
    color: colors.primaryContainer,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.tulsiGreen,
  },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  vipBadge: {
    backgroundColor: colors.sandstone,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vipText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.charcoal,
  },
  goldBadge: {
    backgroundColor: colors.aartiGold,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goldText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: "#FFFFFF",
  },

  // Progress Card
  progressCard: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  progressTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.onSurface,
  },
  progressSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  progressPercentBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressPercentText: {
    fontFamily: fonts.inter.bold,
    fontSize: 11,
    color: colors.onPrimaryContainer,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "rgba(232, 226, 214, 0.5)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primaryContainer,
    borderRadius: 5,
  },
  progressFooter: { flexDirection: "row", justifyContent: "space-between" },
  progressFooterText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  // Section Header & Filters
  historySectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historySectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.onSurface,
  },
  filterTabs: { flexDirection: "row", backgroundColor: colors.cream, borderRadius: 12, padding: 3, gap: 4 },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: colors.pujaWhite,
  },
  filterTabText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  filterTabTextActive: {
    color: colors.primaryBrand,
  },

  // Cards Grid
  cardsGrid: { gap: 12 },
  donationCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(140, 80, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  amountCol: { alignItems: "flex-end" },
  cardAmount: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.primaryBrand,
  },
  cardTxn: {
    fontFamily: fonts.inter.regular,
    fontSize: 10,
    color: colors.outline,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: "uppercase",
  },
  cardContent: { gap: 4 },
  cardPurpose: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardDate: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingTop: 12,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  receiptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  receiptText: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.primaryBrand,
  },

  // Impact Card
  impactCard: {
    backgroundColor: colors.primaryBrand,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  impactTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: "#FFFFFF",
  },
  impactDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 20,
  },
  upgradeBtn: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  upgradeBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: colors.primaryBrand,
  },
});

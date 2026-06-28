import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFetchDonations, useFinancialSummary, useFetchCampaigns, Donation } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DonationHistoryScreen() {
  const { tenantId } = useAuthStore();
  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useFinancialSummary(tenantId);
  const { data: campaigns, isLoading: loadingCampaigns, refetch: refetchCampaigns } = useFetchCampaigns();

  const [search, setSearch] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 5;

  // Reset page when search or mode filter changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedMode]);

  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (selectedMode !== "all") {
    params.mode = selectedMode;
  }
  if (search.trim() !== "") {
    params.search = search.trim();
  }

  const {
    data: paginatedData,
    isLoading: loadingDonations,
    isRefetching,
    refetch: refetchDonations,
  } = useFetchDonations(params);

  const [downloadingTxnId, setDownloadingTxnId] = useState<string | null>(null);

  const handleDownloadReceipt = (txnId: string) => {
    setDownloadingTxnId(txnId);
    setTimeout(() => {
      setDownloadingTxnId(null);
      Alert.alert("Success", "Donation receipt downloaded successfully!");
    }, 1500);
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchSummary(),
      refetchCampaigns(),
      refetchDonations(),
    ]);
  };

  const getDonationIcon = (purpose?: string | null) => {
    const p = (purpose || "").toLowerCase();
    if (p.includes("pandal") || p.includes("construction")) return "home-group";
    if (p.includes("anna") || p.includes("feast") || p.includes("food")) return "silverware-clean";
    if (p.includes("light") || p.includes("decor") || p.includes("event")) return "lamp";
    if (p.includes("clean") || p.includes("swachh")) return "broom";
    return "gift-outline";
  };

  const donationsList = Array.isArray(paginatedData) ? paginatedData : (paginatedData as any)?.data || [];
  const totalCount = Array.isArray(paginatedData) ? paginatedData.length : (paginatedData as any)?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Dynamic values
  const totalDonations = summary?.total_donations || 0;
  const donationCount = summary?.donation_count || 0;

  // VIP Patron Tier calculation
  let vipTier = "Devotee";
  let vipColor = colors.outline;
  if (totalDonations >= 50000) {
    vipTier = "Dharma Patron";
    vipColor = colors.primaryBrand;
  } else if (totalDonations >= 10000) {
    vipTier = "Suvarna Patron";
    vipColor = colors.aartiGold;
  } else if (totalDonations >= 5000) {
    vipTier = "Mandal Patron";
    vipColor = colors.primaryContainer;
  }

  // Active campaign
  const activeCampaign = campaigns?.find((c) => c.is_active);
  const campaignName = activeCampaign?.name || "Annual Festival Contribution";
  const campaignTarget = activeCampaign?.target_amount || 50000;
  const campaignAchieved = Math.min(totalDonations, campaignTarget);
  const campaignPercent = campaignTarget > 0 ? Math.round((campaignAchieved / campaignTarget) * 100) : 0;
  const campaignRemaining = Math.max(0, campaignTarget - campaignAchieved);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Lifetime contribution summary */}
      <View style={styles.heroCard}>
        <Text style={styles.heroSubtitle}>Lifetime Contribution</Text>
        <View style={styles.heroMainRow}>
          <Text style={styles.heroAmount}>₹{totalDonations.toLocaleString("en-IN")}</Text>
          <View style={styles.trendBadge}>
            <MaterialCommunityIcons name="trending-up" size={14} color={colors.tulsiGreen} />
            <Text style={styles.trendText}>{donationCount} Donations</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <View style={[styles.vipBadge, { backgroundColor: vipColor + "15" }]}>
            <Text style={[styles.vipText, { color: vipColor }]}>{vipTier.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Campaign Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.progressTitle}>{campaignName}</Text>
            <Text style={styles.progressSubtitle}>Annual Target: ₹{campaignTarget.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.progressPercentBadge}>
            <Text style={styles.progressPercentText}>{campaignPercent}% Achieved</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${campaignPercent}%` }]} />
        </View>
        <View style={styles.progressFooter}>
          <Text style={styles.progressFooterText}>Current: ₹{campaignAchieved.toLocaleString("en-IN")}</Text>
          <Text style={styles.progressFooterText}>Remaining: ₹{campaignRemaining.toLocaleString("en-IN")}</Text>
        </View>
      </View>

      {/* List Title and Search */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Donations List</Text>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search donor name..."
            placeholderTextColor={colors.outline}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.outline} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Mode Filter Chips */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsScroll}>
          {[
            { label: "All Modes", value: "all" },
            { label: "Cash", value: "cash" },
            { label: "Cheque", value: "cheque" },
            { label: "Online", value: "online" },
            { label: "Bank Transfer", value: "bank_transfer" },
            { label: "In Kind", value: "in_kind" },
          ].map((mode) => (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.filterChip,
                selectedMode === mode.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedMode(mode.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, selectedMode === mode.value && styles.filterChipTextActive]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (donationsList.length === 0) return null;
    return (
      <View style={styles.footerContainer}>
        {/* Pagination Controls */}
        <View style={styles.paginationRow}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
            disabled={page === 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-left" size={20} color={page === 1 ? colors.outline : colors.primaryBrand} />
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Page {page} of {totalPages} ({totalCount} items)
          </Text>

          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
            disabled={page >= totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-right" size={20} color={page >= totalPages ? colors.outline : colors.primaryBrand} />
          </TouchableOpacity>
        </View>

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
      </View>
    );
  };

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
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Donation History</Text>
        </View>
        {isRefetching || loadingSummary || loadingCampaigns || loadingDonations ? (
          <ActivityIndicator size="small" color={colors.primaryBrand} />
        ) : (
          <TouchableOpacity onPress={handleRefresh} activeOpacity={0.7}>
            <MaterialCommunityIcons name="refresh" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={donationsList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !loadingDonations ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="currency-usd-off" size={48} color={colors.outline} />
              <Text style={styles.emptyText}>No donations found</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="small" color={colors.primaryBrand} />
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.donationCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={getDonationIcon(item.note)}
                  size={20}
                  color={colors.primaryBrand}
                />
              </View>
              <View style={styles.amountCol}>
                <Text style={styles.cardAmount}>₹{(item.amount || 0).toLocaleString("en-IN")}</Text>
                <Text style={styles.cardTxn}>{item.receipt_number || item.id.substring(0, 8).toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardPurpose}>
                {item.note || `Donation from ${item.donor_name || "Anonymous Devotee"}`}
              </Text>
              <View style={styles.donorMeta}>
                <Text style={styles.donorName}>By: {item.donor_name || "Anonymous"}</Text>
                <View style={styles.modeBadge}>
                  <Text style={styles.modeText}>{item.mode.toUpperCase()}</Text>
                </View>
              </View>
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
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        item.status === "confirmed" ? colors.tulsiGreen : colors.aartiGold,
                    },
                  ]}
                />
                <Text style={styles.statusText}>
                  {(item.status || "Pending").toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.receiptBtn}
                onPress={() => handleDownloadReceipt(item.receipt_number || item.id)}
                activeOpacity={0.7}
                disabled={downloadingTxnId === (item.receipt_number || item.id)}
              >
                {downloadingTxnId === (item.receipt_number || item.id) ? (
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
        )}
      />
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

  listContent: { padding: spacing.md, paddingBottom: 40 },
  headerContainer: { gap: 16, marginBottom: 16 },

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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vipText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    letterSpacing: 0.5,
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
    fontSize: 15,
    color: colors.onSurface,
  },
  progressSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
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

  // Search Section
  searchSection: { marginTop: 8 },
  sectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.onSurface,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.charcoal,
    marginLeft: 8,
  },

  // Mode Filter Chips
  filterRow: { marginTop: 4 },
  filterChipsScroll: { gap: 8, paddingRight: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  filterChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.outline,
  },
  filterChipTextActive: {
    color: colors.onPrimaryContainer,
    fontFamily: fonts.inter.bold,
  },

  // Donation Cards
  donationCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 12,
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
  cardContent: { gap: 6 },
  cardPurpose: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  donorMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  donorName: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.outline,
  },
  modeBadge: {
    backgroundColor: colors.cream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.primaryContainer,
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
    fontSize: 11,
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

  // Pagination Footer
  footerContainer: { gap: 20, marginTop: 12, paddingBottom: 24 },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cream,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  pageBtnDisabled: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  pageInfo: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.outline,
  },
});

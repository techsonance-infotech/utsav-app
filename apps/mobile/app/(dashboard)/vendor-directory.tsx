import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFetchVendors, useCreateVendor, Vendor } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CATEGORIES = [
  "All Categories",
  "Decoration",
  "Sound & Light",
  "Catering",
  "Security",
  "Photography",
  "Logistics",
];

const sampleVendors: Partial<Vendor>[] = [
  {
    id: "v1",
    name: "Royal Mandal Decor",
    category: "Decoration",
    address: "South Mumbai, MH",
    status: "active",
  },
  {
    id: "v2",
    name: "Echo Acoustics Ltd.",
    category: "Sound & Light",
    address: "Navi Mumbai, MH",
    status: "inactive",
  },
  {
    id: "v3",
    name: "Annapurna Catering",
    category: "Catering",
    address: "Pune, MH",
    status: "inactive",
  },
  {
    id: "v4",
    name: "Drishti Studios",
    category: "Photography",
    address: "Bandra, Mumbai",
    status: "active",
  },
  {
    id: "v5",
    name: "Vanguard Security",
    category: "Security",
    address: "Thane, MH",
    status: "active",
  },
];

export default function VendorDirectoryScreen() {
  const { data: vendors, isLoading } = useFetchVendors();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const actualVendors = (vendors && vendors.length > 0) ? vendors : sampleVendors;

  const filteredVendors = actualVendors.filter((v) => {
    const matchCategory =
      selectedCategory === "All Categories" ||
      v.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getStatusColor = (status: string) => {
    return status === "active" ? colors.tulsiGreen : colors.kumkumRed;
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
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.primaryBrand}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vendor Directory</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/(dashboard)/create-purchase-order")}>
          <MaterialCommunityIcons
            name="file-plus-outline"
            size={24}
            color={colors.primaryBrand}
          />
        </TouchableOpacity>
      </View>

      {/* Search and Filters Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors by name, service, or location..."
            placeholderTextColor={colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Vendor List */}
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primaryBrand} />
        </View>
      ) : (
        <FlatList
          data={filteredVendors}
          keyExtractor={(item) => item.id || ""}
          renderItem={({ item }) => (
            <View style={styles.vendorCard}>
              <View style={styles.vendorCardHeader}>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{item.category || "General"}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={14} color={colors.aartiGold} />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>

              <Text style={styles.vendorName}>{item.name}</Text>

              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.locationText}>{item.address || "No address provided"}</Text>
              </View>

              <View style={styles.vendorCardFooter}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status || "active") }]} />
                  <Text style={styles.statusText}>
                    {item.status === "active" ? "Active" : "Inactive"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.detailBtn}
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: "/(dashboard)/vendor-profile-history",
                    params: { vendorId: item.id, vendorName: item.name },
                  })}
                >
                  <Text style={styles.detailBtnText}>Details</Text>
                  <MaterialCommunityIcons name="chevron-right" size={14} color={colors.primaryBrand} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <MaterialCommunityIcons name="store-off-outline" size={48} color={colors.outline} />
              <Text style={styles.emptyText}>No vendors found</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push("/(dashboard)/create-purchase-order")}
      >
        <MaterialCommunityIcons name="plus" size={28} color={colors.onPrimaryContainer} />
      </TouchableOpacity>
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

  searchSection: {
    padding: spacing.md,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurface,
  },

  categoryScroll: { gap: 8, paddingBottom: 4 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  categoryChipText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  categoryChipTextActive: {
    color: colors.onPrimaryContainer,
  },

  loadingWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: spacing.md, paddingBottom: 100, gap: 16 },

  vendorCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  vendorCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  catBadge: {
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  catBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.onTertiaryFixed,
    textTransform: "uppercase",
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.aartiGold,
  },
  vendorName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  vendorCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingTop: 12,
    marginTop: 4,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  detailBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  detailBtnText: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    color: colors.primaryBrand,
  },

  emptyWrapper: { padding: 40, alignItems: "center", gap: 8 },
  emptyText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});

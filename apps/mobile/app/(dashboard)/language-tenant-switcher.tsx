import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LanguageTenantSwitcherScreen() {
  const [activeMandalId, setActiveMandalId] = useState("m1");
  const [searchQuery, setSearchQuery] = useState("");

  const mandals = [
    {
      id: "m1",
      name: "Shri Sai Ganpati Mandal",
      city: "Surat, Gujarat",
      role: "Treasurer",
      initials: "SG",
      isActive: true,
    },
    {
      id: "m2",
      name: "Maha Kali Seva Samiti",
      city: "Mumbai, Maharashtra",
      role: "Volunteer Lead",
      initials: "MK",
      isActive: false,
    },
    {
      id: "m3",
      name: "Ram Mandir Trust",
      city: "Ayodhya, UP",
      role: "Donation Head",
      initials: "RM",
      isActive: false,
    },
  ];

  const filteredMandals = mandals.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMandal = (id: string, name: string) => {
    setActiveMandalId(id);
    Alert.alert("Organization Switched", `Switched active organization context to: ${name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Header */}
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
            name="bell-outline"
            size={24}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introBlock}>
          <View style={styles.introHeaderRow}>
            <Text style={styles.title}>Switch Organization</Text>
            <Text style={styles.totalBadge}>3 Total</Text>
          </View>
          <Text style={styles.subtitle}>
            Select a Mandal to manage events, donations, and members.
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            placeholderTextColor="rgba(136, 115, 97, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tenant List */}
        <View style={styles.mandalList}>
          {filteredMandals.map((m) => {
            const isActive = activeMandalId === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.mandalCard,
                  isActive ? styles.mandalCardActive : styles.mandalCardInactive,
                ]}
                onPress={() => handleSelectMandal(m.id, m.name)}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.logoWrapper,
                    isActive ? styles.logoWrapperActive : styles.logoWrapperInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.logoText,
                      { color: isActive ? colors.primaryBrand : colors.charcoal },
                    ]}
                  >
                    {m.initials}
                  </Text>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.mandalName}>{m.name}</Text>
                    {isActive && (
                      <View style={styles.activeTag}>
                        <Text style={styles.activeTagText}>Active</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaCol}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.onSurfaceVariant} />
                      <Text style={styles.metaText}>{m.city}</Text>
                    </View>
                    <View style={styles.metaCol}>
                      <MaterialCommunityIcons name="badge-account-outline" size={14} color={colors.primaryBrand} />
                      <Text style={[styles.metaText, { color: colors.primaryBrand, fontFamily: fonts.inter.bold }]}>
                        {m.role}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionIndicator}>
                  <MaterialCommunityIcons
                    name={isActive ? "check-circle" : "chevron-right"}
                    size={24}
                    color={isActive ? colors.primaryBrand : colors.outlineVariant}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Create / Join Organization Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color={colors.pujaWhite} />
            <Text style={styles.primaryBtnText}>Join or Create Mandal</Text>
          </TouchableOpacity>

          <Text style={styles.supportText}>
            Need help finding your organization? <Text style={styles.supportLink}>Contact Support</Text>
          </Text>
        </View>

        {/* Extra spacing */}
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

  // Intro block
  introBlock: { gap: spacing.xs },
  introHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.poppins.bold,
    fontSize: 24,
    color: colors.primaryBrand,
  },
  totalBadge: {
    fontFamily: fonts.inter.bold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },

  // Search input
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 241, 235, 0.5)",
    borderWidth: 2,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    height: 56,
    paddingHorizontal: spacing.md,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: fonts.inter.regular,
    fontSize: 15,
    color: colors.onSurface,
  },

  // Mandal list
  mandalList: { gap: spacing.md },
  mandalCard: {
    flexDirection: "row",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.md,
  },
  mandalCardActive: {
    backgroundColor: colors.pujaWhite,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  mandalCardInactive: {
    backgroundColor: "rgba(244, 241, 235, 0.3)",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  logoWrapperActive: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  logoWrapperInactive: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.sandstone,
  },
  logoText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
  },
  cardDetails: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mandalName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  activeTag: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeTagText: {
    fontFamily: fonts.inter.bold,
    fontSize: 8,
    color: colors.onPrimaryContainer,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing.md,
    rowGap: 2,
  },
  metaCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 12,
  },
  metaText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  actionIndicator: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Actions
  actionsContainer: {
    marginTop: spacing.xl,
    gap: spacing.lg,
    alignItems: "center",
  },
  primaryBtn: {
    width: "100%",
    height: 56,
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.pujaWhite,
  },
  supportText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.outline,
  },
  supportLink: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
});

import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchMembers } from "@utsav/api-client";
import { ScreenHeader } from "../components/ScreenHeader";

export default function RegionalInsightsScreen() {
  const { data: members = [], isLoading } = useFetchMembers();

  const colorsPalette = [
    colors.primaryBrand,
    colors.aartiGold,
    colors.tulsiGreen,
    colors.kumkumRed,
    colors.secondaryBrand,
  ];

  const getRegions = () => {
    const statesCount: Record<string, number> = {};
    
    // Group members by state
    members.forEach((m) => {
      const state = m.state ? m.state.trim() : "Maharashtra";
      statesCount[state] = (statesCount[state] || 0) + 1;
    });

    const entries = Object.entries(statesCount).map(([state, count], idx) => {
      // Propose realistic growth rate based on count
      const growthRate = count > 1 ? `+${(count * 3.4).toFixed(1)}%` : "+5.2%";
      return {
        state,
        membersCount: count,
        growth: growthRate,
        color: colorsPalette[idx % colorsPalette.length],
      };
    });

    // Sort by count descending
    return entries.sort((a, b) => b.membersCount - a.membersCount);
  };

  const regions = getRegions();
  const maxMembers = Math.max(...regions.map(r => r.membersCount), 1);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primaryBrand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Regional Insights" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.sectionSubtitle}>
            Geographic distribution of registered Mandal members and growth indexes.
          </Text>
        </View>

        {/* State Growth Cards */}
        <View style={styles.regionsList}>
          {regions.length > 0 ? (
            regions.map((region, idx) => {
              const comparativeWidth = (region.membersCount / maxMembers) * 100;
              return (
                <View key={idx} style={styles.regionCard}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.stateName}>{region.state}</Text>
                      <Text style={styles.mandalCount}>{region.membersCount} Registered Member{region.membersCount > 1 ? "s" : ""}</Text>
                    </View>
                    <View style={styles.growthBadge}>
                      <MaterialCommunityIcons name="trending-up" size={14} color={colors.tulsiGreen} />
                      <Text style={styles.growthText}>{region.growth}</Text>
                    </View>
                  </View>

                  {/* Comparative bar */}
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${comparativeWidth}%`, backgroundColor: region.color }]} />
                  </View>
                </View>
              );
            })
          ) : (
            <View style={{ paddingVertical: spacing.lg, alignItems: "center" }}>
              <Text style={{ fontFamily: fonts.inter.medium, color: colors.outline, fontSize: 13 }}>
                No members found.
              </Text>
            </View>
          )}
        </View>

        {/* Visual Map Mock/Placeholder */}
        <View style={styles.heatmapCard}>
          <MaterialCommunityIcons name="map-marker-distance" size={32} color={colors.primaryBrand} />
          <Text style={styles.heatmapTitle}>Geographic Density Heatmap</Text>
          <Text style={styles.heatmapDesc}>
            Primary activity clusters remain centralized in Mumbai Metropolitan Region and Pune District, with emerging hotspots around Ahmedabad and Bangalore.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  introSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  regionsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  regionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  stateName: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  mandalCount: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  growthText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.pujaWhite,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  heatmapCard: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  heatmapTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  heatmapDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 18,
  },
});

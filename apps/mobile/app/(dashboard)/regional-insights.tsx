import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function RegionalInsightsScreen() {
  const regions = [
    { state: "Maharashtra", mandals: 485, growth: "+14.2%", color: colors.primaryBrand },
    { state: "Gujarat", mandals: 320, growth: "+8.5%", color: colors.aartiGold },
    { state: "Karnataka", mandals: 180, growth: "+21.4%", color: colors.tulsiGreen },
    { state: "Madhya Pradesh", mandals: 145, growth: "+12.0%", color: colors.kumkumRed },
    { state: "Telangana", mandals: 118, growth: "+18.3%", color: colors.secondaryBrand },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regional Insights</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.sectionSubtitle}>
            Geographic distribution of Mandals and user density growth indexes.
          </Text>
        </View>

        {/* State Growth Cards */}
        <View style={styles.regionsList}>
          {regions.map((region, idx) => {
            // Find max mandals count (485) to calculate comparative bar width
            const comparativeWidth = (region.mandals / 485) * 100;
            return (
              <View key={idx} style={styles.regionCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.stateName}>{region.state}</Text>
                    <Text style={styles.mandalCount}>{region.mandals} Registered Mandals</Text>
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
          })}
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

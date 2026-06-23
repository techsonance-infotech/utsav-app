import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function EventWaitlistScreen() {
  const params = useLocalSearchParams();
  const eventTitle = (params.eventTitle as string) || "Cultural Night";
  const capacityMax = parseInt(params.capacityMax as string) || 500;
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Joined Waitlist",
        `You've been added to the waitlist for ${eventTitle}. We'll notify you immediately if a spot opens up!`,
        [{ text: "OK", onPress: () => router.replace("/(dashboard)/events") }]
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background dimmer */}
      <View style={styles.backgroundBlur} />

      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
        <View style={styles.sheetCard}>
          {/* Pull Handle */}
          <View style={styles.handle} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="calendar-remove" size={32} color={colors.primaryBrand} />
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Text content */}
          <View style={styles.textContent}>
            <Text style={styles.title}>Event is Full</Text>
            <Text style={styles.subtitle}>
              All {capacityMax} spots for the {eventTitle} have been filled. Join the waitlist to be notified immediately if a spot becomes available.
            </Text>
          </View>

          {/* Capacity Progress Card */}
          <View style={styles.capacityCard}>
            <View style={styles.capacityHeaderRow}>
              <Text style={styles.capacityLabel}>Registration Capacity</Text>
              <Text style={styles.capacityValue}>
                {capacityMax} / {capacityMax}
              </Text>
            </View>

            {/* Saffron progress bar */}
            <View style={styles.progressTrack}>
              <View style={styles.progressBar} />
            </View>

            <View style={styles.warningRow}>
              <MaterialCommunityIcons name="information" size={16} color={colors.secondaryBrand} />
              <Text style={styles.warningText}>Capacity reached for this event</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleJoinWaitlist}
              disabled={loading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bell-ring" size={20} color={colors.onPrimaryContainer} />
              <Text style={styles.primaryBtnText}>Join Waitlist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>

          {/* Decorative Divider Brand Footer */}
          <View style={styles.footerBrandRow}>
            <View style={styles.footerLine} />
            <Text style={styles.footerBrandText}>Utsav</Text>
            <View style={styles.footerLine} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.4)",
  },
  backgroundBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  scrollContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetCard: {
    width: "100%",
    backgroundColor: colors.pujaWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(136, 115, 97, 0.3)",
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  textContent: {
    width: "100%",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  capacityCard: {
    width: "100%",
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  capacityHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  capacityLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  capacityValue: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.primaryBrand,
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
    width: "100%",
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  warningText: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.secondaryBrand,
  },
  actionsContainer: {
    width: "100%",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    width: "100%",
    height: 56,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onPrimaryContainer,
  },
  secondaryBtn: {
    width: "100%",
    height: 56,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  footerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    opacity: 0.2,
    width: "100%",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primaryBrand,
  },
  footerBrandText: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.primaryBrand,
  },
});

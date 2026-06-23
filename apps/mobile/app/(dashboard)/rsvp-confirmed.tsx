import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  Share,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function RsvpConfirmedScreen() {
  const params = useLocalSearchParams();
  const eventTitle = (params.eventTitle as string) || "Grand Maha Aarti";
  const eventTime = (params.eventTime as string) || "15 Sep, 7:00 PM";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I've RSVP'd for the ${eventTitle} on Utsav! Join me on ${eventTime}.`,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Event Details (Mock/Behind Sheet styling) */}
      <View style={styles.backgroundBlurOverlay} />

      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
        {/* The Card/Sheet Container */}
        <View style={styles.sheetCard}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Success Checkmark Circle */}
          <View style={styles.iconContainer}>
            <View style={styles.iconRing} />
            <View style={styles.successIconWrapper}>
              <MaterialCommunityIcons name="check-circle" size={48} color={colors.tulsiGreen} />
            </View>
          </View>

          {/* Typography */}
          <Text style={styles.title}>RSVP Confirmed</Text>
          <Text style={styles.subtitle}>
            We've saved your spot for the sacred celebration.
          </Text>

          {/* Event Card Summary */}
          <View style={styles.eventCard}>
            <View style={styles.eventImagePlaceholder}>
              <MaterialCommunityIcons name="candle" size={32} color={colors.primaryBrand} />
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{eventTitle}</Text>
              <Text style={styles.eventTime}>{eventTime}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="calendar-plus" size={20} color={colors.onPrimaryContainer} />
              <Text style={styles.primaryBtnText}>Add to Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.8}>
              <MaterialCommunityIcons name="share-variant" size={20} color={colors.onSurface} />
              <Text style={styles.secondaryBtnText}>Share Invitation</Text>
            </TouchableOpacity>
          </View>

          {/* Done Link */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace("/(dashboard)/events")}
            activeOpacity={0.7}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.4)", // Dimmed backdrop color
  },
  backgroundBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  scrollContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(136, 115, 97, 0.3)",
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    position: "relative",
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  iconRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.poppins.bold,
    fontSize: 24,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  eventCard: {
    width: "100%",
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  eventImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  eventTime: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.primaryBrand,
    marginTop: 2,
  },
  actionButtons: {
    width: "100%",
    gap: spacing.md,
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onPrimaryContainer,
  },
  secondaryBtn: {
    width: "100%",
    height: 56,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  doneBtn: {
    paddingVertical: spacing.xs,
  },
  doneText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
});

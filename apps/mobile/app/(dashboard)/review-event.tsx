import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ReviewEventScreen() {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
      setTimeout(() => {
        Alert.alert("Success", "Your event has been published successfully!", [
          { text: "Done", onPress: () => router.replace("/(dashboard)/events") },
        ]);
      }, 300);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utsav</Text>
        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stepper Indicator */}
        <View style={styles.stepperContainer}>
          <View style={[styles.stepWrapper, styles.stepCompleted]}>
            <View style={styles.stepCircleCompleted}>
              <Text style={styles.stepCircleTextCompleted}>1</Text>
            </View>
            <Text style={styles.stepLabelCompleted}>Details</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepWrapper, styles.stepCompleted]}>
            <View style={styles.stepCircleCompleted}>
              <Text style={styles.stepCircleTextCompleted}>2</Text>
            </View>
            <Text style={styles.stepLabelCompleted}>Media</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepWrapper, styles.stepActive]}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepCircleTextActive}>3</Text>
            </View>
            <Text style={styles.stepLabelActive}>Review</Text>
          </View>
        </View>

        {/* Intro */}
        <View style={styles.introBlock}>
          <Text style={styles.title}>Final Review</Text>
          <Text style={styles.subtitle}>Check the event details before going live.</Text>
        </View>

        {/* High-Fidelity Preview Card */}
        <View style={styles.previewCard}>
          {/* Mock image area */}
          <View style={styles.cardImageWrapper}>
            <View style={styles.mockCardImage}>
              <MaterialCommunityIcons name="image" size={48} color={colors.outlineVariant} />
            </View>
            <View style={styles.visibilityBadge}>
              <MaterialCommunityIcons name="eye" size={14} color={colors.tulsiGreen} />
              <Text style={styles.visibilityText}>Public</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>AARTI</Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.cardBody}>
            <Text style={styles.eventTitle}>Grand Maha Aarti</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIconBg}>
                <MaterialCommunityIcons name="calendar" size={18} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.detailLabel}>DATE & TIME</Text>
                <Text style={styles.detailValue}>15 Sep 2025, 7:00 PM</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconBg}>
                <MaterialCommunityIcons name="map-marker" size={18} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.detailLabel}>VENUE</Text>
                <Text style={styles.detailValue}>Main Pandal, North Gate</Text>
              </View>
            </View>

            {/* Meta row */}
            <View style={styles.cardMetaRow}>
              <View style={styles.avatarsRow}>
                <View style={styles.miniAvatar}><MaterialCommunityIcons name="account" size={14} color="#888" /></View>
                <View style={[styles.miniAvatar, { marginLeft: -8 }]}><MaterialCommunityIcons name="account" size={14} color="#888" /></View>
                <View style={[styles.miniAvatarText, { marginLeft: -8 }]}>
                  <Text style={styles.miniAvatarTextVal}>+12</Text>
                </View>
              </View>
              <Text style={styles.metaOrganizerText}>Organizer: Temple Trust</Text>
            </View>
          </View>
        </View>

        {/* Schedule timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primaryBrand} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleList}>
            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleTime}>19:00</Text>
              <View style={styles.scheduleDivider} />
              <View>
                <Text style={styles.scheduleTitle}>Gathering & Bhajans</Text>
                <Text style={styles.scheduleDesc}>Community chanting session</Text>
              </View>
            </View>

            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleTime}>20:00</Text>
              <View style={styles.scheduleDivider} />
              <View>
                <Text style={styles.scheduleTitle}>Grand Maha Aarti</Text>
                <Text style={styles.scheduleDesc}>Main ceremonial ritual</Text>
              </View>
            </View>

            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleTime}>20:45</Text>
              <View style={styles.scheduleDivider} />
              <View>
                <Text style={styles.scheduleTitle}>Prasadam Distribution</Text>
                <Text style={styles.scheduleDesc}>Blessed food sharing</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alert/Info banner */}
        <View style={styles.infoAlert}>
          <MaterialCommunityIcons name="information" size={20} color={colors.tertiary} />
          <Text style={styles.infoAlertText}>
            Publishing as <Text style={styles.boldText}>Public</Text> means anyone in the community can see and join this event. You can change this to <Text style={styles.boldText}>Private</Text> later in settings.
          </Text>
        </View>

        {/* Extra spacing for footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky footer action buttons */}
      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.draftBtn} activeOpacity={0.8}>
          <Text style={styles.draftBtnText}>Save Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.publishBtn,
            published && { backgroundColor: colors.tulsiGreen },
          ]}
          onPress={handlePublish}
          disabled={publishing || published}
          activeOpacity={0.8}
        >
          {publishing ? (
            <ActivityIndicator color={colors.onPrimaryContainer} size="small" />
          ) : (
            <View style={styles.publishBtnContent}>
              <MaterialCommunityIcons
                name={published ? "check-circle" : "check"}
                size={18}
                color={published ? "#FFFFFF" : colors.onPrimaryContainer}
              />
              <Text style={[styles.publishBtnText, published && { color: "#FFFFFF" }]}>
                {published ? "Published!" : "Publish Now"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.primaryBrand,
  },
  notificationBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  stepWrapper: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  stepCompleted: {
    opacity: 0.4,
  },
  stepActive: {
    opacity: 1,
  },
  stepCircleCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  stepCircleTextCompleted: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.onSurface,
  },
  stepLabelCompleted: {
    fontFamily: fonts.inter.medium,
    fontSize: 10,
    color: colors.onSurface,
  },
  stepCircleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryBrand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  stepCircleTextActive: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: "#FFFFFF",
  },
  stepLabelActive: {
    fontFamily: fonts.inter.medium,
    fontSize: 10,
    color: colors.primaryBrand,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: 8,
    opacity: 0.2,
  },
  introBlock: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardImageWrapper: {
    height: 160,
    width: "100%",
    backgroundColor: colors.surfaceContainerHigh,
    position: "relative",
  },
  mockCardImage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  visibilityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  visibilityText: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurface,
  },
  categoryBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.onPrimaryContainer,
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: spacing.md,
  },
  eventTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
    marginTop: 2,
  },
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarText: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarTextVal: {
    fontSize: 8,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  metaOrganizerText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
  },
  section: {
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editBtnText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.primaryBrand,
  },
  scheduleList: {
    gap: spacing.sm,
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  scheduleTime: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.primaryBrand,
    width: 44,
    textAlign: "center",
  },
  scheduleDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(136, 115, 97, 0.2)",
  },
  scheduleTitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.onSurface,
  },
  scheduleDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  infoAlert: {
    flexDirection: "row",
    backgroundColor: "rgba(223, 165, 47, 0.1)",
    borderWidth: 1,
    borderColor: colors.tertiaryFixed,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoAlertText: {
    flex: 1,
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onTertiaryContainer,
    lineHeight: 18,
  },
  boldText: {
    fontFamily: fonts.inter.bold,
  },
  footerActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.pujaWhite,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.3)",
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
  },
  draftBtn: {
    flex: 1,
    height: 56,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  draftBtnText: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  publishBtn: {
    flex: 2,
    height: 56,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  publishBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  publishBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: colors.onPrimaryContainer,
  },
});

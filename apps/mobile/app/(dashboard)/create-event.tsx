import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCreateEvent } from "@utsav/api-client";
import type { EventCategory } from "@utsav/types";

export default function CreateEventScreen() {
  const createMutation = useCreateEvent();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("puja");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Date & Time (Logistics)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState("13:00");
  const [locationName, setLocationName] = useState("");
  const [rsvpRequired, setRsvpRequired] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const handleUploadBanner = () => {
    setIsUploading(true);
    setTimeout(() => {
      setBannerUrl("https://utsav-app.s3.amazonaws.com/banners/ganesh_chaturthi_default.jpg");
      setIsUploading(false);
    }, 1000);
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!title.trim()) {
        return setErrorMsg("Event title is required");
      }
      setStep(2);
    } else if (step === 2) {
      if (!startDate || !startTime) {
        return setErrorMsg("Start date and time are required");
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handlePublish = async () => {
    setErrorMsg("");
    try {
      // Assemble datetime strings
      const startAtStr = `${startDate}T${startTime}:00.000Z`;
      const endAtStr = `${endDate}T${endTime}:00.000Z`;

      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        banner_image_url: bannerUrl || undefined,
        start_at: startAtStr,
        end_at: endAtStr,
        location_name: locationName.trim() || undefined,
        rsvp_required: rsvpRequired,
        tags: [category],
      });

      router.back();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to publish event");
    }
  };

  const categoryChips: { label: string; value: EventCategory }[] = [
    { label: "Puja", value: "puja" },
    { label: "Cultural", value: "cultural" },
    { label: "Meeting", value: "meeting" },
    { label: "General", value: "general" },
    { label: "Aarti", value: "aarti" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Title Section */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Create New Event</Text>
          <Text style={styles.introSub}>Schedule a celebration or meeting for your Mandal community.</Text>
        </View>

        {/* Progress Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepTrack} />
          <View style={[styles.stepProgress, { width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }]} />
          
          <View style={styles.stepNodesRow}>
            {/* Step 1 Node */}
            <View style={styles.stepNodeContainer}>
              <View style={[styles.stepNode, step >= 1 && styles.stepNodeActive]}>
                <Text style={[styles.stepNodeText, step >= 1 && styles.stepNodeTextActive]}>1</Text>
              </View>
              <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Details</Text>
            </View>

            {/* Step 2 Node */}
            <View style={styles.stepNodeContainer}>
              <View style={[styles.stepNode, step >= 2 && styles.stepNodeActive]}>
                <Text style={[styles.stepNodeText, step >= 2 && styles.stepNodeTextActive]}>2</Text>
              </View>
              <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Logistics</Text>
            </View>

            {/* Step 3 Node */}
            <View style={styles.stepNodeContainer}>
              <View style={[styles.stepNode, step >= 3 && styles.stepNodeActive]}>
                <Text style={[styles.stepNodeText, step >= 3 && styles.stepNodeTextActive]}>3</Text>
              </View>
              <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Review</Text>
            </View>
          </View>
        </View>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* STEP 1: Details */}
        {step === 1 && (
          <View style={styles.card}>
            {/* Banner Upload */}
            <TouchableOpacity style={styles.bannerUpload} onPress={handleUploadBanner} disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.primaryContainer} />
              ) : bannerUrl ? (
                <View style={styles.bannerUploadedContainer}>
                  <Text style={styles.bannerUploadedText}>Banner Image Set ✓</Text>
                  <Text style={styles.changeBannerText}>Tap to change</Text>
                </View>
              ) : (
                <>
                  <View style={styles.bannerUploadIconCircle}>
                    <MaterialCommunityIcons name="image-plus" size={28} color={colors.primaryContainer} />
                  </View>
                  <Text style={styles.bannerUploadTitle}>Upload Banner Image</Text>
                  <Text style={styles.bannerUploadSub}>Recommended: 1600 x 900px</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Event Title <Text style={styles.requiredStar}>*</Text></Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Ganesh Chaturthi Mahotsav 2024"
                placeholderTextColor={colors.outline}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.chipsRow}>
                {categoryChips.map((chip) => {
                  const isActive = category === chip.value;
                  return (
                    <TouchableOpacity
                      key={chip.value}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setCategory(chip.value)}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Event Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Share details about the event, rituals, or schedule..."
                placeholderTextColor={colors.outline}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>
        )}

        {/* STEP 2: Logistics */}
        {step === 2 && (
          <View style={styles.card}>
            {/* Start Date & Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Starts</Text>
              <View style={styles.timeRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <TextInput
                  style={[styles.textInput, { width: 100 }]}
                  placeholder="HH:MM"
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
            </View>

            {/* End Date & Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Ends</Text>
              <View style={styles.timeRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChangeText={setEndDate}
                />
                <TextInput
                  style={[styles.textInput, { width: 100 }]}
                  placeholder="HH:MM"
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Location</Text>
              <View style={styles.locationInputWrapper}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={20}
                  color={colors.onSurfaceVariant}
                  style={styles.locationPin}
                />
                <TextInput
                  style={[styles.textInput, styles.locationInput]}
                  placeholder="Search for a venue or address..."
                  placeholderTextColor={colors.outline}
                  value={locationName}
                  onChangeText={setLocationName}
                />
              </View>
            </View>

            {/* RSVP Toggle */}
            <View style={styles.rsvpRowContainer}>
              <View style={styles.rsvpLeft}>
                <View style={styles.rsvpIconBox}>
                  <MaterialCommunityIcons name="account-multiple-check-outline" size={24} color={colors.primaryBrand} />
                </View>
                <View>
                  <Text style={styles.rsvpTitle}>RSVP Required</Text>
                  <Text style={styles.rsvpSub}>Track attendance and manage guest list</Text>
                </View>
              </View>
              <Switch
                value={rsvpRequired}
                onValueChange={setRsvpRequired}
                trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.reviewHeading}>Review Event Details</Text>
            <View style={styles.divider} />

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>TITLE</Text>
              <Text style={styles.reviewValue}>{title}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>CATEGORY</Text>
              <View style={styles.reviewTag}>
                <Text style={styles.reviewTagText}>{category.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>SCHEDULE</Text>
              <Text style={styles.reviewValue}>
                📅 {startDate} {startTime} to {endDate} {endTime}
              </Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>VENUE</Text>
              <Text style={styles.reviewValue}>{locationName || "No specific venue location set"}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>RSVP REQUIREMENT</Text>
              <Text style={styles.reviewValue}>{rsvpRequired ? "Required" : "Not Required"}</Text>
            </View>

            {description ? (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>DESCRIPTION</Text>
                <Text style={styles.reviewValueDesc}>{description}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Steps Control Row */}
        <View style={styles.controlsRow}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.draftButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color={colors.onSurface} />
              <Text style={styles.draftButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {step < 3 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primaryContainer }]}
              onPress={handlePublish}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>Publish Event</Text>
                  <MaterialCommunityIcons name="send" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  introContainer: {
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  introSub: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  stepperContainer: {
    position: "relative",
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  stepTrack: {
    position: "absolute",
    top: 20,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: colors.sandstone,
  },
  stepProgress: {
    position: "absolute",
    top: 20,
    left: 24,
    height: 2,
    backgroundColor: colors.primaryContainer,
  },
  stepNodesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepNodeContainer: {
    alignItems: "center",
    width: 64,
  },
  stepNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pujaWhite,
    borderWidth: 2,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNodeActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  stepNodeText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  stepNodeTextActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  stepLabelActive: {
    color: colors.primaryBrand,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.error,
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    gap: spacing.md,
  },
  bannerUpload: {
    height: 180,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.sandstone,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerUploadedContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerUploadedText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  changeBannerText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 6,
    textDecorationLine: "underline",
  },
  bannerUploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  bannerUploadTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  bannerUploadSub: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  inputGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  requiredStar: {
    color: colors.error,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  locationInputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  locationPin: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  locationInput: {
    paddingLeft: 44,
  },
  rsvpRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
  },
  rsvpLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rsvpIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
  },
  rsvpTitle: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  rsvpSub: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  reviewHeading: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.sandstone,
    marginVertical: 4,
  },
  reviewItem: {
    gap: 4,
  },
  reviewLabel: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
    letterSpacing: 0.5,
  },
  reviewValue: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  reviewValueDesc: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  reviewTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewTagText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  draftButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  draftButtonText: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: "#FFFFFF",
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  nextButton: {
    backgroundColor: colors.primaryBrand,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 28,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
});

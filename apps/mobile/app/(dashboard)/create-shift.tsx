import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useCreateVolunteerDuty,
  useUpdateVolunteerDuty,
  useFetchVolunteerDuty,
  useEvents,
  useFetchMyProfile,
} from "@utsav/api-client";

const CATEGORIES = [
  { label: "Prasad Distribution", value: "prasad_distribution", icon: "flower-tulip" },
  { label: "Crowd Control", value: "crowd_control", icon: "account-group" },
  { label: "Entry Management", value: "entry_management", icon: "gate" },
  { label: "Decoration", value: "decoration", icon: "palette" },
  { label: "Parking Seva", value: "parking", icon: "parking" },
  { label: "First Aid", value: "first_aid", icon: "medical-bag" },
  { label: "Registration Desk", value: "registration_desk", icon: "card-account-details" },
  { label: "Photo / Video", value: "photo_video", icon: "camera" },
  { label: "Other Seva", value: "other", icon: "hand-heart" },
];

const PRESET_BANNERS = [
  "https://images.unsplash.com/photo-1609137144814-6fa286392095?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&q=80&w=800",
];

export default function CreateShiftScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const { data: existingDuty, isLoading: isFetchingDuty } = useFetchVolunteerDuty(id || "");
  const { data: events = [] } = useEvents();
  const { data: myProfile } = useFetchMyProfile();

  const createMutation = useCreateVolunteerDuty();
  const updateMutation = useUpdateVolunteerDuty();

  // Stepper state
  const [step, setStep] = useState(0);

  // Form states
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [eventId, setEventId] = useState("");
  const [location, setLocation] = useState("");

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");

  const [maxVolunteers, setMaxVolunteers] = useState(5);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Populate data in edit mode
  useEffect(() => {
    if (isEditMode && existingDuty) {
      setTitle(existingDuty.title || "");
      setCategory(existingDuty.duty_type || "other");
      setEventId(existingDuty.event_id || "");
      setLocation(existingDuty.location || "");
      setMaxVolunteers(existingDuty.max_volunteers || 5);

      // Parse description JSON structure
      let descText = existingDuty.description || "";
      if (existingDuty.description) {
        const unescaped = existingDuty.description
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&#x2F;/g, "/");
        const trimmed = unescaped.trim();
        if (trimmed.startsWith("{")) {
          try {
            const parsed = JSON.parse(trimmed);
            descText = parsed.description || "";
            setBannerUrl(parsed.banner_url || PRESET_BANNERS[0]);
          } catch (e) {
            // Fallback
          }
        }
      }
      setDescription(descText);

      // Parse dates
      if (existingDuty.start_at) {
        const d = new Date(existingDuty.start_at);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        setStartDate(`${yyyy}-${mm}-${dd}`);
        setStartTime(`${hh}:${min}`);
      }

      if (existingDuty.end_at) {
        const d = new Date(existingDuty.end_at);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        setEndDate(`${yyyy}-${mm}-${dd}`);
        setEndTime(`${hh}:${min}`);
      }
    } else {
      // Default start date is today
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setStartDate(`${yyyy}-${mm}-${dd}`);
      setEndDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [existingDuty, isEditMode]);

  // Image Upload helper
  const handleUploadBanner = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const nextIndex = (PRESET_BANNERS.indexOf(bannerUrl) + 1) % PRESET_BANNERS.length;
      setBannerUrl(PRESET_BANNERS[nextIndex]);
    }, 1000);
  };

  const validateStep = () => {
    const tempErrors: Record<string, string> = {};
    if (step === 0) {
      if (!title.trim()) tempErrors.title = "Shift Title is required";
      else if (title.trim().length < 3) tempErrors.title = "Title must be at least 3 characters";
    } else if (step === 1) {
      if (!location.trim()) tempErrors.location = "Location is required";
      if (!startDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(startDate.trim())) {
        tempErrors.startDate = "Start Date is required in YYYY-MM-DD format";
      }
      if (!startTime.trim() || !/^\d{2}:\d{2}$/.test(startTime.trim())) {
        tempErrors.startTime = "Start Time is required in HH:MM format";
      }
      if (endDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
        tempErrors.endDate = "End Date must be in YYYY-MM-DD format";
      }
      if (endTime.trim() && !/^\d{2}:\d{2}$/.test(endTime.trim())) {
        tempErrors.endTime = "End Time must be in HH:MM format";
      }
      if (maxVolunteers <= 0) {
        tempErrors.maxVolunteers = "Max Volunteers must be greater than 0";
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setStep((s) => s - 1);
  };

  const handleSave = async () => {
    if (!validateStep()) return;

    // Construct start_at and end_at ISO timestamps
    const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endIso = endDate && endTime ? new Date(`${endDate}T${endTime}:00`).toISOString() : null;

    // Description is stored as JSON string with bannerUrl
    const descriptionJson = JSON.stringify({
      banner_url: bannerUrl,
      description: description.trim(),
    });

    const payload = {
      title: title.trim(),
      duty_type: category as any,
      description: descriptionJson,
      location: location.trim(),
      start_at: startIso,
      end_at: endIso,
      max_volunteers: maxVolunteers,
      event_id: eventId || null,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: id!,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync({
          ...payload,
          status: "open",
        });
      }
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save volunteer duty shift");
    }
  };

  if (isFetchingDuty) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBrand} />
        <Text style={styles.loadingText}>Fetching shift profile...</Text>
      </SafeAreaView>
    );
  }

  const currentCategory = CATEGORIES.find((c) => c.value === category);

  return (
    <SafeAreaView style={styles.container}>
      {/* AppBar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isEditMode ? "Edit Shift Profile" : "Create Volunteer Shift"}
        </Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      {/* Stepper progress */}
      <View style={styles.stepperContainer}>
        {[0, 1, 2].map((sIdx) => (
          <React.Fragment key={sIdx}>
            <View style={styles.stepIndicatorWrapper}>
              <View
                style={[
                  styles.stepIndicatorDot,
                  step >= sIdx && styles.stepIndicatorDotActive,
                  step === sIdx && styles.stepIndicatorDotCurrent,
                ]}
              >
                {step > sIdx ? (
                  <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepIndicatorNumber, step >= sIdx && styles.stepIndicatorNumberActive]}>
                    {sIdx + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepIndicatorLabel, step >= sIdx && styles.stepIndicatorLabelActive]}>
                {sIdx === 0 ? "Details" : sIdx === 1 ? "Logistics" : "Review"}
              </Text>
            </View>
            {sIdx < 2 && (
              <View style={[styles.stepConnectorLine, step > sIdx && styles.stepConnectorLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.formSection}>
            {/* Banner Image Container */}
            <Text style={styles.fieldLabel}>Shift Banner Image</Text>
            <TouchableOpacity style={styles.bannerContainer} onPress={handleUploadBanner} activeOpacity={0.9}>
              <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera-plus-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.bannerOverlayText}>Tap to Change Image</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Shift Title *</Text>
              <TextInput
                style={[styles.textInput, errors.title ? styles.textInputError : null]}
                placeholder="e.g. Prasad Distribution - Shift A"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors((e) => ({ ...e, title: "" }));
                }}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Category / Duty Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Category (Seva Type) *</Text>
              <View style={styles.chipsContainer}>
                {CATEGORIES.map((c) => {
                  const isSelected = category === c.value;
                  return (
                    <TouchableOpacity
                      key={c.value}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setCategory(c.value)}
                    >
                      <MaterialCommunityIcons
                        name={c.icon as any}
                        size={16}
                        color={isSelected ? "#FFFFFF" : colors.primaryBrand}
                      />
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{c.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Linked Event (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Link to Mandal Event (Optional)</Text>
              <View style={styles.pickerFakeWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerFakeList}>
                  <TouchableOpacity
                    style={[styles.eventSelectChip, !eventId && styles.eventSelectChipActive]}
                    onPress={() => setEventId("")}
                  >
                    <Text style={[styles.eventSelectChipText, !eventId && styles.eventSelectChipTextActive]}>
                      None (General Mandal Duty)
                    </Text>
                  </TouchableOpacity>
                  {events.map((ev) => {
                    const isSelected = eventId === ev.id;
                    return (
                      <TouchableOpacity
                        key={ev.id}
                        style={[styles.eventSelectChip, isSelected && styles.eventSelectChipActive]}
                        onPress={() => setEventId(ev.id)}
                      >
                        <Text style={[styles.eventSelectChipText, isSelected && styles.eventSelectChipTextActive]}>
                          {ev.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Description / Prerequisites</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="List duties, guidelines, dress code, etc."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.formSection}>
            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Location *</Text>
              <TextInput
                style={[styles.textInput, errors.location ? styles.textInputError : null]}
                placeholder="e.g. Main Prasad Pandal, Gate 3"
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
                  if (errors.location) setErrors((e) => ({ ...e, location: "" }));
                }}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            {/* Start Logistics */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1.3 }]}>
                <Text style={styles.fieldLabel}>Start Date *</Text>
                <TextInput
                  style={[styles.textInput, errors.startDate ? styles.textInputError : null]}
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChangeText={(text) => {
                    setStartDate(text);
                    if (errors.startDate) setErrors((e) => ({ ...e, startDate: "" }));
                  }}
                />
                {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Start Time *</Text>
                <TextInput
                  style={[styles.textInput, errors.startTime ? styles.textInputError : null]}
                  placeholder="HH:MM"
                  value={startTime}
                  onChangeText={(text) => {
                    setStartTime(text);
                    if (errors.startTime) setErrors((e) => ({ ...e, startTime: "" }));
                  }}
                />
                {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
              </View>
            </View>

            {/* End Logistics */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1.3 }]}>
                <Text style={styles.fieldLabel}>End Date (Optional)</Text>
                <TextInput
                  style={[styles.textInput, errors.endDate ? styles.textInputError : null]}
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChangeText={(text) => {
                    setEndDate(text);
                    if (errors.endDate) setErrors((e) => ({ ...e, endDate: "" }));
                  }}
                />
                {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>End Time (Optional)</Text>
                <TextInput
                  style={[styles.textInput, errors.endTime ? styles.textInputError : null]}
                  placeholder="HH:MM"
                  value={endTime}
                  onChangeText={(text) => {
                    setEndTime(text);
                    if (errors.endTime) setErrors((e) => ({ ...e, endTime: "" }));
                  }}
                />
                {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
              </View>
            </View>

            {/* Max Volunteers slots count */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Volunteer Slots (Capacity) *</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={[styles.counterBtn, maxVolunteers <= 1 && styles.counterBtnDisabled]}
                  disabled={maxVolunteers <= 1}
                  onPress={() => setMaxVolunteers((c) => Math.max(1, c - 1))}
                >
                  <MaterialCommunityIcons name="minus" size={24} color={colors.primaryBrand} />
                </TouchableOpacity>

                <View style={styles.counterValueContainer}>
                  <Text style={styles.counterValueText}>{maxVolunteers}</Text>
                  <Text style={styles.counterLabelText}>volunteers</Text>
                </View>

                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setMaxVolunteers((c) => c + 1)}
                >
                  <MaterialCommunityIcons name="plus" size={24} color={colors.primaryBrand} />
                </TouchableOpacity>
              </View>
              {errors.maxVolunteers && <Text style={styles.errorText}>{errors.maxVolunteers}</Text>}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.reviewHeading}>Review Shift Details</Text>
            
            <View style={styles.reviewCard}>
              <Image source={{ uri: bannerUrl }} style={styles.reviewBanner} />
              
              <View style={styles.reviewBody}>
                {/* Category Badge */}
                <View style={styles.reviewBadgeRow}>
                  <View style={styles.reviewCategoryBadge}>
                    <MaterialCommunityIcons
                      name={currentCategory?.icon as any || "flower"}
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.reviewCategoryText}>{currentCategory?.label}</Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.reviewTitle}>{title}</Text>

                {/* Linked Event */}
                {eventId ? (
                  <View style={styles.reviewMetaRow}>
                    <MaterialCommunityIcons name="calendar-star" size={18} color={colors.primaryBrand} />
                    <Text style={styles.reviewMetaText}>
                      Linked: {events.find((e) => e.id === eventId)?.title || "Selected Event"}
                    </Text>
                  </View>
                ) : null}

                {/* Logistics */}
                <View style={styles.reviewMetaRow}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primaryBrand} />
                  <Text style={styles.reviewMetaText}>
                    {startDate} | {startTime} {endDate ? `to ${endDate} | ${endTime}` : ""}
                  </Text>
                </View>

                <View style={styles.reviewMetaRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.primaryBrand} />
                  <Text style={styles.reviewMetaText}>{location}</Text>
                </View>

                <View style={styles.reviewMetaRow}>
                  <MaterialCommunityIcons name="account-multiple-outline" size={18} color={colors.primaryBrand} />
                  <Text style={styles.reviewMetaText}>Capacity: {maxVolunteers} Volunteer Slots</Text>
                </View>

                {/* Description */}
                {description.trim() ? (
                  <View style={styles.reviewDescSection}>
                    <Text style={styles.reviewDescTitle}>Description / Details</Text>
                    <Text style={styles.reviewDescText}>{description}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Stepper control buttons */}
      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity style={[styles.footerBtn, styles.prevBtn]} onPress={handlePrev}>
            <Text style={styles.prevBtnText}>Previous</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.footerBtn, styles.cancelBtn]} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {step < 2 ? (
          <TouchableOpacity style={[styles.footerBtn, styles.nextBtn]} onPress={handleNext}>
            <Text style={styles.nextBtnText}>Next Step</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.footerBtn, styles.submitBtn]}
            onPress={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {isEditMode ? "Save Changes" : "Confirm & Launch"}
                </Text>
                <MaterialCommunityIcons name="check-decagram" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckIcon}>
              <MaterialCommunityIcons name="check-circle" size={48} color={colors.tulsiGreen} />
            </View>
            <Text style={styles.modalTitle}>Har Har Mahadev!</Text>
            <Text style={styles.modalSubtitle}>
              {isEditMode ? "Shift updated successfully!" : "Shift created successfully!"}
            </Text>
            <View style={styles.modalBooking}>
              <Text style={styles.bookingLabel}>SHIFT TITLE</Text>
              <Text style={styles.bookingCode} numberOfLines={1}>
                {title}
              </Text>
              <View style={styles.calendarRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.calendarText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => {
                setShowSuccess(false);
                router.replace("/(dashboard)/volunteer-duty-roster" as any);
              }}
            >
              <Text style={styles.modalDoneBtnText}>Go to Seva Roster</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", gap: spacing.md },
  loadingText: { fontSize: 16, fontFamily: fonts.inter.semibold, color: colors.onSurfaceVariant },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.md, height: 56,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "rgba(232, 226, 214, 0.4)",
  },
  backBtn: { padding: spacing.xs },
  backBtnPlaceholder: { width: 32 },
  headerTitle: { fontSize: 18, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, flex: 1, textAlign: "center" },
  stepperContainer: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.cream, borderBottomWidth: 1, borderBottomColor: colors.sandstone,
  },
  stepIndicatorWrapper: { alignItems: "center", gap: 4 },
  stepIndicatorDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.sandstone, justifyContent: "center", alignItems: "center",
  },
  stepIndicatorDotActive: { backgroundColor: colors.primaryContainer },
  stepIndicatorDotCurrent: { backgroundColor: colors.primaryBrand },
  stepIndicatorNumber: { fontSize: 12, fontFamily: fonts.inter.bold, color: colors.onSurfaceVariant },
  stepIndicatorNumberActive: { color: "#FFFFFF" },
  stepIndicatorLabel: { fontSize: 11, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  stepIndicatorLabelActive: { color: colors.primaryBrand, fontFamily: fonts.inter.semibold },
  stepConnectorLine: { flex: 1, height: 2, backgroundColor: colors.sandstone, marginHorizontal: spacing.xs, marginTop: -14 },
  stepConnectorLineActive: { backgroundColor: colors.primaryContainer },
  scrollContent: { padding: spacing.md, paddingBottom: 100 },
  formSection: { gap: spacing.lg },
  fieldLabel: { fontSize: 14, fontFamily: fonts.inter.semibold, color: colors.charcoal, marginBottom: spacing.xs },
  bannerContainer: {
    height: 140, borderRadius: borderRadius.lg, overflow: "hidden", position: "relative",
    borderWidth: 1, borderColor: colors.sandstone, backgroundColor: colors.surfaceContainer,
  },
  bannerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", gap: spacing.xs,
  },
  bannerOverlayText: { fontSize: 13, fontFamily: fonts.inter.medium, color: "#FFFFFF" },
  inputGroup: { gap: spacing.xs },
  textInput: {
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.sandstone,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 48,
    fontSize: 15, fontFamily: fonts.inter.regular, color: colors.onSurface,
  },
  textInputError: { borderColor: colors.primaryContainer },
  textArea: { height: 100, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  errorText: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.primaryContainer, marginTop: 2 },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.sandstone,
  },
  chipActive: { backgroundColor: colors.primaryBrand, borderColor: colors.primaryBrand },
  chipText: { fontSize: 13, fontFamily: fonts.inter.semibold, color: colors.charcoal },
  chipTextActive: { color: "#FFFFFF" },
  pickerFakeWrapper: { paddingVertical: spacing.xs },
  pickerFakeList: { gap: spacing.xs },
  eventSelectChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.sandstone,
  },
  eventSelectChipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  eventSelectChipText: { fontSize: 13, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  eventSelectChipTextActive: { color: colors.onPrimaryContainer, fontFamily: fonts.inter.semibold },
  row: { flexDirection: "row", gap: spacing.md },
  counterRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.sandstone,
    borderRadius: borderRadius.md, padding: spacing.md,
  },
  counterBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.cream, justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: colors.sandstone,
  },
  counterBtnDisabled: { opacity: 0.5 },
  counterValueContainer: { alignItems: "center" },
  counterValueText: { fontSize: 24, fontFamily: fonts.poppins.bold, color: colors.primaryBrand },
  counterLabelText: { fontSize: 12, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  reviewHeading: { fontSize: 18, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, marginBottom: spacing.sm },
  reviewCard: {
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.sandstone,
    borderRadius: borderRadius.xl, overflow: "hidden",
    shadowColor: colors.primaryBrand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  reviewBanner: { width: "100%", height: 160, resizeMode: "cover" },
  reviewBody: { padding: spacing.lg, gap: spacing.md },
  reviewBadgeRow: { flexDirection: "row" },
  reviewCategoryBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.primaryBrand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  reviewCategoryText: { fontSize: 12, fontFamily: fonts.inter.bold, color: "#FFFFFF" },
  reviewTitle: { fontSize: 22, fontFamily: fonts.poppins.bold, color: colors.charcoal },
  reviewMetaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  reviewMetaText: { fontSize: 14, fontFamily: fonts.inter.semibold, color: colors.onSurfaceVariant },
  reviewDescSection: {
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.sandstone, gap: spacing.xs,
  },
  reviewDescTitle: { fontSize: 14, fontFamily: fonts.inter.bold, color: colors.charcoal },
  reviewDescText: { fontSize: 14, fontFamily: fonts.inter.regular, color: colors.onSurfaceVariant, lineHeight: 22 },
  footer: {
    flexDirection: "row", padding: spacing.md, backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "rgba(232, 226, 214, 0.4)", gap: spacing.md,
  },
  footerBtn: {
    flex: 1, height: 50, borderRadius: borderRadius.md,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing.xs,
  },
  prevBtn: { backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.sandstone },
  prevBtnText: { fontSize: 15, fontFamily: fonts.inter.bold, color: colors.primaryBrand },
  cancelBtn: { backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.sandstone },
  cancelBtnText: { fontSize: 15, fontFamily: fonts.inter.bold, color: colors.onSurfaceVariant },
  nextBtn: { backgroundColor: colors.primaryBrand },
  nextBtnText: { fontSize: 15, fontFamily: fonts.inter.bold, color: "#FFFFFF" },
  submitBtn: { backgroundColor: colors.primaryContainer },
  submitBtnText: { fontSize: 15, fontFamily: fonts.inter.bold, color: colors.onPrimaryContainer },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(58, 53, 48, 0.6)", alignItems: "center", justifyContent: "center", padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.pujaWhite, width: "100%", maxWidth: 380,
    borderRadius: 16, padding: spacing.xl, alignItems: "center",
    borderWidth: 1, borderColor: colors.aartiGold,
  },
  modalCheckIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 26, fontFamily: fonts.poppins.bold, color: colors.primaryBrand, marginBottom: spacing.sm },
  modalSubtitle: { fontSize: 16, fontFamily: fonts.poppins.semibold, color: colors.charcoal, marginBottom: spacing.lg, textAlign: "center" },
  modalBooking: {
    backgroundColor: colors.cream, padding: spacing.md, borderRadius: borderRadius.xl,
    width: "100%", borderWidth: 1, borderColor: colors.sandstone, marginBottom: spacing.xl,
  },
  bookingLabel: { fontSize: 11, fontFamily: fonts.inter.bold, color: colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 4 },
  bookingCode: { fontSize: 15, fontFamily: fonts.inter.bold, color: colors.charcoal, marginBottom: 6 },
  calendarRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  calendarText: { fontSize: 13, fontFamily: fonts.inter.medium, color: colors.onSurfaceVariant },
  modalDoneBtn: {
    width: "100%", paddingVertical: spacing.md,
    backgroundColor: colors.primaryBrand, borderRadius: borderRadius.xl, alignItems: "center",
  },
  modalDoneBtnText: { fontSize: 15, fontFamily: fonts.inter.bold, color: "#FFFFFF" },
});

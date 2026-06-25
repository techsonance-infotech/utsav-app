import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Dimensions, Animated, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import { useCreateTenant, useCreateEvent } from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const VERTICAL_OPTIONS = [
  { id: "ganpati", label: "Ganpati Mandal", icon: "temple-hindu", bg: "#FFF8F4" },
  { id: "temple", label: "Temple Trust", icon: "office-building", bg: "#FFF8F4" },
  { id: "navratri", label: "Navratri Utsav", icon: "human-female-dance", bg: "#FFF8F4" },
  { id: "other", label: "Other Celebration", icon: "dharmachakra", bg: "#FFF8F4" },
];

const THEME_COLORS = [
  { name: "Saffron", color: "#FF9500" },
  { name: "Kumkum", color: "#D92B2B" },
  { name: "Gold", color: "#C9921A" },
  { name: "Tulsi", color: "#22C55E" },
  { name: "Sky", color: "#0EA5E9" },
];

export default function MobileTenantSetupScreen() {
  const [step, setStep] = useState(1);

  // Step 1: Identity
  const [tenantName, setTenantName] = useState("");
  const [vertical, setVertical] = useState("ganpati");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Maharashtra");

  // Step 2: Branding
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "gu">("en");
  const [accentColor, setAccentColor] = useState("#FF9500");
  const [logoUri, setLogoUri] = useState<string | null>(null);

  // Step 3: Dates
  const [eventName, setEventName] = useState("Ganesh Chaturthi 2024");
  const [startDate, setStartDate] = useState("2024-09-19");
  const [endDate, setEndDate] = useState("2024-09-28");

  // Success state & Animations
  const [showSuccess, setShowSuccess] = useState(false);
  const [petals, setPetals] = useState<{ id: number; left: number; anim: Animated.Value; color: string }[]>([]);

  const createTenantMutation = useCreateTenant();
  const createEventMutation = useCreateEvent();
  const setAuth = useAuthStore((state) => state.setAuth);

  const slug = tenantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const handleNext = () => {
    if (step === 1 && !tenantName.trim()) {
      Alert.alert("Required", "Please enter your Mandal name.");
      return;
    }
    if (step === 3) {
      if (!eventName.trim() || !startDate.trim() || !endDate.trim()) {
        Alert.alert("Required", "Please enter the Event name and dates.");
        return;
      }
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleLaunch = async () => {
    try {
      // 1. Create the tenant organization
      const tenantRes = await createTenantMutation.mutateAsync({
        name: tenantName,
        slug: slug || "mandal",
        vertical: vertical,
        city: city || "Mumbai",
        state: stateName || "Maharashtra",
        address: `${city || "Mumbai"}, ${stateName || "Maharashtra"}`,
        primary_color: accentColor,
        default_language: selectedLanguage,
        description: `${tenantName} community management portal`,
      });

      // 2. Create the first default event
      try {
        await createEventMutation.mutateAsync({
          title: eventName,
          category: "general",
          start_at: new Date(startDate).toISOString(),
          end_at: new Date(endDate).toISOString(),
          location_name: city || "Mumbai",
          rsvp_required: false,
          tags: [],
        });
      } catch (evtError) {
        console.warn("Could not create initial event automatically:", evtError);
      }

      // 3. Trigger flower petals drop celebration
      triggerPetalsCelebration();
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert("Onboarding Failed", err.message || "Something went wrong while setting up your Mandal.");
    }
  };

  const triggerPetalsCelebration = () => {
    const newPetals = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: Math.random() * width,
      anim: new Animated.Value(-50),
      color: THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)].color,
    }));
    setPetals(newPetals);

    newPetals.forEach((p) => {
      Animated.timing(p.anim, {
        toValue: height + 100,
        duration: 3500 + Math.random() * 2000,
        delay: Math.random() * 1800,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleComplete = () => {
    setShowSuccess(false);
    router.replace("/(dashboard)/home");
  };

  const isIdentityComplete = tenantName.trim().length > 0;
  const isDatesComplete = eventName.trim().length > 0 && startDate.trim().length > 0 && endDate.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <MaterialIcons name="temple-hindu" size={20} color={colors.onPrimaryContainer} />
          </View>
          <Text style={styles.logoText}>UTSAV</Text>
        </View>
        <Text style={styles.stepIndicator}>Step {step} of 4</Text>
      </View>

      {/* Main Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressIndicator, { width: `${(step / 4) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Tell us about your Mandal</Text>
            <Text style={styles.subtitle}>Let's set up the core profile for your community management platform.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mandal / Organization Name *</Text>
              <TextInput
                style={styles.textInput}
                value={tenantName}
                onChangeText={setTenantName}
                placeholder="e.g. Lalbaugcha Raja Mandal"
                placeholderTextColor={colors.outlineVariant}
              />
            </View>

            {tenantName.trim().length > 0 && (
              <View style={styles.slugPreviewCard}>
                <MaterialCommunityIcons name="web" size={16} color={colors.primaryBrand} />
                <Text style={styles.slugPreviewText}>
                  Your public web address: <Text style={styles.slugHighlight}>{slug}.utsav.com</Text>
                </Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>Select Celebration Category</Text>
            <View style={styles.verticalGrid}>
              {VERTICAL_OPTIONS.map((item) => {
                const isActive = vertical === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.verticalCard, isActive && styles.verticalCardActive]}
                    onPress={() => setVertical(item.id)}
                    activeOpacity={0.8}
                  >
                    {item.icon === "temple-hindu" ? (
                      <MaterialIcons
                        name="temple-hindu"
                        size={28}
                        color={isActive ? colors.primaryBrand : colors.onSurfaceVariant}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={28}
                        color={isActive ? colors.primaryBrand : colors.onSurfaceVariant}
                      />
                    )}
                    <Text style={[styles.verticalLabel, isActive && styles.verticalLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.textInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Mumbai"
                  placeholderTextColor={colors.outlineVariant}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.textInput}
                  value={stateName}
                  onChangeText={setStateName}
                  placeholder="e.g. Maharashtra"
                  placeholderTextColor={colors.outlineVariant}
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 2: BRANDING */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Make it yours</Text>
            <Text style={styles.subtitle}>Customize the visual logo, primary theme, and default workspace language.</Text>

            {/* Logo Upload Card */}
            <View style={styles.cardCenter}>
              <Text style={styles.cardCenterTitle}>Organization Logo</Text>
              <TouchableOpacity
                style={styles.logoPickerContainer}
                activeOpacity={0.8}
                onPress={() => {
                  // Simulate image upload success
                  setLogoUri("https://lh3.googleusercontent.com/aida-public/AB6AXuCTL9Up-517payVfNmeHJJC1jmHOiQ9hhnqTApakW5lKw-2FQWrSceX8rsTnb5m6PEYkGFHAFRmDJQvMOYQ6lvVTtWTV25yNPfzcXDxbdxEahKhVFv-E1elS0AMs5pctd9e2tKXsLMdPK7bMT8qORud6fSy0VabZkNCUfv9vDc3rT9P0s5dl4U9vtNtre8g35fmF9ZrZX9w94eb2pDDDvLXQzo5EwCGdVGiLuBraoh94CJqnM5_6-R0");
                  Alert.alert("Logo Selected", "Mandal avatar logo uploaded successfully!");
                }}
              >
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.logoPreviewImage as any} />
                ) : (
                  <View style={styles.logoUploadPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus" size={32} color={colors.onSurfaceVariant} />
                  </View>
                )}
                <View style={styles.editBadge}>
                  <MaterialCommunityIcons name="pencil" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.logoHelpText}>Upload a circular logo for best appearance on the app.</Text>
            </View>

            {/* Language Selector */}
            <Text style={styles.sectionLabel}>Primary Language</Text>
            <View style={styles.langGrid}>
              {[
                { id: "en", name: "English (Default)", icon: "translate" },
                { id: "hi", name: "Hindi (हिंदी)", icon: "translate-variant" },
                { id: "gu", name: "Gujarati (ગુજરાતી)", icon: "translate" },
              ].map((lang) => {
                const isActive = selectedLanguage === lang.id;
                return (
                  <TouchableOpacity
                    key={lang.id}
                    style={[styles.langRow, isActive && styles.langRowActive]}
                    onPress={() => setSelectedLanguage(lang.id as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.langLeft}>
                      <MaterialCommunityIcons
                        name={lang.icon as any}
                        size={20}
                        color={isActive ? colors.primaryBrand : colors.onSurfaceVariant}
                      />
                      <Text style={[styles.langText, isActive && styles.langTextActive]}>{lang.name}</Text>
                    </View>
                    {isActive && (
                      <MaterialCommunityIcons name="check-circle" size={20} color={colors.primaryBrand} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Color Accent Picker */}
            <Text style={styles.sectionLabel}>Celebration Theme Color</Text>
            <View style={styles.colorPalette}>
              {THEME_COLORS.map((c) => {
                const isActive = accentColor === c.color;
                return (
                  <TouchableOpacity
                    key={c.name}
                    style={styles.colorNodeContainer}
                    onPress={() => setAccentColor(c.color)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c.color },
                        isActive && styles.colorCircleActive,
                      ]}
                    />
                    <Text style={[styles.colorNodeLabel, isActive && styles.colorNodeLabelActive]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live App Mockup Preview */}
            <View style={styles.livePreviewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewHeaderText}>Live App Preview</Text>
                <View style={styles.indicatorContainer}>
                  <View style={styles.indicatorCircle} />
                  <View style={styles.indicatorCircle} />
                </View>
              </View>
              <View style={styles.previewBody}>
                <View style={styles.previewAvatarRow}>
                  <View style={[styles.previewAvatar, { backgroundColor: accentColor }]} />
                  <View style={styles.previewMeta}>
                    <View style={styles.previewMetaLineLong} />
                    <View style={styles.previewMetaLineShort} />
                  </View>
                </View>
                <View style={styles.previewContentBox}>
                  <MaterialCommunityIcons name="party-popper" size={28} color={accentColor} />
                </View>
                <View style={[styles.previewButton, { backgroundColor: accentColor }]}>
                  <Text style={styles.previewButtonText}>Example Button</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: DATES */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.centerIconBox}>
              <MaterialCommunityIcons name="calendar-multiselect" size={40} color={colors.primaryBrand} />
            </View>
            <Text style={styles.title}>When is the big day?</Text>
            <Text style={styles.subtitle}>Define the core timeline for your primary festival event to sync your dashboard calendars.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Event Name</Text>
              <TextInput
                style={styles.textInput}
                value={eventName}
                onChangeText={setEventName}
                placeholder="e.g. Ganesh Chaturthi 2025"
                placeholderTextColor={colors.outlineVariant}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Festival Start Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.outlineVariant}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.outlineVariant}
                />
              </View>
            </View>

            <View style={styles.infoAlert}>
              <MaterialCommunityIcons name="information" size={20} color={colors.aartiGold} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Setting these dates helps <Text style={styles.infoBold}>UTSAV</Text> automate your volunteer rosters and donation campaign countdowns.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 4: REVIEW & LAUNCH */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Ready to celebrate?</Text>
            <Text style={styles.subtitle}>Everything looks perfect. Review your Mandal details one last time before we go live.</Text>

            {/* Overview Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryAvatar}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.summaryAvatarImg as any} />
                ) : (
                  <MaterialIcons name="temple-hindu" size={32} color={colors.primaryBrand} />
                )}
              </View>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryName}>{tenantName || "Mandal Name"}</Text>
                <View style={[styles.slugBadge, { backgroundColor: accentColor + "15" }]}>
                  <Text style={[styles.slugBadgeText, { color: accentColor }]}>{slug || "mandal"}.utsav.com</Text>
                </View>
              </View>
            </View>

            {/* Config Grid */}
            <View style={styles.reviewGrid}>
              <View style={styles.reviewGridCard}>
                <View style={styles.reviewGridHeader}>
                  <MaterialCommunityIcons name="calendar" size={18} color={accentColor} />
                  <Text style={styles.reviewGridTitle}>Festival Period</Text>
                </View>
                <Text style={styles.reviewGridMain}>
                  {startDate.slice(5)} — {endDate.slice(5)}
                </Text>
                <Text style={styles.reviewGridSub}>{eventName}</Text>
              </View>

              <View style={styles.reviewGridCard}>
                <View style={styles.reviewGridHeader}>
                  <MaterialCommunityIcons name="check-decagram" size={18} color={accentColor} />
                  <Text style={styles.reviewGridTitle}>Setup Profile</Text>
                </View>
                <Text style={styles.reviewGridMain}>Tier 2: Community</Text>
                <Text style={styles.reviewGridSub}>Up to 5,000 Donors</Text>
              </View>
            </View>

            {/* Finance Card */}
            <View style={styles.financeCard}>
              <View style={styles.financeRow}>
                <View style={[styles.financeIconBox, { backgroundColor: colors.aartiGold + "20" }]}>
                  <MaterialCommunityIcons name="currency-inr" size={20} color={colors.aartiGold} />
                </View>
                <View style={styles.financeMeta}>
                  <Text style={styles.financeLabel}>Estimated Daily Capacity</Text>
                  <Text style={styles.financeValue}>₹50,000 / day processing</Text>
                </View>
              </View>
              <View style={styles.dividerV} />
              <View style={styles.financeRow}>
                <View style={[styles.financeIconBox, { backgroundColor: colors.tulsiGreen + "20" }]}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={colors.tulsiGreen} />
                </View>
                <View style={styles.financeMeta}>
                  <Text style={styles.financeLabel}>Payment Status</Text>
                  <Text style={[styles.financeValue, { color: colors.tulsiGreen }]}>Account Verified</Text>
                </View>
              </View>
            </View>

            <View style={styles.encryptionBadge}>
              <MaterialCommunityIcons name="lock-check" size={16} color={colors.tulsiGreen} />
              <Text style={styles.encryptionText}>Data encryption active & servers ready</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav Actions Bar */}
      <View style={styles.bottomActions}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}

        <View style={styles.rightActionsRow}>
          {step < 4 ? (
            <TouchableOpacity
              style={[styles.nextBtn, !isIdentityComplete && step === 1 && styles.nextBtnDisabled]}
              onPress={handleNext}
              disabled={!isIdentityComplete && step === 1}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>Next</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={colors.onPrimaryContainer} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.launchBtn, { backgroundColor: colors.primaryContainer }]}
              onPress={handleLaunch}
              activeOpacity={0.8}
              disabled={createTenantMutation.isPending}
            >
              {createTenantMutation.isPending ? (
                <ActivityIndicator color={colors.onPrimaryContainer} size="small" />
              ) : (
                <View style={styles.launchBtnContent}>
                  <Text style={styles.launchBtnText}>Launch My Mandal</Text>
                  <MaterialCommunityIcons name="rocket-launch" size={18} color={colors.onPrimaryContainer} />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Celebration success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Falling Petals Particle Layer */}
          {petals.map((p) => (
            <Animated.View
              key={p.id}
              style={[
                styles.petal,
                {
                  left: p.left,
                  backgroundColor: p.color,
                  transform: [{ translateY: p.anim }],
                },
              ]}
            />
          ))}

          <View style={styles.successCard}>
            <View style={[styles.successIconBox, { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons name="party-popper" size={40} color={colors.onPrimaryContainer} />
            </View>
            <Text style={styles.successTitle}>Harsha!</Text>
            <Text style={styles.successSubtitle}>Your Mandal is now live. Let the celebrations begin.</Text>
            <TouchableOpacity style={styles.modalCta} onPress={handleComplete} activeOpacity={0.8}>
              <Text style={styles.modalCtaText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.3)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.primaryContainer,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  stepIndicator: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.sandstone + "40",
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  progressIndicator: {
    height: "100%",
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.full,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  stepContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    fontSize: 15,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  slugPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.15)",
    marginBottom: spacing.lg,
  },
  slugPreviewText: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  slugHighlight: {
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  verticalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  verticalCard: {
    width: "47%",
    aspectRatio: 1.25,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  verticalCardActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: "rgba(255, 149, 0, 0.04)",
  },
  verticalLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  verticalLabelActive: {
    color: colors.primaryBrand,
  },
  rowInputs: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardCenter: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginBottom: spacing.md,
  },
  cardCenterTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  logoPickerContainer: {
    position: "relative",
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  logoPreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primaryContainer,
  },
  logoUploadPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryBrand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  logoHelpText: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.md,
  },
  langGrid: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  langRowActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: "rgba(255, 149, 0, 0.04)",
  },
  langLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  langText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  langTextActive: {
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  colorPalette: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  colorNodeContainer: {
    alignItems: "center",
    gap: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorCircleActive: {
    borderColor: colors.onSurface,
    transform: [{ scale: 1.1 }],
  },
  colorNodeLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  colorNodeLabelActive: {
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  livePreviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
  },
  previewHeader: {
    height: 36,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderColor: colors.sandstone,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  previewHeaderText: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
  },
  indicatorContainer: {
    flexDirection: "row",
    gap: 4,
  },
  indicatorCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sandstone,
  },
  previewBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
  previewAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  previewMeta: {
    gap: 4,
  },
  previewMetaLineLong: {
    width: 80,
    height: 8,
    backgroundColor: colors.cream,
    borderRadius: 4,
  },
  previewMetaLineShort: {
    width: 48,
    height: 6,
    backgroundColor: colors.cream,
    borderRadius: 3,
  },
  previewContentBox: {
    height: 80,
    backgroundColor: colors.cream + "30",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
  },
  previewButton: {
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  previewButtonText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
  centerIconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 72,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
    borderRadius: borderRadius.xl,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  infoAlert: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    marginTop: spacing.md,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  infoBold: {
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  summaryAvatarImg: {
    width: 64,
    height: 64,
  },
  summaryDetails: {
    flex: 1,
    gap: 4,
  },
  summaryName: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  slugBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  slugBadgeText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
  },
  reviewGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  reviewGridCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    position: "relative",
  },
  reviewGridHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
  },
  reviewGridTitle: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
  },
  reviewGridMain: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  reviewGridSub: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  financeCard: {
    backgroundColor: colors.cream,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  financeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  financeIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  financeMeta: {
    gap: 2,
  },
  financeLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  financeValue: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.onSurface,
  },
  dividerV: {
    height: 1,
    backgroundColor: colors.sandstone + "40",
  },
  encryptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  encryptionText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.sm,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  rightActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  nextBtn: {
    height: 46,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },
  nextBtnDisabled: {
    backgroundColor: colors.sandstone,
  },
  nextBtnText: {
    color: colors.onPrimaryContainer,
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
  },
  launchBtn: {
    height: 46,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  launchBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  launchBtnText: {
    color: colors.onPrimaryContainer,
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  petal: {
    position: "absolute",
    top: -20,
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.8,
  },
  successCard: {
    width: "100%",
    backgroundColor: colors.pujaWhite,
    borderRadius: borderRadius["2xl"],
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  modalCta: {
    width: "100%",
    height: 48,
    backgroundColor: colors.onSurface,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCtaText: {
    color: colors.pujaWhite,
    fontSize: 14,
    fontFamily: fonts.inter.bold,
  },
});

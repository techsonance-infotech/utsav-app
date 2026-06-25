import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchMyProfile, useUpdateMyProfile } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import LoaderOverlay from "../components/LoaderOverlay";

function CustomInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  editable = true,
  placeholder = "",
  multiline = false,
  numberOfLines = 1,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  editable?: boolean;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.fieldLabel, isFocused && styles.labelFocused]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textArea,
          isFocused && styles.inputFocused,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function DropdownSelect({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownHeader, isOpen && styles.inputFocused]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={[styles.dropdownValue, !value && { color: colors.outline }]}>
          {options.find((o) => o.value === value)?.label || "Select option"}
        </Text>
        <MaterialCommunityIcons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.onSurfaceVariant}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                option.value === value && styles.dropdownItemActive,
              ]}
              onPress={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  option.value === value && styles.dropdownItemTextActive,
                ]}
              >
                {option.label}
              </Text>
              {option.value === value && (
                <MaterialCommunityIcons name="check" size={16} color={colors.primaryBrand} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function EditProfileScreen() {
  const { data: profile, isLoading: isFetching, refetch } = useFetchMyProfile();
  const updateMutation = useUpdateMyProfile();
  const { userFullName, userEmail } = useAuthStore();

  // Helper to get initial value from profile or auth store
  const initName = profile?.full_name || userFullName || "";
  const initEmail = profile?.email || userEmail || "";
  const initPhone = profile?.phone || "";

  // Form states — initialize from profile cache when available
  const [fullName, setFullName] = useState(initName);
  const [phone, setPhone] = useState(initPhone);
  const [email, setEmail] = useState(initEmail);
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || ""); // YYYY-MM-DD
  const [city, setCity] = useState(profile?.city || "");
  const [state, setState] = useState(profile?.state || "");
  const [membershipType, setMembershipType] = useState(profile?.membership_type || "annual");
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || "en");
  const [skills, setSkills] = useState(() => {
    if (!profile?.skills) return "";
    return Array.isArray(profile.skills) ? profile.skills.join(", ") : String(profile.skills);
  });
  const [languages, setLanguages] = useState(() => {
    if (!profile?.languages) return "en";
    return Array.isArray(profile.languages) ? profile.languages.join(", ") : "en";
  });
  const [emergencyContactName, setEmergencyContactName] = useState(profile?.emergency_contact_name || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile?.emergency_contact_phone || "");
  const [notes, setNotes] = useState(profile?.notes || "");
  const [dndStartTime, setDndStartTime] = useState(profile?.dnd_start_time || ""); // HH:MM
  const [dndEndTime, setDndEndTime] = useState(profile?.dnd_end_time || ""); // HH:MM

  const [errorMsg, setErrorMsg] = useState("");
  const [hasBeenPrefilled, setHasBeenPrefilled] = useState(!!profile);

  // Pre-fill form when profile data becomes available (handles async fetch)
  useEffect(() => {
    if (profile && !hasBeenPrefilled) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
      setDateOfBirth(profile.date_of_birth || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setMembershipType(profile.membership_type || "annual");
      setPreferredLanguage(profile.preferred_language || "en");
      
      // Skills is text[] in postgres but we convert to comma separated string for easy typing
      const skillsVal = Array.isArray(profile.skills)
        ? profile.skills.join(", ")
        : (typeof profile.skills === "string" ? profile.skills : "");
      setSkills(skillsVal);

      // Languages is text[] in postgres
      const langsVal = Array.isArray(profile.languages)
        ? profile.languages.join(", ")
        : "en";
      setLanguages(langsVal);

      setEmergencyContactName(profile.emergency_contact_name || "");
      setEmergencyContactPhone(profile.emergency_contact_phone || "");
      setNotes(profile.notes || "");
      setDndStartTime(profile.dnd_start_time || "");
      setDndEndTime(profile.dnd_end_time || "");
      setHasBeenPrefilled(true);
    }
  }, [profile, hasBeenPrefilled]);

  const handleSave = async () => {
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Full Name is required.");
      return;
    }

    if (!phone.trim()) {
      setErrorMsg("Phone Number is required.");
      return;
    }

    // Optional validations
    if (dateOfBirth.trim()) {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dateOfBirth.trim())) {
        setErrorMsg("Date of Birth must be in YYYY-MM-DD format.");
        return;
      }
    }

    if (dndStartTime.trim() && !/^\d{2}:\d{2}(:\d{2})?$/.test(dndStartTime.trim())) {
      setErrorMsg("DND Start Time must be in HH:MM format.");
      return;
    }
    if (dndEndTime.trim() && !/^\d{2}:\d{2}(:\d{2})?$/.test(dndEndTime.trim())) {
      setErrorMsg("DND End Time must be in HH:MM format.");
      return;
    }

    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    const languagesArray = languages.split(",").map((l) => l.trim()).filter(Boolean);

    try {
      await updateMutation.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        languages: languagesArray.length > 0 ? languagesArray : null,
        emergencyContactName: emergencyContactName.trim() || null,
        emergencyContactPhone: emergencyContactPhone.trim() || null,
        notes: notes.trim() || null,
        preferredLanguage,
        membershipType,
        dndStartTime: dndStartTime.trim() || null,
        dndEndTime: dndEndTime.trim() || null,
      });

      router.back();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
    }
  };

  const isSaving = updateMutation.isPending;

  if (isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryBrand} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoaderOverlay visible={isSaving} message="Saving Profile..." />

      {/* Header */}
      <View style={styles.header}>
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {errorMsg ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Section 1: Personal Details */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-circle-outline" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>
          
          <View style={styles.formCard}>
            <CustomInput
              label="Full Name *"
              value={fullName}
              onChangeText={setFullName}
              editable={!isSaving}
              placeholder="e.g. Sajesh Adeya"
            />

            <CustomInput
              label="Email (Verified)"
              value={email}
              onChangeText={() => {}}
              editable={false}
            />

            <CustomInput
              label="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isSaving}
              placeholder="e.g. 9845012345"
            />

            <CustomInput
              label="Date of Birth"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              editable={!isSaving}
            />
          </View>

          {/* Section 2: Address & Preferences */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>Address & Preferences</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  editable={!isSaving}
                  placeholder="e.g. Surat"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="State"
                  value={state}
                  onChangeText={setState}
                  editable={!isSaving}
                  placeholder="e.g. Gujarat"
                />
              </View>
            </View>

            <DropdownSelect
              label="Membership Type"
              value={membershipType}
              options={[
                { label: "Annual Member", value: "annual" },
                { label: "Lifetime Member", value: "lifetime" },
                { label: "Patron Member", value: "patron" },
              ]}
              onSelect={setMembershipType}
            />

            <DropdownSelect
              label="Preferred App Language"
              value={preferredLanguage}
              options={[
                { label: "English", value: "en" },
                { label: "Hindi (हिंदी)", value: "hi" },
                { label: "Gujarati (ગુજરાતી)", value: "gu" },
              ]}
              onSelect={setPreferredLanguage}
            />
          </View>

          {/* Section 3: Skills & Notes */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="brain" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>Skills & Skills Info</Text>
          </View>

          <View style={styles.formCard}>
            <CustomInput
              label="Skills (Comma Separated)"
              value={skills}
              onChangeText={setSkills}
              editable={!isSaving}
              placeholder="e.g. Decoration, Management, Singing"
            />

            <CustomInput
              label="Languages Known (Comma Separated)"
              value={languages}
              onChangeText={setLanguages}
              editable={!isSaving}
              placeholder="e.g. en, hi, gu"
            />

            <CustomInput
              label="Personal Biography / Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              editable={!isSaving}
              placeholder="Write a brief bio or description..."
            />
          </View>

          {/* Section 4: Emergency Contacts & DND */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shield-alert-outline" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>Emergency Contact & DND Settings</Text>
          </View>

          <View style={styles.formCard}>
            <CustomInput
              label="Emergency Contact Name"
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              editable={!isSaving}
              placeholder="e.g. Ramesh Adeya"
            />

            <CustomInput
              label="Emergency Contact Phone"
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              keyboardType="phone-pad"
              editable={!isSaving}
              placeholder="e.g. 9876543210"
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="DND Start Time"
                  value={dndStartTime}
                  onChangeText={setDndStartTime}
                  placeholder="HH:MM"
                  editable={!isSaving}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="DND End Time"
                  value={dndEndTime}
                  onChangeText={setDndEndTime}
                  placeholder="HH:MM"
                  editable={!isSaving}
                />
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          disabled={isSaving}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>Save Changes</Text>
          <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.pujaWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 100, gap: 16 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 15,
    color: colors.primaryBrand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: spacing.md,
    gap: 16,
  },
  inputContainer: { gap: 6 },
  fieldLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.charcoal,
    paddingLeft: 2,
  },
  labelFocused: {
    color: colors.primaryBrand,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  inputFocused: {
    borderColor: colors.primaryContainer,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceContainer,
    color: colors.onSurfaceVariant,
    borderColor: colors.outlineVariant,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  row: { flexDirection: "row", gap: 12 },

  // Dropdown styles
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 48,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dropdownValue: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.onSurface,
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  dropdownItemActive: {
    backgroundColor: "rgba(255, 149, 0, 0.05)",
  },
  dropdownItemText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.onSurface,
  },
  dropdownItemTextActive: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.errorContainer,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.error,
    flex: 1,
  },

  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    padding: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelText: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    backgroundColor: colors.primaryBrand,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});

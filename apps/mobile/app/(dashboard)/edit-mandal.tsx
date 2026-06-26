import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchTenant, useUpdateTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import LoaderOverlay from "../components/LoaderOverlay";
import * as ImagePicker from "expo-image-picker";

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

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.toggleRowContainer}>
      <View style={{ flex: 1, marginRight: spacing.md }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function EditMandalScreen() {
  const { tenantId } = useAuthStore();
  const { data: tenant, isLoading: isFetching } = useFetchTenant(tenantId);
  const updateMutation = useUpdateTenant();

  // Form states
  const [name, setName] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [vertical, setVertical] = useState("ganpati");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("IN");
  const [address, setAddress] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [isPublicDonations, setIsPublicDonations] = useState(true);
  const [isPublicExpenses, setIsPublicExpenses] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill form when tenant data becomes available
  useEffect(() => {
    if (tenant) {
      setName(tenant.name || "");
      setFoundedYear(tenant.founded_year ? tenant.founded_year.toString() : "");
      setVertical(tenant.vertical || "ganpati");
      setWebsiteUrl(tenant.website_url || "");
      setWhatsappGroupUrl(tenant.whatsapp_group_url || "");
      setFacebookUrl(tenant.facebook_url || "");
      setInstagramUrl(tenant.instagram_url || "");
      setCity(tenant.city || "");
      setState(tenant.state || "");
      setCountry(tenant.country || "IN");
      setAddress(tenant.address || "");
      setDefaultLanguage(tenant.default_language || "en");
      setTimezone(tenant.timezone || "Asia/Kolkata");
      setIsPublicDonations(tenant.is_public_donations);
      setIsPublicExpenses(tenant.is_public_expenses);
      setLogoUrl(tenant.logo_url || "");
    }
  }, [tenant]);

  const handlePickQR = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need gallery permissions to select a QR code photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setLogoUrl(base64Uri);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to select image.");
    }
  };

  const handleSave = async () => {
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Mandal Name is required.");
      return;
    }

    let parsedFoundedYear: number | undefined;
    if (foundedYear.trim()) {
      parsedFoundedYear = parseInt(foundedYear.trim(), 10);
      if (isNaN(parsedFoundedYear)) {
        setErrorMsg("Founded Year must be a number.");
        return;
      }
    }

    try {
      await updateMutation.mutateAsync({
        id: tenantId!,
        name: name.trim(),
        founded_year: parsedFoundedYear || null,
        vertical,
        website_url: websiteUrl.trim() || null,
        whatsapp_group_url: whatsappGroupUrl.trim() || null,
        facebook_url: facebookUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim(),
        address: address.trim() || null,
        default_language: defaultLanguage,
        timezone: timezone.trim(),
        is_public_donations: isPublicDonations,
        is_public_expenses: isPublicExpenses,
        logo_url: logoUrl || null,
      });

      router.back();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update Mandal details. Please try again.");
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
      <LoaderOverlay visible={isSaving} message="Saving Mandal Details..." />

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
        <Text style={styles.headerTitle}>Edit Mandal</Text>
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

          {/* Section 1: General Info */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="home-city" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>General Info</Text>
          </View>

          <View style={styles.formCard}>
            <CustomInput
              label="Mandal Name *"
              value={name}
              onChangeText={setName}
              editable={!isSaving}
              placeholder="e.g. Truptinagarcharaja"
            />

            <DropdownSelect
              label="Mandal Category / Vertical"
              value={vertical}
              options={[
                { label: "Ganesh Chaturthi (Ganpati)", value: "ganpati" },
                { label: "Navratri (Durga Puja)", value: "durga" },
                { label: "General Festival Community", value: "general" },
              ]}
              onSelect={setVertical}
            />

            <CustomInput
              label="Founded Year"
              value={foundedYear}
              onChangeText={setFoundedYear}
              keyboardType="numeric"
              editable={!isSaving}
              placeholder="e.g. 2016"
            />
          </View>

          {/* Section 2: Contact & Social URLs */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="earth" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>Social & Contact URLs</Text>
          </View>

          <View style={styles.formCard}>
            <CustomInput
              label="Website Link"
              value={websiteUrl}
              onChangeText={setWebsiteUrl}
              editable={!isSaving}
              placeholder="e.g. https://yoursite.com"
            />

            <CustomInput
              label="WhatsApp Group Invite Link"
              value={whatsappGroupUrl}
              onChangeText={setWhatsappGroupUrl}
              editable={!isSaving}
              placeholder="e.g. https://chat.whatsapp.com/..."
            />

            <CustomInput
              label="Facebook URL"
              value={facebookUrl}
              onChangeText={setFacebookUrl}
              editable={!isSaving}
              placeholder="e.g. https://facebook.com/..."
            />

            <CustomInput
              label="Instagram URL"
              value={instagramUrl}
              onChangeText={setInstagramUrl}
              editable={!isSaving}
              placeholder="e.g. https://instagram.com/..."
            />
          </View>

          {/* Section 3: Address & Location */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>Address & Location</Text>
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

            <CustomInput
              label="Country"
              value={country}
              onChangeText={setCountry}
              editable={!isSaving}
              placeholder="e.g. IN"
            />

            <CustomInput
              label="Mandal Detailed Address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              editable={!isSaving}
              placeholder="Enter building number, street, landmark details..."
            />
          </View>

          {/* Section 4: Settings & Visibility */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog-outline" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>Visibility & Localizations</Text>
          </View>

          <View style={styles.formCard}>
            <DropdownSelect
              label="Default Language"
              value={defaultLanguage}
              options={[
                { label: "English", value: "en" },
                { label: "Hindi (हिंदी)", value: "hi" },
                { label: "Gujarati (ગુજરાતી)", value: "gu" },
              ]}
              onSelect={setDefaultLanguage}
            />

            <CustomInput
              label="Timezone"
              value={timezone}
              onChangeText={setTimezone}
              editable={!isSaving}
              placeholder="e.g. Asia/Kolkata"
            />

            <ToggleRow
              label="Public Donation Feed"
              description="Allow public visitors to see donation feed details."
              value={isPublicDonations}
              onValueChange={setIsPublicDonations}
              disabled={isSaving}
            />

            <ToggleRow
              label="Public Expense Feed"
              description="Allow public visitors to review mandal expense reports."
              value={isPublicExpenses}
              onValueChange={setIsPublicExpenses}
              disabled={isSaving}
            />
          </View>

          {/* Section 5: UPI QR Code Setup */}
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.primaryBrand} />
            <Text style={styles.sectionTitle}>UPI Payment & QR Code Setup</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Mandal UPI QR Code</Text>
            <Text style={styles.fieldSubLabel}>
              Upload the static UPI QR Code image of your Mandal's bank account. This QR Code will be displayed on the donation screen for devotees to scan and pay directly.
            </Text>

            {logoUrl ? (
              <View style={styles.qrImageContainer}>
                <Image source={{ uri: logoUrl }} style={styles.qrPreview} resizeMode="contain" />
                <View style={styles.qrActionsRow}>
                  <TouchableOpacity style={styles.qrChangeBtn} onPress={handlePickQR} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="image-edit-outline" size={16} color={colors.primaryBrand} />
                    <Text style={styles.qrChangeBtnText}>Change QR Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.qrDeleteBtn} onPress={() => setLogoUrl("")} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="delete-outline" size={16} color={colors.kumkumRed} />
                    <Text style={styles.qrDeleteBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.qrUploadBox} onPress={handlePickQR} activeOpacity={0.8}>
                <View style={styles.qrUploadIconCircle}>
                  <MaterialCommunityIcons name="qrcode" size={32} color={colors.primaryBrand} />
                </View>
                <Text style={styles.qrUploadTitle}>Upload UPI QR Code Image</Text>
                <Text style={styles.qrUploadSubtitle}>JPG or PNG format, square aspect recommended</Text>
              </TouchableOpacity>
            )}
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
    height: 80,
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

  // Toggle row styles
  toggleRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.pujaWhite,
    borderRadius: 12,
    paddingVertical: 4,
  },
  toggleLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },
  toggleDescription: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
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
  fieldSubLabel: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  qrUploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.outlineVariant,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 149, 0, 0.02)",
    gap: 8,
  },
  qrUploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  qrUploadTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  qrUploadSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  qrImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: "rgba(255, 149, 0, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  qrPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  qrActionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  qrChangeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: "#FFFFFF",
  },
  qrChangeBtnText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.primaryBrand,
  },
  qrDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: "#FFFFFF",
  },
  qrDeleteBtnText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.kumkumRed,
  },
});

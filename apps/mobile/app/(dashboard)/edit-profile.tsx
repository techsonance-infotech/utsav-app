import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useUpdateTenant } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EditProfileScreen() {
  const [name, setName] = useState("Aravind Sharma");
  const [displayName, setDisplayName] = useState("aravind_utsav");
  const [bio, setBio] = useState(
    "Devoted to organizing community festivals and fostering spirit. Managing Ganesha Chaturthi celebrations for over 10 years in Malleshwaram. Always looking for passionate volunteers!"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [toastOpacity] = useState(new Animated.Value(0));

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Show success toast
      Animated.sequence([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
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
        </View>
        <MaterialCommunityIcons
          name="account-settings"
          size={24}
          color={colors.primaryBrand}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {name.split(" ").map((n) => n[0]).join("")}
              </Text>
            </View>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileRole}>Community Lead • Bengaluru</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="account-outline"
                size={22}
                color={colors.outline}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={colors.outline}
              />
            </View>
          </View>

          {/* Display Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="at"
                size={22}
                color={colors.outline}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                placeholderTextColor={colors.outline}
              />
            </View>
            <Text style={styles.helperText}>
              This is how your name will appear in festival volunteer lists.
            </Text>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Verified Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={[styles.inputWrapper, { flex: 1, backgroundColor: colors.surfaceContainer }]}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={22}
                  color={colors.outline}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.onSurfaceVariant }]}
                  value="+91 98450 12345"
                  editable={false}
                />
              </View>
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color={colors.tulsiGreen}
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.outline}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Privacy Action Card */}
        <TouchableOpacity style={styles.privacyCard} activeOpacity={0.7}>
          <View style={styles.privacyLeft}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={22}
              color={colors.outline}
            />
            <Text style={styles.privacyText}>Privacy & Security Settings</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.outline}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionInner}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.saveText}>Save Profile</Text>
                <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Toast */}
      <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
        <View style={styles.toastContent}>
          <MaterialCommunityIcons
            name="check-circle"
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.toastText}>Profile Updated Successfully!</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.primaryBrand,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 120, gap: 24 },

  avatarSection: { alignItems: "center", marginTop: 8 },
  avatarWrapper: { position: "relative", marginBottom: 12 },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.cream,
    borderWidth: 4,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: fonts.poppins.bold,
    fontSize: 32,
    color: colors.primaryBrand,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primaryContainer,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.pujaWhite,
  },
  profileName: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 20,
    color: colors.primaryBrand,
  },
  profileRole: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  formCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: spacing.md,
    gap: 16,
  },
  inputGroup: { gap: 6 },
  label: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    backgroundColor: colors.pujaWhite,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.inter.regular,
    fontSize: 15,
    color: colors.onSurface,
  },
  helperText: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: "rgba(85,67,52,0.7)",
    paddingLeft: 4,
  },
  phoneRow: { flexDirection: "row", gap: 8 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34,197,94,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  verifiedText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.tulsiGreen,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },

  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 16,
  },
  privacyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  privacyText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },

  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,248,244,0.9)",
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    padding: 16,
  },
  actionInner: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 15,
    color: colors.charcoal,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: colors.onPrimaryContainer,
  },

  toast: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 100,
  },
  toastContent: {
    backgroundColor: colors.tulsiGreen,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  toastText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});

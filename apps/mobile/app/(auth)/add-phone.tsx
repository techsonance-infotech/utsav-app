import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AddPhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSendOtp = () => {
    if (phoneNumber.length !== 10) {
      return;
    }

    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push({
          pathname: "/(auth)/otp-entry",
          params: { phone: `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}` },
        });
      }, 1000);
    }, 1200);
  };

  const isPhoneValid = phoneNumber.length === 10;

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast Notification */}
      {showToast && (
        <View style={styles.toast}>
          <MaterialCommunityIcons name="check-circle" size={18} color={colors.tulsiGreen} />
          <Text style={styles.toastText}>OTP sent successfully</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header navigation (back button) */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          {/* Background Atmospheric Blur simulation */}
          <View style={styles.bgBlobLeft} />
          <View style={styles.bgBlobRight} />

          {/* Diya/Lightbulb Icon Container */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="lightbulb-on" size={40} color={colors.onPrimaryContainer} />
            </View>
          </View>

          {/* Text/Typography Section */}
          <View style={styles.textSection}>
            <Text style={styles.title}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>
              A phone number is required for OTP security and SMS donation receipts to keep your account safe.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.inputLabelRow}>
              <Text style={styles.inputLabel}>Phone Number</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.prefixWrapper}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.textInput}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="00000 00000"
                placeholderTextColor={colors.outlineVariant}
                value={phoneNumber}
                onChangeText={(val) => setPhoneNumber(val.replace(/[^0-9]/g, ""))}
                editable={!loading}
              />
            </View>

            <Text style={styles.inputHelpText}>
              An OTP will be sent to this mobile number.
            </Text>

            {/* Action button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                !isPhoneValid && styles.actionBtnDisabled,
              ]}
              disabled={!isPhoneValid || loading}
              onPress={handleSendOtp}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimaryContainer} size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.btnText}>Send OTP</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimaryContainer} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Linked Badge & Secondary Options */}
          <View style={styles.footerSection}>
            <View style={styles.linkedBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.linkedBadgeText}>Linked to Google Account</Text>
            </View>

            <TouchableOpacity activeOpacity={0.7} style={styles.changeAccountBtn}>
              <Text style={styles.changeAccountText}>Change account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Security mention footer */}
      <View style={styles.securityFooter}>
        <MaterialCommunityIcons name="lock-outline" size={14} color={colors.outlineVariant} />
        <Text style={styles.securityText}>Secure 256-bit SSL encrypted connection</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  toast: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: "5%",
    right: "5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  toastText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.onSurface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  bgBlobLeft: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(140, 80, 0, 0.04)",
    zIndex: -1,
  },
  bgBlobRight: {
    position: "absolute",
    bottom: 50,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 149, 0, 0.06)",
    zIndex: -1,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: colors.primaryContainer,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  textSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
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
    lineHeight: 20,
  },
  formCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.sandstone,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  inputLabelRow: {
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  inputContainer: {
    flexDirection: "row",
    height: 56,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.pujaWhite,
    overflow: "hidden",
    alignItems: "center",
  },
  prefixWrapper: {
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.sandstone,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  prefixText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  textInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: spacing.md,
    fontFamily: fonts.inter.semibold,
    fontSize: 16,
    color: colors.onSurface,
    letterSpacing: 2,
  },
  inputHelpText: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.outlineVariant,
    marginTop: spacing.xs + 2,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    height: 56,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  actionBtnDisabled: {
    backgroundColor: colors.sandstone,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onPrimaryContainer,
  },
  footerSection: {
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
  },
  linkedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.tulsiGreen,
  },
  linkedBadgeText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  changeAccountBtn: {
    paddingVertical: 4,
  },
  changeAccountText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.primaryBrand,
    textDecorationLine: "underline",
  },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.2)",
  },
  securityText: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.outlineVariant,
  },
});

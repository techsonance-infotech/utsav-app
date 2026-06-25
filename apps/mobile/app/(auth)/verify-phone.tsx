import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function MobileVerifyPhoneScreen() {
  const params = useLocalSearchParams();
  const [phone, setPhone] = useState((params.phone as string) || "98765 43210");
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Breathing animation for Diya glow
  const breatheAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSendCode = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      router.push({
        pathname: "/(auth)/otp-entry",
        params: { phone },
      });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Navigation */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ambient Glow Background */}
          <View style={styles.ambientContainer}>
            <Animated.View style={[styles.ambientGlow, { transform: [{ scale: breatheAnim }] }, Platform.OS === 'web' ? { filter: 'blur(40px)' } as any : null]} />
          </View>

          {/* Diya Illustration Box */}
          <View style={styles.illustrationCard}>
            <MaterialCommunityIcons name="lightbulb-on" size={48} color={colors.primaryBrand} />
            <View style={styles.indicatorDot} />
          </View>

          {/* Header Text */}
          <View style={styles.textHeader}>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              We'll send a 6-digit code to verify your identity.
            </Text>
          </View>

          {/* Input & Form Area */}
          <View style={styles.formContainer}>
            <View style={styles.phoneInputRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+91</Text>
                <MaterialCommunityIcons name="chevron-down" size={16} color={colors.onSurfaceVariant} />
              </View>

              <View style={styles.numberBox}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={[styles.textInput, isEditing && styles.textInputEditing]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={isEditing}
                  placeholder="Enter mobile number"
                  placeholderTextColor={colors.outlineVariant}
                />
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={isEditing ? "check" : "pencil"}
                  size={20}
                  color={colors.primaryBrand}
                />
              </TouchableOpacity>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendCode}
              disabled={isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <Text style={styles.sendButtonText}>Sending...</Text>
              ) : (
                <View style={styles.sendBtnContent}>
                  <Text style={styles.sendButtonText}>Send Verification Code</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimaryContainer} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpLink} activeOpacity={0.7}>
              <Text style={styles.helpText}>
                Problems receiving code? <Text style={styles.helpTextBold}>Get help</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Illustrative Dots Footer */}
          <View style={styles.footerDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  topHeader: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  backButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  ambientContainer: {
    position: "absolute",
    top: 0,
    width: width,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
  ambientGlow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 149, 0, 0.06)",
  },
  illustrationCard: {
    width: 100,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius["2xl"],
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryContainer,
    position: "absolute",
    bottom: 12,
  },
  textHeader: {
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
    gap: spacing.lg,
  },
  phoneInputRow: {
    flexDirection: "row",
    height: 60,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  prefixBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRightWidth: 1,
    borderColor: colors.sandstone,
    paddingRight: spacing.sm,
    marginRight: spacing.sm,
    gap: 4,
  },
  prefixText: {
    fontSize: 16,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  numberBox: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  textInput: {
    fontSize: 16,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
    padding: 0,
  },
  textInputEditing: {
    color: colors.primaryBrand,
  },
  editButton: {
    padding: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primaryContainer,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  sendBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sendButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
  },
  helpLink: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  helpText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  helpTextBold: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  footerDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sandstone,
  },
  dotActive: {
    backgroundColor: colors.primaryContainer,
  },
});

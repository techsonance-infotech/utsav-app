import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function MobileOtpEntryScreen() {
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || "+91 98765 43210";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(59);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanText.slice(-1);
    setOtp(newOtp);

    // Auto-focus next cell
    if (cleanText.length > 0 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimeLeft(59);
    setOtp(Array(6).fill(""));
    inputRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    const codeString = otp.join("");
    if (codeString.length < 6) return;

    setIsVerifying(true);
    // Simulate successful backend verification verification
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        router.replace("/(auth)/tenant-setup");
      }, 1000);
    }, 1500);
  };

  const isOtpComplete = otp.every((char) => char.length > 0);

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
          {/* Background Blobs */}
          <View style={styles.bgBlobs}>
            <View style={styles.bottomLeftBlob} />
            <View style={styles.topRightBlob} />
          </View>

          {/* Heading Section */}
          <View style={styles.textHeader}>
            <Text style={styles.title}>Enter Code</Text>
            <Text style={styles.subtitle}>
              Sent to <Text style={styles.phoneHighlight}>{phone}</Text>
            </Text>
          </View>

          {/* 6-Digit OTP Grid */}
          <View style={styles.otpContainer}>
            {otp.map((char, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  char.length > 0 && styles.otpInputFilled,
                ]}
                value={char}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isVerifying && !isSuccess}
              />
            ))}
          </View>

          {/* Resend Timer or Button */}
          <View style={styles.timerContainer}>
            {timeLeft > 0 ? (
              <View style={styles.timerRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.timerText}>
                  Resend code in{" "}
                  <Text style={styles.timerCountdown}>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </Text>
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendText}>Resend SMS</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* CTA Action Button */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!isOtpComplete || isVerifying || isSuccess) && styles.verifyButtonDisabled,
                isSuccess && styles.verifyButtonSuccess,
              ]}
              onPress={handleVerify}
              disabled={!isOtpComplete || isVerifying || isSuccess}
              activeOpacity={0.8}
            >
              {isVerifying ? (
                <View style={styles.btnContent}>
                  <ActivityIndicator color={colors.onPrimaryContainer} size="small" />
                  <Text style={styles.verifyButtonText}>Verifying...</Text>
                </View>
              ) : isSuccess ? (
                <View style={styles.btnContent}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={[styles.verifyButtonText, { color: "#FFFFFF" }]}>Verified</Text>
                </View>
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimaryContainer} />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.legalDisclaimer}>
              By continuing, you agree to receive transactional SMS for authentication purposes.
            </Text>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  bgBlobs: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: "hidden",
  },
  bottomLeftBlob: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
  },
  topRightBlob: {
    position: "absolute",
    top: 100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(201, 146, 26, 0.05)",
  },
  textHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  phoneHighlight: {
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
    marginBottom: spacing.lg,
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 56,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    textAlign: "center",
    fontSize: 20,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  otpInputFilled: {
    borderColor: colors.primaryContainer,
    backgroundColor: "#FFFFFF",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: spacing.xl * 1.5,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  timerCountdown: {
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  resendText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    textDecorationLine: "underline",
  },
  ctaContainer: {
    marginTop: "auto",
    width: "100%",
    gap: spacing.md,
  },
  verifyButton: {
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
  verifyButtonDisabled: {
    backgroundColor: colors.sandstone,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonSuccess: {
    backgroundColor: colors.tulsiGreen,
    shadowColor: colors.tulsiGreen,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  verifyButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
  },
  legalDisclaimer: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: "rgba(85, 67, 52, 0.6)",
    lineHeight: 16,
  },
});

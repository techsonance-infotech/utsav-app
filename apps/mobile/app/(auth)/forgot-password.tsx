import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "../lib/i18n";
import LoaderOverlay from "../components/LoaderOverlay";
import { useForgotPassword, useVerifyOtp, useResetPassword } from "@utsav/api-client";

const { width } = Dimensions.get("window");

function FloatingLabelInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  editable = true,
  rightIcon,
  onRightIconPress,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  editable?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value === "" ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value !== "" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute" as const,
    left: 16,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 6],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 10],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.onSurfaceVariant, colors.primaryBrand],
    }),
    fontFamily: fonts.inter.regular,
  };

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[
          styles.input,
          secureTextEntry && { paddingRight: 48 },
          isFocused && styles.inputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        editable={editable}
        placeholder=""
      />
      {rightIcon && (
        <TouchableOpacity style={styles.rightIcon} onPress={onRightIconPress} activeOpacity={0.7}>
          <MaterialCommunityIcons name={rightIcon as any} size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();

  // Step state: 1 = Input ID, 2 = Verify OTP, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  // Inputs
  const [emailVal, setEmailVal] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // OTP inputs
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(59);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Password inputs
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mutations
  const forgotPasswordMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyOtp();
  const resetPasswordMutation = useResetPassword();

  // Timer countdown for Step 2
  useEffect(() => {
    if (step !== 2 || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Entrance slide animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  // Handle Step 1: Submit email or phone to get OTP code
  const handleRequestOtp = async () => {
    setErrorMsg("");
    setFeedbackMsg("");

    let payload: { email?: string; phone?: string } = {};
    if (activeTab === "email") {
      if (!emailVal || !emailVal.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      payload = { email: emailVal.trim() };
    } else {
      const clean = phoneVal.replace(/\D/g, "");
      if (clean.length !== 10) {
        setErrorMsg("Please enter a valid 10-digit mobile number.");
        return;
      }
      payload = { phone: clean };
    }

    try {
      const res = await forgotPasswordMutation.mutateAsync(payload as any);
      if (res.success) {
        setResolvedEmail((res as any).email || emailVal.trim());
        setFeedbackMsg(res.message);
        setTimeLeft(59);
        setOtp(Array(6).fill(""));
        setStep(2);
      } else {
        setErrorMsg(res.message || "Failed to trigger password recovery.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Please try again.");
    }
  };

  // OTP helpers
  const handleOtpChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanText.slice(-1);
    setOtp(newOtp);

    if (cleanText.length > 0 && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg("");
    try {
      let payload = activeTab === "email" ? { email: resolvedEmail } : { phone: phoneVal.replace(/\D/g, "") };
      const res = await forgotPasswordMutation.mutateAsync(payload as any);
      if (res.success) {
        setFeedbackMsg("A new code has been sent!");
        setTimeLeft(59);
        setOtp(Array(6).fill(""));
        otpInputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend code.");
    }
  };

  // Handle Step 2: Verify OTP code
  const handleVerifyOtp = async () => {
    setErrorMsg("");
    const codeString = otp.join("");
    if (codeString.length < 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    try {
      const res = await verifyOtpMutation.mutateAsync({
        email: resolvedEmail,
        otp: codeString,
      });
      if (res.success) {
        setStep(3);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid OTP code. Please try again.");
    }
  };

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  // Handle Step 3: Set New Password
  const handleResetPassword = async () => {
    setErrorMsg("");
    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg("Password does not meet the complexity requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const codeString = otp.join("");
      const res = await resetPasswordMutation.mutateAsync({
        email: resolvedEmail,
        otp: codeString,
        password,
      });
      if (res.success) {
        setStep(4);
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Please try again.");
    }
  };

  // UI state-based messaging
  const isPending =
    forgotPasswordMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <LoaderOverlay visible={isPending} message="Please wait..." />

      {/* Top Header Navigation */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (step === 2) setStep(1);
            else if (step === 3) setStep(2);
            else router.back();
          }}
          activeOpacity={0.7}
          disabled={step === 4}
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
            <View style={styles.topLeftBlob} />
            <View style={styles.bottomRightBlob} />
          </View>

          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {step === 1 && (
              <View>
                <Text style={styles.title}>{t("forgotPasswordTitle")}</Text>
                <Text style={styles.subtitle}>{t("forgotPasswordDesc")}</Text>

                {errorMsg ? (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.secondaryBrand} />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                {/* Tabs */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === "email" && styles.tabActive]}
                    onPress={() => {
                      setActiveTab("email");
                      setErrorMsg("");
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, activeTab === "email" && styles.tabTextActive]}>
                      Email Address
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === "phone" && styles.tabActive]}
                    onPress={() => {
                      setActiveTab("phone");
                      setErrorMsg("");
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, activeTab === "phone" && styles.tabTextActive]}>
                      Mobile Number
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Form Inputs */}
                <View style={styles.form}>
                  {activeTab === "email" ? (
                    <FloatingLabelInput
                      label="Email Address"
                      value={emailVal}
                      onChangeText={setEmailVal}
                      keyboardType="email-address"
                      editable={!isPending}
                    />
                  ) : (
                    <View style={styles.phoneInputRow}>
                      <View style={styles.countryCodeBox}>
                        <Text style={styles.countryCodeText}>+91</Text>
                      </View>
                      <View style={styles.phoneInputContainer}>
                        <TextInput
                          style={styles.phoneTextInput}
                          value={phoneVal}
                          onChangeText={setPhoneVal}
                          keyboardType="phone-pad"
                          placeholder="Mobile Number"
                          placeholderTextColor={colors.onSurfaceVariant}
                          editable={!isPending}
                        />
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleRequestOtp}
                    disabled={isPending}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.submitButtonText}>{t("sendOtp")}</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimaryContainer} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.title}>{t("otpVerification")}</Text>
                <Text style={styles.subtitle}>{t("enterOtpDesc")}</Text>

                {feedbackMsg ? (
                  <View style={styles.successMessageContainer}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.tulsiGreen} />
                    <Text style={styles.successMessageText}>{feedbackMsg}</Text>
                  </View>
                ) : null}

                {errorMsg ? (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.secondaryBrand} />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                {/* OTP Input Grid */}
                <View style={styles.otpGrid}>
                  {otp.map((char, idx) => (
                    <TextInput
                      key={idx}
                      ref={(ref) => (otpInputRefs.current[idx] = ref)}
                      style={[styles.otpCell, char.length > 0 && styles.otpCellFilled]}
                      value={char}
                      onChangeText={(t) => handleOtpChange(t, idx)}
                      onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      editable={!isPending}
                    />
                  ))}
                </View>

                {/* Timer row */}
                <View style={styles.timerContainer}>
                  {timeLeft > 0 ? (
                    <Text style={styles.timerText}>
                      Resend code in <Text style={styles.timerCount}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
                      <Text style={styles.resendBtnText}>Resend OTP Code</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, otp.join("").length < 6 && styles.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={otp.join("").length < 6 || isPending}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitButtonText}>Verify Code</Text>
                  <MaterialCommunityIcons name="shield-check" size={20} color={colors.onPrimaryContainer} />
                </TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.title}>{t("forgotPasswordTitle")}</Text>
                <Text style={styles.subtitle}>Create a strong, secure new password for your account.</Text>

                {errorMsg ? (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.secondaryBrand} />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                <View style={styles.form}>
                  <FloatingLabelInput
                    label={t("newPassword")}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isPending}
                    rightIcon={showPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                  />

                  <FloatingLabelInput
                    label={t("confirmNewPassword")}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isPending}
                    rightIcon={showConfirmPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />

                  {/* Password rules checklist */}
                  <View style={styles.checklistContainer}>
                    <View style={styles.checkRow}>
                      <MaterialCommunityIcons
                        name={rules.length ? "check-circle" : "circle-outline"}
                        size={16}
                        color={rules.length ? colors.tulsiGreen : colors.onSurfaceVariant}
                      />
                      <Text style={[styles.checkText, rules.length && styles.checkTextActive]}>
                        At least 8 characters long
                      </Text>
                    </View>
                    <View style={styles.checkRow}>
                      <MaterialCommunityIcons
                        name={rules.upper && rules.lower ? "check-circle" : "circle-outline"}
                        size={16}
                        color={rules.upper && rules.lower ? colors.tulsiGreen : colors.onSurfaceVariant}
                      />
                      <Text style={[styles.checkText, rules.upper && rules.lower && styles.checkTextActive]}>
                        Contains uppercase & lowercase letters
                      </Text>
                    </View>
                    <View style={styles.checkRow}>
                      <MaterialCommunityIcons
                        name={rules.number ? "check-circle" : "circle-outline"}
                        size={16}
                        color={rules.number ? colors.tulsiGreen : colors.onSurfaceVariant}
                      />
                      <Text style={[styles.checkText, rules.number && styles.checkTextActive]}>
                        Contains at least one number
                      </Text>
                    </View>
                    <View style={styles.checkRow}>
                      <MaterialCommunityIcons
                        name={rules.symbol ? "check-circle" : "circle-outline"}
                        size={16}
                        color={rules.symbol ? colors.tulsiGreen : colors.onSurfaceVariant}
                      />
                      <Text style={[styles.checkText, rules.symbol && styles.checkTextActive]}>
                        Contains one special character (e.g. @, #, $)
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.submitButton, (!isPasswordValid || password !== confirmPassword) && styles.btnDisabled]}
                    onPress={handleResetPassword}
                    disabled={!isPasswordValid || password !== confirmPassword || isPending}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.submitButtonText}>{t("resetPasswordBtn")}</Text>
                    <MaterialCommunityIcons name="lock-reset" size={20} color={colors.onPrimaryContainer} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 4 && (
              <View style={styles.successContainer}>
                <View style={styles.successIconOuter}>
                  <View style={styles.successIconInner}>
                    <MaterialCommunityIcons name="check-all" size={48} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.successTitle}>{t("passwordResetSuccess")}</Text>
                <Text style={styles.successSubtitle}>
                  Routing you back to the sign in page to access your account securely.
                </Text>
                <ActivityIndicator color={colors.primaryBrand} style={{ marginTop: spacing.md }} />
              </View>
            )}
          </Animated.View>
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
    paddingBottom: spacing.xl,
    justifyContent: "center",
  },
  bgBlobs: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: "hidden",
  },
  topLeftBlob: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 149, 0, 0.06)",
  },
  bottomRightBlob: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(234, 179, 8, 0.05)",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius["2xl"],
    padding: spacing.xl,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    width: "100%",
  },
  title: {
    fontSize: 26,
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.06)",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  errorText: {
    color: colors.secondaryBrand,
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    flex: 1,
  },
  successMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.06)",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.15)",
  },
  successMessageText: {
    color: colors.tulsiGreen,
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.pujaWhite,
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 15,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  inputFocused: {
    borderColor: colors.primaryContainer,
    backgroundColor: "#FFFFFF",
  },
  rightIcon: {
    position: "absolute",
    right: 16,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 56,
  },
  countryCodeBox: {
    width: 64,
    height: "100%",
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  countryCodeText: {
    fontSize: 15,
    fontFamily: fonts.inter.bold,
    color: colors.onSurface,
  },
  phoneInputContainer: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.pujaWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
  },
  phoneTextInput: {
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  submitButton: {
    backgroundColor: colors.primaryContainer,
    height: 56,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
    marginTop: spacing.md,
  },
  btnDisabled: {
    backgroundColor: colors.sandstone,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
  },
  otpGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
    marginBottom: spacing.lg,
  },
  otpCell: {
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
  otpCellFilled: {
    borderColor: colors.primaryContainer,
    backgroundColor: "#FFFFFF",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  timerText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  timerCount: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  resendBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    textDecorationLine: "underline",
  },
  checklistContainer: {
    paddingHorizontal: spacing.sm,
    gap: 6,
    marginVertical: spacing.sm,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
  },
  checkTextActive: {
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  successIconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tulsiGreen,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.tulsiGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },
});

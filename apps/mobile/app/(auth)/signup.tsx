import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import { useSignUp, useLogin, supabase } from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "../lib/i18n";
import LoaderOverlay from "../components/LoaderOverlay";

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

function PhoneInput({
  value,
  onChangeText,
  editable = true,
}: {
  value: string;
  onChangeText: (t: string) => void;
  editable?: boolean;
}) {
  const { t } = useTranslation();
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
    <View style={styles.phoneInputRow}>
      <View style={styles.countryCodeBox}>
        <Text style={styles.countryCodeText}>+91</Text>
      </View>
      <View style={[styles.phoneNumContainer, isFocused && styles.inputFocused]}>
        <Animated.Text style={labelStyle}>{t("phoneNumber")}</Animated.Text>
        <TextInput
          style={styles.phoneTextInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="phone-pad"
          editable={editable}
          placeholder=""
        />
      </View>
    </View>
  );
}

export default function MobileSignupScreen() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const signupMutation = useSignUp();
  const loginMutation = useLogin();

  // Entrance fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignup = async () => {
    setErrorMsg("");

    const fullNameTrimmed = fullName.trim();
    const emailTrimmed = email.trim();
    const phoneTrimmed = phone.trim();

    if (!fullNameTrimmed || !emailTrimmed || !phoneTrimmed || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    // Full name validation: only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullNameTrimmed)) {
      setErrorMsg("Full name must contain only letters and spaces.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Phone number validation: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneTrimmed)) {
      setErrorMsg("Phone number must be exactly 10 digits.");
      return;
    }

    // Password validations: between 8 and 20 characters
    if (password.length < 8 || password.length > 20) {
      setErrorMsg("Password must be between 8 and 20 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setErrorMsg("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/\d/.test(password)) {
      setErrorMsg("Password must contain at least one number.");
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setErrorMsg("Password must contain at least one special character.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    // Split fullName into firstName & lastName
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "Member";

    try {
      await signupMutation.mutateAsync({
        firstName,
        lastName,
        phone,
        email,
        password,
      });

      // Automatically log in on success
      await loginMutation.mutateAsync({ email, password });
      
      // Navigate to phone verification
      router.push({
        pathname: "/(auth)/verify-phone",
        params: { phone },
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "utsav://(auth)/verify-phone",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize Google signup.");
    }
  };

  const isLoading = signupMutation.isPending || loginMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <LoaderOverlay visible={isLoading} message="Creating account..." />
      {/* Background Decorative Blur Blobs */}
      <View style={styles.bgBlobs}>
        <View style={styles.topRightBlob} />
        <View style={styles.bottomLeftBlob} />
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
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.header}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require("../../assets/logo.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>{t("createAccount")}</Text>
              <Text style={styles.subtitle}>{t("signupSubtitle")}</Text>
            </View>

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.secondaryBrand} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <FloatingLabelInput
                label={t("fullName")}
                value={fullName}
                onChangeText={setFullName}
                editable={!isLoading}
              />

              <FloatingLabelInput
                label={t("emailAddress")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!isLoading}
              />

              <PhoneInput
                value={phone}
                onChangeText={setPhone}
                editable={!isLoading}
              />

              <FloatingLabelInput
                label={t("password")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!isLoading}
              />

              <FloatingLabelInput
                label={t("confirmPassword")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                rightIcon={showConfirmPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                editable={!isLoading}
              />

              {/* Terms Checkbox */}
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, agreeTerms && styles.checkboxActive]}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  activeOpacity={0.8}
                >
                  {agreeTerms && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  {t("agreeTo")}{" "}
                  <Text style={styles.termsLink} onPress={() => router.push("/(dashboard)/terms-of-service?from=signup")}>
                    {t("terms")}
                  </Text>{" "}
                  {t("and")}{" "}
                  <Text style={styles.termsLink} onPress={() => router.push("/(dashboard)/privacy-policy?from=signup")}>
                    {t("policy")}
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.8 }]}
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimaryContainer} size="small" />
                ) : (
                  <View style={styles.submitBtnContent}>
                    <Text style={styles.submitButtonText}>{t("createAccount")}</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimaryContainer} />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t("orText")}</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Auth */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Image
                  style={styles.googleIcon}
                  source={{
                    uri: "https://developers.google.com/static/identity/images/g-logo.png",
                  }}
                />
                <Text style={styles.googleButtonText}>{t("googleSignIn")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("alreadyHaveAccountLink")} </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.footerLink}>{t("signInLink")}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Decorative Bottom Row */}
      <View style={styles.bottomIconsRow} pointerEvents="none">
        <MaterialIcons name="temple-hindu" size={32} color={colors.outline} style={styles.bottomIcon} />
        <MaterialCommunityIcons name="flower" size={32} color={colors.outline} style={styles.bottomIcon} />
        <MaterialCommunityIcons name="fire" size={32} color={colors.outline} style={styles.bottomIcon} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  bgBlobs: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: "hidden",
  },
  topRightBlob: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
  },
  bottomLeftBlob: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(234, 179, 8, 0.08)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: spacing.xl,
    zIndex: 1,
  },
  card: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  logoWrapper: {
    marginBottom: spacing.md,
  },
  logoImage: {
    width: 140,
    height: 60,
  },
  title: {
    fontSize: 28,
    color: colors.primaryBrand,
    fontFamily: fonts.poppins.bold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.xs,
    fontFamily: fonts.inter.regular,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorContainer,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    color: colors.secondaryBrand,
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    position: "relative",
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
  },
  input: {
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  inputFocused: {
    borderColor: colors.primaryContainer,
  },
  rightIcon: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  phoneInputRow: {
    flexDirection: "row",
    height: 56,
    gap: spacing.sm,
  },
  countryCodeBox: {
    width: 64,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  countryCodeText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  phoneNumContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
  },
  phoneTextInput: {
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  phoneLabel: {
    position: "absolute",
    left: 16,
    top: 6,
    fontSize: 10,
    color: colors.primaryBrand,
    fontFamily: fonts.inter.regular,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  checkboxActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
    lineHeight: 16,
  },
  termsLink: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.semibold,
  },
  submitButton: {
    backgroundColor: colors.primaryContainer,
    height: 54,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: spacing.xs,
  },
  submitBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  submitButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.5)",
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    letterSpacing: 2,
  },
  googleButton: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    height: 54,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontFamily: fonts.inter.medium,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  bottomIconsRow: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    opacity: 0.08,
    gap: spacing.md,
  },
  bottomIcon: {
    marginHorizontal: 4,
  },
});

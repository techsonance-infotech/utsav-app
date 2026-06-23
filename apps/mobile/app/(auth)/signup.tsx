import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuthStore } from "@utsav/stores";
import { useSignUp, useLogin, supabase } from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
        <Animated.Text style={labelStyle}>Phone Number</Animated.Text>
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

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join your Mandal community today.</Text>
            </View>

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.secondaryBrand} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <FloatingLabelInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                editable={!isLoading}
              />

              <FloatingLabelInput
                label="Email"
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
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "visibility-off" : "visibility"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!isLoading}
              />

              <FloatingLabelInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                rightIcon={showConfirmPassword ? "visibility-off" : "visibility"}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                editable={!isLoading}
              />

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.termsContainer}
                activeOpacity={0.8}
                onPress={() => setAgreeTerms(!agreeTerms)}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                  {agreeTerms && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

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
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimaryContainer} />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.googleIconContainer}>
                  {/* Google Custom Minimal Vector representation */}
                  <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Decorative Bottom Row */}
      <View style={styles.bottomIconsRow}>
        <MaterialCommunityIcons name="temple-hindu" size={32} color={colors.outline} style={styles.bottomIcon} />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    zIndex: 1,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: borderRadius["2xl"],
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
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
  googleIconContainer: {
    justifyContent: "center",
    alignItems: "center",
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

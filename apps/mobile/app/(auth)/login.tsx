import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Animated, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import { useLogin, supabase } from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

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
      toValue: (isFocused || value !== "") ? 1 : 0,
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

export default function MobileLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useLogin();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Diya Glow Animation
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

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

  const handleLogin = async () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    try {
      const res = await loginMutation.mutateAsync({ email, password });
      const isSuperAdmin =
        email.toLowerCase().trim() === "admin@utsav.app" ||
        res.tenant?.role === "super_admin" ||
        (res as any).role === "super_admin";

      if (isSuperAdmin) {
        setAuth({ role: "super_admin" });
        router.replace("/(dashboard)/super-admin-dashboard");
      } else if (res.tenant) {
        router.replace("/(dashboard)/home");
      } else {
        router.replace("/(auth)/tenant-setup");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "utsav://(dashboard)/home",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize Google login.");
    }
  };

  const isLoading = loginMutation.isPending;

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
            {/* Logo Section */}
            <View style={styles.header}>
              <Animated.View style={[styles.logoWrapper, { opacity: glowAnim }]}>
                <Image
                  source={require("../../assets/logo.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to manage your festival with ease.</Text>
            </View>

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.secondaryBrand} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
              <FloatingLabelInput
                label="Email or Phone Number"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!isLoading}
              />

              <FloatingLabelInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotContainer}
                onPress={() => router.push("/(auth)/welcome")}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Primary CTA */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Auth */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <Image
                  style={styles.googleIcon}
                  source={{
                    uri: "https://developers.google.com/static/identity/images/g-logo.png",
                  }}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.footerLink}>Start here</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.push("/(dashboard)/privacy-policy")}>
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerLinkSeparator}>•</Text>
              <TouchableOpacity onPress={() => router.push("/(dashboard)/terms-of-service")}>
                <Text style={styles.footerLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.footerLinkSeparator}>•</Text>
              <TouchableOpacity onPress={() => router.push("/(dashboard)/help-center")}>
                <Text style={styles.footerLinkText}>Help Center</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Decorative Bottom Cultural Icons Row */}
      <View style={styles.bottomIconsRow}>
        <MaterialIcons name="temple-hindu" size={54} color={colors.outline} style={styles.bottomIcon} />
        <MaterialCommunityIcons name="party-popper" size={54} color={colors.outline} style={styles.bottomIcon} />
        <MaterialCommunityIcons name="flower" size={54} color={colors.outline} style={styles.bottomIcon} />
        <MaterialCommunityIcons name="church" size={54} color={colors.outline} style={styles.bottomIcon} />
        <MaterialCommunityIcons name="flare" size={54} color={colors.outline} style={styles.bottomIcon} />
        <MaterialCommunityIcons name="fire" size={54} color={colors.outline} style={styles.bottomIcon} />
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
    color: colors.onSurface,
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
  forgotContainer: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: 12,
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
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerLinkText: {
    fontSize: 12,
    color: colors.primaryBrand,
    fontFamily: fonts.inter.semibold,
    textDecorationLine: "underline",
  },
  footerLinkSeparator: {
    fontSize: 12,
    color: colors.outline,
    opacity: 0.5,
  },
});

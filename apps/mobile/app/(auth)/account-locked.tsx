import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function AccountLockedScreen() {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 22); // 14 mins 22 secs
  const initialTime = 15 * 60; // 15 mins total
  const spinValue = new Animated.Value(0);

  // Rotation animation for dashed circle
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progress = (timeLeft / initialTime) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Utsav</Text>
        <View style={styles.avatarWrapper}>
          <MaterialCommunityIcons name="account-lock" size={20} color={colors.kumkumRed} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient Blur circles */}
        <View style={styles.bgBlobRight} />
        <View style={styles.bgBlobLeft} />

        {/* Lock Animation Area */}
        <View style={styles.lockContainer}>
          {/* Animated dashed circle */}
          <Animated.View style={[styles.dashedBorder, { transform: [{ rotate: spin }] }]} />
          {/* Inner circle */}
          <View style={styles.innerCircle} />
          {/* Lock Icon Wrapper */}
          <View style={styles.lockIconBg}>
            <MaterialCommunityIcons name="lock" size={64} color={colors.kumkumRed} />
          </View>
          {/* Warning badge */}
          <View style={styles.warningBadge}>
            <MaterialCommunityIcons name="alert" size={14} color="#FFFFFF" />
          </View>
        </View>

        {/* Message details */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Account Locked</Text>
          <Text style={styles.subtitle}>
            For security reasons, your account is temporarily locked due to{" "}
            <Text style={styles.alertText}>5 failed</Text> OTP attempts.
          </Text>
        </View>

        {/* Countdown Timer Block */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Unlocks in</Text>
          <View style={styles.timerRow}>
            <Text style={styles.timerText}>{String(minutes).padStart(2, "0")}</Text>
            <Text style={styles.timerSeparator}>:</Text>
            <Text style={styles.timerText}>{String(seconds).padStart(2, "0")}</Text>
          </View>

          {/* Progress track */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Actions CTAs */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Okay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
            <MaterialCommunityIcons name="help-circle-outline" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.secondaryBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Secure Note footer */}
        <View style={styles.footerNote}>
          <MaterialCommunityIcons name="shield-check-outline" size={14} color="rgba(85, 67, 52, 0.6)" />
          <Text style={styles.footerNoteText}>Your data and funds remain secure.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(217, 43, 43, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.kumkumRed,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  bgBlobRight: {
    position: "absolute",
    top: 50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 149, 0, 0.04)",
    zIndex: -1,
  },
  bgBlobLeft: {
    position: "absolute",
    bottom: 50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(217, 43, 43, 0.03)",
    zIndex: -1,
  },
  lockContainer: {
    width: 192,
    height: 192,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    position: "relative",
  },
  dashedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 96,
    borderWidth: 2,
    borderColor: colors.sandstone,
    borderStyle: "dashed",
  },
  innerCircle: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(140, 80, 0, 0.2)",
  },
  lockIconBg: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.kumkumRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  warningBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.kumkumRed,
    borderWidth: 2,
    borderColor: colors.pujaWhite,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
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
    maxWidth: 280,
  },
  alertText: {
    fontFamily: fonts.inter.bold,
    color: colors.kumkumRed,
  },
  timerCard: {
    width: "100%",
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  timerLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 32,
    color: colors.primaryBrand,
    width: 48,
    textAlign: "center",
  },
  timerSeparator: {
    fontFamily: fonts.poppins.bold,
    fontSize: 28,
    color: colors.primaryBrand,
    marginHorizontal: 2,
  },
  progressTrack: {
    height: 4,
    width: "100%",
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primaryContainer,
    borderRadius: 2,
  },
  actionsContainer: {
    width: "100%",
    gap: spacing.md,
  },
  primaryBtn: {
    width: "100%",
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
  primaryBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onPrimaryContainer,
  },
  secondaryBtn: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  secondaryBtnText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    gap: 6,
  },
  footerNoteText: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: "rgba(85, 67, 52, 0.6)",
  },
});

import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Animated, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ExpiredInvitationScreen() {
  const breatheAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Breathing smoke effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Entry animation for messaging
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDownload = () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/utsav"
        : "https://play.google.com/store/apps/details?id=com.utsav.app";
    Linking.openURL(url).catch(() => {});
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
          <Text style={styles.headerBrand}>Utsav</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Unlit Diya Illustration */}
        <View style={styles.diyaSection}>
          <View style={styles.gradientBg} />
          <View style={styles.diyaContainer}>
            <MaterialCommunityIcons
              name="candle"
              size={80}
              color={colors.onSurfaceVariant}
              style={{ opacity: 0.5 }}
            />
            {/* Smoke effect */}
            <Animated.View
              style={[
                styles.smokeEffect,
                { opacity: breatheAnim },
              ]}
            />
          </View>
        </View>

        {/* Messaging */}
        <Animated.View
          style={[
            styles.messaging,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.expiredTitle}>Invitation Link Expired</Text>
          <Text style={styles.expiredBody}>
            This link is no longer active. Please contact your{" "}
            <Text style={styles.highlight}>Mandal administrator</Text> for a
            new invite.
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actions,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleDownload}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="download"
              size={22}
              color={colors.onPrimary}
            />
            <Text style={styles.primaryBtnText}>Download Utsav App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace("/(auth)/welcome")}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="home-outline"
              size={22}
              color={colors.onSurfaceVariant}
            />
            <Text style={styles.secondaryBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Support */}
        <TouchableOpacity
          style={styles.supportLink}
          onPress={() => Linking.openURL("mailto:support@utsav.app")}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={18}
            color={colors.primaryBrand}
          />
          <Text style={styles.supportText}>
            Need help? Contact support
          </Text>
        </TouchableOpacity>
      </View>

      {/* Decorative Bottom */}
      <View style={styles.decorativeBottom} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255,248,244,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232,226,214,0.3)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerBrand: {
    fontFamily: fonts.poppins.bold,
    fontSize: 28,
    color: colors.primaryBrand,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },

  // Diya
  diyaSection: { alignItems: "center", marginBottom: 24, position: "relative" },
  gradientBg: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(232,226,214,0.2)",
    top: -20,
  },
  diyaContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
  },
  smokeEffect: {
    position: "absolute",
    top: 20,
    width: 4,
    height: 40,
    backgroundColor: "rgba(58,53,48,0.15)",
    borderRadius: 2,
  },

  // Messaging
  messaging: { alignItems: "center", maxWidth: 340, marginBottom: 32, gap: 12 },
  expiredTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 26,
    color: colors.onSurface,
    textAlign: "center",
  },
  expiredBody: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  highlight: {
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },

  // Actions
  actions: { width: "100%", maxWidth: 320, gap: 10 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    backgroundColor: colors.primaryBrand,
    borderRadius: 12,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    color: colors.onPrimary,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    backgroundColor: colors.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  secondaryBtnText: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },

  // Support
  supportLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  supportText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.primaryBrand,
  },

  decorativeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(232,226,214,0.3)",
    opacity: 0.4,
  },
});

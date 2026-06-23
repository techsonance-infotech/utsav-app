import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const [activeLang, setActiveLang] = React.useState("EN");

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Background Glows */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <View style={styles.content}>
        {/* Top: Logo */}
        <View style={styles.logoHeader}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="fire"
              size={40}
              color={colors.primaryContainer}
            />
          </View>
        </View>

        {/* Middle: Illustration & Headlines */}
        <View style={styles.heroSection}>
          {/* Illustration Placeholder with Glow */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationGlow} />
            <View style={styles.illustrationBox}>
              <MaterialCommunityIcons
                name="party-popper"
                size={80}
                color={colors.primaryContainer}
              />
              <Text style={styles.illustrationLabel}>Cultural Celebrations</Text>
            </View>
          </View>

          {/* Typography Cluster */}
          <View style={styles.typographyCluster}>
            <View style={styles.titleRow}>
              <Text style={styles.mainTitle}>Utsav</Text>
              <Text style={styles.hindiTitle}>उत्सव</Text>
            </View>
            <Text style={styles.tagline}>
              Celebrate Together. Manage Everything.
            </Text>
          </View>
        </View>

        {/* Bottom: Actions & Language */}
        <View style={styles.footerSection}>
          {/* Action Cluster */}
          <View style={styles.actionCluster}>
            {/* Primary Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text style={styles.primaryButtonText}>Start Your Festival</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={colors.onPrimaryContainer}
              />
            </TouchableOpacity>

            {/* Secondary Link */}
            <TouchableOpacity
              style={styles.secondaryLink}
              activeOpacity={0.7}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.secondaryLinkText}>
                Already have an account?{" "}
                <Text style={styles.signInText}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Language Switcher Pill */}
          <View style={styles.langSwitcher}>
            {["EN", "हि", "ગુ"].map((lang, idx) => (
              <React.Fragment key={lang}>
                {idx > 0 && <View style={styles.langDivider} />}
                <TouchableOpacity
                  style={styles.langButton}
                  onPress={() => setActiveLang(lang)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langText,
                      activeLang === lang && styles.langTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  glowTopLeft: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(201, 146, 26, 0.05)",
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -40,
    right: -40,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoHeader: {
    alignItems: "center",
    paddingTop: spacing.md,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: spacing.md,
  },
  illustrationContainer: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 4 / 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    position: "relative",
  },
  illustrationGlow: {
    position: "absolute",
    width: "80%",
    height: "80%",
    borderRadius: 160,
    backgroundColor: "rgba(255, 149, 0, 0.06)",
  },
  illustrationBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationLabel: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },
  typographyCluster: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  mainTitle: {
    fontSize: 40,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: -0.8,
  },
  hindiTitle: {
    fontSize: 32,
    fontFamily: fonts.poppins.bold,
    color: "rgba(140, 80, 0, 0.5)",
  },
  tagline: {
    fontSize: 16,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  footerSection: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    gap: spacing.xl,
  },
  actionCluster: {
    width: "100%",
    alignItems: "center",
    gap: spacing.md,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 20,
    fontFamily: fonts.poppins.semibold,
    color: colors.onPrimaryContainer,
  },
  secondaryLink: {
    padding: spacing.sm,
  },
  secondaryLinkText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  signInText: {
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  langSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 9999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  langButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  langDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.sandstone,
    marginHorizontal: spacing.xs,
  },
  langText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  langTextActive: {
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
});

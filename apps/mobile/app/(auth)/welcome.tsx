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
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const [activeLang, setActiveLang] = React.useState("EN");

  return (
    <LinearGradient
      colors={["#FCFBF9", "#F5EFE4"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Top: Logo */}
          <View style={styles.logoHeader}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Middle: Illustration & Headlines */}
          <View style={styles.heroSection}>
            {/* Illustration Card */}
            <View style={styles.illustrationContainer}>
              <Image
                source={require("../../assets/welcome-banner.png")}
                style={styles.bannerImage}
                resizeMode="contain"
              />
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
                  color="#FFFFFF"
                  style={{ marginLeft: 4 }}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoHeader: {
    alignItems: "center",
    paddingTop: spacing.xs,
    height: 60,
    justifyContent: "center",
  },
  logoImage: {
    width: 130,
    height: 50,
  },
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  illustrationContainer: {
    width: "100%",
    maxWidth: 340,
    aspectRatio: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginBottom: spacing.lg,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  typographyCluster: {
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  mainTitle: {
    fontSize: 38,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: -0.8,
  },
  hindiTitle: {
    fontSize: 28,
    fontFamily: fonts.poppins.bold,
    color: "rgba(140, 80, 0, 0.5)",
  },
  tagline: {
    fontSize: 15,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  footerSection: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  actionCluster: {
    width: "100%",
    alignItems: "center",
    gap: spacing.xs,
  },
  primaryButton: {
    width: "100%",
    height: 54,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: fonts.poppins.semibold,
    color: "#FFFFFF",
  },
  secondaryLink: {
    padding: spacing.xs,
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
    backgroundColor: "rgba(244, 241, 235, 0.6)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  langButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  langDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.sandstone,
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

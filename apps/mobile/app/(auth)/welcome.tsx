import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "../lib/i18n";

export default function WelcomeScreen() {
  const { t, language, setLanguage } = useTranslation();
  
  const activeLang = language === "en" ? "EN" : language === "hi" ? "हि" : "ગુ";
  
  const handleLangSelect = (langLabel: string) => {
    const langCode = langLabel === "EN" ? "en" : langLabel === "हि" ? "hi" : "gu";
    setLanguage(langCode);
  };

  return (
    <LinearGradient
      colors={["#FCFBF9", "#F5EFE4"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Middle: Hero Section */}
          <View style={styles.heroSection}>
            {/* Logo Mark Container */}
            <View style={styles.logoMarkContainer}>
              <Image
                source={require("../../assets/image-only.png")}
                style={styles.logoMarkImage}
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
                {t("tagline")}
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
                <Text style={styles.primaryButtonText}>{t("startFestival")}</Text>
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
                  {t("alreadyHaveAccount")}{" "}
                  <Text style={styles.signInText}>{t("signInText")}</Text>
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
                    onPress={() => handleLangSelect(lang)}
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
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoMarkContainer: {
    width: 140,
    height: 168,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  logoMarkImage: {
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

import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const APP_VERSION = "2.4.0";
const APP_BUILD = "108";

export default function AboutUtsavScreen() {
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.9,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, []);

  const handleLink = (type: "website" | "support" | "rate") => {
    const urls: Record<string, string> = {
      website: "https://utsav.app",
      support: "mailto:support@utsav.app",
      rate:
        Platform.OS === "ios"
          ? "https://apps.apple.com/app/utsav"
          : "https://play.google.com/store/apps/details?id=com.utsav.app",
    };
    Linking.openURL(urls[type]).catch(() =>
      Alert.alert("Error", "Could not open link.")
    );
  };

  const connectLinks = [
    {
      icon: "web" as const,
      label: "Visit Website",
      type: "website" as const,
      showChevron: true,
    },
    {
      icon: "face-agent" as const,
      label: "Contact Support",
      type: "support" as const,
      showChevron: true,
    },
    {
      icon: "star-outline" as const,
      label: "Rate the App",
      type: "rate" as const,
      showChevron: false,
      rating: "4.9",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
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
          <Text style={styles.headerTitle}>About Utsav</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Branding */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.diyaContainer,
              {
                transform: [{ scale: breatheAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="fire"
              size={64}
              color={colors.primaryBrand}
            />
          </Animated.View>
          <Text style={styles.brandName}>Utsav</Text>
          <Text style={styles.brandTagline}>
            Celebrate Together. Manage Everything.
          </Text>
        </View>

        {/* Mission & Vision Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.missionCard}>
            <View style={styles.cardIconRow}>
              <View style={styles.cardIconBg}>
                <MaterialCommunityIcons
                  name="flag"
                  size={22}
                  color={colors.primaryBrand}
                />
              </View>
              <Text style={styles.cardTitle}>Our Mission</Text>
            </View>
            <Text style={styles.cardBody}>
              Empowering Indian festivals through digital transparency. We
              bridge the gap between ancient traditions and modern
              organizational rigor, ensuring community leaders have the
              precision tools needed to thrive.
            </Text>
          </View>

          <View style={styles.missionCard}>
            <View style={styles.cardIconRow}>
              <View style={styles.cardIconBg}>
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={22}
                  color={colors.primaryBrand}
                />
              </View>
              <Text style={styles.cardTitle}>Our Vision</Text>
            </View>
            <Text style={styles.cardBody}>
              Becoming the definitive digital OS for cultural celebrations. Our
              goal is to preserve the soul of the community while automating
              the logistics of the sacred.
            </Text>
          </View>
        </View>

        {/* Community Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statsOverlay} />
          <View style={styles.statsContent}>
            <View style={styles.statsTag}>
              <Text style={styles.statsTagText}>GLOBAL COMMUNITY</Text>
            </View>
            <Text style={styles.statsHeading}>
              Serving 500+ Cultural Communities
            </Text>
          </View>
        </View>

        {/* Connect Links */}
        <View style={styles.connectSection}>
          <Text style={styles.sectionLabel}>CONNECT WITH US</Text>
          <View style={styles.connectCard}>
            {connectLinks.map((link, idx) => (
              <TouchableOpacity
                key={link.type}
                style={[
                  styles.connectRow,
                  idx < connectLinks.length - 1 && styles.connectRowBorder,
                ]}
                onPress={() => handleLink(link.type)}
                activeOpacity={0.7}
              >
                <View style={styles.connectLeft}>
                  <MaterialCommunityIcons
                    name={link.icon}
                    size={22}
                    color={colors.primaryBrand}
                  />
                  <Text style={styles.connectLabel}>{link.label}</Text>
                </View>
                {link.showChevron ? (
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color={colors.outlineVariant}
                  />
                ) : (
                  <View style={styles.ratingBadge}>
                    <MaterialCommunityIcons
                      name="star"
                      size={14}
                      color={colors.aartiGold}
                    />
                    <Text style={styles.ratingText}>{link.rating}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version {APP_VERSION} (Build {APP_BUILD})
          </Text>
          <Text style={styles.footerText}>
            © 2024 Utsav Technologies Pvt Ltd.
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232,226,214,0.3)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 20,
    color: colors.primaryBrand,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: 28 },

  // Hero
  heroSection: { alignItems: "center", paddingVertical: 16, gap: 12 },
  diyaContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,149,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  brandName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 32,
    color: colors.primaryBrand,
  },
  brandTagline: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Cards
  cardsRow: { gap: 12 },
  missionCard: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: spacing.lg,
  },
  cardIconRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  cardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255,149,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 20,
    color: colors.primaryBrand,
  },
  cardBody: {
    fontFamily: fonts.inter.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
  },

  // Stats Banner
  statsBanner: {
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.charcoal,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  statsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(58,53,48,0.6)",
  },
  statsContent: { padding: 16, zIndex: 1 },
  statsTag: {
    backgroundColor: "rgba(140,80,0,0.9)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  statsTagText: {
    fontFamily: fonts.inter.medium,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  statsHeading: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 18,
    color: colors.pujaWhite,
  },

  // Connect
  connectSection: { gap: 10 },
  sectionLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    paddingHorizontal: 4,
  },
  connectCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
  },
  connectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
  },
  connectRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.sandstone },
  connectLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  connectLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 16,
    color: colors.onSurface,
  },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.aartiGold,
  },

  // Footer
  footer: { alignItems: "center", paddingVertical: 8, gap: 4 },
  footerText: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
});

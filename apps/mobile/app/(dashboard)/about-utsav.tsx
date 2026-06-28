import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated, Linking, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const APP_VERSION = "2.4.1";
const APP_BUILD = "109";

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

  const handleContactLink = (type: "phone" | "email" | "website" | "address") => {
    const urls = {
      phone: "tel:9173101711",
      email: "mailto:admin@techsonance.co.in",
      website: "https://www.techsonance.co.in",
      address: "https://www.google.com/maps/search/?api=1&query=UG-15,+Palladium+plaza,+VIP+Road,+Vesu+Surat,+Gujarat,+India+-+395007",
    };
    Linking.openURL(urls[type]).catch(() =>
      Alert.alert("Error", `Could not launch ${type} link.`)
    );
  };

  const businessDetails = [
    {
      icon: "domain" as const,
      label: "Developer & Publisher",
      value: "TechSonance Infotech LLP",
      action: null,
    },
    {
      icon: "phone-outline" as const,
      label: "Contact Mobile",
      value: "+91 91731 01711",
      action: () => handleContactLink("phone"),
    },
    {
      icon: "email-outline" as const,
      label: "Email Support",
      value: "admin@techsonance.co.in",
      action: () => handleContactLink("email"),
    },
    {
      icon: "web" as const,
      label: "Official Website",
      value: "www.techsonance.co.in",
      action: () => handleContactLink("website"),
    },
    {
      icon: "map-marker-outline" as const,
      label: "Corporate Office Address",
      value: "UG-15, Palladium plaza, VIP Road, Vesu Surat, Gujarat, India - 395007",
      action: () => handleContactLink("address"),
    },
  ];

  const features = [
    {
      icon: "palette-outline" as const,
      iconBg: "rgba(140, 80, 0, 0.08)",
      iconColor: colors.primaryBrand,
      title: "Tenant Branding Integration",
      desc: "Upload custom logos (circular cropped) and dynamic names replacing default brandings on dashboards and media feeds.",
    },
    {
      icon: "qrcode-scan" as const,
      iconBg: "rgba(201, 146, 26, 0.08)",
      iconColor: colors.aartiGold,
      title: "Flexible QR & Payment Setup",
      desc: "Configure devotee profile URLs and UPI QR codes independently, enabling quick merchant payments and digital sharing.",
    },
    {
      icon: "wallet-outline" as const,
      iconBg: "rgba(217, 43, 43, 0.08)",
      iconColor: colors.kumkumRed,
      title: "Expense & Voucher Management",
      desc: "Submit and approve vouchers, track mandal expenses, and generate detailed PDF statement reports on demand.",
    },
    {
      icon: "calendar-month-outline" as const,
      iconBg: "rgba(34, 197, 94, 0.08)",
      iconColor: colors.tulsiGreen,
      title: "Events & Scheduling",
      desc: "Schedule community events, manage devotee RSVP listings, track attendance, and plan schedules.",
    },
    {
      icon: "newspaper-variant-outline" as const,
      iconBg: "rgba(255, 149, 0, 0.08)",
      iconColor: colors.primaryContainer,
      title: "News Feed & Announcements",
      desc: "Publish blogs, articles, board decisions, and festival updates directly to devotees with instant sharing support.",
    },
    {
      icon: "store-outline" as const,
      iconBg: "rgba(140, 80, 0, 0.08)",
      iconColor: colors.primaryBrand,
      title: "Vendor Directory & Invoice Portal",
      desc: "Register vendor accounts, manage corporate invoice listings, and view historic purchase orders.",
    },
    {
      icon: "image-multiple-outline" as const,
      iconBg: "rgba(201, 146, 26, 0.08)",
      iconColor: colors.aartiGold,
      title: "Photo Gallery & Albums",
      desc: "Upload, browse, and organize event memories with beautiful photo grids, masonry layouts, and viewer features.",
    },
    {
      icon: "account-check-outline" as const,
      iconBg: "rgba(34, 197, 94, 0.08)",
      iconColor: colors.tulsiGreen,
      title: "Volunteer Duties & Check-In",
      desc: "Assign duty rosters, coordinate shifts, track check-ins via volunteer QR scan codes, and manage rosters.",
    },
    {
      icon: "translate" as const,
      iconBg: "rgba(140, 80, 0, 0.08)",
      iconColor: colors.primaryBrand,
      title: "Multi-Language Support",
      desc: "Fully localized user experience across English, Hindi, and Gujarati to cater to diverse community demographics.",
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
          <Text style={styles.headerTitle}>About Product</Text>
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
            <Image
              source={require("../../assets/image-only.png")}
              style={{ width: 60, height: 60, resizeMode: "contain" }}
            />
          </Animated.View>
          <Text style={styles.brandName}>Utsav</Text>
          <Text style={styles.brandTagline}>
            Celebrate Together. Manage Everything.
          </Text>
        </View>

        {/* Business Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>BUSINESS DETAILS</Text>
          <View style={styles.card}>
            {businessDetails.map((detail, idx) => (
              <View key={idx}>
                {detail.action ? (
                  <TouchableOpacity
                    style={styles.detailRow}
                    onPress={detail.action}
                    activeOpacity={0.7}
                  >
                    <View style={styles.detailLeft}>
                      <View style={styles.iconBg}>
                        <MaterialCommunityIcons
                          name={detail.icon}
                          size={18}
                          color={colors.primaryBrand}
                        />
                      </View>
                      <View style={styles.detailTextWrapper}>
                        <Text style={styles.detailLabel}>{detail.label}</Text>
                        <Text style={[styles.detailValue, styles.linkText]}>
                          {detail.value}
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="open-in-new"
                      size={16}
                      color={colors.primaryBrand}
                      style={{ opacity: 0.8 }}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <View style={styles.iconBg}>
                        <MaterialCommunityIcons
                          name={detail.icon}
                          size={18}
                          color={colors.onSurfaceVariant}
                        />
                      </View>
                      <View style={styles.detailTextWrapper}>
                        <Text style={styles.detailLabel}>{detail.label}</Text>
                        <Text style={styles.detailValue}>{detail.value}</Text>
                      </View>
                    </View>
                  </View>
                )}
                {idx < businessDetails.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Implemented Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>IMPLEMENTED FEATURES</Text>
          <View style={styles.featuresList}>
            {features.map((feature, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: feature.iconBg }]}>
                  <MaterialCommunityIcons
                    name={feature.icon}
                    size={22}
                    color={feature.iconColor}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version {APP_VERSION} (Build {APP_BUILD})
          </Text>
          <Text style={styles.footerText}>
            © 2026 TechSonance Infotech LLP. All rights reserved.
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
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: 24 },

  // Hero Section
  heroSection: { alignItems: "center", paddingVertical: 8, gap: 8 },
  diyaContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,149,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  brandName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 28,
    color: colors.primaryBrand,
  },
  brandTagline: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Section Container
  sectionContainer: { gap: 10 },
  sectionLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    letterSpacing: 2,
    paddingLeft: spacing.xs,
  },

  // Card & Detail Rows
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  detailTextWrapper: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primaryBrand,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    marginHorizontal: spacing.md,
  },

  // Features List
  featuresList: {
    gap: spacing.sm,
  },
  featureCard: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  featureTextContainer: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  featureDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    opacity: 0.9,
  },

  // Footer
  footer: { alignItems: "center", paddingVertical: 16, gap: 4 },
  footerText: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
});

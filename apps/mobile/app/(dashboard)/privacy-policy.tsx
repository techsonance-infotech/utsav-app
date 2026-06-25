import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PolicySection {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  content: string[];
}

const LAST_UPDATED = "December 15, 2024";

const SECTIONS: PolicySection[] = [
  {
    id: "1",
    icon: "shield-lock-outline",
    title: "1. Information We Collect",
    content: [
      "We collect information you provide directly to us, such as when you create an account, make a donation, join a Mandal, or contact us for support.",
      "Personal information may include: your name, email address, phone number, and profile photo. Financial data such as UPI IDs or card details are processed securely through our payment partners (Razorpay) and are never stored on our servers.",
    ],
  },
  {
    id: "2",
    icon: "database-outline",
    title: "2. How We Use Your Information",
    content: [
      "We use the information we collect to provide, maintain, and improve our services, process transactions and send related notices, send you technical notices, updates, and support messages.",
      "We also use your data to respond to your comments and questions, monitor and analyze trends, usage, and activities in connection with our services.",
    ],
  },
  {
    id: "3",
    icon: "share-variant-outline",
    title: "3. Information Sharing",
    content: [
      "We do not sell, trade, or rent your personal information to third parties. We may share information with Mandal administrators as necessary for organizational management within the platform.",
      "We may disclose information if required by law or to protect our rights, privacy, safety, or property.",
    ],
  },
  {
    id: "4",
    icon: "lock-outline",
    title: "4. Data Security",
    content: [
      "We implement industry-standard security measures including end-to-end encryption, secure API communications (TLS 1.3), and regular security audits to protect your personal information.",
      "All financial transactions are processed through PCI-DSS compliant payment gateways.",
    ],
  },
  {
    id: "5",
    icon: "cookie-outline",
    title: "5. Cookies & Local Storage",
    content: [
      "Our mobile application uses local storage and secure tokens for authentication and session management. We do not use third-party tracking cookies.",
      "Analytics data is collected anonymously to improve app performance and user experience.",
    ],
  },
  {
    id: "6",
    icon: "account-cog-outline",
    title: "6. Your Rights & Choices",
    content: [
      "You may update, correct, or delete your account information at any time through your profile settings. You may opt out of receiving promotional communications from us.",
      "You have the right to request a copy of your data or request complete deletion of your account by contacting support@utsav.app.",
    ],
  },
  {
    id: "7",
    icon: "baby-face-outline",
    title: "7. Children's Privacy",
    content: [
      "Our service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.",
    ],
  },
  {
    id: "8",
    icon: "update",
    title: "8. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date.",
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();

  const handleBack = () => {
    if (from === "signup") {
      router.replace("/(auth)/signup");
    } else if (from === "login") {
      router.replace("/(auth)/login");
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.primaryBrand}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconBg}>
            <MaterialCommunityIcons
              name="shield-check"
              size={40}
              color={colors.primaryBrand}
            />
          </View>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSubtitle}>
            Respecting Your Devotion and Data
          </Text>
          <View style={styles.updatedBadge}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={14}
              color={colors.onSurfaceVariant}
            />
            <Text style={styles.updatedText}>
              Last Updated: {LAST_UPDATED}
            </Text>
          </View>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            At Utsav, we understand that your personal data is sacred. This
            Privacy Policy explains how we collect, use, and protect your
            information when you use our platform to manage community festivals
            and cultural events.
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBg}>
                <MaterialCommunityIcons
                  name={section.icon}
                  size={20}
                  color={colors.primaryBrand}
                />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.content.map((paragraph, idx) => (
              <Text key={idx} style={styles.sectionBody}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {/* Contact */}
        <View style={styles.contactCard}>
          <MaterialCommunityIcons
            name="email-outline"
            size={24}
            color={colors.primaryBrand}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Questions?</Text>
            <Text style={styles.contactBody}>
              If you have questions about this Privacy Policy, please contact
              us at support@utsav.app
            </Text>
          </View>
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
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: 16 },

  hero: { alignItems: "center", paddingVertical: 20, gap: 8 },
  heroIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,149,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 28,
    color: colors.onSurface,
  },
  heroSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
  },
  updatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  updatedText: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  introCard: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: spacing.lg,
  },
  introText: {
    fontFamily: fonts.inter.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,149,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.primaryBrand,
    flex: 1,
  },
  sectionBody: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.onSurfaceVariant,
    marginBottom: 10,
  },

  contactCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: 8,
  },
  contactTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 4,
  },
  contactBody: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceVariant,
  },
});

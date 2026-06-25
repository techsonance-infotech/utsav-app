import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface TosSection {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  content: string[];
}

const LAST_UPDATED = "December 15, 2024";

const SECTIONS: TosSection[] = [
  {
    id: "1",
    icon: "check-circle-outline",
    title: "1. Acceptance of Terms",
    content: [
      "By accessing and using the Utsav platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the platform.",
      "These terms apply to all users, including Mandal administrators, committee members, volunteers, and general community members.",
    ],
  },
  {
    id: "2",
    icon: "account-group-outline",
    title: "2. User Accounts",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.",
      "Each user must provide accurate, current, and complete information during registration. Multiple accounts per individual are not permitted.",
    ],
  },
  {
    id: "3",
    icon: "gavel",
    title: "3. Acceptable Use",
    content: [
      "You agree to use Utsav only for lawful purposes related to community festival management, cultural event organization, and community coordination.",
      "You shall not use the platform to transmit spam, malware, or any content that is discriminatory, hateful, or illegal. Misuse of donation or financial features may result in immediate account suspension.",
    ],
  },
  {
    id: "4",
    icon: "cash-multiple",
    title: "4. Donations & Payments",
    content: [
      "All financial transactions are processed through verified payment gateways (Razorpay). Utsav acts as a facilitator and does not directly handle monetary funds.",
      "Refund policies are governed by the respective Mandal's policies. Utsav will assist in dispute resolution but is not liable for fund mismanagement by Mandal administrators.",
    ],
  },
  {
    id: "5",
    icon: "copyright",
    title: "5. Intellectual Property",
    content: [
      "All content, features, and functionality of the Utsav platform are owned by Utsav Technologies Pvt Ltd and are protected by international copyright, trademark, and other intellectual property laws.",
      "User-generated content (photos, updates, blog posts) remains the property of the creator, with a non-exclusive license granted to Utsav for display within the platform.",
    ],
  },
  {
    id: "6",
    icon: "alert-circle-outline",
    title: "6. Limitation of Liability",
    content: [
      "Utsav shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the platform.",
      "Our total liability for any claim arising from these terms shall not exceed the amount paid by you, if any, to Utsav in the twelve (12) months preceding the claim.",
    ],
  },
  {
    id: "7",
    icon: "cancel",
    title: "7. Termination",
    content: [
      "We reserve the right to suspend or terminate your access to the platform at any time, with or without cause, upon notice. You may also deactivate your account at any time through the settings page.",
      "Upon termination, your right to use the platform ceases immediately. Data retention follows our Privacy Policy guidelines.",
    ],
  },
  {
    id: "8",
    icon: "scale-balance",
    title: "8. Governing Law",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.",
      "Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.",
    ],
  },
];

export default function TermsOfServiceScreen() {
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
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
              name="file-document-outline"
              size={40}
              color={colors.primaryBrand}
            />
          </View>
          <Text style={styles.heroTitle}>Terms of Service</Text>
          <Text style={styles.heroSubtitle}>Legal Clarity</Text>
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
            Welcome to Utsav. These Terms of Service govern your access to and
            use of the Utsav platform for community festival management. Please
            read these terms carefully before using the app.
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
            <Text style={styles.contactTitle}>Legal Questions?</Text>
            <Text style={styles.contactBody}>
              For any questions regarding these terms, please reach out to
              legal@utsav.app
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

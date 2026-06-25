import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  question: string;
  answer: string;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  faqs: FAQItem[];
}

export default function HelpCenterScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>("donations");

  const categories: Category[] = [
    {
      id: "donations",
      title: "Donations & Receipts",
      icon: "hand-heart-outline",
      faqs: [
        {
          question: "How do I download my 80G tax receipt?",
          answer: "Go to Profile > Donation History, find your transaction, and tap the 'Download Receipt' button. The receipt will download as a PDF to your device.",
        },
        {
          question: "What payment methods are accepted?",
          answer: "We support UPI (GPay, PhonePe, Paytm), Debit/Credit Cards (Visa, Mastercard, RuPay), Net Banking, and offline cash/cheque deposits at the Mandal office.",
        },
        {
          question: "Are cash donations eligible for 80G?",
          answer: "According to Indian Income Tax rules, cash donations above ₹2,000 are not eligible for tax deductions under section 80G. For higher amounts, please use bank transfers or online UPI.",
        },
      ],
    },
    {
      id: "events",
      title: "Events & Schedule",
      icon: "calendar-clock-outline",
      faqs: [
        {
          question: "Can I book a group Pooja or Abhishek?",
          answer: "Yes, you can register for special Poojas by visiting the 'Events' section, selecting your desired date/time slot, and completing the RSVP registration form.",
        },
        {
          question: "Where do I find the daily Aarti timings?",
          answer: "All daily ritual schedules are updated in real-time under the 'Events' tab. Select the 'Aarti' filter to view evening and morning slot timings.",
        },
      ],
    },
    {
      id: "volunteer",
      title: "Volunteer Program",
      icon: "account-group-outline",
      faqs: [
        {
          question: "How do I sign up for volunteer seva?",
          answer: "Go to the Volunteer Duty screen from the menu, select an upcoming festival date, choose an available shift block (e.g. Crowd Control, Prasad Distribution), and tap 'Sign Up'.",
        },
        {
          question: "How are volunteer hours tracked?",
          answer: "Volunteers must scan the unique duty venue QR code at the check-in counter when arriving and departing. This automatically logs hours to your Seva profile dashboard.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Support",
      icon: "cog-outline",
      faqs: [
        {
          question: "How do I reset my account password?",
          answer: "On the login screen, click the 'Forgot Password' link to receive a one-time reset token via email or SMS, or go to Profile Settings when logged in.",
        },
        {
          question: "My transaction failed but money was debited.",
          answer: "Occasionally, payment gateway delays occur. If a payment fails but funds are deducted, they are usually automatically refunded by your banking network within 3 to 5 business days.",
        },
      ],
    },
  ];

  const handleToggleCategory = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedCategoryId === id) {
      setExpandedCategoryId(null);
    } else {
      setExpandedCategoryId(id);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@utsavmanager.com?subject=Utsav Support Request").catch((err) =>
      console.error("Couldn't launch mail app", err)
    );
  };

  // Filter FAQs based on search query
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return categories;

    const lowerQuery = searchQuery.toLowerCase();
    return categories
      .map((cat) => {
        const matchingFaqs = cat.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(lowerQuery) ||
            faq.answer.toLowerCase().includes(lowerQuery)
        );
        return { ...cat, faqs: matchingFaqs };
      })
      .filter((cat) => cat.faqs.length > 0);
  };

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

  const filteredCategories = getFilteredCategories();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <TouchableOpacity style={styles.notifyBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Header Section */}
        <View style={styles.searchHeaderSection}>
          <Text style={styles.searchTitle}>How can we help?</Text>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput
              placeholder="Search FAQs, guide topics..."
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons name="close-circle" size={18} color={colors.outline} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FAQs Accordion Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {filteredCategories.length === 0 ? (
            <View style={styles.noResults}>
              <MaterialCommunityIcons name="file-search-outline" size={48} color={colors.outlineVariant} />
              <Text style={styles.noResultsText}>No matching FAQ topics found.</Text>
            </View>
          ) : (
            filteredCategories.map((cat) => {
              const isExpanded = expandedCategoryId === cat.id;
              return (
                <View key={cat.id} style={styles.categoryCard}>
                  {/* Category Drawer Header */}
                  <TouchableOpacity
                    style={[styles.categoryHeader, isExpanded && styles.expandedHeader]}
                    onPress={() => handleToggleCategory(cat.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.categoryTitleRow}>
                      <MaterialCommunityIcons name={cat.icon as any} size={22} color={colors.primaryBrand} />
                      <Text style={styles.categoryTitle}>{cat.title}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={22}
                      color={colors.primaryBrand}
                    />
                  </TouchableOpacity>

                  {/* FAQ List Content */}
                  {isExpanded && (
                    <View style={styles.faqList}>
                      {cat.faqs.map((faq, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.faqItem,
                            idx < cat.faqs.length - 1 && styles.faqItemSeparator,
                          ]}
                        >
                          <Text style={styles.faqQuestion}>{faq.question}</Text>
                          <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Quick Guide Promotion Card */}
        <View style={styles.promoCard}>
          <View style={styles.promoGlow} />
          <View style={styles.promoContent}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>Quick Guide</Text>
            </View>
            <Text style={styles.promoTitle}>Quick Guide for New Members</Text>
            <Text style={styles.promoDesc}>
              Learn how to easily manage donations, track cultural events, and register for volunteer slots.
            </Text>
            <TouchableOpacity style={styles.promoBtn} activeOpacity={0.85}>
              <Text style={styles.promoBtnText}>Read Guide</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color={colors.onPrimaryContainer} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Still Have Questions Footer */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Still have questions?</Text>
          <Text style={styles.supportDesc}>
            Can't find the answers you're looking for? Reach out directly to the Mandal support desk.
          </Text>
          <TouchableOpacity style={styles.supportBtn} onPress={handleContactSupport} activeOpacity={0.85}>
            <MaterialCommunityIcons name="chat-question" size={20} color="#FFFFFF" />
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    flex: 1,
    marginLeft: 8,
  },
  notifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchHeaderSection: {
    backgroundColor: "#FFFFFF",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  searchTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 23,
    backgroundColor: colors.pujaWhite,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
    paddingVertical: 4,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  noResults: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
  },
  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginBottom: spacing.md,
    overflow: "hidden",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    height: 54,
  },
  expandedHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    backgroundColor: colors.surfaceContainerLow,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  faqList: {
    padding: spacing.md,
  },
  faqItem: {
    paddingVertical: 12,
  },
  faqItemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  faqQuestion: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
    lineHeight: 18,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  promoCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    position: "relative",
    overflow: "hidden",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  promoGlow: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  promoContent: {
    zIndex: 10,
  },
  promoBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  promoBadgeText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  promoTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.onPrimaryContainer,
    marginBottom: 6,
  },
  promoDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onPrimaryContainer,
    opacity: 0.85,
    lineHeight: 18,
    marginBottom: 16,
  },
  promoBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  promoBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  supportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semibold,
    color: colors.charcoal,
    marginBottom: 4,
  },
  supportDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  supportBtn: {
    backgroundColor: colors.primaryBrand,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  supportBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.inter.bold,
  },
});

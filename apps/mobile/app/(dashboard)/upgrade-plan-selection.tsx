import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function UpgradePlanSelectionScreen() {
  const [billingCycle, setBillingCycle] = useState("Monthly");

  const plans = [
    {
      name: "Free Tier",
      price: 0,
      desc: "Perfect for small neighborhood associations.",
      features: ["Up to 50 Members", "Basic Event Calendar", "Manual Cash Logging"],
      cta: "Current Plan",
      enabled: false,
    },
    {
      name: "Basic Tier",
      price: 999,
      desc: "For growing organizations wanting standard tooling.",
      features: ["Up to 200 Members", "Standard Analytics", "Payment Gateway integration"],
      cta: "Choose Basic",
      enabled: true,
    },
    {
      name: "Premium Tier",
      price: 4999,
      desc: "Best for large mandals with heavy crowd management.",
      features: ["Up to 1000 Members", "Realtime Pulse Analytics", "Priority Support Gateways", "Unlimited Media Uploads"],
      cta: "Choose Premium",
      enabled: true,
      popular: true,
    },
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (!plan.enabled) return;
    const finalPrice = billingCycle === "Annual" ? plan.price * 0.8 : plan.price;
    router.push({
      pathname: "/(dashboard)/checkout",
      params: {
        planName: plan.name,
        price: finalPrice.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <View style={styles.introSection}>
          <Text style={styles.welcomeSubtitle}>
            Unlock premium features to streamline crowd security and financial accounting.
          </Text>
        </View>

        {/* Billing cycle toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, billingCycle === "Monthly" && styles.activeToggleBtn]}
            onPress={() => setBillingCycle("Monthly")}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, billingCycle === "Monthly" && styles.activeToggleBtnText]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, billingCycle === "Annual" && styles.activeToggleBtn]}
            onPress={() => setBillingCycle("Annual")}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, billingCycle === "Annual" && styles.activeToggleBtnText]}>
              Annual (Save 20%)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pricing Cards Carousel list */}
        <View style={styles.cardsList}>
          {plans.map((p, idx) => {
            let displayPrice = billingCycle === "Annual" ? p.price * 0.8 : p.price;
            return (
              <View key={idx} style={[styles.planCard, p.popular && styles.popularPlanCard]}>
                {p.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                <Text style={[styles.planName, p.popular && styles.whiteText]}>{p.name}</Text>
                <Text style={[styles.planDesc, p.popular && styles.lightText]}>{p.desc}</Text>

                <View style={styles.priceRow}>
                  <Text style={[styles.priceAmt, p.popular && styles.whiteText]}>
                    ₹{displayPrice.toLocaleString("en-IN")}
                  </Text>
                  <Text style={[styles.priceCycle, p.popular && styles.lightText]}>/month</Text>
                </View>

                <View style={styles.separator} />

                {/* Features */}
                <View style={styles.featuresList}>
                  {p.features.map((f, fidx) => (
                    <View key={fidx} style={styles.featureRow}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={18}
                        color={p.popular ? colors.primaryContainer : colors.tulsiGreen}
                      />
                      <Text style={[styles.featureText, p.popular && styles.whiteText]}>{f}</Text>
                    </View>
                  ))}
                </View>

                {/* Select button */}
                <TouchableOpacity
                  style={[
                    styles.selectBtn,
                    !p.enabled && styles.disabledBtn,
                    p.popular && styles.popularSelectBtn,
                  ]}
                  disabled={!p.enabled}
                  onPress={() => handleSelectPlan(p)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.selectBtnText,
                      p.popular && styles.popularSelectBtnText,
                      !p.enabled && styles.disabledBtnText,
                    ]}
                  >
                    {p.cta}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  introSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: borderRadius.sm,
  },
  activeToggleBtn: {
    backgroundColor: colors.primaryBrand,
  },
  toggleBtnText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  activeToggleBtnText: {
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  cardsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    position: "relative",
  },
  popularPlanCard: {
    backgroundColor: colors.charcoal,
    borderColor: colors.primaryBrand,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  planName: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  planDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.md,
  },
  priceAmt: {
    fontSize: 32,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  priceCycle: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.4)",
    marginVertical: spacing.md,
  },
  featuresList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  selectBtn: {
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primaryBrand,
    alignItems: "center",
    justifyContent: "center",
  },
  selectBtnText: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  popularSelectBtn: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryBrand,
  },
  popularSelectBtnText: {
    color: colors.onPrimaryContainer,
  },
  disabledBtn: {
    borderColor: colors.sandstone,
  },
  disabledBtnText: {
    color: colors.outline,
  },
  whiteText: {
    color: "#FFFFFF",
  },
  lightText: {
    color: colors.outlineVariant,
  },
});

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const planName = (params.planName as string) || "Premium Plan";
  const planPrice = parseFloat((params.price as string) || "4999");

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const gst = planPrice * 0.18;
  const total = planPrice + gst;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    // Simulate transaction delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500);
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
        <Text style={styles.headerTitle}>Complete Upgrade</Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>SM</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryItem}>
            <View style={styles.summaryItemLeft}>
              <Text style={styles.itemName}>{planName} (Monthly)</Text>
              <Text style={styles.itemDesc}>Includes advanced analytics & unlimited members</Text>
            </View>
            <Text style={styles.itemPrice}>{formatCurrency(planPrice)}</Text>
          </View>
          <View style={styles.summaryItemRow}>
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(gst)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <View style={styles.totalValContainer}>
              <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
              <Text style={styles.totalSub}>Billed Monthly</Text>
            </View>
          </View>
        </View>

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          <MaterialCommunityIcons name="shield-check" size={28} color={colors.tulsiGreen} style={styles.shieldIcon} />
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Bank-Grade Security</Text>
            <Text style={styles.securityDesc}>
              Your transaction is encrypted with 256-bit SSL security protocols for maximum safety.
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentSectionTitle}>Payment Method</Text>

          {/* Option: Card */}
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "card" && styles.activeOption]}
            onPress={() => setPaymentMethod("card")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="credit-card-outline" size={24} color={paymentMethod === "card" ? colors.primaryBrand : colors.outline} />
            <View style={styles.optionDetails}>
              <Text style={styles.optionName}>•••• 4421</Text>
              <Text style={styles.optionSub}>HDFC Bank • Exp 09/27</Text>
            </View>
            <View style={[styles.radioOuter, paymentMethod === "card" && styles.radioOuterActive]}>
              {paymentMethod === "card" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Option: UPI */}
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === "upi" && styles.activeOption]}
            onPress={() => setPaymentMethod("upi")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="bank-transfer" size={24} color={paymentMethod === "upi" ? colors.primaryBrand : colors.outline} />
            <View style={styles.optionDetails}>
              <Text style={styles.optionName}>siddhivinayak@upi</Text>
              <Text style={styles.optionSub}>Saved UPI ID</Text>
            </View>
            <View style={[styles.radioOuter, paymentMethod === "upi" && styles.radioOuterActive]}>
              {paymentMethod === "upi" && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Secure Action Button */}
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePaymentSubmit}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="lock-outline" size={20} color="#FFFFFF" />
          <Text style={styles.payButtonText}>Secure Payment</Text>
        </TouchableOpacity>

        <Text style={styles.footerBrand}>Securely processed by Razorpay</Text>
      </ScrollView>

      {/* Processing Modal */}
      <Modal visible={isProcessing} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={colors.primaryBrand} />
            <Text style={styles.modalTitle}>Confirming Upgrade</Text>
            <Text style={styles.modalDesc}>
              Please do not refresh or close this window while we secure your premium access.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Success View Screen Overlay */}
      {isSuccess && (
        <View style={styles.successScreen}>
          <View style={styles.successBadge}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Prasadam Confirmed!</Text>
          <Text style={styles.successDesc}>
            Your Mandal has been successfully upgraded to the {planName}. Your receipt has been sent to your email.
          </Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => {
              setIsSuccess(false);
              router.replace("/(dashboard)/settings");
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.successBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
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
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    marginBottom: spacing.md,
  },
  summaryItemLeft: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  itemName: {
    fontSize: 15,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  itemDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  summaryItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.sandstone,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  totalValContainer: {
    alignItems: "flex-end",
  },
  totalVal: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  totalSub: {
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  securityBanner: {
    flexDirection: "row",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  shieldIcon: {
    marginRight: spacing.md,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  securityDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 16,
  },
  paymentSection: {
    marginBottom: spacing.lg,
  },
  paymentSectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  activeOption: {
    borderColor: colors.primaryBrand,
    backgroundColor: "rgba(140, 80, 0, 0.03)",
  },
  optionDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionName: {
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
  },
  optionSub: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: colors.primaryBrand,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryBrand,
  },
  payButton: {
    height: 52,
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: spacing.md,
  },
  payButtonText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
    marginLeft: spacing.sm,
  },
  footerBrand: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  modalDesc: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 18,
  },
  successScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.pujaWhite,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    zIndex: 9999,
  },
  successBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.tulsiGreen,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.tulsiGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: 26,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    marginBottom: spacing.md,
  },
  successDesc: {
    fontSize: 15,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl * 1.5,
    paddingHorizontal: spacing.md,
  },
  successBtn: {
    height: 52,
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    width: "100%",
    maxWidth: 260,
  },
  successBtnText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
});

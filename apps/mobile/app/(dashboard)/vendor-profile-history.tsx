import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function VendorProfileHistoryScreen() {
  const params = useLocalSearchParams();
  const vendorName = (params.vendorName as string) || "Venkatesh Ritual Arts";

  const [privateNote, setPrivateNote] = useState("");

  const handleSaveNote = () => {
    Alert.alert("Success", "Private note saved successfully.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
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
          <Text style={styles.headerTitle}>Vendor Profile</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={colors.primaryBrand}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Hero Header */}
        <View style={styles.heroSection}>
          <View style={styles.vendorIconBg}>
            <MaterialCommunityIcons name="storefront" size={36} color={colors.primaryBrand} />
          </View>
          <View style={styles.heroDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.vendorName}>{vendorName}</Text>
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="decagram" size={14} color={colors.tulsiGreen} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.categorySub}>Sacred Decor & Event Fabrication</Text>
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {[1, 2, 3, 4].map((i) => (
                  <MaterialCommunityIcons key={i} name="star" size={16} color={colors.aartiGold} />
                ))}
                <MaterialCommunityIcons name="star-half" size={16} color={colors.aartiGold} />
              </View>
              <Text style={styles.ratingVal}>4.8</Text>
              <Text style={styles.reviewsCount}>(124 Reviews)</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.primaryAction}
            activeOpacity={0.8}
            onPress={() => router.push("/(dashboard)/create-purchase-order")}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Issue New PO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8}>
            <MaterialCommunityIcons name="email-outline" size={18} color={colors.charcoal} />
            <Text style={styles.secondaryActionText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Stats Panel */}
        <View style={styles.bentoStats}>
          <View style={styles.bentoItem}>
            <Text style={styles.bentoLabel}>TOTAL POs ISSUED</Text>
            <Text style={styles.bentoVal}>42</Text>
            <View style={styles.trendRow}>
              <MaterialCommunityIcons name="trending-up" size={12} color={colors.tulsiGreen} />
              <Text style={styles.trendText}>+12% from last year</Text>
            </View>
          </View>

          <View style={styles.bentoItem}>
            <Text style={styles.bentoLabel}>TOTAL PAID</Text>
            <Text style={styles.bentoVal}>₹12.4L</Text>
            <Text style={styles.bentoSub}>Processed via RazorPay</Text>
          </View>

          <View style={styles.bentoItem}>
            <Text style={styles.bentoLabel}>AVG. RESPONSE</Text>
            <Text style={styles.bentoVal}>4.2h</Text>
            <View style={styles.responseBarBg}>
              <View style={[styles.responseBarFill, { width: "85%" }]} />
            </View>
          </View>
        </View>

        {/* Payment Info Lock Card */}
        <View style={styles.lockCard}>
          <View style={styles.lockHeader}>
            <Text style={styles.lockTitle}>Payment Info</Text>
            <MaterialCommunityIcons name="lock-outline" size={16} color={colors.outline} />
          </View>
          <View style={styles.bankMock}>
            <View style={styles.visaChip} />
            <Text style={styles.bankNum}>•••• •••• •••• 8291</Text>
          </View>
          <Text style={styles.bankLabel}>Primary Settlement Account</Text>
          <Text style={styles.bankName}>HDFC Bank - Ritual Services Div.</Text>
        </View>

        {/* Active POs */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Active Purchase Orders</Text>
          <View style={styles.poList}>
            <View style={styles.poListItem}>
              <View style={styles.poDateBadge}>
                <Text style={styles.poMonth}>OCT</Text>
                <Text style={styles.poDay}>24</Text>
              </View>
              <View style={styles.poMain}>
                <View style={styles.poMainHeader}>
                  <View>
                    <Text style={styles.poCode}>PO-2024-0982</Text>
                    <Text style={styles.poName}>Diwali Mandap Fabrication</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>In Progress</Text>
                  </View>
                </View>
                <View style={styles.poBottom}>
                  <Text style={styles.poCost}>₹4,50,000</Text>
                  <Text style={styles.poDeadline}>Due in 12 days</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Engagement History Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Festival Engagement History</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineNodeActive} />
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Ganesh Chaturthi 2024</Text>
                  <Text style={styles.timelineDate}>Completed Sep 15</Text>
                </View>
                <Text style={styles.timelineDesc}>
                  Fabricated main pandal and eco-friendly immersion float. Outstanding execution within strict timeline.
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineNode} />
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Ram Navami 2024</Text>
                  <Text style={styles.timelineDate}>Completed Apr 17</Text>
                </View>
                <Text style={styles.timelineDesc}>
                  Flower decoration and lighting for the temple precinct. Budget optimized using seasonal sourcing.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.creamCard}>
          <Text style={styles.cardHeaderTitle}>Key Contacts</Text>
          <View style={styles.contactRow}>
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={24} color={colors.outline} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>Rajesh Venkatesh</Text>
              <Text style={styles.contactRole}>Proprietor & Lead Architect</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="phone" size={20} color={colors.primaryBrand} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactInfo}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.outline} />
              <Text style={styles.infoText}>42, Kumkum Gali, Near Temple Square, Pune - 411002</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email-outline" size={16} color={colors.outline} />
              <Text style={styles.infoText}>contracts@vritualarts.in</Text>
            </View>
          </View>
        </View>

        {/* Compliance checklist */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Compliance Status</Text>
          <View style={styles.complianceList}>
            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>GST Registration</Text>
              <View style={styles.statusVerifiedRow}>
                <MaterialCommunityIcons name="check-circle" size={16} color={colors.tulsiGreen} />
                <Text style={styles.complianceStatusVal}>Active</Text>
              </View>
            </View>
            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>Public Liability Insurance</Text>
              <Text style={styles.complianceStatusVal}>Valid till Mar 2025</Text>
            </View>
            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>Ethical Sourcing Cert.</Text>
              <Text style={styles.complianceStatusVal}>Certified</Text>
            </View>
          </View>
        </View>

        {/* Private Admin Notes */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Admin Private Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add a private note about this vendor..."
            placeholderTextColor={colors.outline}
            multiline
            numberOfLines={4}
            value={privateNote}
            onChangeText={setPrivateNote}
          />
          <TouchableOpacity style={styles.saveNoteBtn} onPress={handleSaveNote} activeOpacity={0.8}>
            <Text style={styles.saveNoteBtnText}>Save Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.primaryBrand,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 60, gap: 20 },

  // Hero Section
  heroSection: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  vendorIconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
  },
  heroDetails: { flex: 1, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  vendorName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.charcoal,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: colors.tulsiGreen,
  },
  categorySub: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  stars: { flexDirection: "row", gap: 2 },
  ratingVal: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.charcoal,
  },
  reviewsCount: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.outline,
  },

  // Actions
  quickActions: { flexDirection: "row", gap: 12 },
  primaryAction: {
    flex: 1.2,
    height: 48,
    backgroundColor: colors.primaryBrand,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryActionText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  secondaryAction: {
    flex: 1,
    height: 48,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryActionText: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },

  // Bento Stats
  bentoStats: {
    flexDirection: "row",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  bentoItem: { flex: 1, gap: 4 },
  bentoLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  bentoVal: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: colors.charcoal,
  },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  trendText: {
    fontFamily: fonts.inter.medium,
    fontSize: 9,
    color: colors.tulsiGreen,
  },
  bentoSub: {
    fontFamily: fonts.inter.regular,
    fontSize: 10,
    color: colors.outline,
  },
  responseBarBg: {
    height: 4,
    backgroundColor: colors.outlineVariant,
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  responseBarFill: {
    height: "100%",
    backgroundColor: colors.aartiGold,
    borderRadius: 2,
  },

  // Lock card
  lockCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  lockHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lockTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  bankMock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  visaChip: { width: 32, height: 20, backgroundColor: colors.charcoal, borderRadius: 4 },
  bankNum: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.outline,
    letterSpacing: 2,
  },
  bankLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  bankName: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },

  // Timeline
  timeline: { paddingLeft: 12, gap: 16 },
  timelineItem: { flexDirection: "row", gap: 16 },
  timelineNodeActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryBrand,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginTop: 4,
    zIndex: 10,
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.sandstone,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginTop: 4,
    zIndex: 10,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "rgba(244, 241, 235, 0.4)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  timelineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timelineTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 13,
    color: colors.primaryBrand,
  },
  timelineDate: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.outline,
  },
  timelineDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },

  section: { gap: 12 },
  sectionHeader: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  poList: { gap: 12 },
  poListItem: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  poDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(140, 80, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  poMonth: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.primaryBrand,
  },
  poDay: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.primaryBrand,
    marginTop: -2,
  },
  poMain: { flex: 1, gap: 4 },
  poMainHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  poCode: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.outline,
  },
  poName: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  statusPill: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillText: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.onPrimaryContainer,
  },
  poBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  poCost: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    color: colors.charcoal,
  },
  poDeadline: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.outline,
  },

  // Cream card
  creamCard: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeaderTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  contactName: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  contactRole: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  divider: { height: 1, backgroundColor: "rgba(232, 226, 214, 0.5)" },
  contactInfo: { gap: 8 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    flex: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  complianceList: { gap: 10 },
  complianceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  complianceLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  statusVerifiedRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  complianceStatusVal: {
    fontFamily: fonts.inter.bold,
    fontSize: 13,
    color: colors.primaryBrand,
  },

  notesInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.charcoal,
  },
  saveNoteBtn: {
    backgroundColor: colors.primaryBrand,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    paddingHorizontal: 16,
  },
  saveNoteBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },
});

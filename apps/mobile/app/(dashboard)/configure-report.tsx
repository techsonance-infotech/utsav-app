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
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function ConfigureReportScreen() {
  const [reportType, setReportType] = useState("summary"); // 'summary', 'expense', 'pl'
  const [dateRange, setDateRange] = useState("Festival Period");
  const [generating, setGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const reportTypes = [
    {
      id: "summary",
      title: "Donation Summary",
      desc: "Aggregated contributions by source.",
      icon: "heart-flash",
      color: colors.primaryBrand,
      iconBg: colors.primaryFixed,
    },
    {
      id: "expense",
      title: "Expense Ledger",
      desc: "Itemized outgoing temple costs.",
      icon: "wallet",
      color: colors.onSurfaceVariant,
      iconBg: colors.surfaceContainer,
    },
    {
      id: "pl",
      title: "P&L Statement",
      desc: "Net profit and loss balance sheet.",
      icon: "trending-up",
      color: colors.onSurfaceVariant,
      iconBg: colors.surfaceContainer,
    },
  ];

  const dateRangeOptions = ["Today", "This Week", "Festival Period", "Custom"];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowSuccess(true);
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Config</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.title}>Generate Statement</Text>
          <Text style={styles.subtitle}>
            Configure your parameters below to export detailed financial data for auditing and community transparency.
          </Text>
        </View>

        {/* Report Type Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Report Type</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          </View>

          <View style={styles.typesList}>
            {reportTypes.map((type) => {
              const isActive = reportType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    isActive && styles.typeCardActive,
                  ]}
                  onPress={() => setReportType(type.id)}
                  activeOpacity={0.9}
                >
                  <View
                    style={[
                      styles.typeIconBg,
                      { backgroundColor: isActive ? colors.primaryFixed : colors.surfaceContainer },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={24}
                      color={isActive ? colors.primaryBrand : colors.onSurfaceVariant}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.typeTitle}>{type.title}</Text>
                    <Text style={styles.typeDesc}>{type.desc}</Text>
                  </View>
                  {isActive && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={22}
                      color={colors.primaryBrand}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Range Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date Range</Text>
          <View style={styles.chipRow}>
            {dateRangeOptions.map((opt) => {
              const isActive = dateRange === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chipBtn, isActive && styles.chipBtnActive]}
                  onPress={() => setDateRange(opt)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date range details card (Custom/Festival) */}
          <View style={styles.rangeDetails}>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>FROM</Text>
              <View style={styles.dateValueBox}>
                <Text style={styles.dateValue}>Oct 12, 2023</Text>
                <MaterialCommunityIcons name="calendar" size={16} color={colors.onSurfaceVariant} />
              </View>
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>TO</Text>
              <View style={styles.dateValueBox}>
                <Text style={styles.dateValue}>Nov 15, 2023</Text>
                <MaterialCommunityIcons name="calendar" size={16} color={colors.onSurfaceVariant} />
              </View>
            </View>
          </View>
        </View>

        {/* Filters Grid */}
        <View style={styles.filtersGrid}>
          {/* Campaigns */}
          <View style={styles.filterHalf}>
            <Text style={styles.sectionLabel}>Campaigns</Text>
            <View style={styles.filterChipsRow}>
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Diwali 2023</Text>
                <TouchableOpacity style={styles.removeChipBtn}>
                  <MaterialCommunityIcons name="close" size={12} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Mandap Fund</Text>
                <TouchableOpacity style={styles.removeChipBtn}>
                  <MaterialCommunityIcons name="close" size={12} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.addChipBtn} activeOpacity={0.7}>
                <MaterialCommunityIcons name="plus" size={14} color={colors.primaryBrand} />
                <Text style={styles.addChipText}>Add Campaign</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.filterHalf}>
            <Text style={styles.sectionLabel}>Categories</Text>
            <View style={styles.filterChipsRow}>
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Pooja Services</Text>
                <TouchableOpacity style={styles.removeChipBtn}>
                  <MaterialCommunityIcons name="close" size={12} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Annadanam</Text>
                <TouchableOpacity style={styles.removeChipBtn}>
                  <MaterialCommunityIcons name="close" size={12} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.addChipBtn} activeOpacity={0.7}>
                <MaterialCommunityIcons name="plus" size={14} color={colors.primaryBrand} />
                <Text style={styles.addChipText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Export Format Section */}
        <View style={styles.formatSection}>
          <View style={styles.formatLeft}>
            <View style={styles.pdfIconBg}>
              <MaterialCommunityIcons name="file-pdf-box" size={24} color={colors.secondaryBrand} />
            </View>
            <View>
              <Text style={styles.formatTitle}>Export Format</Text>
              <Text style={styles.formatDesc}>PDF Document (High Fidelity)</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.changeFormatBtn}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Margin space for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating generate action button at the bottom */}
      <View style={styles.generateButtonContainer}>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={handleGenerate}
          disabled={generating}
          activeOpacity={0.9}
        >
          {generating ? (
            <ActivityIndicator color={colors.onPrimaryContainer} size="small" />
          ) : (
            <View style={styles.btnContent}>
              <Text style={styles.generateBtnText}>Generate Report</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimaryContainer} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconWrapper}>
              <MaterialCommunityIcons name="check-circle" size={48} color={colors.tulsiGreen} />
            </View>
            <Text style={styles.modalTitle}>Report Generated</Text>
            <Text style={styles.modalDesc}>
              The "Donation Summary" report for the festival period is ready and has been saved to your downloads.
            </Text>
            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={() => setShowSuccess(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.primaryBrand,
  },
  iconBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.lg,
  },
  introSection: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    opacity: 0.8,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.onSurface,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  requiredBadge: {
    backgroundColor: "rgba(140, 80, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  requiredText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 10,
    color: colors.primaryBrand,
  },
  typesList: {
    gap: spacing.sm,
  },
  typeCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.md,
  },
  typeCardActive: {
    borderColor: colors.primaryContainer,
    borderWidth: 2,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  typeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  typeTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  typeDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: 2,
  },
  chipBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipBtnActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryBrand,
  },
  chipText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurface,
  },
  chipTextActive: {
    color: colors.onPrimaryContainer,
  },
  rangeDetails: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: "rgba(244, 241, 235, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    borderRadius: borderRadius.xl,
    marginTop: spacing.sm,
  },
  dateField: {
    flex: 1,
    gap: spacing.xs,
  },
  dateFieldLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 10,
    color: "rgba(85, 67, 52, 0.6)",
    textTransform: "uppercase",
  },
  dateValueBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    padding: 12,
  },
  dateValue: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurface,
  },
  filtersGrid: {
    gap: spacing.lg,
  },
  filterHalf: {
    gap: spacing.sm,
  },
  filterChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: "rgba(136, 115, 97, 0.1)",
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  filterChipText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.onSurface,
  },
  removeChipBtn: {
    padding: 2,
  },
  addChipBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(140, 80, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(140, 80, 0, 0.2)",
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addChipText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 12,
    color: colors.primaryBrand,
  },
  formatSection: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
  },
  formatLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  pdfIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  formatTitle: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  formatDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    marginTop: 2,
  },
  changeFormatBtn: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.primaryBrand,
  },
  generateButtonContainer: {
    position: "absolute",
    bottom: 24,
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
  },
  generateBtn: {
    height: 56,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  generateBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    color: colors.onPrimaryContainer,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    gap: spacing.md,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 20,
    color: colors.onSurface,
    textAlign: "center",
  },
  modalDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },
  dismissBtn: {
    width: "100%",
    height: 48,
    backgroundColor: colors.charcoal,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  dismissBtnText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// MOCK INTERNAL STAFF DATA
const MOCK_STAFF = [
  { id: "STF-001", name: "Ramesh Sharma", role: "Platform Admin", lastActive: "2 mins ago", tier: "Tier 1" },
  { id: "STF-002", name: "Suresh Gupta", role: "Customer Support", lastActive: "15 mins ago", tier: "Tier 3" },
  { id: "STF-003", name: "Kiran Deshpande", role: "Billing Analyst", lastActive: "1 hour ago", tier: "Tier 2" },
  { id: "STF-004", name: "Alok Verma", role: "Customer Support", lastActive: "Yesterday", tier: "Tier 3" },
];

export default function StaffAccessManagementScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<typeof MOCK_STAFF[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Modal permissions switches
  const [permBilling, setPermBilling] = useState(true);
  const [permDelete, setPermDelete] = useState(false);
  const [permConfig, setPermConfig] = useState(false);
  const [permAudit, setPermAudit] = useState(true);

  const filteredStaff = MOCK_STAFF.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditPermissions = (staff: typeof MOCK_STAFF[0]) => {
    setSelectedStaff(staff);
    // Preset mock permissions depending on role
    if (staff.role === "Platform Admin") {
      setPermBilling(true);
      setPermDelete(true);
      setPermConfig(true);
      setPermAudit(true);
    } else if (staff.role === "Billing Analyst") {
      setPermBilling(true);
      setPermDelete(false);
      setPermConfig(false);
      setPermAudit(true);
    } else {
      setPermBilling(false);
      setPermDelete(false);
      setPermConfig(false);
      setPermAudit(true);
    }
    setShowModal(true);
  };

  const handleSavePermissions = () => {
    setShowModal(false);
    alert(`Permissions successfully updated for ${selectedStaff?.name}!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Staff Access Control</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="plus" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Row */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>124</Text>
            <Text style={styles.kpiLabel}>Active Staff</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.aartiGold }]}>08</Text>
            <Text style={styles.kpiLabel}>Pending Audits</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: colors.primaryBrand }]}>Tier 3</Text>
            <Text style={styles.kpiLabel}>Avg Access</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarWrap}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search staff name or role..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Staff List */}
        <View style={styles.staffSection}>
          <Text style={styles.sectionTitle}>Internal Staff List</Text>
          <View style={styles.staffList}>
            {filteredStaff.map((staff) => (
              <View key={staff.id} style={styles.staffCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {staff.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Text>
                  </View>
                  <View style={styles.staffInfo}>
                    <View style={styles.row}>
                      <Text style={styles.staffName}>{staff.name}</Text>
                      <View style={styles.tierBadge}>
                        <Text style={styles.tierText}>{staff.tier}</Text>
                      </View>
                    </View>
                    <Text style={styles.staffRole}>{staff.role}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.lastActiveText}>Active {staff.lastActive}</Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    activeOpacity={0.8}
                    onPress={() => openEditPermissions(staff)}
                  >
                    <MaterialCommunityIcons name="shield-key-outline" size={14} color={colors.primaryBrand} />
                    <Text style={styles.editBtnText}>Edit Permissions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Permissions Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Staff Permissions</Text>
                <Text style={styles.modalSub}>{selectedStaff?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.permRow}>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>Billing & Transactions</Text>
                  <Text style={styles.permDesc}>Allows access to refunds and subscription analytics</Text>
                </View>
                <Switch
                  value={permBilling}
                  onValueChange={setPermBilling}
                  trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.permRow}>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>User Deletion</Text>
                  <Text style={styles.permDesc}>Delete accounts and organization records permanently</Text>
                </View>
                <Switch
                  value={permDelete}
                  onValueChange={setPermDelete}
                  trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.permRow}>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>System Configuration</Text>
                  <Text style={styles.permDesc}>Modify tenant parameters and system settings</Text>
                </View>
                <Switch
                  value={permConfig}
                  onValueChange={setPermConfig}
                  trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.permRow}>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>Audit Logs</Text>
                  <Text style={styles.permDesc}>View full activity dashboard histories</Text>
                </View>
                <Switch
                  value={permAudit}
                  onValueChange={setPermAudit}
                  trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSavePermissions}>
              <Text style={styles.saveBtnText}>Save Permissions</Text>
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
    backgroundColor: colors.surfaceContainerLow,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "rgba(250, 250, 248, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  appBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  appBarTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 64,
  },
  kpiContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    alignItems: "center",
  },
  kpiValue: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  kpiLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  staffSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  staffList: {
    gap: spacing.md,
  },
  staffCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cream,
    paddingBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryFixed,
  },
  staffInfo: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  staffName: {
    fontSize: 16,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  tierBadge: {
    backgroundColor: colors.cream,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
  },
  staffRole: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
  },
  lastActiveText: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editBtnText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.pujaWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.aartiGold,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  modalSub: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  modalBody: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  permRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  permInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  permTitle: {
    fontSize: 15,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  permDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: colors.primaryBrand,
    height: 50,
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
});

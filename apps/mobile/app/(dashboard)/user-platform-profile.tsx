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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// MOCK DETAILED PROFILE DATA
const MOCK_PROFILES: Record<string, any> = {
  "USR-00247": {
    id: "USR-00247",
    name: "Anish Sharma",
    email: "anish.sharma@gmail.com",
    phone: "+91 98765 43210",
    joinDate: "12 May 2023",
    status: "Active",
    organizations: [
      { id: "ORG-01", name: "Shree Sai Ganpati Mandal", role: "Owner", joinDate: "12 May 2023" },
      { id: "ORG-02", name: "Lalbaug Mitra Mandal", role: "Treasurer", joinDate: "20 Jul 2023" },
      { id: "ORG-03", name: "Dharavi Yuvak Mandal", role: "Volunteer", joinDate: "05 Jan 2024" },
    ],
    stats: { totalDonated: "₹1,45,200", eventsAttended: 14 },
    auditLogs: [
      { action: "Logged in via Mobile app (iOS)", time: "2 hours ago" },
      { action: "Created Donation Campaign 'Ganesh Fund'", time: "3 days ago" },
      { action: "Updated Profile Phone Number", time: "1 week ago" },
    ],
  },
};

export default function UserPlatformProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const profileId = id || "USR-00247";
  const user = MOCK_PROFILES[profileId] || MOCK_PROFILES["USR-00247"];

  const [isActive, setIsActive] = useState(user.status === "Active");
  const [supportNotes, setSupportNotes] = useState("");

  const handleResetPassword = () => {
    alert("Password reset email sent to user!");
  };

  const handleTerminateAccount = () => {
    alert("WARNING: Account deletion requested. Action queued for approval.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>User Platform Profile</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </Text>
            </View>
            <View style={[styles.activeIndicator, isActive && styles.indicatorGreen]} />
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userId}>{user.id}</Text>

          <View style={styles.userMetadata}>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="email-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{user.email}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="phone-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{user.phone}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>Joined {user.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Donated</Text>
            <Text style={styles.statValue}>{user.stats.totalDonated}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Events Attended</Text>
            <Text style={styles.statValue}>{user.stats.eventsAttended}</Text>
          </View>
        </View>

        {/* Organization Affiliations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Mandal Affiliations</Text>
          <View style={styles.orgList}>
            {user.organizations.map((org: any) => (
              <View key={org.id} style={styles.orgItem}>
                <View style={styles.orgInfo}>
                  <Text style={styles.orgName}>{org.name}</Text>
                  <Text style={styles.orgMeta}>
                    Joined {org.joinDate} • {org.role}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.jumpBtn}
                  onPress={() => router.push("/(dashboard)/home")}
                >
                  <MaterialCommunityIcons name="open-in-new" size={16} color={colors.primaryBrand} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Support Notes */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support Notes (Internal Only)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add internal notes about communication history or warnings..."
            placeholderTextColor={colors.outline}
            multiline
            numberOfLines={4}
            value={supportNotes}
            onChangeText={setSupportNotes}
          />
        </View>

        {/* Governance Controls */}
        <View style={styles.governanceCard}>
          <Text style={styles.sectionTitle}>Security & Governance</Text>

          {/* Account Access Toggle */}
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Account Access</Text>
              <Text style={styles.controlDesc}>Temporarily suspend or restore user login access</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Reset Password */}
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={handleResetPassword}
          >
            <MaterialCommunityIcons name="lock-reset" size={20} color={colors.primaryBrand} />
            <Text style={styles.actionBtnText}>Reset Password</Text>
          </TouchableOpacity>

          {/* Audit Logs */}
          <View style={styles.auditLogsSection}>
            <Text style={styles.auditTitle}>Recent Activity Logs</Text>
            <View style={styles.auditList}>
              {user.auditLogs.map((log: any, idx: number) => (
                <View key={idx} style={styles.auditItem}>
                  <View style={styles.auditIcon}>
                    <MaterialCommunityIcons name="history" size={14} color={colors.outline} />
                  </View>
                  <View style={styles.auditInfo}>
                    <Text style={styles.auditAction}>{log.action}</Text>
                    <Text style={styles.auditTime}>{log.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Terminate Account (Danger) */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.dangerBtn]}
            activeOpacity={0.8}
            onPress={handleTerminateAccount}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.secondaryBrand} />
            <Text style={[styles.actionBtnText, styles.dangerBtnText]}>Terminate Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 18,
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
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryFixed,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.outline,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  indicatorGreen: {
    backgroundColor: colors.tulsiGreen,
  },
  userName: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  userId: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  userMetadata: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: colors.cream,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaText: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  orgList: {
    gap: spacing.md,
  },
  orgItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.cream,
    paddingBottom: spacing.sm,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  orgMeta: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  jumpBtn: {
    padding: spacing.xs,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
    textAlignVertical: "top",
    height: 100,
  },
  governanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  controlTitle: {
    fontSize: 15,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  controlDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.sandstone,
    height: 48,
    borderRadius: borderRadius.xl,
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  auditLogsSection: {
    gap: spacing.md,
  },
  auditTitle: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  auditList: {
    gap: spacing.sm,
  },
  auditItem: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  auditIcon: {
    marginTop: 2,
  },
  auditInfo: {
    flex: 1,
  },
  auditAction: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  auditTime: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  dangerBtn: {
    borderColor: "rgba(185, 13, 24, 0.2)",
    backgroundColor: "rgba(185, 13, 24, 0.05)",
  },
  dangerBtnText: {
    color: colors.secondaryBrand,
  },
});

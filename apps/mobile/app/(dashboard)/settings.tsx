import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFetchTenant, useLogout } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function MobileSettingsScreen() {
  const { tenantId, role, tenantName } = useAuthStore();
  const { data: tenant, isLoading } = useFetchTenant(tenantId);
  const logoutMutation = useLogout();

  // Modal states for simulated drawers
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);

  // Edit profile form states
  const [nameInput, setNameInput] = useState("Rajesh Varma");
  const [emailInput, setEmailInput] = useState("rajesh@utsav.app");
  const [phoneInput, setPhoneInput] = useState("+91 98765 43210");

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to log out from Utsav?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync();
            router.replace("/(auth)/login");
          } catch (err) {
            router.replace("/(auth)/login");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topHeader}>
        <View style={styles.logoGroup}>
          <Image
            style={styles.logoAvatar}
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAirm3wYwR2haolgiXhjaLZgwSGYHF_FTD9RKQofQm9GFmwKa4rWXwddtyOpTB7W3NRbnOJzRxAd1a_IJqrnRzWXX6G5BZ0KZ41Xe7B6Ys6KutHCfY59-rdqa0-waHl_H6yWr_rbnsRgakc12aQYw-yApo-VtWljq_COjAjJjjnO86jPd3mAO9bG4KE106lTn_9ikcnA9wEzRpHWrCHXCxvSClONeeGEIo0en5YyJcqCkPa5bzTR39l",
            }}
          />
          <Text style={styles.logoText}>UTSAV</Text>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => router.push("/(dashboard)/notifications")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              <Image
                style={styles.avatarImage}
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVwDCt1yy22Wc84oZNEU1_vqmpWO3s9-1h55IqexzFaHlUeQppZUMoxCnwkDYEngaLHMAfHUgdcoOWQ2l6iK6naKYk17lE00JkxhA-9vq2RVy3tMVG3PrqduyGdyDETD2cjkQgbtICtTYhxucW6ESTtnaMOHtSayWklmIyMmhQVhlLuskMckn1REG2g1LDlN_h1iiR5JJBji8ylSgq83nVPB1HAh8YTCwiLldXtIe503SLkkBAP9ZU",
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={() => setProfileModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{nameInput}</Text>
          <View style={styles.profileBadgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role || "Owner"}</Text>
            </View>
            <Text style={styles.bulletSeparator}>•</Text>
            <Text style={styles.mandalName}>{tenant?.name || "Shree Siddhivinayak Mandal"}</Text>
          </View>
        </View>

        {/* Settings Groups */}
        <View style={styles.groupsContainer}>
          {/* Account Section */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Account</Text>
            <View style={styles.groupCard}>
              <TouchableOpacity
                style={styles.groupItem}
                onPress={() => setProfileModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={colors.primaryBrand} />
                  </View>
                  <Text style={styles.groupItemText}>Edit Profile</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>

              <View style={styles.itemSeparator} />

              <TouchableOpacity
                style={styles.groupItem}
                onPress={() => setSecurityModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="shield-check-outline" size={20} color={colors.primaryBrand} />
                  </View>
                  <Text style={styles.groupItemText}>Security Settings</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mandal Details */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Mandal</Text>
            <View style={styles.groupCard}>
              <View style={styles.groupItemStatic}>
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(125, 88, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="home-city-outline" size={20} color={colors.tertiary} />
                  </View>
                  <View>
                    <Text style={styles.staticLabel}>Mandal Name</Text>
                    <Text style={styles.staticValue}>{tenant?.name || "Utsav Mandal"}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.itemSeparator} />

              <View style={styles.groupItemStatic}>
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(125, 88, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="domain" size={20} color={colors.tertiary} />
                  </View>
                  <View>
                    <Text style={styles.staticLabel}>Subdomain</Text>
                    <Text style={styles.staticValue}>{tenant?.slug || "sai"}.techsonance.co.in</Text>
                  </View>
                </View>
              </View>

              <View style={styles.itemSeparator} />

              <View style={styles.groupItemStatic}>
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(125, 88, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="tag-outline" size={20} color={colors.tertiary} />
                  </View>
                  <View>
                    <Text style={styles.staticLabel}>Category</Text>
                    <Text style={styles.staticValue}>{tenant?.vertical?.toUpperCase() || "GANPATI"}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {/* Subscription Section */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Subscription</Text>
            <View style={styles.groupCard}>
              <TouchableOpacity
                style={styles.groupItem}
                onPress={() => router.push("/(dashboard)/manage-subscription")}
                activeOpacity={0.7}
              >
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(217, 43, 43, 0.08)" }]}>
                    <MaterialCommunityIcons name="card-bulleted-outline" size={20} color={colors.kumkumRed} />
                  </View>
                  <View>
                    <Text style={styles.groupItemText}>Billing & Subscription</Text>
                    <View style={styles.shimmerBadge}>
                      <Text style={styles.shimmerBadgeText}>GOLD PLAN • ACTIVE</Text>
                    </View>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mandal Administration (Visible to Admins / Committee members / Super Admin for testing) */}
          {["owner", "admin", "treasurer", "committee_member", "super_admin"].includes(role || "") && (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>Mandal Administration</Text>
              <View style={styles.groupCard}>
                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/owner-onboarding")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                      <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={colors.primaryBrand} />
                    </View>
                    <Text style={styles.groupItemText}>Owner Onboarding Checklist</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/analytics-hub")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(201, 146, 26, 0.08)" }]}>
                      <MaterialCommunityIcons name="chart-bar" size={20} color={colors.aartiGold} />
                    </View>
                    <Text style={styles.groupItemText}>Analytics Hub</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/committee-directory")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(34, 197, 94, 0.08)" }]}>
                      <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.tulsiGreen} />
                    </View>
                    <Text style={styles.groupItemText}>Committee Directory</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/assign-position")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                      <MaterialCommunityIcons name="account-cog-outline" size={20} color={colors.primaryBrand} />
                    </View>
                    <Text style={styles.groupItemText}>Assign Committee Position</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/create-campaign")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(255, 149, 0, 0.08)" }]}>
                      <MaterialCommunityIcons name="bullhorn-outline" size={20} color={colors.primaryContainer} />
                    </View>
                    <Text style={styles.groupItemText}>Launch Campaign</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/volunteer-duty-roster")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(34, 197, 94, 0.08)" }]}>
                      <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.tulsiGreen} />
                    </View>
                    <Text style={styles.groupItemText}>Volunteer Duty Roster</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/volunteer-check-in")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                      <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.primaryBrand} />
                    </View>
                    <Text style={styles.groupItemText}>Volunteer Check-in</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/record-cash-entry")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(255, 149, 0, 0.08)" }]}>
                      <MaterialCommunityIcons name="cash-multiple" size={20} color={colors.primaryContainer} />
                    </View>
                    <Text style={styles.groupItemText}>Record Cash Donation</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/select-amount")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(255, 149, 0, 0.08)" }]}>
                      <MaterialCommunityIcons name="gift-outline" size={20} color={colors.primaryContainer} />
                    </View>
                    <Text style={styles.groupItemText}>Devotee Donation Flow</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Platform Super Admin Portal */}
          {role === "super_admin" && (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>Platform Administration</Text>
              <View style={styles.groupCard}>
                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/super-admin-dashboard")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(185, 13, 24, 0.08)" }]}>
                      <MaterialCommunityIcons name="view-dashboard-outline" size={20} color={colors.secondaryBrand} />
                    </View>
                    <Text style={styles.groupItemText}>Super Admin Dashboard</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/global-user-directory")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(185, 13, 24, 0.08)" }]}>
                      <MaterialCommunityIcons name="account-search-outline" size={20} color={colors.secondaryBrand} />
                    </View>
                    <Text style={styles.groupItemText}>Global User Directory</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/staff-access-management")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(185, 13, 24, 0.08)" }]}>
                      <MaterialCommunityIcons name="shield-account-outline" size={20} color={colors.secondaryBrand} />
                    </View>
                    <Text style={styles.groupItemText}>Staff Access Control</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/tenant-management")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(185, 13, 24, 0.08)" }]}>
                      <MaterialCommunityIcons name="domain" size={20} color={colors.secondaryBrand} />
                    </View>
                    <Text style={styles.groupItemText}>Tenant Directory</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <View style={styles.itemSeparator} />

                <TouchableOpacity
                  style={styles.groupItem}
                  onPress={() => router.push("/(dashboard)/platform-health")}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupItemLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: "rgba(185, 13, 24, 0.08)" }]}>
                      <MaterialCommunityIcons name="shield-crown-outline" size={20} color={colors.secondaryBrand} />
                    </View>
                    <Text style={styles.groupItemText}>Platform Health Status</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
          )}


          {/* System Section */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>System</Text>
            <View style={styles.groupCard}>
              <TouchableOpacity style={styles.groupItem} activeOpacity={0.7}>
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.surfaceContainer }]}>
                    <MaterialCommunityIcons name="key-outline" size={20} color={colors.onSurfaceVariant} />
                  </View>
                  <View style={styles.apiKeysRow}>
                    <Text style={styles.groupItemText}>API Keys</Text>
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                    </View>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>

              <View style={styles.itemSeparator} />

              <TouchableOpacity style={styles.groupItem} activeOpacity={0.7}>
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.surfaceContainer }]}>
                    <MaterialCommunityIcons name="translate" size={20} color={colors.onSurfaceVariant} />
                  </View>
                  <Text style={styles.groupItemText}>Language (EN/हि/ગુ)</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <MaterialCommunityIcons name="logout" size={20} color={colors.kumkumRed} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            VERSION 2.4.1 (STABLE) • Powered by Utsav
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal / Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="e.g. Rajesh Kumar"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address</Text>
                <TextInput
                  style={styles.formInput}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => {
                  setProfileModalVisible(false);
                  Alert.alert("Success", "Profile updated successfully!");
                }}
              >
                <Text style={styles.modalSaveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Security Modal / Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={securityModalVisible}
        onRequestClose={() => setSecurityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security Settings</Text>
              <TouchableOpacity onPress={() => setSecurityModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current Password</Text>
                <TextInput
                  style={styles.formInput}
                  secureTextEntry
                  placeholder="••••••••"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>New Password</Text>
                <TextInput
                  style={styles.formInput}
                  secureTextEntry
                  placeholder="••••••••"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.formInput}
                  secureTextEntry
                  placeholder="••••••••"
                />
              </View>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => {
                  setSecurityModalVisible(false);
                  Alert.alert("Success", "Password updated successfully!");
                }}
              >
                <Text style={styles.modalSaveButtonText}>Update Password</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
  },
  logoText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  bellButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: spacing.sm,
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: colors.primaryContainer,
    padding: 3,
    backgroundColor: "#FFFFFF",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: colors.cream,
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: colors.primaryBrand,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    fontSize: 22,
    color: colors.onSurface,
    fontFamily: fonts.poppins.semibold,
  },
  profileBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: "rgba(255, 149, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  roleText: {
    color: colors.primaryBrand,
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    letterSpacing: 0.5,
  },
  bulletSeparator: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  mandalName: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
  },
  groupsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  group: {
    gap: spacing.xs,
  },
  groupLabel: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 2,
    paddingLeft: spacing.sm,
  },
  groupCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
  },
  groupItemStatic: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  groupItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  groupItemText: {
    fontSize: 15,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  staticLabel: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
  },
  staticValue: {
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.semibold,
    marginTop: 2,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    marginHorizontal: spacing.md,
  },
  shimmerBadge: {
    backgroundColor: "rgba(201, 146, 26, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  shimmerBadgeText: {
    fontSize: 10,
    color: colors.aartiGold,
    fontFamily: fonts.inter.bold,
  },
  apiKeysRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  premiumBadge: {
    backgroundColor: "rgba(201, 146, 26, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(201, 146, 26, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  premiumBadgeText: {
    fontSize: 9,
    color: colors.aartiGold,
    fontFamily: fonts.inter.bold,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: "rgba(217, 43, 43, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(217, 43, 43, 0.1)",
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  logoutText: {
    color: colors.kumkumRed,
    fontSize: 15,
    fontFamily: fonts.inter.bold,
  },
  footerNote: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
    textAlign: "center",
    marginTop: spacing.md,
    fontFamily: fonts.inter.medium,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: borderRadius["2xl"],
    borderTopRightRadius: borderRadius["2xl"],
    padding: spacing.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  modalForm: {
    marginBottom: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  formLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
    backgroundColor: colors.pujaWhite,
  },
  modalSaveButton: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginTop: spacing.md,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  modalSaveButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
  },
});

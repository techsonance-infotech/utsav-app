import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFetchTenant,
  useLogout,
  useFetchMyProfile,
  useUpdateMyProfile,
  useChangePassword,
} from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "../lib/i18n";
import LoaderOverlay from "../components/LoaderOverlay";
import * as ImagePicker from "expo-image-picker";

export default function MobileSettingsScreen() {
  const { t, language, setLanguage } = useTranslation();
  const { tenantId, role, userEmail, userFullName } = useAuthStore();

  // Queries & Mutations
  const { data: tenant, isLoading: isTenantLoading } = useFetchTenant(tenantId);
  const { data: myProfile, isLoading: isProfileLoading } = useFetchMyProfile();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateMyProfile();
  const changePasswordMutation = useChangePassword();

  // Modal states
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Sync auth store when profile data arrives from backend
  useEffect(() => {
    if (myProfile) {
      const updates: Record<string, string | null> = {};
      if (myProfile.full_name && myProfile.full_name !== userFullName) {
        updates.userFullName = myProfile.full_name;
      }
      if (myProfile.email && myProfile.email !== userEmail) {
        updates.userEmail = myProfile.email;
      }
      if (Object.keys(updates).length > 0) {
        useAuthStore.getState().setAuth(updates);
      }
    }
  }, [myProfile]);

  const adminItems = [
    {
      title: "Owner Onboarding Checklist",
      icon: "checkbox-marked-circle-outline",
      iconBg: "rgba(140, 80, 0, 0.08)",
      iconColor: colors.primaryBrand,
      route: "/(dashboard)/owner-onboarding",
      roles: ["owner", "super_admin"],
    },
    {
      title: "Analytics Hub",
      icon: "chart-bar",
      iconBg: "rgba(201, 146, 26, 0.08)",
      iconColor: colors.aartiGold,
      route: "/(dashboard)/analytics-hub",
      roles: ["owner", "admin", "super_admin"],
    },
    {
      title: "Committee Directory",
      icon: "account-group-outline",
      iconBg: "rgba(34, 197, 94, 0.08)",
      iconColor: colors.tulsiGreen,
      route: "/(dashboard)/committee-directory",
      roles: ["owner", "admin", "treasurer", "committee_member", "super_admin"],
    },
    {
      title: "Assign Committee Position",
      icon: "account-cog-outline",
      iconBg: "rgba(140, 80, 0, 0.08)",
      iconColor: colors.primaryBrand,
      route: "/(dashboard)/assign-position",
      roles: ["owner", "admin", "super_admin"],
    },
    {
      title: "Launch Campaign",
      icon: "bullhorn-outline",
      iconBg: "rgba(255, 149, 0, 0.08)",
      iconColor: colors.primaryContainer,
      route: "/(dashboard)/create-campaign",
      roles: ["owner", "admin", "treasurer", "super_admin"],
    },
    {
      title: "Volunteer Duty Roster",
      icon: "calendar-clock",
      iconBg: "rgba(34, 197, 94, 0.08)",
      iconColor: colors.tulsiGreen,
      route: "/(dashboard)/volunteer-duty-roster",
      roles: ["owner", "admin", "treasurer", "committee_member", "super_admin"],
    },
    {
      title: "Volunteer Check-in",
      icon: "qrcode-scan",
      iconBg: "rgba(140, 80, 0, 0.08)",
      iconColor: colors.primaryBrand,
      route: "/(dashboard)/volunteer-check-in",
      roles: ["owner", "admin", "treasurer", "committee_member", "super_admin"],
    },
    {
      title: "Record Cash Donation",
      icon: "cash-multiple",
      iconBg: "rgba(255, 149, 0, 0.08)",
      iconColor: colors.primaryContainer,
      route: "/(dashboard)/record-cash-entry",
      roles: ["owner", "admin", "treasurer", "super_admin"],
    },
    {
      title: "Devotee Donation Flow",
      icon: "gift-outline",
      iconBg: "rgba(255, 149, 0, 0.08)",
      iconColor: colors.primaryContainer,
      route: "/(dashboard)/select-amount",
      roles: ["owner", "admin", "treasurer", "committee_member", "super_admin"],
    },
  ];

  const visibleAdminItems = adminItems.filter(item => item.roles.includes(role || ""));

  // Change password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);



  // Password rules validation
  const rules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  };
  const isPasswordValid = Object.values(rules).every(Boolean);

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

  const openEditProfile = () => {
    router.push("/(dashboard)/edit-profile");
  };



  const handleEditAvatar = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option to update your profile photo:",
      [
        {
          text: "Take Photo",
          onPress: () => pickImage(true),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickImage(false),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need camera permission to take a picture.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need gallery permissions to select a photo.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateProfileMutation.mutateAsync({ avatarUrl: base64Uri });
        Alert.alert("Success", "Profile photo updated successfully!");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to pick/upload image.");
    }
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Validation Error", "Current password and new password are required.");
      return;
    }
    if (!isPasswordValid) {
      Alert.alert("Validation Error", "New password does not meet complexity rules.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword,
        newPassword,
      });
      setSecurityModalVisible(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      Alert.alert("Success", "Password updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to change password. Make sure current password is correct.");
    }
  };


  const handleSelectLanguage = (lang: "en" | "hi" | "gu") => {
    setLanguage(lang);
    setLangModalVisible(false);
  };

  if (isTenantLoading || isProfileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  const profileName = myProfile?.full_name || userFullName || "Utsav User";
  const avatarUrl = myProfile?.avatar_url || "";
  const profileEmail = myProfile?.email || userEmail || "";
  const profilePhone = myProfile?.phone || "";

  const isPending =
    logoutMutation.isPending ||
    updateProfileMutation.isPending ||
    changePasswordMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <LoaderOverlay visible={isPending} message="Please wait..." />

      {/* Top App Bar */}
      <View style={styles.topHeader}>
        <View style={styles.logoGroup}>
          <View style={styles.logoAvatarWrapper}>
            <Image
              style={styles.logoAvatar}
              source={require("../../assets/image-only.png")}
            />
          </View>
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
              {avatarUrl ? (
                <Image style={styles.avatarImage} source={{ uri: avatarUrl }} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {profileName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={handleEditAvatar}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">{profileName}</Text>
          <Text style={styles.profileEmailText} numberOfLines={1} ellipsizeMode="tail">{profileEmail}</Text>
          {profilePhone ? <Text style={styles.profilePhoneText} numberOfLines={1} ellipsizeMode="tail">{profilePhone}</Text> : null}

          <View style={styles.profileBadgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role || "Owner"}</Text>
            </View>
            <Text style={styles.bulletSeparator}>•</Text>
            <Text style={styles.mandalName} numberOfLines={1} ellipsizeMode="tail">{tenant?.name || "Shree Siddhivinayak Mandal"}</Text>
          </View>
        </View>

        {/* Settings Groups */}
        <View style={styles.groupsContainer}>
          {/* Account Section */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>{t("accountLabel")}</Text>
            <View style={styles.groupCard}>
              <TouchableOpacity
                style={styles.groupItem}
                onPress={openEditProfile}
                activeOpacity={0.7}
              >
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={colors.primaryBrand} />
                  </View>
                  <Text style={styles.groupItemText}>{t("editProfile")}</Text>
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
                  <Text style={styles.groupItemText}>{t("securitySettings")}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mandal Details */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>{t("mandalLabel")}</Text>
            <View style={styles.groupCard}>
              <View style={styles.groupItemStatic}>
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(125, 88, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="home-city-outline" size={20} color={colors.tertiary} />
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.staticLabel}>{t("mandalName")}</Text>
                    <Text style={styles.staticValue}>{tenant?.name || "Shree Siddhivinayak Mandal"}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.itemSeparator} />

              <View style={styles.groupItemStatic}>
                <View style={styles.groupItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: "rgba(125, 88, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="domain" size={20} color={colors.tertiary} />
                  </View>
                  <View style={{ flex: 1, flexWrap: "wrap", flexDirection: "column" }}>
                    <Text style={styles.staticLabel}>{t("subdomain")}</Text>
                    <Text style={[styles.staticValue, { flexWrap: "wrap" }]} numberOfLines={2}>
                      {tenant?.slug || "sai"}.techsonance.co.in
                    </Text>
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
                    <Text style={styles.staticLabel}>{t("category")}</Text>
                    <Text style={styles.staticValue}>{tenant?.vertical?.toUpperCase() || "GANPATI"}</Text>
                  </View>
                </View>
              </View>

              {["owner", "admin", "super_admin"].includes(role || "") && (
                <>
                  <View style={styles.itemSeparator} />
                  {/* Edit Detailed Onboarding Info Row */}
                  <TouchableOpacity
                    style={styles.groupItem}
                    onPress={() => router.push("/(dashboard)/edit-mandal" as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.groupItemLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: "rgba(125, 88, 0, 0.08)" }]}>
                        <MaterialCommunityIcons name="home-edit-outline" size={20} color={colors.tertiary} />
                      </View>
                      <Text style={styles.groupItemText}>Edit Mandal Details</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Subscription Section */}
          {["owner", "super_admin"].includes(role || "") && (
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
                        <Text style={styles.shimmerBadgeText}>
                          {`${(tenant?.plan || "TRIAL").toUpperCase()} PLAN • ACTIVE`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mandal Administration */}
          {visibleAdminItems.length > 0 && (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>Mandal Administration</Text>
              <View style={styles.groupCard}>
                {visibleAdminItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <TouchableOpacity
                      style={styles.groupItem}
                      onPress={() => router.push(item.route as any)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.groupItemLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                          <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
                        </View>
                        <Text style={styles.groupItemText}>{item.title}</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                    {idx < visibleAdminItems.length - 1 && <View style={styles.itemSeparator} />}
                  </React.Fragment>
                ))}
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

              <TouchableOpacity
                style={styles.groupItem}
                onPress={() => setLangModalVisible(true)}
                activeOpacity={0.7}
              >
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

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordTextInput}
                    secureTextEntry={!showOldPassword}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="••••••••"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                    <MaterialCommunityIcons
                      name={showOldPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordTextInput}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="••••••••"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <MaterialCommunityIcons
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordTextInput}
                    secureTextEntry={!showConfirmNewPassword}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    placeholder="••••••••"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                    <MaterialCommunityIcons
                      name={showConfirmNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password complexity checklist */}
              <View style={styles.checklist}>
                <View style={styles.checkRow}>
                  <MaterialCommunityIcons
                    name={rules.length ? "check-circle" : "circle-outline"}
                    size={16}
                    color={rules.length ? colors.tulsiGreen : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.checkText, rules.length && styles.checkTextActive]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.checkRow}>
                  <MaterialCommunityIcons
                    name={rules.upper && rules.lower ? "check-circle" : "circle-outline"}
                    size={16}
                    color={rules.upper && rules.lower ? colors.tulsiGreen : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.checkText, rules.upper && rules.lower && styles.checkTextActive]}>
                    Uppercase & lowercase letters
                  </Text>
                </View>
                <View style={styles.checkRow}>
                  <MaterialCommunityIcons
                    name={rules.number ? "check-circle" : "circle-outline"}
                    size={16}
                    color={rules.number ? colors.tulsiGreen : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.checkText, rules.number && styles.checkTextActive]}>
                    At least one number
                  </Text>
                </View>
                <View style={styles.checkRow}>
                  <MaterialCommunityIcons
                    name={rules.symbol ? "check-circle" : "circle-outline"}
                    size={16}
                    color={rules.symbol ? colors.tulsiGreen : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.checkText, rules.symbol && styles.checkTextActive]}>
                    At least one special character
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  (!isPasswordValid || newPassword !== confirmNewPassword) && styles.btnDisabled,
                ]}
                onPress={handleSavePassword}
                disabled={!isPasswordValid || newPassword !== confirmNewPassword}
              >
                <Text style={styles.modalSaveButtonText}>Update Password</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>


      {/* Language Switcher Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("selectLanguageTitle")}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: spacing.md, paddingVertical: spacing.md }}>
              <TouchableOpacity
                style={[styles.langOption, language === "en" && styles.langOptionActive]}
                onPress={() => handleSelectLanguage("en")}
              >
                <Text style={[styles.langOptionText, language === "en" && styles.langOptionTextActive]}>
                  English
                </Text>
                {language === "en" && <MaterialCommunityIcons name="check" size={20} color={colors.primaryBrand} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.langOption, language === "hi" && styles.langOptionActive]}
                onPress={() => handleSelectLanguage("hi")}
              >
                <Text style={[styles.langOptionText, language === "hi" && styles.langOptionTextActive]}>
                  Hindi / हिंदी
                </Text>
                {language === "hi" && <MaterialCommunityIcons name="check" size={20} color={colors.primaryBrand} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.langOption, language === "gu" && styles.langOptionActive]}
                onPress={() => handleSelectLanguage("gu")}
              >
                <Text style={[styles.langOptionText, language === "gu" && styles.langOptionTextActive]}>
                  Gujarati / ગુજરાતી
                </Text>
                {language === "gu" && <MaterialCommunityIcons name="check" size={20} color={colors.primaryBrand} />}
              </TouchableOpacity>
            </View>
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
  logoAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    overflow: "hidden",
  },
  logoAvatar: {
    width: 22,
    height: 22,
    resizeMode: "contain",
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
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 36,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
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
  },
  profileName: {
    fontSize: 18,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
    textAlign: "center",
    maxWidth: "90%",
  },
  profileEmailText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    marginTop: 2,
    opacity: 0.8,
    textAlign: "center",
    maxWidth: "90%",
  },
  profilePhoneText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    marginTop: 1,
    opacity: 0.8,
    textAlign: "center",
    maxWidth: "90%",
  },
  profileBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: 6,
    maxWidth: "95%",
    flexWrap: "wrap",
    paddingHorizontal: spacing.sm,
  },
  roleBadge: {
    backgroundColor: "rgba(255, 149, 0, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 11,
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
    textTransform: "uppercase",
  },
  bulletSeparator: {
    color: colors.onSurfaceVariant,
    opacity: 0.5,
  },
  mandalName: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    flexShrink: 1,
  },
  groupsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
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
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.pujaWhite,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  passwordTextInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  checklist: {
    gap: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
  },
  checkTextActive: {
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  btnDisabled: {
    backgroundColor: colors.sandstone,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
  },
  langOptionActive: {
    borderColor: colors.primaryBrand,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
  },
  langOptionText: {
    fontSize: 15,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  langOptionTextActive: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
});

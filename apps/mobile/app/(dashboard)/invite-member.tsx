import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGenerateInvite } from "@utsav/api-client";

export default function InviteMemberScreen() {
  const generateInviteMutation = useGenerateInvite();

  // Form Fields
  const [inviteeName, setInviteeName] = useState("");
  const [roleSelection, setRoleSelection] = useState<"treasurer" | "admin" | "volunteer">("volunteer");

  // Output token & link
  const [generatedLink, setGeneratedLink] = useState("");
  const [invitationToken, setInvitationToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!inviteeName.trim()) {
      Alert.alert("Name Required", "Please enter the invitee's name.");
      return;
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateInviteMutation.mutateAsync({
        role: roleSelection,
        invitee_name: inviteeName.trim(),
        expires_in_days: 7,
      });

      setGeneratedLink(response.link);
      setInvitationToken(response.invitation.token);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate invite link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    // Clipboard copy mock
    Alert.alert("Link Copied", "Invitation link copied to clipboard!");
  };

  const handleWhatsAppShare = () => {
    if (!generatedLink) return;
    Alert.alert(
      "Opening WhatsApp",
      `Sharing invite link for ${inviteeName} on WhatsApp...`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Member</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Invite Member</Text>
          <Text style={styles.introSub}>Add a new coordinator, treasurer, or volunteer to your Mandal.</Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Member's Full Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Rajesh Sharma"
              placeholderTextColor={colors.outline}
              value={inviteeName}
              onChangeText={setInviteeName}
            />
          </View>

          {/* Role selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Assign Role</Text>
            
            {/* Treasurer Option */}
            <TouchableOpacity
              style={[styles.roleRow, roleSelection === "treasurer" && styles.roleRowActive]}
              onPress={() => setRoleSelection("treasurer")}
            >
              <View style={styles.roleLeft}>
                <View style={styles.roleIconBox}>
                  <MaterialCommunityIcons name="wallet" size={20} color={colors.primaryBrand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>Treasurer</Text>
                  <Text style={styles.roleDesc}>Manage finances, approve vouchers</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={roleSelection === "treasurer" ? "radiobox-marked" : "radiobox-blank"}
                size={22}
                color={roleSelection === "treasurer" ? colors.primaryContainer : colors.outline}
              />
            </TouchableOpacity>

            {/* Committee Member Option */}
            <TouchableOpacity
              style={[styles.roleRow, roleSelection === "admin" && styles.roleRowActive]}
              onPress={() => setRoleSelection("admin")}
            >
              <View style={styles.roleLeft}>
                <View style={styles.roleIconBox}>
                  <MaterialCommunityIcons name="shield-account-outline" size={20} color={colors.primaryBrand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>Committee Member</Text>
                  <Text style={styles.roleDesc}>Publish announcements, edit schedules</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={roleSelection === "admin" ? "radiobox-marked" : "radiobox-blank"}
                size={22}
                color={roleSelection === "admin" ? colors.primaryContainer : colors.outline}
              />
            </TouchableOpacity>

            {/* Volunteer Option */}
            <TouchableOpacity
              style={[styles.roleRow, roleSelection === "volunteer" && styles.roleRowActive]}
              onPress={() => setRoleSelection("volunteer")}
            >
              <View style={styles.roleLeft}>
                <View style={styles.roleIconBox}>
                  <MaterialCommunityIcons name="account-star-outline" size={20} color={colors.primaryBrand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>Volunteer</Text>
                  <Text style={styles.roleDesc}>Assign and complete logistics duties</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={roleSelection === "volunteer" ? "radiobox-marked" : "radiobox-blank"}
                size={22}
                color={roleSelection === "volunteer" ? colors.primaryContainer : colors.outline}
              />
            </TouchableOpacity>
          </View>

          {/* Generate Button / Display Link */}
          {!generatedLink ? (
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="link-plus" size={18} color="#FFFFFF" />
                  <Text style={styles.generateBtnText}>Generate Invitation Link</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.shareBlock}>
              <Text style={styles.shareHeading}>Invitation Link Ready</Text>
              
              <View style={styles.linkDisplayBox}>
                <Text style={styles.linkText} numberOfLines={1}>
                  {generatedLink}
                </Text>
                <TouchableOpacity onPress={handleCopy}>
                  <MaterialCommunityIcons name="content-copy" size={18} color={colors.primaryBrand} />
                </TouchableOpacity>
              </View>

              <View style={styles.shareButtonsRow}>
                <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsAppShare}>
                  <MaterialCommunityIcons name="whatsapp" size={18} color="#FFFFFF" />
                  <Text style={styles.whatsappText}>Share via WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => {
                    setGeneratedLink("");
                    setInvitationToken("");
                  }}
                >
                  <Text style={styles.resetBtnText}>New Invite</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* In-Person Onboarding Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In-Person Onboarding</Text>
          <View style={styles.qrCard}>
            <View style={styles.qrPlaceholderBox}>
              {/* Render a styled mockup QR code using nested border layouts */}
              <View style={styles.qrCorner}>
                <View style={styles.qrInnerBlock}>
                  <MaterialCommunityIcons name="qrcode" size={120} color={colors.charcoal} />
                </View>
              </View>
            </View>
            <View style={styles.qrInfo}>
              <Text style={styles.qrTitle}>Scan to Join in Person</Text>
              <Text style={styles.qrDesc}>
                Let {inviteeName ? inviteeName : "them"} scan this QR code to join instantly as a{" "}
                <Text style={{ fontFamily: fonts.inter.bold, color: colors.primaryBrand }}>
                  {roleSelection.toUpperCase()}
                </Text>
                .
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  introContainer: {
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  introSub: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.pujaWhite,
  },
  roleRowActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: "rgba(255, 149, 0, 0.04)",
  },
  roleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  roleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
  },
  roleTitle: {
    fontSize: 13,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  roleDesc: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  generateBtn: {
    backgroundColor: colors.primaryContainer,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  generateBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
  shareBlock: {
    gap: 12,
    padding: 12,
    backgroundColor: colors.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  shareHeading: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    letterSpacing: 0.5,
  },
  linkDisplayBox: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkText: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    flex: 1,
    marginRight: 8,
  },
  shareButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  whatsappBtn: {
    flex: 1,
    backgroundColor: "#25D366",
    height: 40,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  whatsappText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
  resetBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  resetBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  section: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    paddingLeft: 4,
  },
  qrCard: {
    backgroundColor: colors.pujaWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 20,
    alignItems: "center",
    gap: 16,
  },
  qrPlaceholderBox: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  qrCorner: {
    padding: 4,
  },
  qrInnerBlock: {
    justifyContent: "center",
    alignItems: "center",
  },
  qrInfo: {
    alignItems: "center",
    gap: 6,
  },
  qrTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  qrDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});

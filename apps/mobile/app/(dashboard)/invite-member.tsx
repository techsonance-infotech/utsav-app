import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGenerateInvite } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type RoleType = "treasurer" | "admin" | "volunteer" | "member";

export default function InviteMemberScreen() {
  const { tenantSlug, tenantName } = useAuthStore();
  const generateInviteMutation = useGenerateInvite();

  // Form Fields
  const [inviteeName, setInviteeName] = useState("");
  const [inviteePhone, setInviteePhone] = useState("");
  const [roleSelection, setRoleSelection] = useState<RoleType>("volunteer");

  // Output token & link
  const [generatedLink, setGeneratedLink] = useState("");
  const [invitationToken, setInvitationToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!inviteeName.trim()) {
      Alert.alert("Name Required", "Please enter the invitee's name.");
      return;
    }
    if (!inviteePhone.trim()) {
      Alert.alert("Phone Required", "Please enter the invitee's mobile number.");
      return;
    }
    if (!/^\d{10}$/.test(inviteePhone.trim())) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateInviteMutation.mutateAsync({
        role: roleSelection,
        invitee_name: inviteeName.trim(),
        phone: inviteePhone.trim(),
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

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await Clipboard.setStringAsync(generatedLink);
      Alert.alert("Link Copied", "Invitation link copied to clipboard!");
    } catch (err: any) {
      Alert.alert("Error", "Failed to copy link to clipboard.");
    }
  };

  const handleWhatsAppShare = () => {
    if (!generatedLink) return;
    const cleanedPhone = inviteePhone.trim().replace(/\D/g, "");
    const formattedPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;

    const roleMap: Record<RoleType, string> = {
      treasurer: "Treasurer",
      admin: "Committee Member",
      volunteer: "Volunteer",
      member: "Devotee",
    };
    const roleLabel = roleMap[roleSelection];

    const message = `Hello ${inviteeName},\n\nYou have been invited to join ${tenantName || "our Mandal"} on Utsav App as a ${roleLabel}.\n\nPlease click the link below to verify your details and join:\n${generatedLink}\n\nRegards,\n${tenantName || "Utsav Mandal"}`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("Error", "WhatsApp is not installed on this device or could not be opened.");
    });
  };

  const handlePrintQR = async (qrDataUrl: string, title: string, subtitle: string) => {
    const html = `
      <html>
        <body style="text-align: center; font-family: sans-serif; padding: 40px; color: #333333; background-color: #FFFFFF;">
          <div style="border: 4px solid #FF9500; border-radius: 20px; padding: 30px; max-width: 500px; margin: 0 auto; background-color: #FFFDF9; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <h1 style="color: #D92B2B; margin-bottom: 5px; font-size: 28px; letter-spacing: 1px;">${(tenantName || "UTSAV MANDAL").toUpperCase()}</h1>
            <h2 style="color: #FF9500; margin-top: 0; font-size: 20px; font-weight: 600;">${title}</h2>
            <hr style="border: 0; border-top: 1px solid #E8E2D6; margin: 20px 0;" />
            <p style="font-size: 15px; line-height: 1.6; color: #555555; margin-bottom: 25px; padding: 0 10px;">
              ${subtitle}
            </p>
            <div style="display: inline-block; background: white; padding: 15px; border: 1px solid #E8E2D6; border-radius: 12px; margin-bottom: 20px;">
              <img src="${qrDataUrl}" style="width: 250px; height: 250px; display: block;" />
            </div>
            <p style="font-size: 12px; color: #999999; margin-top: 25px;">
              Scan using your smartphone camera or QR reader to join.
            </p>
            <p style="font-size: 11px; color: #CCCCCC; margin-top: 5px;">
              Powered by Utsav App • techsonance.co.in
            </p>
          </div>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `Print/Save ${title}` });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to download QR code PDF");
    }
  };

  const volunteerLink = tenantSlug
    ? `https://${tenantSlug}.techsonance.co.in/join?role=volunteer`
    : "";

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
          <Text style={styles.introSub}>Add a new coordinator, treasurer, volunteer, or devotee to your Mandal.</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="10-digit mobile number"
              placeholderTextColor={colors.outline}
              keyboardType="phone-pad"
              maxLength={10}
              value={inviteePhone}
              onChangeText={setInviteePhone}
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

            {/* Devotee/Member Option */}
            <TouchableOpacity
              style={[styles.roleRow, roleSelection === "member" && styles.roleRowActive]}
              onPress={() => setRoleSelection("member")}
            >
              <View style={styles.roleLeft}>
                <View style={styles.roleIconBox}>
                  <MaterialCommunityIcons name="account-heart-outline" size={20} color={colors.primaryBrand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>Devotee / Member</Text>
                  <Text style={styles.roleDesc}>Access announcements, donation campaigns & chats</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={roleSelection === "member" ? "radiobox-marked" : "radiobox-blank"}
                size={22}
                color={roleSelection === "member" ? colors.primaryContainer : colors.outline}
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
                  <Text style={styles.whatsappText}>Send to WhatsApp</Text>
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

          {/* Card 1: Specific Invitation Link QR Code */}
          {generatedLink ? (
            <View style={styles.qrCard}>
              <View style={styles.qrPlaceholderBox}>
                <View style={styles.qrInnerBlock}>
                  <Print.Image
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedLink)}` }}
                    style={{ width: 140, height: 140 }}
                  />
                </View>
              </View>
              <View style={styles.qrInfo}>
                <Text style={styles.qrTitle}>Personalized Onboarding QR</Text>
                <Text style={styles.qrDesc}>
                  Let <Text style={{ fontFamily: fonts.inter.bold }}>{inviteeName}</Text> scan this to register as a{" "}
                  <Text style={{ fontFamily: fonts.inter.bold, color: colors.primaryBrand }}>
                    {roleSelection === "admin" ? "COMMITTEE MEMBER" : roleSelection.toUpperCase()}
                  </Text>
                  .
                </Text>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() =>
                    handlePrintQR(
                      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedLink)}`,
                      `Personalized Invite: ${inviteeName}`,
                      `Scan this QR to register as a ${roleSelection === "admin" ? "Committee Member" : roleSelection} in ${tenantName || "our Mandal"}.`
                    )
                  }
                >
                  <MaterialCommunityIcons name="download" size={16} color={colors.primaryBrand} />
                  <Text style={styles.downloadBtnText}>Download/Print QR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Card 2: Constant Volunteer Join QR Code */}
          {volunteerLink ? (
            <View style={styles.qrCard}>
              <View style={styles.qrPlaceholderBox}>
                <View style={styles.qrInnerBlock}>
                  <Print.Image
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(volunteerLink)}` }}
                    style={{ width: 140, height: 140 }}
                  />
                </View>
              </View>
              <View style={styles.qrInfo}>
                <Text style={styles.qrTitle}>Join instantly as a Volunteer</Text>
                <Text style={styles.qrDesc}>
                  Print and display this QR code around your Mandal premises to invite volunteer signups.
                </Text>
                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() =>
                    handlePrintQR(
                      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(volunteerLink)}`,
                      "Join as Volunteer",
                      `Scan this QR code to join ${tenantName || "our Mandal"} as a Volunteer.`
                    )
                  }
                >
                  <MaterialCommunityIcons name="download" size={16} color={colors.primaryBrand} />
                  <Text style={styles.downloadBtnText}>Download/Print QR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
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
    marginBottom: 8,
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
    gap: 16,
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
    marginBottom: 8,
  },
  qrPlaceholderBox: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  qrInnerBlock: {
    justifyContent: "center",
    alignItems: "center",
    width: 140,
    height: 140,
    overflow: "hidden",
  },
  qrInfo: {
    alignItems: "center",
    gap: 6,
    width: "100%",
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
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primaryBrand,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  downloadBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
});

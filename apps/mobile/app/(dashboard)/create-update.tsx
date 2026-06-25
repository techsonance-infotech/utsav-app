import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCreateNewsArticle, useCreateBlogPost } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CreateUpdateScreen() {
  const createNewsMutation = useCreateNewsArticle();
  const createBlogMutation = useCreateBlogPost();

  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"news" | "blog">("news");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  
  const [language, setLanguage] = useState("en");
  const [bodyText, setBodyText] = useState("");
  const [status, setStatus] = useState<"draft" | "schedule" | "publish">("publish");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockBannersList = [
    "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=600",
    "https://images.unsplash.com/photo-1609137948924-f7253597c413?w=600",
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600",
  ];

  const handleSelectMockBanner = () => {
    const randomUrl = mockBannersList[Math.floor(Math.random() * mockBannersList.length)];
    setBannerUrl(randomUrl);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a title for the update.");
      return;
    }
    if (!bodyText.trim()) {
      Alert.alert("Body Required", "Please write some content before publishing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalBannerUrl = bannerUrl || mockBannersList[0];

      if (category === "news") {
        await createNewsMutation.mutateAsync({
          title: title.trim(),
          body: bodyText.trim(),
          category: "announcement",
          banner_image_url: finalBannerUrl,
        });
      } else {
        await createBlogMutation.mutateAsync({
          title: title.trim(),
          body: bodyText.trim(),
          category: "tradition_culture",
          cover_image_url: finalBannerUrl,
          excerpt: bodyText.slice(0, 100) + "...",
        });
      }

      Alert.alert("Published Successfully", `Your ${category === "news" ? "news update" : "devotional blog"} has been published successfully.`);
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to publish update");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Update</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>New Post Creator</Text>
          <Text style={styles.introSub}>Draft your next community announcement or blog post.</Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepsRow}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
              <Text style={[styles.stepCircleText, step >= 1 && styles.stepCircleTextActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Basic Details</Text>
          </View>
          <View style={styles.stepDivider} />
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
              <Text style={[styles.stepCircleText, step >= 2 && styles.stepCircleTextActive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Compose Body</Text>
          </View>
        </View>

        {step === 1 ? (
          /* STEP 1 FORM */
          <View style={styles.formSection}>
            {/* Title Input */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Update Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Maha Aarti Timing Updates..."
                placeholderTextColor={colors.outline}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category selection */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Category Selection</Text>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={[styles.radioButton, category === "news" && styles.radioActive]}
                  onPress={() => setCategory("news")}
                >
                  <MaterialCommunityIcons
                    name="newspaper"
                    size={20}
                    color={category === "news" ? colors.primaryBrand : colors.outline}
                  />
                  <Text style={[styles.radioText, category === "news" && styles.radioTextActive]}>
                    News Update
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioButton, category === "blog" && styles.radioActive]}
                  onPress={() => setCategory("blog")}
                >
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={20}
                    color={category === "blog" ? colors.primaryBrand : colors.outline}
                  />
                  <Text style={[styles.radioText, category === "blog" && styles.radioTextActive]}>
                    Devotional Blog
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Banner media pick */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Banner Media</Text>
              <TouchableOpacity
                style={styles.bannerPicker}
                activeOpacity={0.8}
                onPress={handleSelectMockBanner}
              >
                {bannerUrl ? (
                  <View style={styles.bannerPreview}>
                    <Image source={{ uri: bannerUrl }} style={styles.bannerImg} />
                    <TouchableOpacity style={styles.removeBannerBtn} onPress={() => setBannerUrl(null)}>
                      <MaterialCommunityIcons name="close-circle" size={20} color={colors.kumkumRed} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.pickerContent}>
                    <MaterialCommunityIcons name="image-plus" size={32} color={colors.primaryBrand} />
                    <Text style={styles.pickerTitle}>Tap to Select Banner Photo</Text>
                    <Text style={styles.pickerSub}>JPG, PNG, WEBP (Max 5MB)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Step 1 Actions */}
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>Next Step</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          /* STEP 2 FORM */
          <View style={styles.formSection}>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Content Language</Text>
              <View style={styles.languageSelectors}>
                {["en", "hi", "gu"].map((lang) => {
                  const isActive = language === lang;
                  return (
                    <TouchableOpacity
                      key={lang}
                      style={[styles.langChip, isActive && styles.langChipActive]}
                      onPress={() => setLanguage(lang)}
                    >
                      <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>
                        {lang === "en" ? "English" : lang === "hi" ? "Hindi (हिन्दी)" : "Gujarati (ગુજરાતી)"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              {/* Rich formatting row mock */}
              <View style={styles.formatToolbar}>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <MaterialCommunityIcons name="format-bold" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <MaterialCommunityIcons name="format-italic" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <MaterialCommunityIcons name="link-variant" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.bodyInput}
                placeholder="Start writing your community update here..."
                placeholderTextColor={colors.outline}
                multiline
                numberOfLines={10}
                value={bodyText}
                onChangeText={setBodyText}
              />
            </View>

            {/* Back action */}
            <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)}>
              <MaterialCommunityIcons name="arrow-left" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.backStepText}>Back to Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>STATUS:</Text>
          <View style={styles.statusChips}>
            {["draft", "publish"].map((st) => {
              const isActive = status === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.statusChip, isActive && styles.statusChipActive]}
                  onPress={() => setStatus(st as any)}
                >
                  <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>
                    {st === "draft" ? "Draft" : "Publish Now"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.publishBtn}
            onPress={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.publishBtnText}>Publish</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    letterSpacing: 1.5,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 150,
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
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: colors.primaryBrand,
  },
  stepCircleText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  stepCircleTextActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  stepLabelActive: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  stepDivider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.sandstone,
    marginHorizontal: 12,
  },
  formSection: {
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 16,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
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
  radioRow: {
    flexDirection: "row",
    gap: 12,
  },
  radioButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.pujaWhite,
  },
  radioActive: {
    borderColor: colors.primaryBrand,
    backgroundColor: "rgba(255, 149, 0, 0.08)",
  },
  radioText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  radioTextActive: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  bannerPicker: {
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primaryBrand,
    borderStyle: "dashed",
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerPreview: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  removeBannerBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  pickerContent: {
    alignItems: "center",
    gap: 4,
  },
  pickerTitle: {
    fontSize: 13,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  pickerSub: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.outline,
  },
  nextBtn: {
    height: 48,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.inter.bold,
  },
  languageSelectors: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
  },
  langChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  langChipText: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  langChipTextActive: {
    color: "#FFFFFF",
  },
  formatToolbar: {
    flexDirection: "row",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    paddingBottom: 8,
    marginBottom: 8,
  },
  toolbarBtn: {
    padding: 6,
    borderRadius: 4,
  },
  bodyInput: {
    minHeight: 180,
    textAlignVertical: "top",
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  backStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  backStepText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  statusSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
    letterSpacing: 0.5,
  },
  statusChips: {
    flexDirection: "row",
    gap: 6,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  statusChipActive: {
    backgroundColor: colors.primaryBrand,
  },
  statusChipText: {
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  statusChipTextActive: {
    color: "#FFFFFF",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
  },
  publishBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  publishBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.inter.bold,
  },
});

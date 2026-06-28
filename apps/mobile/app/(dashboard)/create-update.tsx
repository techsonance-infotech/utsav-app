import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Switch, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useCreateNewsArticle, useCreateBlogPost, useUpdateNewsArticle, useUpdateBlogPost, useNewsArticles, useBlogPosts } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function CreateUpdateScreen() {
  const { editId, type } = useLocalSearchParams();
  const editIdStr = typeof editId === "string" ? editId : "";

  const createNewsMutation = useCreateNewsArticle();
  const createBlogMutation = useCreateBlogPost();
  const updateNewsMutation = useUpdateNewsArticle();
  const updateBlogMutation = useUpdateBlogPost();

  const { data: articles = [] } = useNewsArticles(true); // fetch all including drafts
  const { data: blogs = [] } = useBlogPosts(true);

  // Find edit item
  const editItem = editIdStr
    ? type === "blog"
      ? blogs.find((b) => b.id === editIdStr)
      : articles.find((a) => a.id === editIdStr)
    : null;

  const [step, setStep] = useState(1);

  // Form State
  const [titleEn, setTitleEn] = useState("");
  const [postType, setPostType] = useState<"news" | "blog">("news");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  // New Fields (Step 1)
  const [activeCategory, setActiveCategory] = useState("general");
  const [tagsStr, setTagsStr] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [scheduledAtStr, setScheduledAtStr] = useState(""); // YYYY-MM-DD HH:MM

  // Blog Only Fields (Step 1)
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [estimatedReadMins, setEstimatedReadMins] = useState("");

  // Step 2 Compose State
  const [language, setLanguage] = useState("en"); // Active language tab / single language select
  const [bodyEn, setBodyEn] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [bodyHi, setBodyHi] = useState("");
  const [titleGu, setTitleGu] = useState("");
  const [bodyGu, setBodyGu] = useState("");
  const [excerpt, setExcerpt] = useState("");

  // Blog SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [showSeoSettings, setShowSeoSettings] = useState(false);

  // Submission State
  const [status, setStatus] = useState<"draft" | "publish" | "schedule">("publish");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editItem) {
      setTitleEn(editItem.title || "");
      setPostType(type === "blog" ? "blog" : "news");
      setBannerUrl(type === "blog" ? (editItem as any).cover_image_url : (editItem as any).banner_image_url);
      setActiveCategory(editItem.category || (type === "blog" ? "tradition_culture" : "general"));
      setTagsStr(editItem.tags ? editItem.tags.join(", ") : "");
      setAllowComments(editItem.allow_comments ?? true);
      setExcerpt(editItem.excerpt || "");

      const dbStatus = editItem.status;
      setStatus(dbStatus === "scheduled" ? "schedule" : dbStatus === "draft" ? "draft" : "publish");

      if (editItem.scheduled_at) {
        const date = new Date(editItem.scheduled_at);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        setScheduledAtStr(`${yyyy}-${mm}-${dd} ${hh}:${min}`);
      }

      if (type === "blog") {
        setSlug((editItem as any).slug || "");
        setSubtitle((editItem as any).subtitle || "");
        setEstimatedReadMins((editItem as any).estimated_read_mins ? String((editItem as any).estimated_read_mins) : "");
        setMetaTitle((editItem as any).meta_title || "");
        setMetaDescription((editItem as any).meta_description || "");
        setLanguage(editItem.language || "en");
        setBodyEn(editItem.body || "");
      } else {
        setLanguage("en");
        setBodyEn(editItem.body || "");
        setTitleHi((editItem as any).title_hi || "");
        setBodyHi((editItem as any).body_hi || "");
        setTitleGu((editItem as any).title_gu || "");
        setBodyGu((editItem as any).body_gu || "");
      }
    }
  }, [editItem]);

  const newsCategories = [
    { label: "General Update", value: "general" },
    { label: "Festival Update", value: "festival_update" },
    { label: "Announcement", value: "announcement" },
    { label: "Achievement", value: "achievement" },
    { label: "Press Release", value: "press" },
    { label: "Charity & Social", value: "charity" },
  ];

  const blogCategories = [
    { label: "Tradition & Culture", value: "tradition_culture" },
    { label: "Festival Story", value: "festival_story" },
    { label: "Volunteer Voice", value: "volunteer_voice" },
    { label: "Committee Update", value: "committee_update" },
    { label: "Recipe / Food & Rituals", value: "recipe" },
    { label: "Other Story", value: "other" },
  ];

  const handlePostTypeChange = (type: "news" | "blog") => {
    setPostType(type);
    if (type === "news") {
      setActiveCategory("general");
    } else {
      setActiveCategory("tradition_culture");
    }
  };

  const handleTitleEnChange = (val: string) => {
    setTitleEn(val);
    if (postType === "blog") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generatedSlug);
    }
  };

  const handlePickBanner = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need library permissions to select a banner photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const mimeType = result.assets[0].mimeType || "image/jpeg";
        const base64Uri = `data:${mimeType};base64,${result.assets[0].base64}`;
        setBannerUrl(base64Uri);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to select image.");
    }
  };

  const handlePublish = async () => {
    if (!titleEn.trim()) {
      Alert.alert("Title Required", "Please enter a title for the update.");
      return;
    }

    const currentBody = language === "en" ? bodyEn : language === "hi" ? bodyHi : bodyGu;
    if (!bodyEn.trim() && !currentBody.trim()) {
      Alert.alert("Body Required", "Please write some content before publishing.");
      return;
    }

    setIsSubmitting(true);
    try {
      let scheduledAtIso: string | null = null;
      if (status === "schedule") {
        if (!scheduledAtStr.trim()) {
          Alert.alert("Schedule Date Required", "Please enter scheduled date and time.");
          setIsSubmitting(false);
          return;
        }
        const dateObj = new Date(scheduledAtStr.replace(" ", "T") + ":00");
        if (isNaN(dateObj.getTime())) {
          Alert.alert("Invalid Date Format", "Please use YYYY-MM-DD HH:MM format.");
          setIsSubmitting(false);
          return;
        }
        if (dateObj <= new Date()) {
          Alert.alert("Invalid Date", "Scheduled date must be in the future.");
          setIsSubmitting(false);
          return;
        }
        scheduledAtIso = dateObj.toISOString();
      }

      const tagsArray = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const dbStatus = status === "draft" ? "draft" : status === "schedule" ? "scheduled" : "published";

      if (postType === "news") {
        const payload = {
          title: titleEn.trim(),
          title_hi: titleHi.trim() || null,
          title_gu: titleGu.trim() || null,
          body: bodyEn.trim(),
          body_hi: bodyHi.trim() || null,
          body_gu: bodyGu.trim() || null,
          excerpt: excerpt.trim() || null,
          category: activeCategory as any,
          language: "en",
          banner_image_url: bannerUrl || null,
          tags: tagsArray,
          status: dbStatus as any,
          scheduled_at: scheduledAtIso,
          allow_comments: allowComments,
        };

        if (editIdStr) {
          await updateNewsMutation.mutateAsync({ articleId: editIdStr, data: payload });
        } else {
          await createNewsMutation.mutateAsync(payload);
        }
      } else {
        if (!slug.trim()) {
          Alert.alert("Slug Required", "Please enter a URL slug for the blog.");
          setIsSubmitting(false);
          return;
        }
        if (!/^[a-z0-9-_]+$/.test(slug.trim())) {
          Alert.alert("Invalid Slug", "Slug must contain only lowercase alphanumeric characters, dashes, and underscores.");
          setIsSubmitting(false);
          return;
        }

        let parsedReadMins: number | null = null;
        if (estimatedReadMins.trim()) {
          const mins = parseInt(estimatedReadMins.trim(), 10);
          if (isNaN(mins) || mins <= 0) {
            Alert.alert("Invalid Read Time", "Estimated read time must be a positive integer.");
            setIsSubmitting(false);
            return;
          }
          parsedReadMins = mins;
        }

        const payload = {
          title: titleEn.trim(),
          subtitle: subtitle.trim() || null,
          slug: slug.trim(),
          body: bodyEn.trim(),
          excerpt: excerpt.trim() || null,
          cover_image_url: bannerUrl || null,
          category: activeCategory as any,
          tags: tagsArray,
          language: language,
          status: dbStatus as any,
          scheduled_at: scheduledAtIso,
          estimated_read_mins: parsedReadMins,
          allow_comments: allowComments,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
        };

        if (editIdStr) {
          await updateBlogMutation.mutateAsync({ postId: editIdStr, data: payload });
        } else {
          await createBlogMutation.mutateAsync(payload);
        }
      }

      Alert.alert(
        editIdStr ? "Updated Successfully" : "Published Successfully",
        `Your ${postType === "news" ? "news update" : "devotional blog"} has been ${editIdStr ? "updated" : "created"} successfully.`
      );
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to publish update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormCategories = () => {
    return postType === "news" ? newsCategories : blogCategories;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editIdStr ? "Edit Post" : "Create Update"}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>{editIdStr ? "Edit Post" : "New Post Creator"}</Text>
          <Text style={styles.introSub}>
            {editIdStr ? "Modify post content, banner media, status or localized translations." : "Draft your next community announcement or blog post."}
          </Text>
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
            {/* Title & Optional Blog Details */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Update Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Maha Aarti Timing Updates..."
                placeholderTextColor={colors.outline}
                value={titleEn}
                onChangeText={handleTitleEnChange}
              />

              {postType === "blog" && (
                <>
                  <Text style={styles.fieldLabel}>URL Slug *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. maha-aarti-timings-update"
                    placeholderTextColor={colors.outline}
                    autoCapitalize="none"
                    value={slug}
                    onChangeText={setSlug}
                  />

                  <Text style={styles.fieldLabel}>Blog Subtitle</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Understanding historical contexts..."
                    placeholderTextColor={colors.outline}
                    value={subtitle}
                    onChangeText={setSubtitle}
                  />

                  <Text style={styles.fieldLabel}>Estimated Read Time (Minutes)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 5"
                    placeholderTextColor={colors.outline}
                    keyboardType="numeric"
                    value={estimatedReadMins}
                    onChangeText={setEstimatedReadMins}
                  />
                </>
              )}
            </View>

            {/* Category selection & details */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Category Selection</Text>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={[styles.radioButton, postType === "news" && styles.radioActive]}
                  onPress={() => handlePostTypeChange("news")}
                >
                  <MaterialCommunityIcons
                    name="newspaper"
                    size={20}
                    color={postType === "news" ? colors.primaryBrand : colors.outline}
                  />
                  <Text style={[styles.radioText, postType === "news" && styles.radioTextActive]}>
                    News Update
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioButton, postType === "blog" && styles.radioActive]}
                  onPress={() => handlePostTypeChange("blog")}
                >
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={20}
                    color={postType === "blog" ? colors.primaryBrand : colors.outline}
                  />
                  <Text style={[styles.radioText, postType === "blog" && styles.radioTextActive]}>
                    Devotional Blog
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sub-category selector */}
              <Text style={styles.fieldLabel}>Select Specific Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageSelectors}>
                {getFormCategories().map((cat) => {
                  const isSelected = activeCategory === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      style={[styles.langChip, isSelected && styles.langChipActive]}
                      onPress={() => setActiveCategory(cat.value)}
                    >
                      <Text style={[styles.langChipText, isSelected && styles.langChipTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Tags */}
              <Text style={styles.fieldLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. festival, timing, morning"
                placeholderTextColor={colors.outline}
                value={tagsStr}
                onChangeText={setTagsStr}
              />
            </View>

            {/* Banner media pick */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Banner Media</Text>
              <TouchableOpacity
                style={styles.bannerPicker}
                activeOpacity={0.8}
                onPress={handlePickBanner}
              >
                {bannerUrl ? (
                  <View style={styles.bannerPreview}>
                    <Image source={{ uri: bannerUrl }} style={styles.bannerImg} />
                    <TouchableOpacity style={styles.removeBannerBtn} onPress={() => setBannerUrl(null)}>
                      <MaterialCommunityIcons name="close-circle" size={24} color={colors.kumkumRed} />
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

              {/* Allow Comments & Schedule Publish */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <Text style={styles.fieldLabel}>Allow Comments</Text>
                <Switch
                  value={allowComments}
                  onValueChange={setAllowComments}
                  trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {status === "schedule" && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.fieldLabel}>Scheduled Date & Time *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD HH:MM (e.g. 2026-06-28 18:30)"
                    placeholderTextColor={colors.outline}
                    value={scheduledAtStr}
                    onChangeText={setScheduledAtStr}
                  />
                </View>
              )}
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
            {/* Language Selector */}
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

            {/* Excerpt / Summary Card */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Excerpt / Short Description</Text>
              <TextInput
                style={[styles.textInput, { height: 64, textAlignVertical: "top", paddingTop: 8 }]}
                placeholder="Brief summary used for previews..."
                placeholderTextColor={colors.outline}
                multiline
                value={excerpt}
                onChangeText={setExcerpt}
              />
            </View>

            {/* Blog SEO Settings */}
            {postType === "blog" && (
              <View style={styles.card}>
                <TouchableOpacity
                  style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  onPress={() => setShowSeoSettings(!showSeoSettings)}
                >
                  <Text style={styles.fieldLabel}>SEO Metadata (Optional)</Text>
                  <MaterialCommunityIcons
                    name={showSeoSettings ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.outline}
                  />
                </TouchableOpacity>

                {showSeoSettings && (
                  <View style={{ gap: 8, marginTop: 8 }}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Meta Title"
                      placeholderTextColor={colors.outline}
                      value={metaTitle}
                      onChangeText={setMetaTitle}
                    />
                    <TextInput
                      style={[styles.textInput, { height: 60, textAlignVertical: "top", paddingTop: 8 }]}
                      placeholder="Meta Description"
                      placeholderTextColor={colors.outline}
                      multiline
                      value={metaDescription}
                      onChangeText={setMetaDescription}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Body Input */}
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

              {/* News Localization Editor or single editor for Blog */}
              {postType === "news" ? (
                <>
                  {language === "en" && (
                    <View style={{ gap: 8 }}>
                      <Text style={styles.fieldLabel}>English Title *</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="English Title"
                        placeholderTextColor={colors.outline}
                        value={titleEn}
                        onChangeText={handleTitleEnChange}
                      />
                      <Text style={styles.fieldLabel}>English Body *</Text>
                      <TextInput
                        style={styles.bodyInput}
                        placeholder="Start writing your English article body here..."
                        placeholderTextColor={colors.outline}
                        multiline
                        numberOfLines={10}
                        value={bodyEn}
                        onChangeText={setBodyEn}
                      />
                    </View>
                  )}

                  {language === "hi" && (
                    <View style={{ gap: 8 }}>
                      <Text style={styles.fieldLabel}>Hindi Title (हिन्दी शीर्षक)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="हिंदी शीर्षक"
                        placeholderTextColor={colors.outline}
                        value={titleHi}
                        onChangeText={setTitleHi}
                      />
                      <Text style={styles.fieldLabel}>Hindi Body (हिन्दी विवरण)</Text>
                      <TextInput
                        style={styles.bodyInput}
                        placeholder="लेख का मुख्य विवरण हिंदी में लिखें..."
                        placeholderTextColor={colors.outline}
                        multiline
                        numberOfLines={10}
                        value={bodyHi}
                        onChangeText={setBodyHi}
                      />
                    </View>
                  )}

                  {language === "gu" && (
                    <View style={{ gap: 8 }}>
                      <Text style={styles.fieldLabel}>Gujarati Title (ગુજરાતી શીર્ષક)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="ગુજરાતી શીર્ષક"
                        placeholderTextColor={colors.outline}
                        value={titleGu}
                        onChangeText={setTitleGu}
                      />
                      <Text style={styles.fieldLabel}>Gujarati Body (ગુજરાતી વિગત)</Text>
                      <TextInput
                        style={styles.bodyInput}
                        placeholder="લેખની મુખ્ય વિગત ગુજરાતીમાં લખો..."
                        placeholderTextColor={colors.outline}
                        multiline
                        numberOfLines={10}
                        value={bodyGu}
                        onChangeText={setBodyGu}
                      />
                    </View>
                  )}
                </>
              ) : (
                /* Blog Post Title and Body */
                <View style={{ gap: 8 }}>
                  <Text style={styles.fieldLabel}>Title ({language.toUpperCase()}) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter Title..."
                    placeholderTextColor={colors.outline}
                    value={titleEn}
                    onChangeText={handleTitleEnChange}
                  />
                  <Text style={styles.fieldLabel}>Body ({language.toUpperCase()}) *</Text>
                  <TextInput
                    style={styles.bodyInput}
                    placeholder={`Start writing your ${language.toUpperCase()} blog content here...`}
                    placeholderTextColor={colors.outline}
                    multiline
                    numberOfLines={10}
                    value={bodyEn}
                    onChangeText={setBodyEn}
                  />
                </View>
              )}
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
            {[
              { label: "Draft", value: "draft" },
              { label: "Publish Now", value: "publish" },
              { label: "Schedule", value: "schedule" },
            ].map((st) => {
              const isActive = status === st.value;
              return (
                <TouchableOpacity
                  key={st.value}
                  style={[styles.statusChip, isActive && styles.statusChipActive]}
                  onPress={() => setStatus(st.value as any)}
                >
                  <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>
                    {st.label}
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
              <Text style={styles.publishBtnText}>
                {editIdStr
                  ? status === "draft" ? "Save Draft" : status === "schedule" ? "Update Schedule" : "Save Changes"
                  : status === "draft" ? "Save Draft" : status === "schedule" ? "Schedule" : "Publish"
                }
              </Text>
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
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 12,
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

import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useNewsArticles, useBlogPosts, useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function NewsArticleScreen() {
  const { articleId, isBlog } = useLocalSearchParams();
  const idStr = typeof articleId === "string" ? articleId : "";
  const isBlogBool = isBlog === "true";

  const { role: userRole, tenantId, tenantName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const currentTenantName = tenant?.name || tenantName || "Mandal";
  const isAdmin = ["owner", "admin", "committee_member"].includes(userRole || "");

  const { data: articles = [] } = useNewsArticles(false);
  const { data: blogs = [] } = useBlogPosts();

  // Find article
  const article = isBlogBool
    ? blogs.find((b) => b.id === idStr)
    : articles.find((a) => a.id === idStr);

  const [language, setLanguage] = useState<"EN" | "HI" | "GU">("EN");
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Article not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get localized content fields
  const getLocalizedTitle = () => {
    if (language === "HI") return (article as any).title_hi || article.title;
    if (language === "GU") return (article as any).title_gu || article.title;
    return article.title;
  };

  const getLocalizedBody = () => {
    if (language === "HI") return (article as any).body_hi || article.body;
    if (language === "GU") return (article as any).body_gu || article.body;
    return article.body;
  };

  const articleBannerUrl = isBlogBool
    ? (article as any).cover_image_url
    : (article as any).banner_image_url;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Read "${getLocalizedTitle()}" on ${currentTenantName} app: ${articleBannerUrl || ""}`,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const authorFallback = {
    name: isBlogBool ? "Ananya Sharma" : "Aditya Kulkarni",
    role: isBlogBool ? "Chief Heritage Designer" : "Cultural Correspondent",
    avatar: isBlogBool
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuB-cvTDg0H9y3IpoYh-uHrnv6QMfTpbOEmRH7HkJnkhNdLihE8KlPLI5m7CD8QXKFsHC_fITwdsCBtxgz2f-c8-oYTzwUZ5e_Yq1cFj0eqfKi5J_tcbHCRKugHUKXe96wNMXWpfFc--6EQE-FyOzsXJjBvCX7_sZoCCZrL6n5yeGRZLJhlzbt4v5QbLDhhnSI9fX6xdra-9kZe55VCxiH94ppmemuC1WAZyMdyPyHXOJti-WMHVPNz4"
      : "https://lh3.googleusercontent.com/aida-public/AB6AXuCB2hbBRJZpr8fV6I4oub_86maNcW8uGRVzOlP33Sa_Sn9AneNpO0J-uIbXcIbEP7B1KLcRslUoNQ-r9M4hBLjHPnEZX7WebCMN0u6_e4SdYTSBsCeJUwa4gZRm70xuOYBz04MuP1bh1j623uHgWx1F6xg7DzyNHpxHlDO0pP7KRcn3IaNJfrJ98x9eYINjPdLSzIyntzPNhstdIzLcjn3LKWhgA7rx6LEDHfHfvtKEcEbwt2Lulu7R",
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerCircleBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.headerCircleBtn}
              onPress={() =>
                router.push({
                  pathname: "/create-update",
                  params: { editId: article.id, type: isBlogBool ? "blog" : "news" },
                })
              }
            >
              <MaterialCommunityIcons name="pencil" size={20} color={colors.charcoal} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerCircleBtn} onPress={handleShare}>
            <MaterialCommunityIcons name="share-variant" size={20} color={colors.charcoal} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Hero Image */}
        <Image
          source={{ uri: articleBannerUrl || "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=600" }}
          style={styles.bannerImage}
        />
        
        {/* Float Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{article.category || "FESTIVAL UPDATE"}</Text>
            </View>
            <Text style={styles.readTime}>• 5 min read</Text>
          </View>

          <Text style={styles.articleTitle}>{getLocalizedTitle()}</Text>

          <View style={styles.authorRow}>
            <Image source={{ uri: authorFallback.avatar }} style={styles.authorAvatar} />
            <View>
              <Text style={styles.authorName}>{authorFallback.name}</Text>
              <Text style={styles.authorRole}>
                {new Date(article.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} • {authorFallback.role}
              </Text>
            </View>
          </View>
        </View>

        {/* Translation bar */}
        <View style={styles.translationBar}>
          <View style={styles.langButtons}>
            {(["EN", "HI", "GU"] as const).map((lang) => {
              const isActive = language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langBtn, isActive && styles.langBtnActive]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text style={[styles.langBtnText, isActive && styles.langBtnTextActive]}>
                    {lang === "EN" ? "EN" : lang === "HI" ? "हिं" : "ગુ"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <MaterialCommunityIcons name="translate" size={18} color={colors.outline} />
        </View>

        {/* Body Text */}
        <View style={styles.bodyContent}>
          <Text style={styles.bodyParagraph}>{getLocalizedBody()}</Text>
          
          {/* Quote Callout block */}
          <View style={styles.calloutCard}>
            <Text style={styles.calloutQuote}>
              "Our goal is to make the divine experience seamless and dignified for every family."
            </Text>
            <Text style={styles.calloutAuthor}>— Rajesh Mehta, Head of Logistics</Text>
          </View>

          <Text style={styles.bodyParagraph}>
            Safety remains a paramount concern. Over 200 high-definition AI-integrated cameras will monitor crowd flow, providing real-time data to a central command center. Furthermore, a dedicated medical wing has been established near the primary entrance, staffed with multilingual professionals to assist a diverse demographic.
          </Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <Text style={styles.tag}>#GaneshChaturthi</Text>
          <Text style={styles.tag}>#MumbaiEvents</Text>
          <Text style={styles.tag}>#SmartCity</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.whatsappBtn} onPress={handleShare}>
          <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" />
          <Text style={styles.whatsappText}>Share to WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, isBookmarked && styles.actionBtnActive]}
          onPress={() => setIsBookmarked(!isBookmarked)}
        >
          <MaterialCommunityIcons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isBookmarked ? colors.primaryBrand : colors.charcoal}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MaterialCommunityIcons name="message-text-outline" size={22} color={colors.charcoal} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.kumkumRed,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  bannerImage: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    marginHorizontal: spacing.md,
    marginTop: -40,
    padding: 16,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.primaryContainer,
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    textTransform: "uppercase",
  },
  readTime: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.outline,
  },
  articleTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    lineHeight: 24,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
    paddingTop: 12,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  authorName: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
  },
  authorRole: {
    fontSize: 10,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  translationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing.md,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    paddingBottom: 8,
  },
  langButtons: {
    flexDirection: "row",
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  langBtnActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  langBtnText: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  langBtnTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  bodyContent: {
    paddingHorizontal: spacing.md,
    marginTop: 16,
    gap: 16,
  },
  bodyParagraph: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  calloutCard: {
    backgroundColor: colors.cream,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBrand,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  calloutQuote: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    fontStyle: "italic",
    lineHeight: 18,
  },
  calloutAuthor: {
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: spacing.md,
    marginTop: 20,
  },
  tag: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: "rgba(255, 248, 244, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  whatsappBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  whatsappText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.inter.bold,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnActive: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderColor: colors.primaryContainer,
  },
});

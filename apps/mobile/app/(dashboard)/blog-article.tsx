import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Share, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useBlogPosts, useIncrementNewsRead } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BlogArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: posts, isLoading } = useBlogPosts();
  const incrementRead = useIncrementNewsRead();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const article = posts?.find((p) => p.id === id) || posts?.[0];

  React.useEffect(() => {
    if (article?.id) {
      incrementRead.mutate(article.id);
    }
  }, [article?.id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article on Utsav: ${article?.title || ""}`,
        title: article?.title || "Utsav Blog",
      });
    } catch {}
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      </SafeAreaView>
    );
  }

  const displayTitle =
    (article as any)?.title ||
    "The Eternal Flame: Preserving Our Sacred Rituals in the Digital Age";
  const displayBody =
    (article as any)?.body ||
    (article as any)?.content ||
    "In the heart of every celebration lies a rhythm that has pulsed through generations. As we transition into a world increasingly defined by pixels and immediate gratification, the challenge of maintaining the sanctity of our communal rituals becomes more pressing than ever. This is not just about nostalgia; it's about the preservation of our collective identity.\n\nCommunity leaders across the nation are beginning to realize that technology, rather than being an adversary to tradition, can serve as its most potent steward. The digital platforms we use today allow us to document, share, and organize festivals with a level of precision that was previously unimaginable.\n\nConsider the logistical complexity of organizing a grand Utsav. Historically, these were managed through oral traditions and handwritten ledgers. Today, high-fidelity management systems allow committees to ensure that every donor is recognized, every ritual is scheduled accurately, and every member of the community feels included.\n\nThe integration of transparent financial tracking and real-time updates through community apps has fostered a new era of trust. When a devotee contributes to the temple fund, seeing that contribution materialize into a tangible community project in real-time creates a sense of belonging.";
  const authorName = (article as any)?.author_name || "Dr. Rajesh Mehta";
  const authorRole = "Committee Secretary & Cultural Historian";
  const readTime = "8 min read";
  const category = (article as any)?.category || "Tradition";
  const publishDate =
    article?.created_at
      ? new Date(article.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Oct 24, 2023";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.primaryBrand}
            />
          </TouchableOpacity>
          <Text style={styles.headerBrand}>UTSAV</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setIsBookmarked(!isBookmarked)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBg} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.tagRow}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{category}</Text>
              </View>
              <View style={styles.readTimeBadge}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.readTimeText}>{readTime}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{displayTitle}</Text>
            <View style={styles.authorRow}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitials}>
                  {authorName.charAt(0)}
                </Text>
              </View>
              <Text style={styles.authorMeta}>
                By {authorName} • {publishDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Article Body */}
        <View style={styles.articleBody}>
          {displayBody.split("\n\n").map((paragraph: string, idx: number) => (
            <Text
              key={idx}
              style={[
                styles.paragraph,
                idx === 0 && styles.firstParagraph,
              ]}
            >
              {paragraph}
            </Text>
          ))}

          {/* Blockquote */}
          <View style={styles.blockquote}>
            <Text style={styles.blockquoteText}>
              "Tradition is not the worship of ashes, but the preservation of
              fire. Our digital tools are the modern wood that keeps this
              sacred flame burning brighter for the youth."
            </Text>
          </View>
        </View>

        {/* Author Bio */}
        <View style={styles.authorBio}>
          <View style={styles.authorBioAvatar}>
            <Text style={styles.authorBioInitials}>
              {authorName.charAt(0)}
            </Text>
          </View>
          <View style={styles.authorBioInfo}>
            <Text style={styles.authorBioName}>{authorName}</Text>
            <Text style={styles.authorBioRole}>{authorRole}</Text>
            <Text style={styles.authorBioDesc}>
              Dr. Mehta has served the Utsav Committee for over 15 years,
              specializing in the intersection of Vedic traditions and
              community organizational systems.
            </Text>
          </View>
        </View>

        {/* Share Actions */}
        <View style={styles.shareSection}>
          <View style={styles.shareLeft}>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="chat"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.whatsappText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.copyLinkBtn}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={18}
                color={colors.onSurface}
              />
              <Text style={styles.copyLinkText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => setIsLiked(!isLiked)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isLiked ? "thumb-up" : "thumb-up-outline"}
              size={22}
              color={isLiked ? colors.primaryBrand : colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {/* Related Stories */}
        <View style={styles.relatedSection}>
          <View style={styles.relatedHeader}>
            <View>
              <Text style={styles.relatedLabel}>CONTINUE READING</Text>
              <Text style={styles.relatedTitle}>Related Stories</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(dashboard)/blog-feed")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>
                View all{" "}
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={14}
                  color={colors.primaryBrand}
                />
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedScroll}
          >
            {[
              {
                title: "The Geometry of Rangoli: Math and Ritual",
                author: "Anjali Sharma",
                readTime: "5 min read",
                cat: "Art",
              },
              {
                title: "The New Temple Fund: Transparency Reimagined",
                author: "Siddharth Rao",
                readTime: "12 min read",
                cat: "Community",
              },
              {
                title: "The Science of Satvik Cooking in Festivals",
                author: "Chef Priya K.",
                readTime: "7 min read",
                cat: "Cuisine",
              },
            ].map((story, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.relatedCard}
                activeOpacity={0.8}
              >
                <View style={styles.relatedCardImage}>
                  <View style={styles.relatedCatBadge}>
                    <Text style={styles.relatedCatText}>{story.cat}</Text>
                  </View>
                </View>
                <View style={styles.relatedCardBody}>
                  <Text style={styles.relatedCardTitle} numberOfLines={2}>
                    {story.title}
                  </Text>
                  <View style={styles.relatedMeta}>
                    <MaterialCommunityIcons
                      name="account"
                      size={14}
                      color={colors.onSurfaceVariant}
                    />
                    <Text style={styles.relatedMetaText}>{story.author}</Text>
                    <Text style={styles.relatedMetaDot}>•</Text>
                    <Text style={styles.relatedMetaText}>
                      {story.readTime}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255,248,244,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232,226,214,0.2)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerBrand: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 20,
    color: colors.primaryBrand,
    letterSpacing: 2,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Hero
  heroSection: {
    height: 360,
    justifyContent: "flex-end",
    position: "relative",
    overflow: "hidden",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.charcoal,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  heroContent: { padding: spacing.md, zIndex: 2 },
  tagRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  categoryTag: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryTagText: {
    fontFamily: fonts.inter.medium,
    fontSize: 10,
    color: colors.onPrimaryContainer,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  readTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  readTimeText: {
    fontFamily: fonts.inter.medium,
    fontSize: 10,
    color: "#FFFFFF",
  },
  heroTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 24,
    color: "#FFFFFF",
    lineHeight: 32,
    marginBottom: 12,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  authorInitials: {
    fontFamily: fonts.poppins.bold,
    fontSize: 13,
    color: colors.onPrimaryContainer,
  },
  authorMeta: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },

  // Article Body
  articleBody: { padding: spacing.md, paddingTop: 24, paddingBottom: 8 },
  paragraph: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    lineHeight: 28,
    color: colors.onSurfaceVariant,
    marginBottom: 20,
  },
  firstParagraph: {},
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBrand,
    paddingLeft: 20,
    marginVertical: 24,
  },
  blockquoteText: {
    fontFamily: fonts.inter.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
  },

  // Author Bio
  authorBio: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginHorizontal: spacing.md,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  authorBioAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  authorBioInitials: {
    fontFamily: fonts.poppins.bold,
    fontSize: 24,
    color: colors.onPrimaryContainer,
  },
  authorBioInfo: { flex: 1 },
  authorBioName: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 18,
    color: colors.onSurface,
  },
  authorBioRole: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.primaryBrand,
    marginBottom: 8,
  },
  authorBioDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },

  // Share
  shareSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing.md,
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
  },
  shareLeft: { flexDirection: "row", gap: 8 },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#25D366",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  whatsappText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: "#FFFFFF",
  },
  copyLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  copyLinkText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.onSurface,
  },
  likeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  // Related
  relatedSection: { paddingHorizontal: spacing.md, marginTop: 32 },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  relatedLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.primaryBrand,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  relatedTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 22,
    color: colors.onSurface,
  },
  viewAllText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.primaryBrand,
  },
  relatedScroll: { gap: 14, paddingBottom: 8 },
  relatedCard: {
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(232,226,214,0.5)",
    overflow: "hidden",
  },
  relatedCardImage: {
    height: 140,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 10,
  },
  relatedCatBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  relatedCatText: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.primaryBrand,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  relatedCardBody: { padding: 14 },
  relatedCardTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 8,
    lineHeight: 22,
  },
  relatedMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  relatedMetaText: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  relatedMetaDot: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
});

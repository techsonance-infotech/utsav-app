import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useBlogPosts } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BlogFeedScreen() {
  const { data: blogs = [], isLoading } = useBlogPosts();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All Stories",
    "Traditions",
    "Philanthropy",
    "Spotlight",
    "Food & Rituals",
  ];

  const getFallbackCover = (index: number) => {
    const covers = [
      "https://images.unsplash.com/photo-1609137948924-f7253597c413?w=600",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
    ];
    return covers[index % covers.length];
  };

  const getFallbackAuthor = (index: number) => {
    const authors = [
      {
        name: "Ananya Sharma",
        role: "Chief Heritage Designer",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-cvTDg0H9y3IpoYh-uHrnv6QMfTpbOEmRH7HkJnkhNdLihE8KlPLI5m7CD8QXKFsHC_fITwdsCBtxgz2f-c8-oYTzwUZ5e_Yq1cFj0eqfKi5J_tcbHCRKugHUKXe96wNMXWpfFc--6EQE-FyOzsXJjBvCX7_sZoCCZrL6n5yeGRZLJhlzbt4v5QbLDhhnSI9fX6xdra-9kZe55VCxiH94ppmemuC1WAZyMdyPyHXOJti-WMHVPNz4",
      },
      {
        name: "Vikram Malhotra",
        role: "Devotional Culinary Specialist",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgo7HwLvmIBdEgcqFeFN-6iBCw2UiaEEL__jncL_Ng3Uuy7kj5KnVmMsR77e1HP7je8GB4aK_Xln5r2ld0fP1AtkyPLTFyRFP3NbrS3-gTWf1NFbtBVQ_mBpk_-bOo7pgV_h-jxi2CEiCkMg0gdijBpkTQfPKvzK9wFVqIwyxsw13r_MCIslWO45QElAOCKiIem4pHPJT1MussWRfiTa0TxrC46uJmhhRefeIvchzwptUzJMLsJB-o",
      },
      {
        name: "Rajeshwari Devi",
        role: "Mandal Trustee",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtsE_1r478o9ZhWVoarxzsSk91r0oI4Ktcozca4uVPUg1e0OUh9MgM1x1lGCAg-z_Cy65xmwnIyEjsjtPfM4pINfv9uQe-x1RwlfW1aST84sJkin5Tkoda6-xXguJE-hUqzOgVUjGbHQqXmDnf1BSl6s-G1D36LNsuFVFSIh7fx3tJRxdP9dC4mr_iDhGtNJmj-TcANfIK0qAD8ksLyJ_TFZEB0yBl1b0_f546GuOyNntz1KthhXWH",
      },
    ];
    return authors[index % authors.length];
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (activeCategory === "All Stories") return true;
    if (activeCategory === "Spotlight") return blog.category?.toLowerCase() === "community spotlight";
    return blog.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/news")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Devotional Blogs</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Toggle header between News and Blogs */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => router.push("/news")}>
            <Text style={styles.tabBtnText}>Mandal News</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>Devotional Blogs</Text>
            <View style={styles.tabIndicator} />
          </TouchableOpacity>
        </View>

        {/* Category horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Cover Featured Story (Static premium placeholder if database is empty, else dynamic) */}
        {blogs.length > 0 && (
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/news-article",
                params: { articleId: blogs[0].id, isBlog: "true" },
              })
            }
          >
            <Image
              source={{ uri: blogs[0].cover_image_url || "https://images.unsplash.com/photo-1609137948924-f7253597c413?w=600" }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredOverlay} />
            <View style={styles.featuredContent}>
              <View style={styles.tagRow}>
                <Text style={styles.featuredTag}>COVER STORY</Text>
                <Text style={styles.readTime}>• 12 min read</Text>
              </View>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {blogs[0].title}
              </Text>
              <Text style={styles.featuredExcerpt} numberOfLines={2}>
                {blogs[0].excerpt || "How traditional Vedic architecture is being reimagined for modern community integration."}
              </Text>
              <View style={styles.authorRow}>
                <Image
                  source={{ uri: getFallbackAuthor(0).avatar }}
                  style={styles.authorAvatar}
                />
                <View>
                  <Text style={styles.authorName}>{getFallbackAuthor(0).name}</Text>
                  <Text style={styles.authorRole}>{getFallbackAuthor(0).role}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Feed List */}
        {isLoading ? (
          <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginTop: 40 }} />
        ) : filteredBlogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="feather" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>No devotional blogs posted yet.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredBlogs.slice(1).map((item, idx) => {
              const author = getFallbackAuthor(idx + 1);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.blogCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: "/news-article",
                      params: { articleId: item.id, isBlog: "true" },
                    })
                  }
                >
                  <Image
                    source={{ uri: item.cover_image_url || getFallbackCover(idx) }}
                    style={styles.blogImage}
                  />
                  <View style={styles.blogDetails}>
                    <View style={styles.blogTagRow}>
                      <Text style={styles.blogTag}>{item.category || "TRADITIONS"}</Text>
                      <Text style={styles.blogReadTime}>6 min read</Text>
                    </View>
                    <Text style={styles.blogTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.blogExcerpt} numberOfLines={2}>
                      {item.excerpt || "Preserving traditional recipes and cultural music."}
                    </Text>
                    <View style={styles.blogAuthorRow}>
                      <Image source={{ uri: author.avatar }} style={styles.authorMiniAvatar} />
                      <Text style={styles.authorMiniName}>{author.name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
    letterSpacing: 1.5,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 95,
  },
  tabToggleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    backgroundColor: "#FFFFFF",
  },
  tabBtn: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tabBtnActive: {
    backgroundColor: colors.pujaWhite,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: 3,
    backgroundColor: colors.primaryBrand,
    borderRadius: 1.5,
  },
  tabBtnText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  tabBtnTextActive: {
    color: colors.primaryBrand,
  },
  chipsScroll: {
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  featuredCard: {
    marginHorizontal: spacing.md,
    borderRadius: 20,
    overflow: "hidden",
    height: 340,
    position: "relative",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 8,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredTag: {
    backgroundColor: colors.aartiGold,
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  readTime: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    fontFamily: fonts.inter.medium,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    lineHeight: 24,
  },
  featuredExcerpt: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    lineHeight: 16,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.aartiGold,
  },
  authorName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  authorRole: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 9,
    fontFamily: fonts.inter.semibold,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    gap: 16,
  },
  blogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  blogImage: {
    width: "100%",
    height: 160,
  },
  blogDetails: {
    padding: 16,
    gap: 8,
  },
  blogTagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  blogTag: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  blogReadTime: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  blogTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    lineHeight: 20,
  },
  blogExcerpt: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
  blogAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
    paddingTop: 12,
  },
  authorMiniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  authorMiniName: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
});

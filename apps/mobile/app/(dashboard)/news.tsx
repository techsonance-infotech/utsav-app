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
import { useNewsArticles } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function NewsFeedScreen() {
  const { role: userRole } = useAuthStore();
  const { data: articles = [], isLoading, refetch } = useNewsArticles(false);

  // Filter category states
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Festival", "Announcements", "Press", "Charity"];

  const isAdmin = ["owner", "admin"].includes(userRole || "");

  const getFallbackBanner = (index: number) => {
    const banners = [
      "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1609137948924-f7253597c413?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60",
    ];
    return banners[index % banners.length];
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category?.toLowerCase()) {
      case "festival":
        return { bg: "rgba(255, 149, 0, 0.15)", text: colors.primaryContainer };
      case "charity":
        return { bg: "rgba(34, 197, 94, 0.15)", text: colors.tulsiGreen };
      case "press":
        return { bg: "rgba(14, 165, 233, 0.15)", text: "#0EA5E9" };
      default:
        return { bg: colors.cream, text: colors.charcoal };
    }
  };

  const filteredArticles = articles.filter((art) => {
    if (activeCategory === "All") return true;
    return art.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="temple-hindu" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.headerLogo}>UTSAV</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerNotifyBtn} onPress={() => refetch()}>
            <MaterialCommunityIcons name="refresh" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerNotifyBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.onSurfaceVariant} />
            <View style={styles.notifyBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content scroll */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Toggle header between News and Blogs */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>Mandal News</Text>
            <View style={styles.tabIndicator} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} onPress={() => router.push("/blog-feed")}>
            <Text style={styles.tabBtnText}>Devotional Blogs</Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills horizontal scroll */}
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

        {/* Articles List */}
        {isLoading ? (
          <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginTop: 40 }} />
        ) : filteredArticles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="newspaper-variant-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>No news articles found in this category.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredArticles.map((item, idx) => {
              const badgeColors = getCategoryBadgeStyle(item.category || "");
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.articleCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: "/news-article",
                      params: { articleId: item.id },
                    })
                  }
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.banner_image_url || getFallbackBanner(idx) }}
                      style={styles.articleBanner}
                    />
                    <View style={[styles.categoryBadge, { backgroundColor: badgeColors.bg }]}>
                      <Text style={[styles.categoryBadgeText, { color: badgeColors.text }]}>
                        {item.category || "General"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.articleTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaLeft}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color={colors.outline} />
                        <Text style={styles.metaText}>
                          {new Date(item.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Text>
                        <Text style={styles.bullet}>•</Text>
                        <MaterialCommunityIcons name="eye-outline" size={14} color={colors.outline} />
                        <Text style={styles.metaText}>{item.read_count || 0} reads</Text>
                      </View>

                      <TouchableOpacity style={styles.bookmarkBtn}>
                        <MaterialCommunityIcons name="bookmark-outline" size={18} color={colors.primaryBrand} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button to post update (Admin only / Available in demo) */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push("/create-update")}
        >
          <MaterialCommunityIcons name="pencil-plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogo: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: "row",
    gap: 4,
  },
  headerNotifyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifyBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondaryBrand,
    borderWidth: 1,
    borderColor: "#FFFFFF",
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
  listContainer: {
    paddingHorizontal: spacing.md,
    gap: 16,
  },
  articleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  articleBanner: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    textTransform: "uppercase",
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  articleTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
    paddingTop: 12,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.outline,
  },
  bullet: {
    color: colors.outline,
    fontSize: 10,
  },
  bookmarkBtn: {
    padding: 4,
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
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

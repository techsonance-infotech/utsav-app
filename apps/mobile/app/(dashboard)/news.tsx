import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  SafeAreaView,
} from "react-native";
import { useNewsArticles, useIncrementNewsRead } from "@utsav/api-client";

export default function MobileNewsScreen() {
  const { data: articles, isLoading, refetch } = useNewsArticles(false);
  const incrementRead = useIncrementNewsRead();
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [viewLanguage, setViewLanguage] = useState<"en" | "hi" | "gu">("en");

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleOpenArticle = (article: any) => {
    setSelectedArticle(article);
    incrementRead.mutate(article.id);
  };

  const getLocalizedContent = (article: any) => {
    if (!article) return { title: "", body: "", excerpt: "" };
    let title = article.title;
    let body = article.body;
    let excerpt = article.excerpt || "";

    if (viewLanguage === "hi") {
      title = article.title_hi || article.title;
      body = article.body_hi || article.body;
    } else if (viewLanguage === "gu") {
      title = article.title_gu || article.title;
      body = article.body_gu || article.body;
    }

    return { title, body, excerpt };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mandal News</Text>
        <TouchableOpacity style={styles.refetchButton} onPress={() => refetch()}>
          <Text style={styles.refetchText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9500" />
        </View>
      ) : articles && articles.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {articles.map((item) => {
            const loc = getLocalizedContent(item);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => handleOpenArticle(item)}
              >
                {item.banner_image_url ? (
                  <Image source={{ uri: item.banner_image_url }} style={styles.cardImage} />
                ) : (
                  <View style={styles.cardPlaceholderImage}>
                    <Text style={styles.placeholderEmoji}>🪔</Text>
                  </View>
                )}

                <View style={styles.cardContent}>
                  <View style={styles.cardMeta}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.metaText}>👁 {item.read_count || 0} reads</Text>
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {loc.title}
                  </Text>

                  {loc.excerpt ? (
                    <Text style={styles.cardExcerpt} numberOfLines={3}>
                      {loc.excerpt}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>📅 {formatDate(item.published_at || item.created_at)}</Text>
                    <Text style={styles.readMoreText}>Read More →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No news articles published yet.</Text>
        </View>
      )}

      {/* Article Detail Modal */}
      <Modal visible={!!selectedArticle} animationType="slide" transparent={false}>
        {selectedArticle && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedArticle(null)}>
                <Text style={styles.closeButtonText}>✕ Close</Text>
              </TouchableOpacity>
              <View style={styles.langSelector}>
                {(["en", "hi", "gu"] as const).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langBtn, viewLanguage === lang && styles.langBtnActive]}
                    onPress={() => setViewLanguage(lang)}
                  >
                    <Text style={[styles.langBtnText, viewLanguage === lang && styles.langBtnTextActive]}>
                      {lang === "en" ? "EN" : lang === "hi" ? "हिं" : "ગુ"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {selectedArticle.banner_image_url ? (
                <Image source={{ uri: selectedArticle.banner_image_url }} style={styles.modalImage} />
              ) : null}

              <View style={styles.modalContent}>
                <View style={styles.modalMetaRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{selectedArticle.category}</Text>
                  </View>
                  <Text style={styles.dateText}>
                    📅 {formatDate(selectedArticle.published_at || selectedArticle.created_at)}
                  </Text>
                </View>

                <Text style={styles.modalTitle}>{getLocalizedContent(selectedArticle).title}</Text>

                <View style={styles.divider} />

                <Text style={styles.modalBody}>{getLocalizedContent(selectedArticle).body}</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6", // Puja Ivory White
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  refetchButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  refetchText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  cardImage: {
    height: 160,
    width: "100%",
  },
  cardPlaceholderImage: {
    height: 160,
    backgroundColor: "#FFEFD5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: 44,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#D97706",
    textTransform: "uppercase",
  },
  metaText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
    lineHeight: 20,
  },
  cardExcerpt: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF9500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  langSelector: {
    flexDirection: "row",
    gap: 6,
  },
  langBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  langBtnActive: {
    borderColor: "#FF9500",
    backgroundColor: "#FFFBEB",
  },
  langBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  langBtnTextActive: {
    color: "#FF9500",
  },
  modalScroll: {
    paddingBottom: 40,
  },
  modalImage: {
    height: 200,
    width: "100%",
  },
  modalContent: {
    padding: 20,
    gap: 12,
  },
  modalMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  modalBody: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
});

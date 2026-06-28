import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useFetchAlbumMedia, useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2;

export default function AlbumGridScreen() {
  const { tenantId, tenantName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const currentTenantName = tenant?.name || tenantName || "Mandal";

  const { albumId, albumName } = useLocalSearchParams();
  const idStr = typeof albumId === "string" ? albumId : "";
  const nameStr = typeof albumName === "string" ? albumName : "Album Gallery";

  const { data: mediaItems = [], isLoading } = useFetchAlbumMedia(idStr || undefined);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out the "${nameStr}" album on ${currentTenantName}!`,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const imagesCount = mediaItems.filter((m) => m.media_type !== "video").length;
  const videosCount = mediaItems.filter((m) => m.media_type === "video").length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {nameStr}
          </Text>
          <Text style={styles.headerSub}>
            {mediaItems.length} items • {imagesCount} Photos • {videosCount} Videos
          </Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={20} color={colors.primaryBrand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Album description section */}
        <View style={styles.descSection}>
          <Text style={styles.descText}>
            Celebrating the arrival of Bappa at the {currentTenantName}. A week of devotion, cultural performances, and community feasts.
          </Text>
        </View>

        {/* Media Grid */}
        {isLoading ? (
          <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginTop: 40 }} />
        ) : mediaItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="image-off-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>No photos or videos added to this album yet.</Text>
            <TouchableOpacity
              style={styles.addMediaPlaceholderBtn}
              onPress={() => router.push({ pathname: "/upload-media", params: { albumId: idStr } })}
            >
              <Text style={styles.addMediaPlaceholderText}>Upload the First Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {mediaItems.map((item) => {
              const isVideo = item.media_type === "video";
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.mediaCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: "/media-viewer",
                      params: {
                        mediaUrl: item.media_url,
                        mediaType: item.media_type,
                        caption: item.caption || "",
                        uploadedByName: item.uploaded_by_name || "",
                        uploadedByAvatar: item.uploaded_by_avatar || "",
                        createdAt: item.created_at || "",
                      },
                    })
                  }
                >
                  <Image source={{ uri: item.media_url }} style={styles.mediaImage} />
                  
                  {isVideo && (
                    <View style={styles.playOverlay}>
                      <View style={styles.playCircle}>
                        <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" />
                      </View>
                    </View>
                  )}

                  {item.caption ? (
                    <View style={styles.captionOverlay}>
                      <Text style={styles.captionText} numberOfLines={1}>
                        {item.caption}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB to add media */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/upload-media", params: { albumId: idStr } })}
      >
        <MaterialCommunityIcons name="camera-plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  headerSub: {
    fontSize: 10,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  descSection: {
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  descText: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mediaCard: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 149, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  captionOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  captionText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 10,
    textAlign: "center",
  },
  addMediaPlaceholderBtn: {
    marginTop: 16,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addMediaPlaceholderText: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
    fontSize: 12,
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

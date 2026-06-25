import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal, Dimensions, ActivityIndicator, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFetchAlbumMedia, useFetchAlbums } from "@utsav/api-client";

const { width } = Dimensions.get("window");

export default function AlbumMasonryScreen() {
  const { albumId, albumName } = useLocalSearchParams<{ albumId: string; albumName: string }>();
  
  // Fetch albums to find cover details or first album if albumId is not passed
  const { data: albums } = useFetchAlbums();
  const selectedAlbumId = albumId || albums?.[0]?.id || "";
  const selectedAlbumName = albumName || albums?.[0]?.name || "Ganesh Chaturthi 2024 — Day 1";

  const { data: mediaItems = [], isLoading } = useFetchAlbumMedia(selectedAlbumId);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  // Robust mock data matching the design spec heights
  const mockMedia = [
    {
      id: "m1",
      media_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD1ogZ8dpPviVCJSCXPZqGrjvPwOmX-JzVUICm_85F1RJnloX6t0Fl1TgJ3xlmuMvzCUkxK3DSGd7J7nGjZLkSYZeonFrmpGNHbbTaOV_ErDS2D8t718s6vSVwGltY9oqrEBZ8TZ1jXLaelasK5pD_o55JOXYv6GSnGSH70fbQe8o8XE0Ozdg4EDzM4bBrg0KUx1hnzmicA13gLu4Vx45JrOO0ulH2RXg9FxOo-hZO2I6EF-sPsDYWB",
      caption: "Mandal President welcoming devotees at the main entry gate",
      height: 240,
    },
    {
      id: "m2",
      media_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBC6SSfuGQzeFpA8m0gkAS26xBhoogWI7IOU_OckpzNdUE7J8itUIVTyZoWqel5_1O9QJ8HPEnphmpIU7_hrcktgyS1fn5JWaG9LuXUPwjJaidMemuxRDn5R69A6jZhJ3VM3E6rTjtjrZk-2SSzR84-zcATonL95MPcWoPCm0hyfCKWieeYCLyp0jUig6r4kO376g8fzz9rjqR2weD5d_b3d6Qld7lUiqRV7MDtwqK0SC8Wb8bqWiyp",
      caption: "Preparation of Modak prasad by committee volunteers",
      height: 180,
    },
    {
      id: "m3",
      media_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA2ntcMhEjnPt0iZ0cTv2PzDvZ0PhmfNfZD7jHHtc3Ob8BtK3H4sjuWUl829JWIpelMxVB-yLg2zD3WjDjzOmGxAXnCL2M3cG-RpfGZJOIbUU0Nk0VbeerzAviG21NOhH7m4WUkaxMXL7RnepGbIKpcpMqo3M7aFsHKxZ9gVkAt3avbfGx-VKEu1kC69bZWslabds2-voFEsItZVsqbK_Z77cLpp3Zc3cDrokCXumarLmH8rksK-mKD",
      caption: "Stunning evening Aarti decoration under illuminated dome",
      height: 200,
    },
    {
      id: "m4",
      media_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAdCd6QTk3aUMaOkiauSVozLiu9kiiR2xPOOh9bfQyNK3WrD-SKObQq507s1CnM69i5G0VPhjHD48SLg7C5SRzMH9VXaczEQRFAADQ9QEi0YNPy6qN1MahwI2DnJv1FhTPslIc4HaEoBFwENV71Eh76lr0IaBe8lqQwa85UasVXG6uPPM7c2C0qdo8k1ohni3-oyCcSAiQ7GnKep4U82n25cTXxhpmjJ50PCN0vQ5aPwmlmAwpsmOxr",
      caption: "Digital map layout for crowd route mapping",
      height: 220,
    },
    {
      id: "m5",
      media_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCRKVU9f8ei0nL_xsoNwV4QoQnbBLYZESTyTfylAGjxRiiVXkA4VYtoTLeFv1YI2QcDlxqYqztiJzac6LsFVtcvrZmmWBKTWpjpVBjjKCfrcs4aJUXlgfoeAH3e5h35WgouxZn5KxilsHB9phfnzhbNr2Q1zF3dAmV7DXi-FEde4EWZGWiBifQPWNoKpU7myyHFoG0HdwkBPYqJLdywLdK-ieTkfr4MzWTVvZhWto1iBjNJkl4AzYwd",
      caption: "Volunteers posing together at the main desk area",
      height: 190,
    },
    {
      id: "m6",
      media_url:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDqPNrh8lY9nNEQPi_Xzd8O-uUgyfVzbmyIhNeuySJ7cyd67cfC5T_KsVAD1oNxHl-PxMA5NgH9_e3wtBsO-0P0stHTaepN44LU8dkcOkgnEUeDkgD7JWAUKjFUJZ-ekkWMcjSxhml3Q25gCTBEruqr4khzet0PNV9HtFuwKE4HXkVgFDv3SUKBSywb4g2xtRKnEafslVuFa0HYnDNjvTX7EyLFQ480uYu69kWSFywZLLJ9IkQ4Uta1",
      caption: "Evening cultural performance and devotional music session",
      height: 250,
    },
  ];

  const displayMedia = mediaItems.length
    ? mediaItems.map((item, idx) => ({
        id: item.id,
        media_url: item.media_url,
        caption: item.caption || `Gallery photo #${idx + 1}`,
        height: idx % 3 === 0 ? 240 : idx % 3 === 1 ? 180 : 210, // assign dynamic heights for real masonry grid effect
      }))
    : mockMedia;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out the beautiful album gallery "${selectedAlbumName}" on Utsav App!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Group into 2 columns for masonry layout
  const col1: typeof displayMedia = [];
  const col2: typeof displayMedia = [];
  displayMedia.forEach((item, idx) => {
    if (idx % 2 === 0) col1.push(item);
    else col2.push(item);
  });

  const openViewer = (index: number) => {
    setSelectedMediaIndex(index);
    setViewerVisible(true);
  };

  const handleNextMedia = () => {
    if (selectedMediaIndex < displayMedia.length - 1) {
      setSelectedMediaIndex(selectedMediaIndex + 1);
    }
  };

  const handlePrevMedia = () => {
    if (selectedMediaIndex > 0) {
      setSelectedMediaIndex(selectedMediaIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Album Gallery
        </Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant-outline" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Album Metadata Banner */}
        <View style={styles.albumMetaCard}>
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.albumTitle} numberOfLines={1}>
                {selectedAlbumName}
              </Text>
              <View style={styles.albumSubRow}>
                <MaterialCommunityIcons name="calendar" size={14} color={colors.onSurfaceVariant} />
                <Text style={styles.albumDate}>Saturday, Sept 14, 2024</Text>
                <View style={styles.bullet} />
                <Text style={styles.photoCount}>{displayMedia.length} Photos</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadAllBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="download" size={18} color={colors.charcoal} />
              <Text style={styles.downloadText}>Download All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primaryContainer} />
          </View>
        ) : (
          /* Masonry Grid */
          <View style={styles.masonryContainer}>
            <View style={styles.masonryColumn}>
              {col1.map((item) => {
                const globalIndex = displayMedia.findIndex((m) => m.id === item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.masonryItemCard, { height: item.height }]}
                    activeOpacity={0.9}
                    onPress={() => openViewer(globalIndex)}
                  >
                    <Image source={{ uri: item.media_url }} style={styles.masonryImage} />
                    <View style={styles.imageOverlay}>
                      <Text style={styles.overlayCaption} numberOfLines={2}>
                        {item.caption}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.masonryColumn}>
              {col2.map((item) => {
                const globalIndex = displayMedia.findIndex((m) => m.id === item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.masonryItemCard, { height: item.height }]}
                    activeOpacity={0.9}
                    onPress={() => openViewer(globalIndex)}
                  >
                    <Image source={{ uri: item.media_url }} style={styles.masonryImage} />
                    <View style={styles.imageOverlay}>
                      <Text style={styles.overlayCaption} numberOfLines={2}>
                        {item.caption}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Load More Trigger */}
        <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.8}>
          <Text style={styles.loadMoreText}>Load More</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={colors.primaryBrand} />
        </TouchableOpacity>
      </ScrollView>

      {/* Lightbox / Modal Photo Viewer */}
      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={styles.viewerContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.viewerCloseBtn} onPress={() => setViewerVisible(false)}>
            <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Image */}
          <View style={styles.viewerImageWrap}>
            <Image
              source={{ uri: displayMedia[selectedMediaIndex]?.media_url }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          </View>

          {/* Navigation Controls */}
          <View style={styles.viewerNavRow}>
            <TouchableOpacity
              style={[styles.viewerNavBtn, selectedMediaIndex === 0 && styles.disabledNav]}
              onPress={handlePrevMedia}
              disabled={selectedMediaIndex === 0}
            >
              <MaterialCommunityIcons name="chevron-left" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.viewerCounter}>
              <Text style={styles.viewerCounterText}>
                {selectedMediaIndex + 1} / {displayMedia.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.viewerNavBtn,
                selectedMediaIndex === displayMedia.length - 1 && styles.disabledNav,
              ]}
              onPress={handleNextMedia}
              disabled={selectedMediaIndex === displayMedia.length - 1}
            >
              <MaterialCommunityIcons name="chevron-right" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Caption footer card */}
          <View style={styles.viewerFooterCard}>
            <Text style={styles.viewerCaptionText}>
              {displayMedia[selectedMediaIndex]?.caption}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
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
    flex: 1,
    marginLeft: 8,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  albumMetaCard: {
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  albumTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.semibold,
    color: colors.charcoal,
    maxWidth: width * 0.55,
  },
  albumSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  albumDate: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginLeft: 4,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: 6,
  },
  photoCount: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  downloadAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  downloadText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
    marginLeft: 4,
  },
  loaderWrap: {
    paddingVertical: 60,
    alignItems: "center",
  },
  masonryContainer: {
    flexDirection: "row",
    padding: spacing.sm,
    gap: spacing.sm,
  },
  masonryColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  masonryItemCard: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.cream,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  masonryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
    padding: spacing.sm,
    opacity: 0, // Hidden by default, standard visual overlay
  },
  overlayCaption: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: fonts.inter.medium,
  },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    marginRight: 4,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  viewerCloseBtn: {
    alignSelf: "flex-end",
    marginRight: 20,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  viewerImageWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: {
    width: width,
    height: width * 1.3,
  },
  viewerNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  viewerNavBtn: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledNav: {
    opacity: 0.3,
  },
  viewerCounter: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewerCounterText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
  },
  viewerFooterCard: {
    backgroundColor: "rgba(58, 53, 48, 0.8)",
    marginHorizontal: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.2)",
  },
  viewerCaptionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    textAlign: "center",
    lineHeight: 20,
  },
});

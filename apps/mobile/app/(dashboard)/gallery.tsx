import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Modal,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@utsav/stores";
import { useFetchAlbums, useCreateAlbum } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function GalleryHubScreen() {
  const { role: userRole } = useAuthStore();
  const { data: albums = [], isLoading } = useFetchAlbums();
  const createAlbumMutation = useCreateAlbum();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Create Album Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "All",
    "Festivals",
    "Donations",
    "Cultural",
    "Mandal",
  ];

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      Alert.alert("Name Required", "Please enter an album name.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createAlbumMutation.mutateAsync({
        name: newAlbumName.trim(),
        description: newAlbumDesc.trim() || undefined,
        is_public: isPublic,
      });
      Alert.alert("Album Created", `Album "${newAlbumName}" has been created successfully.`);
      // Reset form
      setNewAlbumName("");
      setNewAlbumDesc("");
      setIsPublic(true);
      setIsModalOpen(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create album");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAlbums = albums.filter((album) => {
    const matchesSearch = album.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (album.description && album.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // In demo, we can just do matchesSearch. 
    return matchesSearch;
  });

  const getFallbackCover = (index: number) => {
    const covers = [
      "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=500&auto=format&fit=crop&q=60", // Ganesh
      "https://images.unsplash.com/photo-1609137948924-f7253597c413?w=500&auto=format&fit=crop&q=60", // Sthapana
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60", // Supplies/Charity
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60", // Cultural
    ];
    return covers[index % covers.length];
  };

  const isAdmin = ["owner", "admin"].includes(userRole || "");

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
        <TouchableOpacity style={styles.headerNotifyBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
          <View style={styles.notifyBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Gallery Hub</Text>
          <Text style={styles.introSub}>Relive the moments of celebration and community.</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search albums or events..."
            placeholderTextColor={colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.outline} />
            </TouchableOpacity>
          ) : null}
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
                  {cat === "All" ? "All Moments" : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Loading / Content Grid */}
        {isLoading ? (
          <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.gridContainer}>
            {filteredAlbums.map((album, idx) => (
              <TouchableOpacity
                key={album.id}
                style={styles.albumCard}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/album-grid",
                    params: { albumId: album.id, albumName: album.name },
                  })
                }
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: album.cover_image_url || getFallbackCover(idx) }}
                    style={styles.albumImage}
                  />
                  <View style={styles.overlay} />
                  <View style={styles.photoCountBadge}>
                    <MaterialCommunityIcons name="image-multiple-outline" size={12} color="#FFFFFF" />
                    <Text style={styles.photoCountText}>{album.media_count || 0} Media</Text>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <Text style={styles.albumName}>{album.name}</Text>
                  {album.description ? (
                    <Text style={styles.albumDesc} numberOfLines={1}>{album.description}</Text>
                  ) : null}
                  <View style={styles.albumMeta}>
                    <MaterialCommunityIcons name="calendar-range" size={14} color={colors.outline} />
                    <Text style={styles.albumDate}>
                      {new Date(album.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Create New Album Button Card (Admin Only / Available in Demo) */}
            {isAdmin && (
              <TouchableOpacity
                style={styles.createAlbumCard}
                activeOpacity={0.8}
                onPress={() => setIsModalOpen(true)}
              >
                <View style={styles.plusCircle}>
                  <MaterialCommunityIcons name="folder-plus" size={32} color={colors.primaryBrand} />
                </View>
                <Text style={styles.createAlbumText}>Create New Album</Text>
                <Text style={styles.adminBadge}>ADMIN ONLY</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for Upload */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push("/upload-media")}
      >
        <MaterialCommunityIcons name="upload" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Album Dialog Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Gallery Album</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Album Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Ganesh Chaturthi 2024"
                  placeholderTextColor={colors.outline}
                  value={newAlbumName}
                  onChangeText={setNewAlbumName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Summarize the moments captured in this album..."
                  placeholderTextColor={colors.outline}
                  multiline
                  numberOfLines={3}
                  value={newAlbumDesc}
                  onChangeText={setNewAlbumDesc}
                />
              </View>

              <View style={styles.switchGroup}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Make Publicly Viewable</Text>
                  <Text style={styles.switchSub}>Allow all devotees to view this album in their app</Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateAlbum}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Album</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerNotifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifyBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryBrand,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
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
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  clearBtn: {
    padding: 4,
  },
  chipsScroll: {
    gap: 8,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  gridContainer: {
    flexDirection: "column",
    gap: spacing.md,
  },
  albumCard: {
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
  cardImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  albumImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  photoCountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: fonts.inter.bold,
  },
  cardDetails: {
    padding: 16,
    gap: 6,
  },
  albumName: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  albumDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
  albumMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  albumDate: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  createAlbumCard: {
    height: 180,
    borderWidth: 2,
    borderColor: colors.sandstone,
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  plusCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  createAlbumText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
  },
  adminBadge: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
    opacity: 0.7,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  modalForm: {
    paddingVertical: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
    backgroundColor: colors.pujaWhite,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    paddingBottom: 12,
  },
  switchGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cream,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  switchTitle: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
  },
  switchSub: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: colors.primaryContainer,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
});

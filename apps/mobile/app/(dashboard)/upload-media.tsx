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
  Switch,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useFetchAlbums, useAddAlbumMedia } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function UploadMediaScreen() {
  const params = useLocalSearchParams();
  const initialAlbumId = typeof params.albumId === "string" ? params.albumId : "";

  const { data: albums = [], isLoading: loadingAlbums } = useFetchAlbums();
  const addMediaMutation = useAddAlbumMedia();

  // Form state
  const [selectedAlbumId, setSelectedAlbumId] = useState(initialAlbumId);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [enableWatermark, setEnableWatermark] = useState(false);

  // Selected file mocks
  const [selectedMockFile, setSelectedMockFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mockPhotosList = [
    "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1609137948924-f7253597c413?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60",
  ];

  const handleSelectMockFile = () => {
    // Cycle through mock files or choose random
    const randomUrl = mockPhotosList[Math.floor(Math.random() * mockPhotosList.length)];
    setSelectedMockFile(randomUrl);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    const finalAlbumId = selectedAlbumId || (albums[0] ? albums[0].id : "");
    if (!finalAlbumId) {
      Alert.alert("Album Required", "Please select or create an album first.");
      return;
    }
    if (!selectedMockFile) {
      Alert.alert("File Required", "Please select a photo to upload by tapping the upload area.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate progress ticks
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    try {
      // Call mutation
      await addMediaMutation.mutateAsync({
        albumId: finalAlbumId,
        media_url: selectedMockFile,
        media_type: "image",
        caption: caption.trim() || undefined,
        size_bytes: 1450000,
      });

      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        Alert.alert("Success", "Media uploaded successfully to the album!");
        // Reset states
        setSelectedMockFile(null);
        setCaption("");
        setIsUploading(false);
        setUploadProgress(0);
        router.back();
      }, 300);
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      Alert.alert("Error", err.message || "Failed to upload media");
    }
  };

  const activeAlbum = albums.find((a) => a.id === selectedAlbumId);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Media</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Gallery Management</Text>
          <Text style={styles.introSub}>
            Add high-resolution photos and videos to your Mandal's digital archive.
          </Text>
        </View>

        {/* Dropzone area */}
        <TouchableOpacity
          style={[styles.dropZone, selectedMockFile ? styles.dropZoneWithFile : null]}
          activeOpacity={0.8}
          onPress={handleSelectMockFile}
        >
          {selectedMockFile ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedMockFile }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeFileBtn}
                onPress={() => setSelectedMockFile(null)}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color={colors.kumkumRed} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.dropZoneContent}>
              <View style={styles.uploadIconCircle}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={32} color={colors.primaryBrand} />
              </View>
              <Text style={styles.dropZoneTitle}>Tap to Select Photo</Text>
              <Text style={styles.dropZoneSub}>Supports high-res JPG, PNG, and MP4 (Max 50MB)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form parameters */}
        <View style={styles.card}>
          {/* Destination Album select */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Select Destination Album</Text>
            {loadingAlbums ? (
              <ActivityIndicator size="small" color={colors.primaryBrand} style={{ alignSelf: "flex-start" }} />
            ) : albums.length === 0 ? (
              <Text style={styles.errorText}>No albums exist. Please create one in Gallery Hub first.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.albumChips}>
                {albums.map((album) => {
                  const isSelected = selectedAlbumId === album.id;
                  return (
                    <TouchableOpacity
                      key={album.id}
                      style={[styles.albumChip, isSelected && styles.albumChipActive]}
                      onPress={() => setSelectedAlbumId(album.id)}
                    >
                      <MaterialCommunityIcons
                        name={isSelected ? "folder-open" : "folder-outline"}
                        size={16}
                        color={isSelected ? "#FFFFFF" : colors.primaryBrand}
                      />
                      <Text style={[styles.albumChipText, isSelected && styles.albumChipTextActive]}>
                        {album.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Caption Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Media Caption</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Traditional Aarti ceremony during evening puja"
              placeholderTextColor={colors.outline}
              value={caption}
              onChangeText={setCaption}
            />
          </View>

          {/* Public Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="earth" size={20} color={colors.primaryBrand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Public Visibility</Text>
                <Text style={styles.toggleSub}>Visible to all community members</Text>
              </View>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: colors.sandstone, true: colors.tulsiGreen }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Watermark Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.primaryBrand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Enable Watermark</Text>
                <Text style={styles.toggleSub}>Apply Mandal official branding seal</Text>
              </View>
            </View>
            <Switch
              value={enableWatermark}
              onValueChange={setEnableWatermark}
              trackColor={{ false: colors.sandstone, true: colors.primaryContainer }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Upload Queue details */}
        {selectedMockFile && (
          <View style={styles.queueContainer}>
            <Text style={styles.queueTitle}>Upload Queue (1 File)</Text>
            <View style={styles.queueCard}>
              <MaterialCommunityIcons name="image" size={24} color={colors.outline} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.fileName} numberOfLines={1}>
                  mock_utsav_upload_{activeAlbum?.name || "gallery"}.jpg
                </Text>
                {isUploading && (
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{uploadProgress}%</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Submission Panel */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="rocket-launch-outline" size={20} color="#FFFFFF" />
              <Text style={styles.uploadBtnText}>Upload Media</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          disabled={isUploading}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
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
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 120,
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
  dropZone: {
    borderWidth: 2,
    borderColor: colors.primaryBrand,
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: colors.cream,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  dropZoneWithFile: {
    borderStyle: "solid",
  },
  dropZoneContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  uploadIconCircle: {
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
  dropZoneTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  dropZoneSub: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  previewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeFileBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: spacing.md,
  },
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.kumkumRed,
  },
  albumChips: {
    gap: 8,
    paddingBottom: 4,
  },
  albumChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
  },
  albumChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  albumChipText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  albumChipTextActive: {
    color: "#FFFFFF",
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.pujaWhite,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  toggleTitle: {
    fontSize: 13,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  toggleSub: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  queueContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  queueTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  queueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fileName: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.sandstone,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primaryBrand,
  },
  progressText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 248, 244, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    padding: spacing.md,
    flexDirection: "row",
    gap: 12,
  },
  uploadBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadBtnDisabled: {
    opacity: 0.7,
  },
  uploadBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.inter.bold,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
});

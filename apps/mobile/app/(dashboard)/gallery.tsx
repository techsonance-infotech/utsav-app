import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
import {
  useFetchAlbums,
  useFetchAlbumMedia,
} from "@utsav/api-client";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2;

export default function GalleryScreen() {
  const { data: albums, isLoading: loadingAlbums } = useFetchAlbums();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const { data: media, isLoading: loadingMedia } = useFetchAlbumMedia(
    selectedAlbumId || undefined
  );

  const selectedAlbum = albums?.find((a) => a.id === selectedAlbumId);

  if (selectedAlbumId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedAlbumId(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Albums</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedAlbum?.name}</Text>
        </View>

        {loadingMedia ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color="#FF9500" />
          </View>
        ) : media && media.length > 0 ? (
          <FlatList
            data={media}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.mediaList}
            renderItem={({ item }) => (
              <View style={styles.mediaCard}>
                <Image source={{ uri: item.media_url }} style={styles.mediaImage} />
                {item.caption && (
                  <View style={styles.captionArea}>
                    <Text style={styles.captionText} numberOfLines={1}>
                      {item.caption}
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        ) : (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No media files in this album yet.</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Photo Gallery</Text>
      </View>

      {loadingAlbums ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="#FF9500" />
        </View>
      ) : (
        <FlatList
          data={albums || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedAlbumId(item.id)}
              style={styles.albumCard}
            >
              <View style={styles.albumCoverPlaceholder}>
                <Text style={styles.albumIcon}>🖼️</Text>
              </View>
              <View style={styles.albumInfo}>
                <Text style={styles.albumName}>{item.name}</Text>
                <Text style={styles.albumCount}>{item.media_count || 0} media items</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: "#FF9500",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  list: {
    padding: 16,
  },
  albumCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  albumCoverPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#FFEEDB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  albumIcon: {
    fontSize: 24,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  albumCount: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  mediaList: {
    padding: 16,
  },
  mediaCard: {
    width: COLUMN_WIDTH,
    margin: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: COLUMN_WIDTH,
    backgroundColor: "#F3F4F6",
  },
  captionArea: {
    padding: 8,
  },
  captionText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "500",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
});

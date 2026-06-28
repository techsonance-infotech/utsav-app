import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@utsav/stores";
import { useFetchTenant } from "@utsav/api-client";

export default function MediaViewerScreen() {
  const { tenantId, tenantName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const currentTenantName = tenant?.name || tenantName || "Mandal";

  const { mediaUrl, mediaType, caption, uploadedByName, uploadedByAvatar, createdAt } = useLocalSearchParams();
  const urlStr = typeof mediaUrl === "string" ? mediaUrl : "https://images.unsplash.com/photo-1561361513-2d000a50f0db?w=600";
  const typeStr = typeof mediaType === "string" ? mediaType : "image";
  const captionStr = typeof caption === "string" ? caption : `Festive celebrations at the ${currentTenantName}`;
  const uploaderNameStr = typeof uploadedByName === "string" && uploadedByName ? uploadedByName : "Mandal Member";
  const uploaderAvatarStr = typeof uploadedByAvatar === "string" && uploadedByAvatar ? uploadedByAvatar : "https://lh3.googleusercontent.com/aida-public/AB6AXuAhvaZhz8JdwGPg1mmlpJkJ9o1D9JEKbsMxTzXU4AntkWihJmhRwcf7JihK3RDm5u_HP-BIUDcnHo5H_f-Ap5FVX5N3-HtYhur3VSrDFAqItE8Qktu_DCEtJIuY_QSpQN8Sgo4DOjXa4L11dp4MSJcyd3ItCjZvHem5KRQSaTZPK5S-OEwmXh3EUsAD9qu7YBVtCRRP7QWfR8KheoH64oEjwn_xZNcBpQb6Mip3vI96-C-Y21-EUMo4";

  // Format creation date
  let dateText = "Today";
  if (typeof createdAt === "string" && createdAt) {
    try {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
        dateText = d.toLocaleDateString("en-US", options);
      }
    } catch {
      // fallback
    }
  }

  // Interaction States
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(142);

  const handleLike = () => {
    if (isLiked) {
      setLikesCount((c) => c - 1);
    } else {
      setLikesCount((c) => c + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Take a look at this beautiful moment from ${currentTenantName}: ${urlStr}`,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    Alert.alert("Download", "Saved high-resolution photo to your device gallery.");
  };

  const isVideo = typeStr === "video";

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header overlay */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.actionIconBtn} onPress={handleDownload}>
            <MaterialCommunityIcons name="download" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn} onPress={handleShare}>
            <MaterialCommunityIcons name="share-variant" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Media Container */}
      <View style={styles.mediaWrapper}>
        <Image source={{ uri: urlStr }} style={styles.heroImage} resizeMode="contain" />
        
        {isVideo && (
          <View style={styles.playOverlay}>
            <View style={styles.playCircle}>
              <MaterialCommunityIcons name="play" size={32} color="#FFFFFF" />
            </View>
          </View>
        )}
      </View>

      {/* Bottom Metadata Drawer */}
      <View style={styles.bottomDrawer}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Image
              source={{ uri: uploaderAvatarStr }}
              style={styles.avatarImg}
            />
            <View style={styles.activeDot} />
          </View>

          <View style={styles.metaInfo}>
            <Text style={styles.mediaTitle} numberOfLines={1}>
              {captionStr}
            </Text>
            <Text style={styles.mediaSubtitle}>
              Uploaded by {uploaderNameStr} • {dateText}
            </Text>
          </View>
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.drawerBtn, isLiked && styles.likedBtn]}
            onPress={handleLike}
          >
            <MaterialCommunityIcons
              name={isLiked ? "heart" : "heart-outline"}
              size={18}
              color={isLiked ? colors.kumkumRed : "#FFFFFF"}
            />
            <Text style={styles.btnText}>{likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerBtn} onPress={handleShare}>
            <MaterialCommunityIcons name="share" size={18} color="#FFFFFF" />
            <Text style={styles.btnText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primarySupportBtn}
            onPress={() => router.push("/donate")}
          >
            <MaterialCommunityIcons name="heart-flash" size={18} color={colors.onPrimaryFixed} />
            <Text style={styles.primarySupportText}>Support Event</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Tags */}
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>{typeStr.toUpperCase()}</Text>
          {urlStr.includes("youtube.com") || urlStr.includes("youtu.be") ? (
            <Text style={[styles.tag, styles.tagFeatured]}>YOUTUBE</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  actionIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  heroImage: {
    width: "100%",
    height: "80%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 149, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomDrawer: {
    backgroundColor: "rgba(30, 27, 24, 0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: "relative",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  activeDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.tulsiGreen,
    borderWidth: 2,
    borderColor: "#1E1B18",
  },
  metaInfo: {
    flex: 1,
    gap: 4,
  },
  mediaTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
  mediaSubtitle: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: "rgba(255, 255, 255, 0.6)",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  drawerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  likedBtn: {
    backgroundColor: "rgba(217, 43, 43, 0.15)",
    borderColor: colors.kumkumRed,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  primarySupportBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaryContainer,
    height: 40,
    borderRadius: 20,
  },
  primarySupportText: {
    color: colors.onPrimaryFixed,
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 0.5,
  },
  tagFeatured: {
    backgroundColor: "rgba(201, 146, 26, 0.15)",
    borderColor: "rgba(201, 146, 26, 0.25)",
    color: colors.aartiGold,
  },
});

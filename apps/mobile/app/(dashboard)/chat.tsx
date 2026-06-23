import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useChatChannels } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ChatScreen() {
  const { data: channels = [], isLoading } = useChatChannels();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = channels.filter((ch) =>
    ch.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChannelIcon = (name: string) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("announcement")) return "campaign";
    if (n.includes("volunteer")) return "account-group";
    if (n.includes("decoration")) return "palette";
    if (n.includes("puja")) return "hinduism";
    return "chat-processing";
  };

  const getChannelIconBg = (name: string) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("announcement")) return "rgba(255, 149, 0, 0.15)";
    if (n.includes("volunteer")) return "rgba(34, 197, 94, 0.15)";
    if (n.includes("decoration")) return "rgba(234, 179, 8, 0.15)";
    return "rgba(140, 80, 0, 0.1)";
  };

  const getChannelIconColor = (name: string) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("announcement")) return colors.primaryBrand;
    if (n.includes("volunteer")) return colors.tulsiGreen;
    if (n.includes("decoration")) return colors.haldiYellow;
    return colors.primaryBrand;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLogo}>UTSAV</Text>
        </View>
        <TouchableOpacity style={styles.headerNotifyBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.onSurfaceVariant} />
          <View style={styles.notifyBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>Messages</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search channels..."
            placeholderTextColor={colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* List content */}
        {isLoading ? (
          <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginTop: 40 }} />
        ) : filteredChannels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="forum-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>No channels found.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredChannels.map((item) => {
              const iconName = getChannelIcon(item.name || "");
              const iconBg = getChannelIconBg(item.name || "");
              const iconColor = getChannelIconColor(item.name || "");
              
              // Mock unread badges for visual excellence
              const hasUnread = item.name?.toLowerCase().includes("announcement") || item.name?.toLowerCase().includes("volunteer");
              const unreadCount = item.name?.toLowerCase().includes("announcement") ? 2 : 5;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.channelRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/chat-room",
                      params: { channelId: item.id, channelName: item.name },
                    })
                  }
                >
                  <View style={[styles.avatarFrame, { backgroundColor: iconBg }]}>
                    <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
                  </View>

                  <View style={styles.channelInfo}>
                    <View style={styles.infoTop}>
                      <Text style={styles.channelName} numberOfLines={1}>
                        {item.name || "Group Chat"}
                      </Text>
                      <Text style={styles.timeText}>10:42 AM</Text>
                    </View>

                    <View style={styles.infoBottom}>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message_text || "No messages yet"}
                      </Text>
                      {hasUnread && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="message-plus" size={24} color="#FFFFFF" />
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1.5,
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
    backgroundColor: colors.kumkumRed,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 95,
  },
  titleContainer: {
    paddingHorizontal: spacing.md,
    marginTop: 20,
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarFrame: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  channelInfo: {
    flex: 1,
    justifyContent: "center",
  },
  infoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  channelName: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  infoBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.kumkumRed,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: fonts.inter.bold,
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
    borderRadius: 16,
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

import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Image, Modal, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useChatChannels, useFetchMembers, useCreateChatChannel, useFetchMyProfile, useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ChatScreen() {
  const { tenantId, userId, userFullName } = useAuthStore();
  const { data: myProfile } = useFetchMyProfile();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: channels = [], isLoading, refetch } = useChatChannels();
  const { data: members = [], isLoading: loadingMembers } = useFetchMembers({ status: "active" });
  const createChannelMutation = useCreateChatChannel();

  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  // Construct header info
  const profileName = myProfile?.full_name || userFullName || "User";
  const initials = profileName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarUrl = myProfile?.avatar_url || null;

  // Resolve channel details (names and avatars for DM channels)
  const getChannelDetails = (item: any) => {
    if (item.type === "direct" && item.members) {
      const otherMember = item.members.find((m: any) => m.user_id !== userId);
      if (otherMember) {
        return {
          name: otherMember.full_name,
          avatarUrl: otherMember.avatar_url,
          isGroup: false,
        };
      }
    }
    return {
      name: item.name || "Group Chat",
      avatarUrl: null,
      isGroup: true,
    };
  };

  // Filter channels
  const filteredChannels = channels.filter((ch) => {
    const details = getChannelDetails(ch);
    const matchesName = details.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSnippet = ch.last_message_text?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesName || matchesSnippet;
  });

  // Filter members list for modal
  const selectableMembers = members.filter((m) => m.user_id !== userId);
  const filteredMembers = selectableMembers.filter((m) =>
    m.full_name?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const getChannelIcon = (name: string, isGroup: boolean) => {
    if (!isGroup) return "chat-processing";
    const n = name?.toLowerCase() || "";
    if (n.includes("announcement")) return "campaign";
    if (n.includes("volunteer")) return "account-group";
    if (n.includes("decoration")) return "palette";
    if (n.includes("puja")) return "hinduism";
    return "chat-processing";
  };

  const getChannelIconBg = (name: string, isGroup: boolean) => {
    if (!isGroup) return "rgba(140, 80, 0, 0.08)";
    const n = name?.toLowerCase() || "";
    if (n.includes("announcement")) return "rgba(255, 149, 0, 0.12)";
    if (n.includes("volunteer")) return "rgba(34, 197, 94, 0.12)";
    if (n.includes("decoration")) return "rgba(234, 179, 8, 0.12)";
    return "rgba(140, 80, 0, 0.08)";
  };

  const getChannelIconColor = (name: string, isGroup: boolean) => {
    if (!isGroup) return colors.primaryBrand;
    const n = name?.toLowerCase() || "";
    if (n.includes("announcement")) return colors.primaryBrand;
    if (n.includes("volunteer")) return colors.tulsiGreen;
    if (n.includes("decoration")) return colors.haldiYellow;
    return colors.primaryBrand;
  };

  // Toggle member selection in modal
  const toggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  // Create chat channel submit
  const handleCreateChat = async () => {
    if (selectedMembers.length === 0) {
      Alert.alert("Error", "Please select at least one member to start a chat.");
      return;
    }
    const type = selectedMembers.length === 1 ? "direct" : "group";
    if (type === "group" && !groupName.trim()) {
      Alert.alert("Error", "Please enter a group name.");
      return;
    }

    try {
      const newChan = await createChannelMutation.mutateAsync({
        type,
        name: type === "group" ? groupName.trim() : undefined,
        member_ids: [userId!, ...selectedMembers],
      });

      setModalVisible(false);
      setSelectedMembers([]);
      setGroupName("");
      setMemberSearch("");

      // Find dynamic name
      let finalName = newChan.name || "Group Chat";
      if (type === "direct") {
        const otherId = selectedMembers[0];
        const otherMem = selectableMembers.find((m) => m.user_id === otherId);
        finalName = otherMem?.full_name || "Direct Message";
      }

      router.push({
        pathname: "/chat-room",
        params: { channelId: newChan.id, channelName: finalName },
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create chat channel.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Unified Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.logoAvatarWrapper}>
            <Image
              style={styles.logoAvatar}
              source={require("../../assets/image-only.png")}
            />
          </View>
          <Text style={styles.logoText}>UTSAV</Text>
        </View>
        <View style={styles.profileAvatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.headerAvatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
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
            placeholder="Search channels or messages..."
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
              const details = getChannelDetails(item);
              const iconName = getChannelIcon(details.name, details.isGroup);
              const iconBg = getChannelIconBg(details.name, details.isGroup);
              const iconColor = getChannelIconColor(details.name, details.isGroup);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.channelRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/chat-room",
                      params: { channelId: item.id, channelName: details.name },
                    })
                  }
                >
                  <View style={[styles.avatarFrame, { backgroundColor: iconBg }]}>
                    {details.avatarUrl ? (
                      <Image source={{ uri: details.avatarUrl }} style={styles.channelAvatarImage} />
                    ) : (
                      <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
                    )}
                  </View>

                  <View style={styles.channelInfo}>
                    <View style={styles.infoTop}>
                      <Text style={styles.channelName} numberOfLines={1}>
                        {details.name}
                      </Text>
                      {item.last_message_at && (
                        <Text style={styles.timeText}>
                          {new Date(item.last_message_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      )}
                    </View>

                    <View style={styles.infoBottom}>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message_text || "No messages yet"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="message-plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* New Chat Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Conversation</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSelectedMembers([]); setGroupName(""); }}>
                <MaterialCommunityIcons name="close" size={24} color={colors.charcoal} />
              </TouchableOpacity>
            </View>

            {/* Member Search */}
            <View style={styles.modalSearchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.outline} style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search mandal members..."
                placeholderTextColor={colors.outline}
                value={memberSearch}
                onChangeText={setMemberSearch}
              />
            </View>

            {/* Group Name input (visible only when multiple members selected) */}
            {selectedMembers.length > 1 && (
              <View style={styles.groupNameContainer}>
                <Text style={styles.groupNameLabel}>Group Chat Name</Text>
                <TextInput
                  style={styles.groupNameInput}
                  placeholder="e.g. Puja Decoration Team"
                  placeholderTextColor={colors.outline}
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>
            )}

            {/* Members List */}
            {loadingMembers ? (
              <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginVertical: 40 }} />
            ) : filteredMembers.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <MaterialCommunityIcons name="account-off-outline" size={40} color={colors.outlineVariant} />
                <Text style={styles.modalEmptyText}>No members found</Text>
              </View>
            ) : (
              <FlatList
                data={filteredMembers}
                keyExtractor={(item) => item.id}
                style={styles.membersList}
                renderItem={({ item }) => {
                  const isSelected = selectedMembers.includes(item.user_id);
                  const memInitials = item.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "M";

                  return (
                    <TouchableOpacity
                      style={styles.memberRow}
                      activeOpacity={0.7}
                      onPress={() => toggleMember(item.user_id)}
                    >
                      <View style={styles.memberAvatarWrap}>
                        {item.avatar_url ? (
                          <Image source={{ uri: item.avatar_url }} style={styles.memberAvatarImage} />
                        ) : (
                          <View style={styles.memberInitialsFrame}>
                            <Text style={styles.memberInitialsText}>{memInitials}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{item.full_name}</Text>
                        <Text style={styles.memberRole}>{item.role}</Text>
                      </View>
                      <MaterialCommunityIcons
                        name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                        size={24}
                        color={isSelected ? colors.primaryContainer : colors.outlineVariant}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  selectedMembers.length === 0 && styles.createBtnDisabled,
                ]}
                disabled={selectedMembers.length === 0 || createChannelMutation.isPending}
                onPress={handleCreateChat}
              >
                {createChannelMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.createBtnText}>
                    {selectedMembers.length > 1 ? "Create Group Chat" : "Start Direct Chat"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
  },
  appBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.primaryBrand,
    backgroundColor: colors.cream,
  },
  logoAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoText: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.sandstone,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
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
    overflow: "hidden",
  },
  channelAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    marginVertical: spacing.md,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  groupNameContainer: {
    marginBottom: spacing.md,
    gap: 6,
  },
  groupNameLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  groupNameInput: {
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  membersList: {
    flex: 1,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
    gap: 12,
  },
  memberAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  memberAvatarImage: {
    width: "100%",
    height: "100%",
  },
  memberInitialsFrame: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  memberInitialsText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.charcoal,
  },
  memberRole: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    textTransform: "capitalize",
    marginTop: 2,
  },
  modalEmptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  modalEmptyText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  modalActions: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
  },
  createBtn: {
    height: 48,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnDisabled: {
    backgroundColor: colors.outlineVariant,
  },
  createBtnText: {
    fontSize: 15,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
});

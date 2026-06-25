import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useChatMessages, useSendMessage } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ChatRoomScreen() {
  const { channelId, channelName } = useLocalSearchParams();
  const chanIdStr = typeof channelId === "string" ? channelId : "";
  const nameStr = typeof channelName === "string" ? channelName : "Group Chat";

  const { userId } = useAuthStore();
  const { data: messagesData, isLoading, refetch } = useChatMessages(chanIdStr || undefined);
  const sendMessageMutation = useSendMessage();

  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const messages = messagesData?.messages || [];

  const handleSend = () => {
    if (!chanIdStr || !inputText.trim()) return;
    sendMessageMutation.mutate({
      channelId: chanIdStr,
      text: inputText.trim(),
    });
    setInputText("");
    // Re-scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {nameStr}
              </Text>
              <Text style={styles.headerSub}>Active now</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.actionBtn}>
              <MaterialCommunityIcons name="phone" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <MaterialCommunityIcons name="video" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Scroll Area */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primaryContainer} size="large" />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((item, idx) => {
              const isSelf = item.sender_id === userId;
              
              return (
                <View
                  key={item.id || idx}
                  style={[
                    styles.messageWrapper,
                    isSelf ? styles.wrapperSelf : styles.wrapperOther,
                  ]}
                >
                  {!isSelf && (
                    <Image
                      source={{
                        uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVm8mGX1o_66QQ0TzJkL-JcjJ8BURxWYH1fS2eaADOF1War6HJ06FH9k7e5bMcYrbzPoedgYM_Jmz9I6v5uvayyklGETyQHTmJJ_voLAGFBhrUMH-Ko0mM1UtU0GXbjjn82W4II3QR9x9eiDkt5GU66Q-jxgp6DdJy5l8zJ68wEwdDav2_ySOnqWN3SA1-B9el2FV3Q1fP2sLnCPjfWV6Rrr3ZUeHG_GlbS2WZA9k7gQx-VdU0Sz3F",
                      }}
                      style={styles.senderAvatar}
                    />
                  )}

                  <View style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}>
                    {!isSelf && <Text style={styles.senderName}>{item.sender_name}</Text>}
                    <Text style={[styles.messageText, isSelf ? styles.textSelf : styles.textOther]}>
                      {item.message_text}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Input Dock Row */}
        <View style={styles.inputDock}>
          <TouchableOpacity style={styles.dockAddBtn}>
            <MaterialCommunityIcons name="plus" size={22} color={colors.primaryBrand} />
          </TouchableOpacity>

          <TextInput
            style={styles.chatInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.outline}
            value={inputText}
            onChangeText={setInputText}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  headerSub: {
    fontSize: 10,
    fontFamily: fonts.inter.medium,
    color: colors.tulsiGreen,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    padding: spacing.md,
    gap: 12,
  },
  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "80%",
  },
  wrapperSelf: {
    alignSelf: "flex-end",
  },
  wrapperOther: {
    alignSelf: "flex-start",
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleSelf: {
    backgroundColor: colors.primaryContainer,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  senderName: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    lineHeight: 18,
  },
  textSelf: {
    color: "#FFFFFF",
  },
  textOther: {
    color: colors.charcoal,
  },
  inputDock: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    gap: 10,
  },
  dockAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 13,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
});

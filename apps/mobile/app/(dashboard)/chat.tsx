import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import {
  useChatChannels,
  useChatMessages,
  useSendMessage,
} from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

export default function ChatScreen() {
  const { userId } = useAuthStore();
  const { data: channels, isLoading: loadingChannels } = useChatChannels();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const { data: messagesData, isLoading: loadingMessages } = useChatMessages(
    activeChannelId || undefined
  );
  const sendMessageMutation = useSendMessage();
  const [messageText, setMessageText] = useState("");

  const handleSend = () => {
    if (!activeChannelId || !messageText.trim()) return;
    sendMessageMutation.mutate({
      channelId: activeChannelId,
      text: messageText,
    });
    setMessageText("");
  };

  const activeChannel = channels?.find((c) => c.id === activeChannelId);

  if (activeChannelId) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setActiveChannelId(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{activeChannel?.name || "Group Chat"}</Text>
          </View>

          {/* Messages */}
          {loadingMessages ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color="#FF9500" />
            </View>
          ) : (
            <FlatList
              data={messagesData?.messages || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              renderItem={({ item }) => {
                const isSelf = item.sender_id === userId;
                return (
                  <View
                    style={[
                      styles.messageRow,
                      isSelf ? styles.messageRowSelf : styles.messageRowOther,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        isSelf ? styles.bubbleSelf : styles.bubbleOther,
                      ]}
                    >
                      <Text style={styles.senderName}>{item.sender_name}</Text>
                      <Text style={[styles.messageText, isSelf && styles.textSelf]}>
                        {item.message_text}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {/* Input */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type message..."
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversations</Text>
      </View>

      {loadingChannels ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="#FF9500" />
        </View>
      ) : (
        <FlatList
          data={channels || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveChannelId(item.id)}
              style={styles.channelRow}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👥</Text>
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>{item.name || "Group Chat"}</Text>
                <Text style={styles.channelLastMsg} numberOfLines={1}>
                  {item.last_message_text || "No messages yet"}
                </Text>
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
  keyboardContainer: {
    flex: 1,
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
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  channelRow: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFEEDB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  channelLastMsg: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  messageRowSelf: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },
  bubbleSelf: {
    backgroundColor: "#FF9500",
  },
  bubbleOther: {
    backgroundColor: "#F3F4F6",
  },
  senderName: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "semibold",
  },
  messageText: {
    fontSize: 14,
    color: "#111827",
  },
  textSelf: {
    color: "#FFFFFF",
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});

"use client";

import React, { useState } from "react";
import {
  useChatChannels,
  useChatMessages,
  useSendMessage,
  useCreateChatChannel,
} from "@utsav/api-client";
import { ChannelListItem, ChatBubble, MessageInput } from "@utsav/ui";
import { useAuthStore } from "@utsav/stores";

export default function ChatDashboardPage() {
  const { userId } = useAuthStore();
  const { data: channels, isLoading: loadingChannels } = useChatChannels();
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>();

  // Fetch messages for active channel
  const { data: messagesData, isLoading: loadingMessages } = useChatMessages(activeChannelId);
  const sendMessageMutation = useSendMessage();
  const createChannelMutation = useCreateChatChannel();

  const [newChannelName, setNewChannelName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeChannel = channels?.find((c) => c.id === activeChannelId);

  const handleSend = (text: string) => {
    if (!activeChannelId) return;
    sendMessageMutation.mutate({
      channelId: activeChannelId,
      text,
    });
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    createChannelMutation.mutate(
      {
        name: newChannelName,
        type: "group",
        member_ids: [],
      },
      {
        onSuccess: (newChan) => {
          setActiveChannelId(newChan.id);
          setNewChannelName("");
          setShowCreateModal(false);
        },
      }
    );
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
      {/* Sidebar Channels List */}
      <div className="w-80 border-r border-gray-100 bg-white flex flex-col justify-between">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900">Conversations</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors text-xs font-bold"
          >
            ＋ New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChannels ? (
            <p className="text-center text-xs text-gray-400 py-6">Loading channels...</p>
          ) : channels && channels.length > 0 ? (
            channels.map((chan) => (
              <ChannelListItem
                key={chan.id}
                name={chan.name || `Chat #${chan.id.substring(0, 4)}`}
                type={chan.type}
                lastMessageText={chan.last_message_text}
                lastMessageAt={chan.last_message_at}
                isActive={chan.id === activeChannelId}
                onClick={() => setActiveChannelId(chan.id)}
              />
            ))
          ) : (
            <p className="text-center text-xs text-gray-400 py-6">No chat channels created yet.</p>
          )}
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChannelId ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700">
                {activeChannel?.type === "direct" ? "👤" : "👥"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {activeChannel?.name || "Direct Message"}
                </h3>
                <span className="text-xxs text-green-500 font-medium">● Realtime Active</span>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
              {loadingMessages ? (
                <p className="text-center text-xs text-gray-400 py-6">Loading messages...</p>
              ) : messagesData?.messages && messagesData.messages.length > 0 ? (
                messagesData.messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    text={msg.message_text}
                    senderName={msg.sender_name}
                    senderAvatarUrl={msg.sender_avatar_url}
                    isSelf={msg.sender_id === userId}
                    mediaUrl={msg.media_url}
                    mediaType={msg.media_type}
                    timestamp={msg.created_at}
                  />
                ))
              ) : (
                <p className="text-center text-xs text-gray-400 py-12">No messages in this chat. Say hello!</p>
              )}
            </div>

            {/* Input field */}
            <MessageInput onSend={handleSend} placeholder="Type a message here..." />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/20">
            <span className="text-4xl mb-3">💬</span>
            <h4 className="text-base font-bold text-gray-900">No Chat Selected</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Choose an existing channel from the sidebar list or create a new discussion group to get started.
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-xs">
          <form
            onSubmit={handleCreateChannel}
            className="bg-white rounded-2xl p-6 w-96 border border-gray-100 shadow-xl flex flex-col gap-4"
          >
            <h3 className="text-base font-bold text-gray-900">Create Chat Group</h3>
            <div>
              <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g. Committee Committee"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newChannelName.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  useChatChannels,
  useChatMessages,
  useSendMessage,
  useCreateChatChannel,
} from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import {
  Search,
  PlusCircle,
  Campaign,
  Groups,
  VolunteerActivism,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCheck,
  ShieldAlert,
  CloudLightning,
  FileText,
  Settings,
  X,
  RefreshCw,
} from "lucide-react";

export default function ChatDashboardPage() {
  const { userId } = useAuthStore();
  const { data: channels, isLoading: loadingChannels } = useChatChannels();
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: messagesData, isLoading: loadingMessages } = useChatMessages(activeChannelId);
  const sendMessageMutation = useSendMessage();
  const createChannelMutation = useCreateChatChannel();

  const [newChannelName, setNewChannelName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inputText, setInputText] = useState("");

  const activeChannel = channels?.find((c) => c.id === activeChannelId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChannelId || !inputText.trim()) return;
    sendMessageMutation.mutate({
      channelId: activeChannelId,
      text: inputText,
    });
    setInputText("");
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

  // Helper to map channel icons based on name
  const getChannelIcon = (name: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("announcement")) {
      return <Campaign className="w-5 h-5 shrink-0" />;
    }
    if (n.includes("volunteer")) {
      return <VolunteerActivism className="w-5 h-5 shrink-0" />;
    }
    return <Groups className="w-5 h-5 shrink-0" />;
  };

  // Filter channels based on search query
  const filteredChannels = (channels || []).filter((c: any) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-margin-desktop w-full font-sans text-on-surface">
      <div className="flex h-[calc(100vh-180px)] bg-puja-white rounded-2xl overflow-hidden border border-sandstone shadow-sm font-sans text-on-surface">
      {/* Sidebar Channels Drawer (Left) */}
      <aside className="w-80 border-r border-sandstone bg-cream/40 flex flex-col shrink-0">
        {/* Search & Header */}
        <div className="p-4 border-b border-sandstone space-y-3 bg-white/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-charcoal uppercase tracking-wider">Conversations</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 hover:bg-cream rounded-full text-primary transition-colors"
              title="Create Chat Group"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-sandstone rounded-xl text-xs focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all font-semibold"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-6 custom-scrollbar">
          <div>
            <span className="text-[10px] font-black text-outline uppercase tracking-wider px-3 mb-2 block">
              Active Groups
            </span>
            {loadingChannels ? (
              <div className="py-4 text-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-[10px] text-outline">Syncing channels...</span>
              </div>
            ) : filteredChannels.length > 0 ? (
              <nav className="space-y-1">
                {filteredChannels.map((chan) => {
                  const isActive = chan.id === activeChannelId;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => setActiveChannelId(chan.id)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-primary-container/20 text-primary border border-primary-container/30 font-bold"
                          : "hover:bg-cream text-on-surface-variant font-semibold hover:text-charcoal border border-transparent"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "bg-cream text-outline"}`}>
                        {getChannelIcon(chan.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{chan.name || `Chat #${chan.id.substring(0, 4)}`}</p>
                        <p className="text-[10px] text-outline truncate mt-0.5">
                          {chan.last_message_text || "No messages yet."}
                        </p>
                      </div>
                      {chan.unread_count > 0 && (
                        <span className="bg-kumkum-red text-white text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-bold">
                          {chan.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            ) : (
              <p className="text-center text-[10px] text-outline py-4">No groups found.</p>
            )}
          </div>

          {/* Mapped Direct Messages mock items from templates */}
          <div>
            <span className="text-[10px] font-black text-outline uppercase tracking-wider px-3 mb-2 block">
              Direct Messages
            </span>
            <nav className="space-y-1">
              <div className="text-on-surface-variant hover:bg-cream mx-1 rounded-xl flex items-center gap-3 px-3 py-2 cursor-pointer group transition-all font-semibold text-xs border border-transparent">
                <img
                  className="w-8 h-8 rounded-full object-cover border border-sandstone"
                  alt="Pandit Ji"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9f0-R3BYPHhCR8gce6CsJa2VIgfRzNjSxFyaKuGgOmD8VmAjvXSBmb8hcoQAx1Juf57Mm-BwDPMY0r9MhWXtulerWJFs_J5HGqpEZH9snTMqJjJNpEYWiJZ0v5Wxt7w9bzpx-SJm2bjms8GOrR15dBxbH2dLf7jWiUF066RGxcl8DDCqnOpxVzcyyTTuK7t3dnOjws8yKVj7Af3Nmv_IQpt7snd2jGRsKpcBT_3OHe6mhyFRONiXl5HLi13DP0AU9a7YYuDye2HM"
                />
                <span className="flex-1 truncate">Pandit Ji</span>
                <span className="w-1.5 h-1.5 rounded-full bg-tulsi-green shrink-0" />
              </div>
              <div className="text-on-surface-variant hover:bg-cream mx-1 rounded-xl flex items-center gap-3 px-3 py-2 cursor-pointer group transition-all font-semibold text-xs border border-transparent">
                <img
                  className="w-8 h-8 rounded-full object-cover border border-sandstone"
                  alt="Finance Lead"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsN6TLw6h0QnBFHARTgVnEQcfFUoxGm_K4eTsjzlTFU1S0lh-FrhKreDK0eVlySJ_uZJ1RRkYYDbdbOiTqPWH3e5ifm02-4tYoYprfIf1E2BzGky4vjzB9hLaLOQsK6SPgBomUhIkE51hmwhy6cccztzuWKDkx-rUTZLtxch_qRSNi-evruAmaontP4n_nLqaNL_sfWut9N0IDLsiRuSPOf8tvOO6AtoqZzgsZq9C_jjscPySRl5yQtfKkjHjqhLuNt1UY3U0NQ9E"
                />
                <span className="flex-1 truncate">Finance Lead</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Sync Status Footer */}
        <div className="p-3 border-t border-sandstone bg-white/30 shrink-0">
          <div className="bg-cream/40 rounded-xl p-2.5 flex items-center gap-2.5 border border-sandstone/30">
            <div className="p-1.5 bg-[#22C55E]/10 rounded-lg text-tulsi-green shrink-0">
              <CloudLightning className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[10px] text-charcoal">Real-time Connected</p>
              <p className="text-[9px] text-outline mt-0.5">Last Sync: Just now</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Feed (Center) */}
      <section className="flex-1 flex flex-col bg-white">
        {activeChannelId ? (
          <>
            {/* Active Channel Header */}
            <header className="h-16 px-6 border-b border-sandstone flex items-center justify-between bg-puja-white/85 backdrop-blur-xs shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                  {getChannelIcon(activeChannel?.name || "")}
                </div>
                <div>
                  <h2 className="font-bold text-charcoal text-sm leading-tight">
                    {activeChannel?.name || "Group Discussion"}
                  </h2>
                  <p className="text-[10px] text-outline font-semibold mt-0.5">
                    {activeChannel?.type === "direct"
                      ? "Direct Conversation"
                      : "142 members • Read-only for general volunteers"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-cream text-outline transition-colors">
                  <Search className="w-4.5 h-4.5" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-cream text-outline transition-colors">
                  <MoreVertical className="w-4.5 h-4.5" />
                </button>
              </div>
            </header>

            {/* Message History Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAF8]/50 custom-scrollbar">
              {loadingMessages ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <span className="text-xs text-outline font-semibold uppercase tracking-wider">Syncing channel feed...</span>
                </div>
              ) : messagesData?.messages && messagesData.messages.length > 0 ? (
                <>
                  <div className="flex justify-center my-4">
                    <span className="px-4 py-1 rounded-full bg-sandstone/30 text-outline text-[9px] font-black uppercase tracking-widest">
                      Group History Feed
                    </span>
                  </div>

                  {messagesData.messages.map((msg: any) => {
                    const isSelf = msg.sender_id === userId;
                    if (isSelf) {
                      return (
                        <div key={msg.id} className="flex items-start justify-end gap-3 animate-in fade-in duration-200">
                          <div className="space-y-1 text-right max-w-xl">
                            <div className="flex items-baseline justify-end gap-2">
                              <span className="text-[9px] text-outline font-semibold">
                                {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[10px] font-bold text-aarti-gold">You</span>
                            </div>
                            <div className="message-bubble-out bg-primary-container text-on-primary-container p-3.5 shadow-xs border border-primary-container/20 text-xs font-semibold leading-relaxed text-left max-w-md ml-auto">
                              {msg.message_text}
                            </div>
                            <div className="flex justify-end mt-1 text-tulsi-green">
                              <CheckCheck className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <img
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-primary-container"
                            alt="Your Avatar"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7pg33u8oJzysg0Ob_HpJU4pOIEviMmGa8i5kTAMQe0tFeZ6e1TR9DV4hqOyQCVF7l80vJamtKD6LZIEpGJExwNh6-wiwGurzfSfcz7XxuB2OjfhL0xp-pKFv7epF66JS7wC99CuTawyXB5Xf3HYOjDqpFLoVBh28Mw36U3BLqKXd-JWTWSpnBnzkbebpqesIGD-qsdNdMpfvbkXdht1cIH3SULZjqVbl21q48ihTLzkxtg_mvFaqIJcB3-Olv4ntS1Q3leHmuDLg"
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div key={msg.id} className="flex items-start gap-3 max-w-xl animate-in fade-in duration-200">
                          <img
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-sandstone"
                            alt={msg.sender_name}
                            src={msg.sender_avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDtPGGFzg-0G2QYbmZ5sOUJ0BTZ8RJe7SKqDE6ZB5yOVZk5haorpcEGe8sE94nEjQbjyN5j2_XShwGMvaJVebXgh7y2near0VnZCtZYQOQ9CblzabUtkeErBSX_gt1NS6EkbP3w2vx6HV9i_xjHcciQussGYyAoeybNZAODJk-t435bhxstlrIMXVR4AA7glxpbiJBLO6uYHF3HeRPdir-JGbseFipreOp3oo4MRoz06dkour2D3MOJk26jfkH8mDVtUaY1jaiJVmI"}
                          />
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-bold text-primary">{msg.sender_name || "Mandal Member"}</span>
                              <span className="text-[9px] text-outline font-semibold">
                                {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="message-bubble-in bg-cream p-3.5 shadow-xs border border-sandstone/50 text-xs font-semibold leading-relaxed text-charcoal max-w-md">
                              {msg.message_text}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </>
              ) : (
                <div className="py-20 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
                  <Campaign className="w-12 h-12 text-outline-variant" />
                  <div>
                    <h4 className="font-bold text-charcoal text-sm">No messages in this chat yet</h4>
                    <p className="text-xs mt-1 text-on-surface-variant leading-relaxed">
                      Start the conversation by typing an update or general message below.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Interactive Footer Editor */}
            <form onSubmit={handleSend} className="p-4 bg-puja-white border-t border-sandstone shrink-0">
              <div className="flex items-end gap-3 bg-cream/30 border border-sandstone rounded-2xl p-2 pr-4 shadow-sm focus-within:ring-2 focus-within:ring-primary-container focus-within:border-transparent transition-all">
                <button type="button" className="p-2 text-outline hover:text-primary transition-colors">
                  <Paperclip className="w-4.5 h-4.5" />
                </button>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Type an announcement/message..."
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-semibold py-2 px-2 min-h-[38px] max-h-24 resize-none custom-scrollbar outline-none text-charcoal"
                />
                <div className="flex items-center gap-1.5 mb-1 shrink-0">
                  <button type="button" className="p-2 text-outline hover:text-primary transition-colors">
                    <Smile className="w-4.5 h-4.5" />
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white h-9 w-9 rounded-xl flex items-center justify-center shadow-md active:scale-95 duration-100 transition-all glow-effect hover:opacity-90 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          // No Active Chat Selection
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#FAFAF8]/50">
            <span className="text-4xl mb-3">💬</span>
            <h4 className="text-sm font-bold text-charcoal">No Discussion Group Selected</h4>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs leading-relaxed">
              Choose an existing channel from the conversations list on the left to browse and publish real-time updates.
            </p>
          </div>
        )}
      </section>

      {/* Right Side Panel: Channel Info (Desktop Only) */}
      {activeChannelId && (
        <aside className="hidden xl:flex w-72 border-l border-sandstone bg-cream/15 flex-col py-6 shrink-0">
          <div className="text-center border-b border-sandstone pb-6 px-6">
            <div className="w-16 h-16 mx-auto bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary mb-3">
              {getChannelIcon(activeChannel?.name || "")}
            </div>
            <h3 className="font-bold text-charcoal text-sm truncate">{activeChannel?.name || "Discussion"}</h3>
            <p className="text-[10px] text-outline mt-1 font-semibold">Active Portal Segment</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* Pinned items widgets */}
            <div>
              <span className="text-[10px] font-black text-outline uppercase tracking-wider mb-2 block">
                Pinned Items
              </span>
              <div className="space-y-2">
                <div className="p-3 bg-white border border-sandstone rounded-xl text-xs hover:shadow-xs transition-all cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <p className="truncate font-semibold text-charcoal">Emergency_Contacts_2026.pdf</p>
                  </div>
                  <span className="text-[9px] text-primary font-bold mt-1.5 block">PDF • 1.2 MB</span>
                </div>
              </div>
            </div>

            {/* Media shared snippets grid */}
            <div>
              <span className="text-[10px] font-black text-outline uppercase tracking-wider mb-3 block">
                Shared Media (24)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div
                  className="aspect-square rounded-lg bg-cover bg-center border border-sandstone/50 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=150&auto=format&fit=crop')",
                  }}
                />
                <div
                  className="aspect-square rounded-lg bg-cover bg-center border border-sandstone/50 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?q=80&w=150&auto=format&fit=crop')",
                  }}
                />
                <div
                  className="aspect-square rounded-lg bg-cover bg-center border border-sandstone/50 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1561361513-2d000a50f0db?q=80&w=150&auto=format&fit=crop')",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-sandstone bg-white/20">
            <button className="w-full py-2.5 bg-cream border border-sandstone rounded-xl text-xs font-bold text-charcoal hover:bg-sandstone/30 transition-all flex items-center justify-center gap-2 active:scale-95">
              <Settings className="w-4 h-4 text-primary" />
              <span>Channel Settings</span>
            </button>
          </div>
        </aside>
      )}

      {/* Create Chat Group Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateChannel}
            className="bg-white rounded-2xl p-6 w-96 border border-sandstone shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-charcoal uppercase tracking-tight flex items-center gap-1.5">
                <Groups className="w-5 h-5 text-primary" /> Create Group
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-cream rounded-lg text-outline"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Group Name *</label>
              <input
                type="text"
                required
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g. Volunteers Committee"
                className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
              />
            </div>

            <div className="flex justify-end gap-2.5 text-xs font-semibold mt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 border border-sandstone text-charcoal rounded-xl bg-cream hover:bg-sandstone/30 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createChannelMutation.isPending || !newChannelName.trim()}
                className="px-5 py-2.5 bg-primary text-white hover:opacity-90 rounded-xl transition-all font-bold shadow-md saffron-glow active:scale-95 flex items-center justify-center gap-1.5"
              >
                {createChannelMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Group</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div>
  );
}

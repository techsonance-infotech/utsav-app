import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useFetchMembers } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

export default function MobileMembersScreen() {
  const { tenantName, role: currentRole } = useAuthStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data: members, isLoading, refetch } = useFetchMembers({
    search: search.trim() || undefined,
    role: roleFilter || undefined,
  });

  const renderMemberItem = ({ item }: { item: any }) => (
    <View style={styles.memberCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.full_name?.charAt(0).toUpperCase() || "M"}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.full_name}</Text>
        <Text style={styles.memberSub}>{item.user_id?.substring(0, 16)}...</Text>
      </View>
      <View style={[styles.roleBadge, item.role === "owner" ? styles.badgeOwner : styles.badgeMember]}>
        <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.diya}>🪔</Text>
        <View>
          <Text style={styles.title}>{tenantName || "Mandal Directory"}</Text>
          <Text style={styles.roleLabel}>Role: {currentRole || "Member"}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search members..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Role Filters */}
      <View style={styles.filterRow}>
        {[
          { id: "", label: "All" },
          { id: "owner", label: "Owner" },
          { id: "admin", label: "Admin" },
          { id: "treasurer", label: "Treasurer" },
          { id: "volunteer", label: "Volunteer" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setRoleFilter(filter.id)}
            style={[
              styles.filterChip,
              roleFilter === filter.id && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                roleFilter === filter.id && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Directory List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF9500" />
          <Text style={styles.loadingText}>Loading directory...</Text>
        </View>
      ) : (
        <FlatList
          data={members || []}
          keyExtractor={(item) => item.id}
          renderItem={renderMemberItem}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members found matching active search</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5EF", // Festive Creamy-white
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderColor: "#EAE6DF",
    backgroundColor: "#FFFFFF",
  },
  diya: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  roleLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#FFEFE0",
    borderColor: "#FF9500",
  },
  filterChipText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "semibold",
  },
  filterChipTextActive: {
    color: "#FF9500",
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0EBE4",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF2E5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9500",
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
  },
  memberSub: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
    fontFamily: "System",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeOwner: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  badgeMember: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  roleText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4B5563",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});

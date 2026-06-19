import React from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useFetchTenant } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";

export default function MobileSettingsScreen() {
  const { tenantId, role } = useAuthStore();
  const { data: tenant, isLoading } = useFetchTenant(tenantId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mandal Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identity Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{tenant?.name || "Utsav Mandal"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Subdomain</Text>
            <Text style={[styles.value, styles.mono]}>{tenant?.slug || "sai"}.utsav.app</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{tenant?.vertical?.toUpperCase() || "GANPATI"}</Text>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Geography & Locale</Text>
          <View style={styles.row}>
            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{tenant?.city || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>State</Text>
            <Text style={styles.value}>{tenant?.state || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Default Language</Text>
            <Text style={styles.value}>{tenant?.default_language?.toUpperCase() || "EN"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Timezone</Text>
            <Text style={styles.value}>{tenant?.timezone || "Asia/Kolkata"}</Text>
          </View>
        </View>

        {/* Permissions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Access & Scope</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Active Role</Text>
            <Text style={[styles.value, styles.roleHighlight]}>{role?.toUpperCase() || "MEMBER"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Donations Visibility</Text>
            <Text style={styles.value}>{tenant?.is_public_donations ? "Public" : "Members Only"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Expenses Visibility</Text>
            <Text style={styles.value}>{tenant?.is_public_expenses ? "Public" : "Members Only"}</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Note: To update branding colors, logo details, or payment integrations, please access the Utsav Web Portal.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5EF",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#EAE6DF",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0EBE4",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FF9500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  mono: {
    fontFamily: "System",
    color: "#B45309",
  },
  roleHighlight: {
    color: "#FF9500",
    fontWeight: "bold",
  },
  footerNote: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

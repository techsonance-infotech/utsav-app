import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFetchVendors,
  useFetchPurchaseOrders,
} from "@utsav/api-client";

export default function VendorsScreen() {
  const { data: vendors, isLoading: loadingVendors } = useFetchVendors();
  const { data: pos, isLoading: loadingPOs } = useFetchPurchaseOrders();
  const [tab, setTab] = useState<"profiles" | "orders">("profiles");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Procurement & Vendors</Text>
      </View>

      {/* Selector */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setTab("profiles")}
          style={[styles.tab, tab === "profiles" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "profiles" && styles.tabTextActive]}>
            Vendors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("orders")}
          style={[styles.tab, tab === "orders" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "orders" && styles.tabTextActive]}>
            Purchase Orders
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "profiles" ? (
        loadingVendors ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color="#FF9500" />
          </View>
        ) : (
          <FlatList
            data={vendors || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.vendorName}>{item.name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.category}>{item.category || "General Vendor"}</Text>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Contact:</Text>
                  <Text style={styles.value}>{item.contact_person || "N/A"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{item.phone || "N/A"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Payment Terms:</Text>
                  <Text style={styles.value}>{item.payment_terms || "N/A"}</Text>
                </View>
              </View>
            )}
          />
        )
      ) : loadingPOs ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="#FF9500" />
        </View>
      ) : (
        <FlatList
          data={pos || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.poNum}>{item.po_number}</Text>
                <View style={[styles.badge, styles.poBadge]}>
                  <Text style={styles.poBadgeText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.poTitle}>{item.title}</Text>
              <Text style={styles.poVendor}>Vendor: {item.vendors?.name || "Unknown"}</Text>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.label}>Total Amount:</Text>
                <Text style={styles.amount}>₹{item.total_amount.toLocaleString("en-IN")}</Text>
              </View>
            </View>
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#FF9500",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#FF9500",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  vendorName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  category: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "600",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "#EAFDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "bold",
  },
  poBadge: {
    backgroundColor: "#EFF6FF",
  },
  poBadgeText: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  value: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  poNum: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  poTitle: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
    marginTop: 6,
  },
  poVendor: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF9500",
  },
});

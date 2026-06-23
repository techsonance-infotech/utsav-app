import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useCreatePurchaseOrder, useFetchVendors } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export default function CreatePurchaseOrderScreen() {
  const { data: vendors } = useFetchVendors();
  const createPO = useCreatePurchaseOrder();

  const [vendorId, setVendorId] = useState("v1");
  const [vendorName, setVendorName] = useState("Royal Marigold Decors");
  const [title, setTitle] = useState("Annual Community Jagran Floral Decor");
  const [totalAmount, setTotalAmount] = useState("45000");
  const [deliveryDate, setDeliveryDate] = useState("2024-10-28");
  const [notes, setNotes] = useState("Please ensure all flowers are delivered fresh by 6:00 AM.");

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "li1",
      description: "100 Fresh Marigold Garlands (6ft)",
      qty: 100,
      unitPrice: 350,
    },
    {
      id: "li2",
      description: "Carnation floral bouquets for stage backdrop",
      qty: 20,
      unitPrice: 500,
    },
  ]);

  const handleAddRow = () => {
    const newItem: LineItem = {
      id: `li_${Date.now()}`,
      description: "",
      qty: 1,
      unitPrice: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, val: any) => {
    const updated = lineItems.map((item) => {
      if (item.id === id) {
        const itemVal = { ...item, [field]: val };
        // Recalculate estimated total amount if qty or unitPrice changes
        return itemVal;
      }
      return item;
    });
    setLineItems(updated);

    // Calculate sum
    const total = updated.reduce((sum, curr) => sum + (Number(curr.qty) || 0) * (Number(curr.unitPrice) || 0), 0);
    setTotalAmount(total.toString());
  };

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a service title.");
      return;
    }

    createPO.mutate(
      {
        vendor_id: vendorId,
        po_number: `PO-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        description: notes,
        total_amount: Number(totalAmount) || 0,
        expected_delivery_date: deliveryDate,
        items: lineItems,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Purchase Order created successfully!");
          router.back();
        },
        onError: (err) => {
          Alert.alert("Error", err.message || "Failed to create PO. Pls retry.");
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.primaryBrand}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>New Purchase Order</Text>
            <Text style={styles.headerSubtitle}>PO-2024-0892 • Draft State</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Vendor Summary Card */}
        <View style={styles.vendorCard}>
          <View style={styles.vendorLeft}>
            <View style={styles.vendorIconBg}>
              <MaterialCommunityIcons name="storefront" size={24} color={colors.aartiGold} />
            </View>
            <View>
              <Text style={styles.vendorCardLabel}>Selected Vendor</Text>
              <Text style={styles.vendorCardName}>{vendorName}</Text>
              <Text style={styles.vendorCardId}>V-ID: RM-8829 • Mumbai</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.changeVendorBtn} activeOpacity={0.7}>
            <Text style={styles.changeVendorText}>Change</Text>
            <MaterialCommunityIcons name="pencil" size={12} color={colors.primaryBrand} />
          </TouchableOpacity>
        </View>

        {/* Order Overview Form */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>
            <MaterialCommunityIcons name="information-outline" size={18} color={colors.primaryBrand} /> Order Overview
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Title / Event Reference</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Annual Community Jagran Floral Decor"
              placeholderTextColor={colors.outline}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Total Estimated Amount (₹)</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Service Date</Text>
              <View style={styles.amountInputWrapper}>
                <TextInput
                  style={styles.amountInput}
                  value={deliveryDate}
                  onChangeText={setDeliveryDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.outline}
                />
                <MaterialCommunityIcons name="calendar" size={18} color={colors.outline} />
              </View>
            </View>
          </View>
        </View>

        {/* Line Items Builder */}
        <View style={styles.card}>
          <View style={styles.lineItemsHeader}>
            <Text style={styles.cardSectionTitle}>
              <MaterialCommunityIcons name="format-list-bulleted" size={18} color={colors.primaryBrand} /> Line Items
            </Text>
            <TouchableOpacity style={styles.addRowBtn} onPress={handleAddRow} activeOpacity={0.7}>
              <MaterialCommunityIcons name="plus" size={14} color={colors.primaryBrand} />
              <Text style={styles.addRowText}>Add Row</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lineItemsList}>
            {lineItems.map((item, idx) => (
              <View key={item.id} style={styles.lineItemRow}>
                <View style={styles.lineItemMain}>
                  <TextInput
                    style={styles.lineItemDescInput}
                    placeholder="Item/Service Description"
                    placeholderTextColor={colors.outline}
                    value={item.description}
                    onChangeText={(val) => handleLineItemChange(item.id, "description", val)}
                  />
                  <View style={styles.lineItemQtyCost}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.qtyLabel}>Qty</Text>
                      <TextInput
                        style={styles.qtyInput}
                        value={item.qty.toString()}
                        onChangeText={(val) => handleLineItemChange(item.id, "qty", Number(val) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1.5 }]}>
                      <Text style={styles.qtyLabel}>Unit Price (₹)</Text>
                      <TextInput
                        style={styles.qtyInput}
                        value={item.unitPrice.toString()}
                        onChangeText={(val) => handleLineItemChange(item.id, "unitPrice", Number(val) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.deleteRowBtn}
                      onPress={() => handleRemoveRow(item.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.kumkumRed} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Terms & Notes */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>
            <MaterialCommunityIcons name="note-text-outline" size={18} color={colors.primaryBrand} /> Terms & Notes
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholder="Add special instructions or delivery details..."
            placeholderTextColor={colors.outline}
          />
        </View>
      </ScrollView>

      {/* Sticky Action Footer */}
      <View style={styles.actionBar}>
        <View style={styles.actionInner}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handlePublish}
            activeOpacity={0.8}
            disabled={createPO.isPending}
          >
            {createPO.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.saveText}>Publish & Send</Text>
                <MaterialCommunityIcons name="send-outline" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.primaryBrand,
  },
  headerSubtitle: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: -2,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 100, gap: 16 },

  vendorCard: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vendorLeft: { flexDirection: "row", gap: 12, alignItems: "center" },
  vendorIconBg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  vendorCardLabel: {
    fontFamily: fonts.inter.bold,
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  vendorCardName: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: colors.primaryBrand,
  },
  vendorCardId: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  changeVendorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeVendorText: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.primaryBrand,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardSectionTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 15,
    color: colors.charcoal,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inputGroup: { gap: 6 },
  label: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  input: {
    height: 48,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurface,
  },
  row: { flexDirection: "row", gap: 12 },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontFamily: fonts.inter.bold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurface,
  },

  lineItemsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,149,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,149,0,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addRowText: {
    fontFamily: fonts.inter.bold,
    fontSize: 12,
    color: colors.primaryBrand,
  },
  lineItemsList: { gap: 12 },
  lineItemRow: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: 12,
  },
  lineItemMain: { gap: 8 },
  lineItemDescInput: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurface,
  },
  lineItemQtyCost: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  qtyLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    paddingLeft: 2,
  },
  qtyInput: {
    height: 38,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurface,
    textAlign: "center",
  },
  deleteRowBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },

  textArea: {
    height: 90,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },

  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,248,244,0.9)",
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    padding: 16,
  },
  actionInner: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelText: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  saveBtn: {
    flex: 1.5,
    height: 48,
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: {
    fontFamily: fonts.poppins.bold,
    fontSize: 14,
    color: colors.onPrimaryContainer,
  },
});

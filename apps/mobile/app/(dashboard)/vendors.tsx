import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  useFetchVendors,
  useFetchPurchaseOrders,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CATEGORIES = [
  "Catering / Food",
  "Decoration / Flowers",
  "Sound / Lighting",
  "Tents / Mandap",
  "Rituals / Pooja",
  "Security / Logistics",
  "Printing / Media",
  "Other",
];

export default function VendorsScreen() {
  const { data: vendors, isLoading: loadingVendors } = useFetchVendors();
  const { data: pos, isLoading: loadingPOs } = useFetchPurchaseOrders();
  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();
  const deleteVendorMutation = useDeleteVendor();
  const { role } = useAuthStore();

  const [tab, setTab] = useState<"profiles" | "orders">("profiles");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Catering / Food");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfscCode, setBankIfscCode] = useState("");
  const [notes, setNotes] = useState("");

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = "Vendor name is required";
    if (!category.trim()) tempErrors.category = "Category is required";
    if (!contactPerson.trim()) tempErrors.contactPerson = "Contact person is required";
    if (!phone.trim()) {
      tempErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone.trim())) {
      tempErrors.phone = "Must be a 10-digit mobile number";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      tempErrors.email = "Must be a valid email address";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSaveVendor = async () => {
    if (!validateForm()) return;

    try {
      if (editingVendorId) {
        await updateVendorMutation.mutateAsync({
          id: editingVendorId,
          data: {
            name: name.trim(),
            category: category,
            contact_person: contactPerson.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            gst_number: gstNumber.trim() || undefined,
            payment_terms: paymentTerms.trim() || undefined,
            bank_account_number: bankAccountNumber.trim() || undefined,
            bank_ifsc_code: bankIfscCode.trim() || undefined,
            notes: notes.trim() || undefined,
          },
        });
        Alert.alert("Success", "Vendor updated successfully!");
      } else {
        await createVendorMutation.mutateAsync({
          name: name.trim(),
          category: category,
          contact_person: contactPerson.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          gst_number: gstNumber.trim() || undefined,
          payment_terms: paymentTerms.trim() || undefined,
          bank_account_number: bankAccountNumber.trim() || undefined,
          bank_ifsc_code: bankIfscCode.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        Alert.alert("Success", "Vendor created successfully!");
      }
      handleCloseModal();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save vendor. Please try again.");
    }
  };

  const handleStartEdit = (vendor: any) => {
    setEditingVendorId(vendor.id);
    setName(vendor.name || "");
    setCategory(vendor.category || "Catering / Food");
    setContactPerson(vendor.contact_person || "");
    setPhone(vendor.phone || "");
    setEmail(vendor.email || "");
    setGstNumber(vendor.gst_number || "");
    setPaymentTerms(vendor.payment_terms || "");
    setBankAccountNumber(vendor.bank_account_number || "");
    setBankIfscCode(vendor.bank_ifsc_code || "");
    setNotes(vendor.notes || "");
    setModalVisible(true);
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Vendor",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVendorMutation.mutateAsync(id);
              Alert.alert("Success", "Vendor deleted successfully!");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete vendor.");
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingVendorId(null);
    setName("");
    setCategory("Catering / Food");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setGstNumber("");
    setPaymentTerms("");
    setBankAccountNumber("");
    setBankIfscCode("");
    setNotes("");
    setErrors({});
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "accepted" || s === "completed") return colors.tulsiGreen;
    if (s === "pending" || s === "sent" || s === "draft") return colors.aartiGold;
    return colors.kumkumRed;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Procurement & Vendors</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Tabs */}
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
            <ActivityIndicator size="small" color={colors.primaryContainer} />
          </View>
        ) : (
          <FlatList
            data={vendors || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.vendorName}>{item.name}</Text>
                    <Text style={styles.category}>{item.category || "General Vendor"}</Text>
                  </View>
                  <View style={styles.headerRightActions}>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + "15", marginRight: 8 }]}>
                      <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                        {(item.status || "Active").toUpperCase()}
                      </Text>
                    </View>
                    {["owner", "admin", "treasurer", "committee_member", "super_admin"].includes(role || "") && (
                      <View style={styles.actionIconsRow}>
                        <TouchableOpacity
                          style={styles.actionIconButton}
                          onPress={() => handleStartEdit(item)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.outline} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionIconButton, { marginLeft: 6 }]}
                          onPress={() => confirmDelete(item.id, item.name)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.kumkumRed} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="account-outline" size={16} color={colors.onSurfaceVariant} />
                    <Text style={styles.detailLabel}>Contact:</Text>
                  </View>
                  <Text style={styles.detailValue}>{item.contact_person || "N/A"}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="phone-outline" size={16} color={colors.onSurfaceVariant} />
                    <Text style={styles.detailLabel}>Phone:</Text>
                  </View>
                  <Text style={styles.detailValue}>{item.phone || "N/A"}</Text>
                </View>

                {item.email ? (
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="email-outline" size={16} color={colors.onSurfaceVariant} />
                      <Text style={styles.detailLabel}>Email:</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.email}</Text>
                  </View>
                ) : null}

                {item.gst_number ? (
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="card-account-details-outline" size={16} color={colors.onSurfaceVariant} />
                      <Text style={styles.detailLabel}>GSTIN:</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.gst_number}</Text>
                  </View>
                ) : null}

                {item.payment_terms ? (
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="handshake-outline" size={16} color={colors.onSurfaceVariant} />
                      <Text style={styles.detailLabel}>Terms:</Text>
                    </View>
                    <Text style={styles.detailValue}>{item.payment_terms}</Text>
                  </View>
                ) : null}

                {item.notes ? (
                  <View style={styles.notesBlock}>
                    <Text style={styles.notesTitle}>Private Notes</Text>
                    <Text style={styles.notesContent}>{item.notes}</Text>
                  </View>
                ) : null}
              </View>
            )}
          />
        )
      ) : loadingPOs ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.primaryContainer} />
        </View>
      ) : (
        <FlatList
          data={pos || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.poNum}>{item.po_number}</Text>
                  <Text style={styles.poTitle}>{item.title}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + "15" }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                    {(item.status || "Draft").toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.poVendor}>
                <MaterialCommunityIcons name="storefront-outline" size={14} color={colors.onSurfaceVariant} />{" "}
                {item.vendors?.name || "Unknown Vendor"}
              </Text>

              {item.description ? (
                <Text style={styles.poDesc}>{item.description}</Text>
              ) : null}

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="currency-inr" size={16} color={colors.onSurfaceVariant} />
                  <Text style={styles.detailLabel}>Total Amount:</Text>
                </View>
                <Text style={styles.amount}>₹{(item.total_amount || 0).toLocaleString("en-IN")}</Text>
              </View>

              {item.expected_delivery_date ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="calendar-clock-outline" size={16} color={colors.onSurfaceVariant} />
                    <Text style={styles.detailLabel}>Expected Delivery:</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {new Date(item.expected_delivery_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        />
      )}

      {/* Floating Add Button for Vendors */}
      {tab === "profiles" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Add Vendor Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingVendorId ? "Edit Vendor Profile" : "Add New Vendor"}
                </Text>
                <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.7} style={styles.modalCloseBtn}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.charcoal} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Vendor Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Business / Vendor Name *</Text>
                  <TextInput
                    style={[styles.input, errors.name ? styles.inputError : null]}
                    placeholder="e.g. Swad Catering Services"
                    placeholderTextColor={colors.outline}
                    value={name}
                    onChangeText={setName}
                  />
                  {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                </View>

                {/* Category Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vendor Category *</Text>
                  <View style={styles.categoriesRow}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          category === cat && styles.categoryChipActive,
                        ]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            category === cat && styles.categoryChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Contact Person */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Person Name *</Text>
                  <TextInput
                    style={[styles.input, errors.contactPerson ? styles.inputError : null]}
                    placeholder="e.g. Rajesh Kumar"
                    placeholderTextColor={colors.outline}
                    value={contactPerson}
                    onChangeText={setContactPerson}
                  />
                  {errors.contactPerson ? <Text style={styles.errorText}>{errors.contactPerson}</Text> : null}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile / Phone Number *</Text>
                  <TextInput
                    style={[styles.input, errors.phone ? styles.inputError : null]}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={colors.outline}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                  {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address (Optional)</Text>
                  <TextInput
                    style={[styles.input, errors.email ? styles.inputError : null]}
                    placeholder="e.g. rajesh@swadcatering.com"
                    placeholderTextColor={colors.outline}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                {/* GST IN */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>GSTIN / GST Number (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="15-character GSTIN number"
                    placeholderTextColor={colors.outline}
                    autoCapitalize="characters"
                    maxLength={15}
                    value={gstNumber}
                    onChangeText={setGstNumber}
                  />
                </View>

                {/* Payment Terms */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Payment Terms (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 50% Advance, Net 30, Due on Delivery"
                    placeholderTextColor={colors.outline}
                    value={paymentTerms}
                    onChangeText={setPaymentTerms}
                  />
                </View>

                {/* Bank Account Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bank Account Number (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Bank account number for transfers"
                    placeholderTextColor={colors.outline}
                    keyboardType="number-pad"
                    value={bankAccountNumber}
                    onChangeText={setBankAccountNumber}
                  />
                </View>

                {/* Bank IFSC Code */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bank IFSC Code (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="IFSC code"
                    placeholderTextColor={colors.outline}
                    autoCapitalize="characters"
                    value={bankIfscCode}
                    onChangeText={setBankIfscCode}
                  />
                </View>

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Internal / Private Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any specific instructions or logs related to this vendor"
                    placeholderTextColor={colors.outline}
                    multiline={true}
                    numberOfLines={4}
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>

                <View style={{ height: 32 }} />
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCloseModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSaveVendor}
                  activeOpacity={0.8}
                  disabled={createVendorMutation.isPending || updateVendorMutation.isPending}
                >
                  {createVendorMutation.isPending || updateVendorMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {editingVendorId ? "Save Changes" : "Add Vendor"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.primaryContainer,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.outline,
  },
  tabTextActive: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  vendorName: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  category: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryContainer,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.pujaWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  poNum: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
  },
  poTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    marginTop: 2,
  },
  poVendor: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  poDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.outline,
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.4)",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.outline,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
    flex: 1,
    textAlign: "right",
    paddingLeft: 16,
  },
  amount: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.kumkumRed,
    flex: 1,
    textAlign: "right",
    paddingLeft: 16,
  },
  notesBlock: {
    backgroundColor: colors.cream,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  notesTitle: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
    marginBottom: 4,
  },
  notesContent: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.charcoal,
    lineHeight: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(58, 53, 48, 0.6)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    maxHeight: "90%",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  modalCloseBtn: {
    padding: 4,
  },
  formScroll: {
    maxHeight: "75%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  inputError: {
    borderColor: colors.kumkumRed,
  },
  errorText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.kumkumRed,
    marginTop: 4,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  categoryChipActive: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderColor: colors.primaryContainer,
  },
  categoryChipText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  categoryChipTextActive: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.charcoal,
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
});

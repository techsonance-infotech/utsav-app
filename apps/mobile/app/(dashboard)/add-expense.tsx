import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Platform, Animated, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCreateExpense, useExpenseCategories, useFetchVendors } from "@utsav/api-client";
import DatePickerModal from "../components/DatePickerModal";
import * as ImagePicker from "expo-image-picker";

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  editable?: boolean;
  maxLength?: number;
}

function FloatingLabelInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  editable = true,
  maxLength,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = React.useRef(new Animated.Value(value === "" ? 0 : 1)).current;

  React.useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value !== "" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: "absolute" as const,
    left: 16,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 6],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 10],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.onSurfaceVariant, colors.primaryBrand],
    }),
    fontFamily: fonts.inter.regular,
  };

  return (
    <View style={styles.floatingInputContainer}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[
          styles.floatingInput,
          isFocused && styles.floatingInputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        placeholder=""
      />
    </View>
  );
}

interface FloatingLabelSelectorProps {
  label: string;
  value: string;
  onPress: () => void;
  icon?: string;
}

function FloatingLabelSelector({
  label,
  value,
  onPress,
  icon = "chevron-down",
}: FloatingLabelSelectorProps) {
  return (
    <TouchableOpacity
      style={styles.floatingSelectorContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.floatingSelectorLabel}>{label}</Text>
      <View style={styles.floatingSelectorContent}>
        <Text style={styles.floatingSelectorText} numberOfLines={1}>
          {value}
        </Text>
        <MaterialCommunityIcons name={icon as any} size={20} color={colors.onSurfaceVariant} style={styles.floatingSelectorIcon} />
      </View>
    </TouchableOpacity>
  );
}

export default function AddExpenseScreen() {
  const { data: categories = [], isLoading: loadingCategories } = useExpenseCategories();
  const { data: vendors = [], isLoading: loadingVendors } = useFetchVendors();
  const createMutation = useCreateExpense();

  // Form States
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("Select Category");
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("Select Vendor");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"cash" | "bank_transfer" | "upi" | "cheque">("cash");
  const [gstAmount, setGstAmount] = useState("");

  // Selector Modals
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentModeSelector, setShowPaymentModeSelector] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUploadReceipt = () => {
    Alert.alert(
      "Upload Receipt",
      "Choose an option to upload your receipt:",
      [
        {
          text: "Take Photo (Camera)",
          onPress: () => pickImage(true),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickImage(false),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need camera permission to take a picture.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.7,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need gallery permissions to select a photo.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.7,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploading(true);
        
        // Validate type: only png, jpg, jpeg. Do not accept pdf.
        const uriLower = asset.uri.toLowerCase();
        const isImage = uriLower.endsWith(".png") || uriLower.endsWith(".jpg") || uriLower.endsWith(".jpeg");
        const mimeType = asset.mimeType?.toLowerCase() || "";
        const isMimeImage = mimeType === "image/png" || mimeType === "image/jpeg" || mimeType === "image/jpg";

        if (!isImage && !isMimeImage) {
          setIsUploading(false);
          Alert.alert("Invalid File Type", "Only PNG, JPG, or JPEG images are allowed. PDFs are not accepted.");
          return;
        }

        // Validate size (1MB = 1048576 bytes)
        let sizeBytes = asset.fileSize;
        if (!sizeBytes && asset.base64) {
          sizeBytes = Math.round((asset.base64.length * 3) / 4);
        }

        if (sizeBytes && sizeBytes > 1024 * 1024) {
          setIsUploading(false);
          Alert.alert("File Too Large", "The receipt image must be 1MB or smaller.");
          return;
        }

        if (asset.base64) {
          const format = uriLower.endsWith(".png") || mimeType === "image/png" ? "png" : "jpeg";
          setReceiptUrl(`data:image/${format};base64,${asset.base64}`);
        } else {
          Alert.alert("Error", "Could not read the image data.");
        }
        setIsUploading(false);
      }
    } catch (err: any) {
      setIsUploading(false);
      Alert.alert("Error picking image", err.message || "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return setErrorMsg("Please enter a valid amount");
    }
    if (!title.trim()) {
      return setErrorMsg("Please enter an expense title");
    }
    if (parsedAmount > 500 && (!receiptUrl || receiptUrl.trim() === "")) {
      return setErrorMsg("A digital receipt upload is mandatory for expenses exceeding ₹500.");
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        amount: parsedAmount,
        category_id: categoryId || undefined,
        vendor_id: vendorId || undefined,
        expense_date: expenseDate,
        description: notes.trim() || undefined,
        payment_mode: paymentMode,
        receipt_url: receiptUrl || undefined,
        gst_amount: gstAmount ? parseFloat(gstAmount) : 0,
      });
      router.back();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit expense");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Expense</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Title Description */}
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Submit Expense</Text>
          <Text style={styles.introSub}>Capture spending for the upcoming Mandal festival.</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Amount Section */}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>AMOUNT</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.outlineVariant}
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View style={styles.divider} />
          </View>

          {/* Title Input */}
          <FloatingLabelInput
            label="Expense Title *"
            value={title}
            onChangeText={setTitle}
          />

          {/* Category Selector */}
          <FloatingLabelSelector
            label="Category"
            value={categoryName}
            onPress={() => setShowCategorySelector(true)}
          />

          {/* Date & Vendor Grid */}
          <View style={styles.gridRow}>
            {/* Date Input */}
            <View style={{ flex: 1 }}>
              <FloatingLabelSelector
                label="Date *"
                value={expenseDate}
                onPress={() => setShowDatePicker(true)}
                icon="calendar"
              />
            </View>

            {/* Vendor Selector */}
            <View style={{ flex: 1 }}>
              <FloatingLabelSelector
                label="Vendor"
                value={vendorName}
                onPress={() => setShowVendorSelector(true)}
                icon="store-outline"
              />
            </View>
          </View>

          {/* Payment Mode & GST Grid */}
          <View style={styles.gridRow}>
            {/* Payment Mode Selector */}
            <View style={{ flex: 1 }}>
              <FloatingLabelSelector
                label="Payment Mode"
                value={
                  paymentMode === "cash"
                    ? "Cash"
                    : paymentMode === "bank_transfer"
                    ? "Bank Transfer"
                    : paymentMode === "upi"
                    ? "UPI"
                    : "Cheque"
                }
                onPress={() => setShowPaymentModeSelector(true)}
                icon="credit-card-outline"
              />
            </View>

            {/* GST Amount Input */}
            <View style={{ flex: 1 }}>
              <FloatingLabelInput
                label="GST Amount"
                value={gstAmount}
                onChangeText={setGstAmount}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Receipt Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.uploadLabelHeader}>Proof of Expense (Required if over ₹500)</Text>
            {receiptUrl ? (
              <View style={[styles.uploadBox, styles.uploadBoxSuccess]}>
                <View style={styles.uploadIconCircleSuccess}>
                  <MaterialCommunityIcons name="check-circle" size={24} color={colors.tulsiGreen} />
                </View>
                <Text style={styles.uploadTitle}>Receipt Uploaded</Text>
                <TouchableOpacity onPress={() => setReceiptUrl("")}>
                  <Text style={styles.changeFileText}>Change receipt</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={handleUploadReceipt}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={colors.primaryContainer} />
                ) : (
                  <>
                    <View style={styles.uploadIconCircle}>
                      <MaterialCommunityIcons name="camera-outline" size={28} color={colors.primaryContainer} />
                    </View>
                    <Text style={styles.uploadTitle}>Upload Receipt</Text>
                    <Text style={styles.uploadSubtitle}>PNG, JPG or PDF up to 5MB</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Optional Notes */}
          <FloatingLabelInput
            label="Additional Notes"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Quick Tips Bento */}
        <View style={styles.bentoRow}>
          <View style={[styles.bentoCard, styles.policyCard]}>
            <MaterialCommunityIcons name="shield-check-outline" size={24} color={colors.primaryBrand} />
            <Text style={styles.bentoTitle}>Policy Check</Text>
            <Text style={styles.bentoDesc}>Expenses above ₹5,000 require Treasurer approval.</Text>
          </View>

          <View style={[styles.bentoCard, styles.fastTrackCard]}>
            <MaterialCommunityIcons name="flash-outline" size={24} color={colors.tulsiGreen} />
            <Text style={[styles.bentoTitle, { color: colors.tulsiGreen }]}>Fast-Track</Text>
            <Text style={[styles.bentoDesc, { color: colors.tulsiGreen }]}>Verified vendors get approved within 2 hours.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Submit Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit for Approval</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Picker Modal */}
      <Modal visible={showCategorySelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategorySelector(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {loadingCategories ? (
                <ActivityIndicator size="small" color={colors.primaryBrand} style={{ marginVertical: 20 }} />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setCategoryId("");
                      setCategoryName("None / General");
                      setShowCategorySelector(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>None / General</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.modalItem}
                      onPress={() => {
                        setCategoryId(cat.id);
                        setCategoryName(cat.name);
                        setShowCategorySelector(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Vendor Picker Modal */}
      <Modal visible={showVendorSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vendor</Text>
              <TouchableOpacity onPress={() => setShowVendorSelector(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {loadingVendors ? (
                <ActivityIndicator size="small" color={colors.primaryBrand} style={{ marginVertical: 20 }} />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setVendorId("");
                      setVendorName("None");
                      setShowVendorSelector(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>None</Text>
                  </TouchableOpacity>
                  {vendors.map((vendor) => (
                    <TouchableOpacity
                      key={vendor.id}
                      style={styles.modalItem}
                      onPress={() => {
                        setVendorId(vendor.id);
                        setVendorName(vendor.name);
                        setShowVendorSelector(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{vendor.name}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        value={expenseDate}
        onSelect={(dateStr) => {
          if (dateStr) setExpenseDate(dateStr);
        }}
        onClose={() => setShowDatePicker(false)}
        title="Select Expense Date"
      />

      {/* Payment Mode Picker Modal */}
      <Modal visible={showPaymentModeSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Mode</Text>
              <TouchableOpacity onPress={() => setShowPaymentModeSelector(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {([
                { id: "cash", name: "Cash" },
                { id: "bank_transfer", name: "Bank Transfer" },
                { id: "upi", name: "UPI" },
                { id: "cheque", name: "Cheque" },
              ] as const).map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setPaymentMode(mode.id);
                    setShowPaymentModeSelector(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{mode.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Label Helper
function LabelWithIcon({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.labelRow}>
      <MaterialCommunityIcons name={icon as any} size={16} color={colors.onSurface} style={styles.labelIcon} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  introContainer: {
    marginBottom: spacing.md,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  introSub: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.errorContainer,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.error,
    flex: 1,
  },
  amountContainer: {
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  amountLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  currencySymbol: {
    fontSize: 32,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryContainer,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 36,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    textAlign: "center",
    minWidth: 100,
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 149, 0, 0.3)",
    width: 96,
    marginTop: 8,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  labelIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  selectorBtn: {
    height: 48,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
  },
  textPlaceholder: {
    color: colors.outline,
  },
  textActive: {
    color: colors.onSurface,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.sandstone,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBoxSuccess: {
    borderStyle: "solid",
    borderColor: colors.tulsiGreen,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  uploadIconCircleSuccess: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  uploadSubtitle: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  changeFileText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 6,
    textDecorationLine: "underline",
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.md,
  },
  bentoCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  policyCard: {
    backgroundColor: "rgba(255, 184, 116, 0.1)",
    borderColor: "rgba(255, 184, 116, 0.2)",
  },
  fastTrackCard: {
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    borderColor: "rgba(34, 197, 94, 0.1)",
  },
  bentoTitle: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryFixedVariant,
    marginTop: 8,
  },
  bentoDesc: {
    fontSize: 10,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 13,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 248, 244, 0.9)",
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  submitBtn: {
    backgroundColor: colors.primaryContainer,
    height: 54,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnText: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
  },
  modalItemText: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  floatingInputContainer: {
    position: "relative",
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
  },
  floatingInput: {
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  floatingInputFocused: {
    borderColor: colors.primaryContainer,
  },
  floatingSelectorContainer: {
    position: "relative",
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  floatingSelectorLabel: {
    position: "absolute",
    left: 16,
    top: 6,
    fontSize: 10,
    color: colors.primaryBrand,
    fontFamily: fonts.inter.regular,
  },
  floatingSelectorContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
  },
  floatingSelectorText: {
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
    flex: 1,
  },
  floatingSelectorIcon: {
    marginLeft: 8,
  },
  uploadLabelHeader: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    marginBottom: 6,
  },
});

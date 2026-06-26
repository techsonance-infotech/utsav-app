import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Platform,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import {
  useExpenses,
  useApproveExpense,
  useRejectExpense,
  usePayExpense,
  useUpdateExpense,
  useExpenseCategories,
  useFetchVendors,
} from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import DatePickerModal from "../components/DatePickerModal";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function MobileExpensesScreen() {
  const { role, userFullName, userId } = useAuthStore();
  const { data: expenses = [], isLoading: loadingExpenses, refetch } = useExpenses() as any;

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const payMutation = usePayExpense();
  const updateMutation = useUpdateExpense();
  const { data: categories = [], isLoading: loadingCategories } = useExpenseCategories();
  const { data: vendors = [], isLoading: loadingVendors } = useFetchVendors();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | null>(null);
  const [startDateStr, setStartDateStr] = useState(""); // YYYY-MM-DD
  const [endDateStr, setEndDateStr] = useState(""); // YYYY-MM-DD
  const [showFilters, setShowFilters] = useState(false);

  // DatePicker Visibilities
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Local Pagination State
  const [visibleCount, setVisibleCount] = useState(15);

  // Edit Expense States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("Select Category");
  const [editVendorId, setEditVendorId] = useState("");
  const [editVendorName, setEditVendorName] = useState("Select Vendor");
  const [editExpenseDate, setEditExpenseDate] = useState("");
  const [editPaymentMode, setEditPaymentMode] = useState<"cash" | "bank_transfer" | "upi" | "cheque">("cash");
  const [editGstAmount, setEditGstAmount] = useState("");
  const [editReceiptUrl, setEditReceiptUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Edit Modal Selectors Visibilities
  const [showEditCategorySelector, setShowEditCategorySelector] = useState(false);
  const [showEditVendorSelector, setShowEditVendorSelector] = useState(false);
  const [showEditPaymentModeSelector, setShowEditPaymentModeSelector] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const hasAdminAccess = ["owner", "admin", "treasurer"].includes(role || "");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Actions
  const handleApprove = async (id: string) => {
    Alert.alert("Approve Expense", "Are you sure you want to approve this expense voucher?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            await approveMutation.mutateAsync(id);
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to approve expense");
          }
        },
      },
    ]);
  };

  const handleReject = async (id: string) => {
    Alert.prompt(
      "Reject Expense",
      "Please enter a review note describing the reason for rejection:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async (note) => {
            try {
              await rejectMutation.mutateAsync({ id, review_note: note || "Rejected from mobile app." });
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to reject expense");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handlePay = async (id: string) => {
    Alert.alert("Record Payment", "Disburse cash and mark this expense voucher as paid?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Paid",
        onPress: async () => {
          try {
            await payMutation.mutateAsync(id);
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to record payment");
          }
        },
      },
    ]);
  };

  const isEditable = (item: any) => {
    return (item.status === "draft" || item.status === "pending_approval") && item.submitted_by === userId;
  };

  const handleEditPress = (item: any) => {
    setEditingExpenseId(item.id);
    setEditTitle(item.title || "");
    setEditAmount(item.amount ? item.amount.toString() : "");
    setEditCategoryId(item.category_id || "");
    setEditCategoryName(item.category?.name || "None / General");
    setEditVendorId(item.vendor_id || "");
    setEditVendorName(item.vendor?.business_name || "None");
    setEditExpenseDate(item.expense_date || "");
    setEditPaymentMode(item.payment_mode || "cash");
    setEditGstAmount(item.gst_amount ? item.gst_amount.toString() : "");
    setEditReceiptUrl(item.receipt_url || "");
    setEditNotes(item.description || "");
    setIsEditModalVisible(true);
  };

  const handleEditUploadReceipt = () => {
    Alert.alert(
      "Upload Receipt",
      "Choose an option to upload your receipt:",
      [
        {
          text: "Take Photo (Camera)",
          onPress: () => pickEditImage(true),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickEditImage(false),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const pickEditImage = async (useCamera: boolean) => {
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
          setEditReceiptUrl(`data:image/${format};base64,${asset.base64}`);
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

  const handleUpdateSubmit = async () => {
    if (!editingExpenseId) return;

    const parsedAmount = parseFloat(editAmount);
    if (!editTitle.trim()) {
      Alert.alert("Validation Error", "Please enter an expense title");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Validation Error", "Please enter a valid amount");
      return;
    }
    if (parsedAmount > 500 && (!editReceiptUrl || editReceiptUrl.trim() === "")) {
      Alert.alert("Validation Error", "A digital receipt upload is mandatory for expenses exceeding ₹500.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingExpenseId,
        title: editTitle.trim(),
        amount: parsedAmount,
        category_id: editCategoryId || undefined,
        vendor_id: editVendorId || undefined,
        expense_date: editExpenseDate,
        description: editNotes.trim() || undefined,
        payment_mode: editPaymentMode,
        receipt_url: editReceiptUrl || undefined,
        gst_amount: editGstAmount ? parseFloat(editGstAmount) : 0,
      });
      setIsEditModalVisible(false);
      Alert.alert("Success", "Expense updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update expense");
    }
  };

  // Helper formatting functions
  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusPillColors = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "rgba(34, 197, 94, 0.1)", text: colors.tulsiGreen, border: "rgba(34, 197, 94, 0.2)" };
      case "approved":
        return { bg: "rgba(59, 130, 246, 0.1)", text: "#2563EB", border: "rgba(59, 130, 246, 0.2)" };
      case "rejected":
        return { bg: "rgba(239, 68, 68, 0.1)", text: colors.kumkumRed, border: "rgba(239, 68, 68, 0.2)" };
      default: // pending_approval
        return { bg: "rgba(234, 179, 8, 0.1)", text: colors.haldiYellow, border: "rgba(234, 179, 8, 0.2)" };
    }
  };

  // Filtered dataset
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp: any) => {
      // 1. Text Search query matching title, vendor or category
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = exp.title?.toLowerCase().includes(query);
        const matchesCategory = exp.category?.name?.toLowerCase().includes(query);
        const matchesVendor = exp.vendor?.business_name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesVendor) return false;
      }

      // 2. Payment Mode filter
      if (selectedModeFilter) {
        if (exp.payment_mode !== selectedModeFilter) return false;
      }

      // 3. Month Filter
      if (selectedMonthFilter !== null && exp.expense_date) {
        const dateObj = new Date(exp.expense_date);
        if (!isNaN(dateObj.getTime())) {
          if (dateObj.getMonth() !== selectedMonthFilter) return false;
        }
      }

      // 4. Date Range Filter
      if (startDateStr && exp.expense_date) {
        if (exp.expense_date < startDateStr) return false;
      }
      if (endDateStr && exp.expense_date) {
        if (exp.expense_date > endDateStr) return false;
      }

      return true;
    });
  }, [expenses, searchQuery, selectedModeFilter, selectedMonthFilter, startDateStr, endDateStr]);

  const paginatedExpenses = useMemo(() => {
    return filteredExpenses.slice(0, visibleCount);
  }, [filteredExpenses, visibleCount]);

  const handleLoadMore = () => {
    if (visibleCount < filteredExpenses.length) {
      setVisibleCount((prev) => prev + 15);
    }
  };

  // Recalculate dynamic KPIs based on active filtered dataset
  const kpis = useMemo(() => {
    let totalPaid = 0;
    let pendingApprovalCount = 0;
    let approvedUnpaidTotal = 0;

    filteredExpenses.forEach((exp: any) => {
      const amount = parseFloat(exp.amount) || 0;
      if (exp.status === "paid") {
        totalPaid += amount;
      } else if (exp.status === "pending_approval") {
        pendingApprovalCount += 1;
      } else if (exp.status === "approved") {
        approvedUnpaidTotal += amount;
      }
    });

    return { totalPaid, pendingApprovalCount, approvedUnpaidTotal };
  }, [filteredExpenses]);

  // Export PDF Report function
  const handleExportPDF = async () => {
    if (filteredExpenses.length === 0) {
      Alert.alert("No Data", "There are no expenses in the filtered list to export.");
      return;
    }

    const rowsHtml = filteredExpenses
      .map(
        (exp: any, index: number) => `
        <tr style="background-color: ${index % 2 === 0 ? "#FFFFFF" : "#FDFBF7"}; border-bottom: 1px solid #EAE6DF;">
          <td style="padding: 10px; font-size: 11px; color: #1E1B18;">${exp.expense_date || "-"}</td>
          <td style="padding: 10px; font-size: 11px; font-weight: bold; color: #1E1B18;">${exp.title || "-"}</td>
          <td style="padding: 10px; font-size: 11px; color: #5C5549;">${exp.category?.name || "General"}</td>
          <td style="padding: 10px; font-size: 11px; color: #5C5549;">${exp.vendor?.business_name || "None"}</td>
          <td style="padding: 10px; font-size: 11px; text-transform: uppercase; font-weight: bold; color: ${
            exp.status === "paid" ? "#22C55E" : exp.status === "approved" ? "#2563EB" : exp.status === "rejected" ? "#EF4444" : "#EAB308"
          };">${exp.status}</td>
          <td style="padding: 10px; font-size: 11px; text-align: right; font-weight: bold; color: #1E1B18;">₹${(parseFloat(exp.amount) || 0).toLocaleString("en-IN")}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1E1B18; padding: 20px; background-color: #FCFBF9; }
            .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #D3BFA7; padding-bottom: 15px; margin-bottom: 20px; }
            .mandal-title { font-size: 22px; font-weight: bold; color: #8C5000; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
            .mandal-sub { font-size: 12px; color: #5C5549; margin: 4px 0 0 0; }
            .report-title { font-size: 14px; font-weight: bold; color: #A8201A; text-align: right; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .meta-date { font-size: 11px; color: #8C8270; text-align: right; margin-top: 4px; }
            .kpi-grid { display: flex; gap: 15px; margin-bottom: 25px; }
            .kpi-card { flex: 1; background-color: #FFFFFF; border: 1px solid #EAE6DF; border-radius: 8px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            .kpi-title { font-size: 10px; font-weight: bold; color: #8C8270; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px; }
            .kpi-value { font-size: 18px; font-weight: bold; color: #8C5000; margin: 0; }
            .kpi-count { font-size: 16px; font-weight: bold; color: #A8201A; margin: 0; }
            table { width: 100%; border-collapse: collapse; background-color: #FFFFFF; margin-top: 10px; }
            th { background-color: #8C5000; color: #FFFFFF; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 10px; text-align: left; letter-spacing: 0.5px; }
            td { border-bottom: 1px solid #EAE6DF; }
            .footer { margin-top: 40px; border-top: 1px solid #EAE6DF; padding-top: 15px; display: flex; justify-content: space-between; font-size: 10px; color: #8C8270; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="mandal-title">UTSAV Mandal Expenses</h1>
              <p class="mandal-sub">Official Festival Expenditure & Disbursement Ledger</p>
            </div>
            <div>
              <h2 class="report-title">Financial Report</h2>
              <p class="meta-date">Exported on: ${new Date().toLocaleDateString("en-IN")} | By: ${userFullName || "Mandal Administrator"}</p>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <p class="kpi-title">Total Disbursed (Paid)</p>
              <p class="kpi-value">₹${kpis.totalPaid.toLocaleString("en-IN")}</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-title">Approved (Unpaid)</p>
              <p class="kpi-value" style="color: #2563EB;">₹${kpis.approvedUnpaidTotal.toLocaleString("en-IN")}</p>
            </div>
            <div class="kpi-card">
              <p class="kpi-title">Pending Approvals</p>
              <p class="kpi-count">${kpis.pendingApprovalCount} Vouchers</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Date</th>
                <th style="width: 25%;">Voucher Title</th>
                <th style="width: 20%;">Category</th>
                <th style="width: 15%;">Vendor</th>
                <th style="width: 12%;">Status</th>
                <th style="width: 13%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated via UTSAV Mandal Mobile Client</p>
            <p>Page 1 of 1</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Export Expenses Report" });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate report file.");
    }
  };

  const renderExpenseItem = ({ item }: { item: any }) => {
    const statusTheme = statusPillColors(item.status);
    const categoryName = item.category?.name || "None / General";
    const vendorName = item.vendor?.business_name || null;
    const categoryColor = item.category?.color || colors.primaryBrand;

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {/* Category Avatar Box */}
            <View style={[styles.avatarCircle, { backgroundColor: `${categoryColor}15` }]}>
              <MaterialCommunityIcons
                name={(item.category?.icon as any) || "cash-register"}
                size={20}
                color={categoryColor}
              />
            </View>
            <View style={styles.infoWrapper}>
              <Text style={styles.rowName} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.rowCategory}>{categoryName}</Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.rowAmount}>{formatRupee(item.amount)}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusTheme.bg, borderColor: statusTheme.border }]}>
              <Text style={[styles.statusText, { color: statusTheme.text }]}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <Text style={styles.rowDate}>📅 {item.expense_date}</Text>
            {vendorName && (
              <>
                <Text style={styles.bulletDot}>•</Text>
                <View style={styles.vendorTag}>
                  <Text style={styles.vendorTagText} numberOfLines={1}>🏬 {vendorName}</Text>
                </View>
              </>
            )}
          </View>
          {item.payment_mode && (
            <View style={styles.modeBadge}>
              <MaterialCommunityIcons name="wallet-outline" size={12} color={colors.onSurfaceVariant} />
              <Text style={styles.modeBadgeText}>{item.payment_mode.replace("_", " ").toUpperCase()}</Text>
            </View>
          )}
        </View>

        {item.description ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText} numberOfLines={2}>📝 {item.description}</Text>
          </View>
        ) : null}

        {/* Action Rows */}
        {isEditable(item) && (
          <TouchableOpacity
            style={styles.editActionBtn}
            onPress={() => handleEditPress(item)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.primaryBrand} />
            <Text style={styles.editActionBtnText}>Edit Expense Details</Text>
          </TouchableOpacity>
        )}

        {hasAdminAccess && item.status === "pending_approval" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleApprove(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleReject(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasAdminAccess && item.status === "approved" && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => handlePay(item.id)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="check-decagram" size={16} color="#FFFFFF" />
            <Text style={styles.payBtnText}>Record Cash Disbursement</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
          <Text style={styles.logoText}>Mandal Expenses</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(dashboard)/add-expense")}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={paginatedExpenses}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listScroll}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          visibleCount < filteredExpenses.length ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.primaryBrand} />
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* KPI Cards section */}
            <View style={styles.kpiRow}>
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.08)", "rgba(34, 197, 94, 0.03)"]}
                style={styles.kpiCard}
              >
                <View style={styles.kpiCardHeader}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.tulsiGreen} />
                  <Text style={styles.kpiTitle}>Total Paid</Text>
                </View>
                <Text style={styles.kpiValue} numberOfLines={1}>{formatRupee(kpis.totalPaid)}</Text>
              </LinearGradient>

              <LinearGradient
                colors={["rgba(59, 130, 246, 0.08)", "rgba(59, 130, 246, 0.03)"]}
                style={styles.kpiCard}
              >
                <View style={styles.kpiCardHeader}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color="#2563EB" />
                  <Text style={styles.kpiTitle}>Approved</Text>
                </View>
                <Text style={[styles.kpiValue, { color: "#2563EB" }]} numberOfLines={1}>
                  {formatRupee(kpis.approvedUnpaidTotal)}
                </Text>
              </LinearGradient>

              <LinearGradient
                colors={["rgba(234, 179, 8, 0.08)", "rgba(234, 179, 8, 0.03)"]}
                style={styles.kpiCard}
              >
                <View style={styles.kpiCardHeader}>
                  <MaterialCommunityIcons name="alert-decagram-outline" size={18} color={colors.haldiYellow} />
                  <Text style={styles.kpiTitle}>Pending</Text>
                </View>
                <Text style={[styles.kpiValue, { color: colors.haldiYellow }]} numberOfLines={1}>
                  {kpis.pendingApprovalCount}
                </Text>
              </LinearGradient>
            </View>

            {/* Actions Bar (Export & Toggle Filters) */}
            <View style={styles.actionsBar}>
              <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF} activeOpacity={0.8}>
                <MaterialCommunityIcons name="file-pdf-box" size={18} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Export PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterToggleBtn, showFilters && styles.filterToggleBtnActive]}
                onPress={() => setShowFilters(!showFilters)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="filter-variant"
                  size={18}
                  color={showFilters ? "#FFFFFF" : colors.primaryBrand}
                />
                <Text style={[styles.filterToggleText, showFilters && styles.filterToggleTextActive]}>
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search title, category, or vendor..."
                placeholderTextColor={colors.onSurfaceVariant}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <View style={styles.filtersPanel}>
                <Text style={styles.panelSectionTitle}>Payment Mode</Text>
                <View style={styles.filterChipsRow}>
                  <TouchableOpacity
                    style={[styles.filterChip, !selectedModeFilter && styles.filterChipActive]}
                    onPress={() => setSelectedModeFilter(null)}
                  >
                    <Text style={[styles.filterChipText, !selectedModeFilter && styles.filterChipTextActive]}>All Modes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, selectedModeFilter === "cash" && styles.filterChipActive]}
                    onPress={() => setSelectedModeFilter("cash")}
                  >
                    <Text style={[styles.filterChipText, selectedModeFilter === "cash" && styles.filterChipTextActive]}>Cash</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, selectedModeFilter === "bank_transfer" && styles.filterChipActive]}
                    onPress={() => setSelectedModeFilter("bank_transfer")}
                  >
                    <Text style={[styles.filterChipText, selectedModeFilter === "bank_transfer" && styles.filterChipTextActive]}>Bank</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterChip, selectedModeFilter === "upi" && styles.filterChipActive]}
                    onPress={() => setSelectedModeFilter("upi")}
                  >
                    <Text style={[styles.filterChipText, selectedModeFilter === "upi" && styles.filterChipTextActive]}>UPI</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.panelSectionTitle, { marginTop: 12 }]}>Filter by Month</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[{ name: "All", index: null }, ...months.map((m, i) => ({ name: m, index: i }))]}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.horizontalMonthList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.monthChip, selectedMonthFilter === item.index && styles.monthChipActive]}
                      onPress={() => setSelectedMonthFilter(item.index)}
                    >
                      <Text style={[styles.monthChipText, selectedMonthFilter === item.index && styles.monthChipTextActive]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />

                <Text style={[styles.panelSectionTitle, { marginTop: 12 }]}>Date Range</Text>
                <View style={styles.dateInputsRow}>
                  <TouchableOpacity
                    style={styles.dateInputButton}
                    onPress={() => setShowStartDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateInputButtonText, startDateStr ? styles.dateInputButtonTextActive : null]}>
                      {startDateStr ? startDateStr : "Start Date"}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={16} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  <View style={styles.dateInputDivider}>
                    <Text style={styles.dateInputDividerText}>to</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dateInputButton}
                    onPress={() => setShowEndDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateInputButtonText, endDateStr ? styles.dateInputButtonTextActive : null]}>
                      {endDateStr ? endDateStr : "End Date"}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={16} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.clearFiltersBtn}
                  onPress={() => {
                    setSelectedModeFilter(null);
                    setSelectedMonthFilter(null);
                    setStartDateStr("");
                    setEndDateStr("");
                    setSearchQuery("");
                  }}
                >
                  <Text style={styles.clearFiltersText}>Reset All Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loadingExpenses ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primaryContainer} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💵</Text>
              <Text style={styles.emptyText}>No expenses match the filter criteria.</Text>
            </View>
          )
        }
      />

      <DatePickerModal
        visible={showStartDatePicker}
        value={startDateStr}
        onSelect={(date) => setStartDateStr(date)}
        onClose={() => setShowStartDatePicker(false)}
        title="Select Start Date"
      />

      <DatePickerModal
        visible={showEndDatePicker}
        value={endDateStr}
        onSelect={(date) => setEndDateStr(date)}
        onClose={() => setShowEndDatePicker(false)}
        title="Select End Date"
      />

      {/* Edit Expense Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalSafeArea} edges={["top", "bottom"]}>
          <View style={styles.editModalContainer}>
            {/* Modal Header */}
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Expense Voucher</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.editModalCloseBtn}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalScrollView} contentContainerStyle={styles.editModalScrollContent}>
              {/* Form Input fields */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title / Purpose *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Flower decorations"
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount (₹) *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={editAmount}
                  onChangeText={setEditAmount}
                />
              </View>

              {/* Category selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setShowEditCategorySelector(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorBtnText}>{editCategoryName}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {/* Vendor selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Vendor</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setShowEditVendorSelector(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorBtnText}>{editVendorName}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {/* Expense Date selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Expense Date *</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setShowEditDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorBtnText}>{editExpenseDate || "Select Date"}</Text>
                  <MaterialCommunityIcons name="calendar" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {/* Payment Mode */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Payment Mode *</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setShowEditPaymentModeSelector(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorBtnText}>
                    {editPaymentMode.replace("_", " ").toUpperCase()}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {/* GST Amount */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>GST Amount (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00 (optional)"
                  keyboardType="numeric"
                  value={editGstAmount}
                  onChangeText={setEditGstAmount}
                />
              </View>

              {/* Receipt File upload */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Receipt / Invoice Proof</Text>
                <View style={styles.receiptUploadContainer}>
                  {editReceiptUrl ? (
                    <View style={styles.receiptPreviewWrapper}>
                      <Text style={styles.receiptPreviewText} numberOfLines={1}>
                        {editReceiptUrl.startsWith("data:image/") ? "New Receipt Selected" : "Current Receipt Uploaded"}
                      </Text>
                      <TouchableOpacity
                        style={styles.clearReceiptBtn}
                        onPress={() => setEditReceiptUrl("")}
                      >
                        <MaterialCommunityIcons name="delete-outline" size={20} color={colors.kumkumRed} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadReceiptBtn}
                      onPress={handleEditUploadReceipt}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <ActivityIndicator size="small" color={colors.primaryBrand} />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="camera-plus-outline" size={22} color={colors.primaryBrand} />
                          <Text style={styles.uploadReceiptBtnText}>Attach Image (PNG/JPG/JPEG Max 1MB)</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Notes / Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe the reason/details of this expense..."
                  multiline
                  numberOfLines={4}
                  value={editNotes}
                  onChangeText={setEditNotes}
                />
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={[styles.modalFooterBtn, styles.cancelFooterBtn]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={updateMutation.isPending}
              >
                <Text style={styles.cancelFooterBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalFooterBtn, styles.saveFooterBtn]}
                onPress={handleUpdateSubmit}
                disabled={updateMutation.isPending || isUploading}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveFooterBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Category picker modal */}
      <Modal visible={showEditCategorySelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowEditCategorySelector(false)}>
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
                      setEditCategoryId("");
                      setEditCategoryName("None / General");
                      setShowEditCategorySelector(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>None / General</Text>
                  </TouchableOpacity>
                  {categories.map((cat: any) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.modalItem}
                      onPress={() => {
                        setEditCategoryId(cat.id);
                        setEditCategoryName(cat.name);
                        setShowEditCategorySelector(false);
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

      {/* Edit Vendor picker modal */}
      <Modal visible={showEditVendorSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vendor</Text>
              <TouchableOpacity onPress={() => setShowEditVendorSelector(false)}>
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
                      setEditVendorId("");
                      setEditVendorName("None");
                      setShowEditVendorSelector(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>None</Text>
                  </TouchableOpacity>
                  {vendors.map((vendor: any) => (
                    <TouchableOpacity
                      key={vendor.id}
                      style={styles.modalItem}
                      onPress={() => {
                        setEditVendorId(vendor.id);
                        setEditVendorName(vendor.name);
                        setShowEditVendorSelector(false);
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

      {/* Edit Payment Mode picker modal */}
      <Modal visible={showEditPaymentModeSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Mode</Text>
              <TouchableOpacity onPress={() => setShowEditPaymentModeSelector(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {["cash", "bank_transfer", "upi", "cheque"].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={styles.modalItem}
                  onPress={() => {
                    setEditPaymentMode(mode as any);
                    setShowEditPaymentModeSelector(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{mode.replace("_", " ").toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Date picker modal */}
      <DatePickerModal
        visible={showEditDatePicker}
        value={editExpenseDate}
        onSelect={(dateStr) => {
          if (dateStr) setEditExpenseDate(dateStr);
        }}
        onClose={() => setShowEditDatePicker(false)}
        title="Select Expense Date"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  appBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  logoText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  addButton: {
    backgroundColor: colors.primaryBrand,
    borderRadius: borderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  listScroll: {
    paddingBottom: 110,
    gap: spacing.sm,
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  kpiRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    backgroundColor: "#FFFFFF",
  },
  kpiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  kpiTitle: {
    fontSize: 9,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.tulsiGreen,
    marginTop: 4,
  },
  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  exportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.kumkumRed,
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    gap: 6,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.inter.bold,
  },
  filterToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryBrand,
    borderRadius: borderRadius.lg,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: "#FFFFFF",
  },
  filterToggleBtnActive: {
    backgroundColor: colors.primaryBrand,
  },
  filterToggleText: {
    color: colors.primaryBrand,
    fontSize: 13,
    fontFamily: fonts.inter.bold,
  },
  filterToggleTextActive: {
    color: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
    paddingVertical: 8,
  },
  filtersPanel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  panelSectionTitle: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.onSurface,
    marginBottom: 4,
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.primaryBrand,
    borderColor: colors.primaryBrand,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  horizontalMonthList: {
    gap: 6,
    paddingVertical: 4,
  },
  monthChip: {
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  monthChipActive: {
    backgroundColor: colors.aartiGold,
    borderColor: colors.aartiGold,
  },
  monthChipText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  monthChipTextActive: {
    color: "#FFFFFF",
  },
  dateInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  dateInputDivider: {
    paddingHorizontal: 4,
  },
  dateInputDividerText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
  },
  dateInputButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.pujaWhite,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
  },
  dateInputButtonText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  dateInputButtonTextActive: {
    color: colors.onSurface,
    fontFamily: fonts.inter.bold,
  },
  clearFiltersBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.kumkumRed,
  },
  cardItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.2,
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoWrapper: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.bold,
  },
  rowCategory: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    marginTop: 1,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
    flex: 0.8,
    gap: 4,
  },
  rowAmount: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  statusText: {
    fontSize: 8,
    fontFamily: fonts.inter.bold,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1.2,
  },
  rowDate: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  bulletDot: {
    color: colors.onSurfaceVariant,
    fontSize: 8,
  },
  vendorTag: {
    backgroundColor: "rgba(140, 80, 0, 0.05)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
    maxWidth: 120,
  },
  vendorTagText: {
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  modeBadgeText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  notesContainer: {
    backgroundColor: colors.pujaWhite,
    padding: 8,
    borderRadius: borderRadius.md,
    marginTop: 4,
  },
  notesText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: colors.primaryBrand,
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  rejectBtnText: {
    color: colors.kumkumRed,
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
  },
  payBtn: {
    backgroundColor: colors.tulsiGreen,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    textAlign: "center",
  },
  editActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  editActionBtnText: {
    color: colors.primaryBrand,
    fontSize: 12,
    fontFamily: fonts.inter.bold,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    backgroundColor: "#FFFFFF",
  },
  editModalTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  editModalCloseBtn: {
    padding: 4,
  },
  editModalScrollView: {
    flex: 1,
  },
  editModalScrollContent: {
    padding: 20,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  textInput: {
    height: 48,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
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
    color: colors.onSurface,
  },
  receiptUploadContainer: {
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  receiptPreviewWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 48,
  },
  receiptPreviewText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.tulsiGreen,
    flex: 1,
  },
  clearReceiptBtn: {
    padding: 8,
  },
  uploadReceiptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    gap: 8,
  },
  uploadReceiptBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  editModalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
    padding: 16,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  modalFooterBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelFooterBtn: {
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  cancelFooterBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  saveFooterBtn: {
    backgroundColor: colors.primaryBrand,
  },
  saveFooterBtnText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
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
    color: colors.primaryBrand,
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
});

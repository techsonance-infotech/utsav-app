import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
  Alert,
  FlatList,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import {
  useFetchCampaigns,
  useCreateRazorpayOrder,
  useCreateDonation,
  useFetchDonations,
  useFetchMyProfile,
  useFetchTenant,
  useUpdateDonation,
} from "@utsav/api-client";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import DatePickerModal from "../components/DatePickerModal";
import { ScreenHeader } from "../components/ScreenHeader";


const { width } = Dimensions.get("window");

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

interface PhoneInputProps {
  value: string;
  onChangeText: (t: string) => void;
  editable?: boolean;
}

function PhoneInput({
  value,
  onChangeText,
  editable = true,
}: PhoneInputProps) {
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
    <View style={styles.floatingPhoneInputRow}>
      <View style={styles.floatingCountryCodeBox}>
        <Text style={styles.floatingCountryCodeText}>+91</Text>
      </View>
      <View style={[styles.floatingPhoneNumContainer, isFocused && styles.floatingInputFocused]}>
        <Animated.Text style={labelStyle}>Donor Mobile Number (10 digits)</Animated.Text>
        <TextInput
          style={styles.floatingPhoneTextInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="phone-pad"
          maxLength={10}
          editable={editable}
          placeholder=""
        />
      </View>
    </View>
  );
}

export default function MobileDonateScreen() {
  const params = useLocalSearchParams();
  const campaignIdParam = (params.campaign_id as string) || "";

  const { tenantId, role, userFullName } = useAuthStore();
  const { data: tenant } = useFetchTenant(tenantId);
  const { data: myProfile } = useFetchMyProfile();
  const { data: campaigns } = useFetchCampaigns();
  const { data: donations, isLoading: isLedgerLoading, refetch: refetchLedger } = useFetchDonations();
  const createOrderMutation = useCreateRazorpayOrder();
  const createOfflineMutation = useCreateDonation();
  const updateDonationMutation = useUpdateDonation();

  // Navigation tab state: "ledger" or "form"
  const [activeTab, setActiveTab] = useState<"ledger" | "form">("ledger");

  // Search & Advanced Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModeFilter, setSelectedModeFilter] = useState<string | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | null>(null);
  const [startDateStr, setStartDateStr] = useState(""); // YYYY-MM-DD
  const [endDateStr, setEndDateStr] = useState(""); // YYYY-MM-DD
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Form states
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorAddress, setDonorAddress] = useState(""); // House No / Address
  const [amount, setAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(campaignIdParam);
  const [mode, setMode] = useState("online"); // online or cash
  const [status, setStatus] = useState("confirmed"); // confirmed or pending (paid / due)
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockOrderData, setMockOrderData] = useState<any>(null);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  // Edit Modal states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingDonation, setEditingDonation] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCampaign, setEditCampaign] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editStatus, setEditStatus] = useState<"confirmed" | "pending">("confirmed");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (campaignIdParam) {
      setSelectedCampaign(campaignIdParam);
      setActiveTab("form");
    }
  }, [campaignIdParam]);

  const quickAmounts = [501, 1100, 2100, 5100, 11000];
  const allowedOffline = ["owner", "admin", "treasurer", "committee_member"].includes(role || "");
  const canEdit = ["owner", "admin", "treasurer"].includes(role || "");

  const handleDonate = async () => {
    setErrorMsg("");
    if (!donorName.trim()) return setErrorMsg("Name is required");
    
    if (donorPhone) {
      const cleaned = donorPhone.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        return setErrorMsg("Please enter a valid 10-digit mobile number");
      }
    }

    if (donorEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(donorEmail.trim())) {
        return setErrorMsg("Please enter a valid email address");
      }
    }

    if (!amount || parseFloat(amount) <= 0) return setErrorMsg("Enter a positive amount");

    setIsProcessing(true);

    try {
      if (mode === "cash" || mode === "online") {
        // Record immediate donation (cash or static QR online checkout)
        const res = await createOfflineMutation.mutateAsync({
          donor_name: donorName,
          donor_phone: donorPhone || undefined,
          donor_email: donorEmail || undefined,
          donor_address: donorAddress || undefined,
          amount: parseFloat(amount),
          mode: mode,
          campaign_id: selectedCampaign || undefined,
          is_anonymous: isAnonymous,
          note: note || undefined,
          status: status,
        });

        setSuccessReceipt({
          receipt_number: res.receipt_number || `RCPT-${Math.floor(Math.random() * 90000) + 10000}`,
          amount: res.amount,
          donor_name: res.donor_name,
          mode: mode === "cash" ? "Cash" : "Online (UPI QR)",
        });
        
        // Reset form
        setDonorName("");
        setDonorPhone("");
        setDonorEmail("");
        setDonorAddress("");
        setAmount("");
        setSelectedCampaign("");
        setNote("");
        refetchLedger();
      } else {
        // Online order fallback simulation (Razorpay gateway)
        const order = await createOrderMutation.mutateAsync({
          donor_name: donorName,
          donor_phone: donorPhone || undefined,
          donor_email: donorEmail || undefined,
          amount: parseFloat(amount),
          campaign_id: selectedCampaign || undefined,
          is_anonymous: isAnonymous,
          note: note || undefined,
        });

        // Open sandbox payment selector simulation
        setMockOrderData(order);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record transaction.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!mockOrderData) return;
    setIsProcessing(true);

    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;

      // Call webhook API from mobile client to trigger mock confirmed status
      const res = await fetch(`https://utsav.app/api/v1/webhooks/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "sandbox_bypass_signature",
        },
        body: JSON.stringify({
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: mockPaymentId,
                order_id: mockOrderData.id,
                amount: parseFloat(amount) * 100,
                status: "captured",
              },
            },
          },
        }),
      });

      setSuccessReceipt({
        receipt_number: `RCPT-${Math.floor(Math.random() * 90000) + 10000}`,
        amount: parseFloat(amount),
        donor_name: donorName,
        mode: "Online (Razorpay)",
        payment_id: mockPaymentId,
      });

      // Reset form
      setDonorName("");
      setDonorPhone("");
      setDonorEmail("");
      setDonorAddress("");
      setAmount("");
      setSelectedCampaign("");
      setNote("");
      setMockOrderData(null);
      refetchLedger();
    } catch (err) {
      setErrorMsg("Simulation request failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditModal = (don: any) => {
    if (!canEdit) return;
    setEditingDonation(don);
    setEditName(don.donor_name);
    setEditPhone(don.donor_phone || "");
    setEditEmail(don.donor_email || "");
    setEditAddress(don.donor_address || "");
    setEditAmount(don.amount.toString());
    setEditCampaign(don.campaign_id || "");
    setEditNote(don.note || "");
    setEditStatus(don.status === "confirmed" ? "confirmed" : "pending");
    setIsEditModalVisible(true);
  };

  const handleUpdateDonation = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Donor Name is required");
      return;
    }
    if (!editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert("Error", "Please enter a positive amount");
      return;
    }
    if (editPhone) {
      const cleaned = editPhone.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        Alert.alert("Error", "Please enter a valid 10-digit mobile number");
        return;
      }
    }

    setIsUpdating(true);
    try {
      await updateDonationMutation.mutateAsync({
        id: editingDonation.id,
        donor_name: editName,
        donor_phone: editPhone || null,
        donor_email: editEmail || null,
        donor_address: editAddress || null,
        amount: parseFloat(editAmount),
        campaign_id: editCampaign || null,
        note: editNote || null,
        status: editStatus,
      });
      setIsEditModalVisible(false);
      refetchLedger();
      Alert.alert("Success", "Donation record updated successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update donation");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getInitials = (name: string) => {
    if (!name) return "D";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Filter donations with all search inputs, mode, monthly and date-range filters
  const filteredDonations = donations?.filter((don) => {
    const matchesSearch =
      don.donor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      don.receipt_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMode = selectedModeFilter ? don.mode?.toLowerCase() === selectedModeFilter.toLowerCase() : true;
    
    // Month filter check
    let matchesMonth = true;
    if (selectedMonthFilter !== null) {
      const donDate = new Date(don.created_at);
      matchesMonth = donDate.getMonth() === selectedMonthFilter;
    }

    // Date range filter check
    let matchesDateRange = true;
    const donTime = new Date(don.created_at).getTime();
    if (startDateStr) {
      const startMs = new Date(startDateStr).getTime();
      if (!isNaN(startMs)) {
        matchesDateRange = matchesDateRange && donTime >= startMs;
      }
    }
    if (endDateStr) {
      const endMs = new Date(endDateStr + "T23:59:59.999Z").getTime();
      if (!isNaN(endMs)) {
        matchesDateRange = matchesDateRange && donTime <= endMs;
      }
    }

    return matchesSearch && matchesMode && matchesMonth && matchesDateRange;
  }) || [];

  // Compute KPI amounts dynamically from complete database records
  const totalLedgerSum = donations
    ? donations
        .filter((d) => d.status === "confirmed")
        .reduce((sum, d) => sum + Number(d.amount), 0)
    : 0;

  const todayLedgerSum = donations
    ? donations
        .filter((d) => d.status === "confirmed" && new Date(d.created_at).toDateString() === new Date().toDateString())
        .reduce((sum, d) => sum + Number(d.amount), 0)
    : 0;

  // PDF Export Logic
  const handleExportPDF = async () => {
    if (filteredDonations.length === 0) {
      Alert.alert("Export Error", "There are no donation records to export.");
      return;
    }

    try {
      const htmlContent = `
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #222; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2a014; padding-bottom: 10px; margin-bottom: 20px; }
            .logo-title { font-size: 24px; font-weight: bold; color: #ff9500; }
            .report-title { font-size: 14px; color: #555; text-align: right; }
            .kpi-row { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 20px; }
            .kpi-card { flex: 1; background: #fffdf9; border: 1px solid #f2e7d5; border-radius: 8px; padding: 12px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .kpi-lbl { font-size: 11px; text-transform: uppercase; color: #8c8270; font-weight: 700; letter-spacing: 0.5px; }
            .kpi-val { font-size: 20px; color: #b90d18; font-weight: 800; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f7f5f0; border-bottom: 2px solid #e0dcd3; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; color: #555; }
            td { padding: 8px; border-bottom: 1px solid #eeeae1; font-size: 11px; }
            .status-paid { color: #22c55e; font-weight: bold; }
            .status-due { color: #eab308; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 9px; color: #a09787; text-align: center; border-top: 1px solid #eeeae1; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-title">${(tenant?.name || "UTSAV").toUpperCase()} DONATIONS</div>
            <div class="report-title">
              <strong>Mandal Ledger Summary</strong><br/>
              Report Date: ${new Date().toLocaleDateString("en-IN")}
            </div>
          </div>

          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-lbl">Total Ledger Sum (Confirmed)</div>
              <div class="kpi-val">₹${totalLedgerSum.toLocaleString("en-IN")}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-lbl">Filtered Records Sum</div>
              <div class="kpi-val">₹${filteredDonations.reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString("en-IN")}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-lbl">Total Filtered Count</div>
              <div class="kpi-val">${filteredDonations.length} Entries</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Donor Name</th>
                <th>Phone No</th>
                <th>Address/House No</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDonations
                .map(
                  (don) => `
                <tr>
                  <td>${don.receipt_number || "-"}</td>
                  <td>${don.donor_name}</td>
                  <td>${don.donor_phone || "-"}</td>
                  <td>${don.donor_address || "-"}</td>
                  <td>${don.mode ? don.mode.toUpperCase() : "ONLINE"}</td>
                  <td><span class="${don.status === "confirmed" ? "status-paid" : "status-due"}">${don.status === "confirmed" ? "Paid" : "Due"}</span></td>
                  <td>₹${Number(don.amount).toLocaleString("en-IN")}</td>
                  <td>${new Date(don.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            ${tenant?.name || "UTSAV"} Mandal Management App • Production Generated Document
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (err: any) {
      Alert.alert("Export Failed", err.message || "Failed to generate report.");
    }
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const activeCampaigns = campaigns?.filter((c) => c.is_active) || [];

  const profileName = myProfile?.full_name || userFullName || "Devotee";
  const avatarUrl = myProfile?.avatar_url || null;
  const initials = profileName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Render method for dynamic card list
  const renderDonationItem = ({ item }: { item: any }) => {
    const isOnline = item.mode?.toLowerCase() !== "cash";
    const isPaid = item.status === "confirmed";

    return (
      <TouchableOpacity
        style={styles.cardItem}
        onPress={() => openEditModal(item)}
        disabled={!canEdit}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.avatarCircle, { backgroundColor: isOnline ? "rgba(201, 146, 26, 0.12)" : "rgba(217, 43, 43, 0.12)" }]}>
              <Text style={[styles.avatarText, { color: isOnline ? colors.aartiGold : colors.kumkumRed }]}>
                {getInitials(item.donor_name)}
              </Text>
            </View>
            <View style={styles.donorInfo}>
              <Text style={styles.rowName} numberOfLines={1} ellipsizeMode="tail">
                {item.donor_name || "Anonymous"}
              </Text>
              <Text style={styles.rowReceipt} numberOfLines={1} ellipsizeMode="tail">
                {item.receipt_number || "No Receipt"}
              </Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.rowAmount}>{formatRupee(item.amount)}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <MaterialCommunityIcons name="clock-outline" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.rowDate}>
              {new Date(item.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
            </Text>
            {item.campaign_id && (
              <>
                <Text style={styles.bulletDot}>•</Text>
                <View style={styles.campaignTag}>
                  <Text style={styles.campaignTagText} numberOfLines={1} ellipsizeMode="tail">
                    {campaigns?.find((c) => c.id === item.campaign_id)?.name || "Campaign"}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.cardFooterRight}>
            <View style={styles.modeBadge}>
              <MaterialCommunityIcons
                name={isOnline ? "credit-card-outline" : "cash"}
                size={12}
                color={colors.onSurfaceVariant}
              />
              <Text style={styles.modeBadgeText}>{isOnline ? "Online" : "Cash"}</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: isPaid ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)" }]}>
              <View style={[styles.statusDot, { backgroundColor: isPaid ? colors.tulsiGreen : colors.haldiYellow }]} />
              <Text style={[styles.statusBadgeText, { color: isPaid ? colors.tulsiGreen : colors.haldiYellow }]}>
                {isPaid ? "Paid" : "Due"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <ScreenHeader
        title="Donate"
        showBack={false}
        showLogo={false}
      />

      {/* Segmented Top Control Tab */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "ledger" && styles.tabButtonActive]}
          onPress={() => { setActiveTab("ledger"); setSuccessReceipt(null); }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={18}
            color={activeTab === "ledger" ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          />
          <Text style={[styles.tabText, activeTab === "ledger" && styles.tabTextActive]}>Donation Ledger</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "form" && styles.tabButtonActive]}
          onPress={() => setActiveTab("form")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={18}
            color={activeTab === "form" ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          />
          <Text style={[styles.tabText, activeTab === "form" && styles.tabTextActive]}>New Donation</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "ledger" ? (
        /* LEDGER VIEW */
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredDonations}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={renderDonationItem}
            contentContainerStyle={styles.ledgerScroll}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            windowSize={5}
            maxToRenderPerBatch={10}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                {/* KPI Metrics Cards */}
                <View style={styles.kpiRow}>
                  <LinearGradient
                    colors={["rgba(255, 149, 0, 0.08)", "rgba(255, 149, 0, 0.03)"]}
                    style={styles.kpiCard}
                  >
                    <View style={styles.kpiHeader}>
                      <MaterialCommunityIcons name="wallet-giftcard" size={20} color={colors.primaryBrand} />
                      <Text style={styles.kpiTitle}>Total Donations</Text>
                    </View>
                    <Text style={styles.kpiValue} numberOfLines={1}>{formatRupee(totalLedgerSum)}</Text>
                  </LinearGradient>

                  <LinearGradient
                    colors={["rgba(211, 47, 47, 0.08)", "rgba(211, 47, 47, 0.03)"]}
                    style={styles.kpiCard}
                  >
                    <View style={styles.kpiHeader}>
                      <MaterialCommunityIcons name="calendar-today" size={20} color={colors.kumkumRed} />
                      <Text style={styles.kpiTitle}>Today's Donations</Text>
                    </View>
                    <Text style={styles.kpiValue} numberOfLines={1}>{formatRupee(todayLedgerSum)}</Text>
                  </LinearGradient>
                </View>

                {/* Actions: Export PDF & Toggle Filters */}
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
                    <MaterialCommunityIcons name="filter-variant" size={18} color={showFilters ? "#FFFFFF" : colors.primaryBrand} />
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
                    placeholder="Search name or receipt ID..."
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
                        <MaterialCommunityIcons name="cash" size={14} color={selectedModeFilter === "cash" ? "#FFFFFF" : colors.onSurfaceVariant} />
                        <Text style={[styles.filterChipText, selectedModeFilter === "cash" && styles.filterChipTextActive]}>Cash</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.filterChip, selectedModeFilter === "online" && styles.filterChipActive]}
                        onPress={() => setSelectedModeFilter("online")}
                      >
                        <MaterialCommunityIcons name="cellphone-nfc" size={14} color={selectedModeFilter === "online" ? "#FFFFFF" : colors.onSurfaceVariant} />
                        <Text style={[styles.filterChipText, selectedModeFilter === "online" && styles.filterChipTextActive]}>Online</Text>
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
              isLedgerLoading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color={colors.primaryContainer} />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="cookie-clock-outline" size={48} color={colors.outline} />
                  <Text style={styles.emptyText}>No donations found matching criteria.</Text>
                </View>
              )
            }
          />

          {/* Quick Make Donation FAB */}
          <TouchableOpacity style={styles.makeDonationFab} onPress={() => setActiveTab("form")} activeOpacity={0.9}>
            <LinearGradient
              colors={["#ff9500", "#b90d18"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.makeDonationFabGrad}
            >
              <MaterialCommunityIcons name="heart-plus" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : successReceipt ? (
        /* SUCCESS RECEIPT VIEW */
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.successScroll}>
              <View style={styles.successCard}>
                <Text style={styles.successDiya}>🪔</Text>
                <Text style={styles.successTitle}>Aarti / Donation Received!</Text>
                <Text style={styles.successText}>
                  May the divine blessings bring joy, peace, and abundance to you and your family.
                </Text>

                <View style={styles.receiptCard}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Receipt Number:</Text>
                    <Text style={styles.receiptVal}>{successReceipt.receipt_number}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Donor Name:</Text>
                    <Text style={styles.receiptVal}>{successReceipt.donor_name}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Contribution Amount:</Text>
                    <Text style={[styles.receiptVal, styles.receiptAmount]}>{formatRupee(successReceipt.amount)}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Payment Mode:</Text>
                    <Text style={styles.receiptVal}>{successReceipt.mode}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setSuccessReceipt(null);
                    setActiveTab("ledger");
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>View Donation Ledger</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      ) : (
        /* FORM VIEW */
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.scrollContent}>
              <Text style={styles.formTitle}>Make Contribution</Text>
              <Text style={styles.formSubtitle}>Enter details to support your community initiatives.</Text>

              {errorMsg ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.secondaryBrand} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Status Selection */}
              {allowedOffline && (
                <View style={[styles.statusBanner, { marginBottom: spacing.md }]}>
                  <View style={styles.bannerLeft}>
                    <View style={[styles.paymentModeIcon, mode === "online" && { backgroundColor: "rgba(201, 146, 26, 0.12)" }]}>
                      <MaterialCommunityIcons
                        name={mode === "cash" ? "cash-multiple" : "qrcode-scan"}
                        size={20}
                        color={mode === "cash" ? colors.primaryContainer : colors.aartiGold}
                      />
                    </View>
                    <View style={{ flex: 1, flexShrink: 1 }}>
                      <Text style={styles.bannerLabel}>Payment Mode</Text>
                      <Text style={styles.bannerValue} numberOfLines={1} ellipsizeMode="tail">
                        {mode === "cash" ? "CASH" : "ONLINE"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusSelectGroup}>
                    <TouchableOpacity
                      onPress={() => setStatus("confirmed")}
                      style={[
                        styles.statusSelectBadge,
                        status === "confirmed" ? styles.statusSelectBadgeActiveConfirmed : styles.statusSelectBadgeInactive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusSelectBadgeText,
                          status === "confirmed" && styles.statusSelectBadgeTextActive,
                        ]}
                      >
                        PAID
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setStatus("pending")}
                      style={[
                        styles.statusSelectBadge,
                        status === "pending" ? styles.statusSelectBadgeActivePending : styles.statusSelectBadgeInactive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusSelectBadgeText,
                          status === "pending" && styles.statusSelectBadgeTextActive,
                        ]}
                      >
                        DUE
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    Amount (Rupees) <Text style={styles.required}>*</Text>
                  </Text>
                  <Text style={styles.requiredHint}>Required</Text>
                </View>
                <View style={styles.amountInputWrap}>
                  <Text style={styles.rupeePrefix}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor={colors.outline}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
              </View>

              {/* Preset Amounts */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Select Preset Amount</Text>
                <View style={styles.quickGrid}>
                  {quickAmounts.map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[styles.quickChip, amount === val.toString() && styles.quickChipActive]}
                      onPress={() => setAmount(val.toString())}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.quickText, amount === val.toString() && styles.quickTextActive]}>₹{val}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Donor Details Card */}
              <View style={styles.formCard}>
                <View style={styles.formCardHeader}>
                  <MaterialCommunityIcons name="account-outline" size={22} color={colors.aartiGold} />
                  <Text style={styles.formCardTitle}>Donor Information</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Full Name <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Rajesh Kumar"
                    placeholderTextColor={colors.outline}
                    value={donorName}
                    onChangeText={setDonorName}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Mobile Number (Optional)</Text>
                  <View style={styles.phoneInputWrap}>
                    <Text style={styles.phonePrefix}>+91</Text>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="98765 43210"
                      placeholderTextColor={colors.outline}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={donorPhone}
                      onChangeText={setDonorPhone}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. rajesh@example.com"
                    placeholderTextColor={colors.outline}
                    keyboardType="email-address"
                    value={donorEmail}
                    onChangeText={setDonorEmail}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>House No / Address (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Flat 101, Shanti Sadan"
                    placeholderTextColor={colors.outline}
                    value={donorAddress}
                    onChangeText={setDonorAddress}
                  />
                </View>
              </View>

              {/* Allocation & Method Selection */}
              <View style={styles.formSection}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Payment Method</Text>
                  <View style={styles.modeContainer}>
                    <TouchableOpacity
                      style={[styles.modeButton, mode === "online" && styles.modeButtonActive]}
                      onPress={() => setMode("online")}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.modeText, mode === "online" && styles.modeTextActive]}>Online Checkout</Text>
                    </TouchableOpacity>
                    {allowedOffline && (
                      <TouchableOpacity
                        style={[styles.modeButton, mode === "cash" && styles.modeButtonActive]}
                        onPress={() => setMode("cash")}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.modeText, mode === "cash" && styles.modeTextActive]}>Offline Cash</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* UPI QR Code Scanner section */}
                {mode === "online" && (
                  <View style={styles.qrContainer}>
                    <Text style={styles.qrSectionHeader}>Scan & Pay using UPI</Text>
                    {tenant?.banner_url ? (
                      <View style={styles.qrCard}>
                        {/* Golden corner borders styling */}
                        <View style={styles.qrBorderDecoration}>
                          <Image source={{ uri: tenant.banner_url }} style={styles.qrCodeImage} resizeMode="contain" />
                        </View>
                        <Text style={styles.qrScanInstructions}>Scan this QR code using GPay, PhonePe, Paytm, or any UPI app to complete payment.</Text>
                        <View style={styles.upiIconRow}>
                          <MaterialCommunityIcons name="google" size={16} color={colors.onSurfaceVariant} />
                          <Text style={styles.upiBrandText}>GPay</Text>
                          <Text style={styles.upiBrandDot}>•</Text>
                          <MaterialCommunityIcons name="cellphone-nfc" size={16} color={colors.onSurfaceVariant} />
                          <Text style={styles.upiBrandText}>PhonePe</Text>
                          <Text style={styles.upiBrandDot}>•</Text>
                          <MaterialCommunityIcons name="wallet" size={16} color={colors.onSurfaceVariant} />
                          <Text style={styles.upiBrandText}>Paytm</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.qrPlaceholderCard}>
                        <MaterialCommunityIcons name="qrcode-remove" size={40} color={colors.outline} />
                        <Text style={styles.qrPlaceholderTitle}>No QR Code Configured</Text>
                        <Text style={styles.qrPlaceholderText}>
                          The Mandal owner has not uploaded a UPI QR Code yet. They can add it from Settings → Edit Mandal details.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Campaign Designation</Text>
                  <View style={styles.dropdownWrap}>
                    <Text style={styles.dropdownSelected}>
                      {selectedCampaign === ""
                        ? "General Fund"
                        : activeCampaigns?.find((c) => c.id === selectedCampaign)?.name ?? "General Fund"}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.outline} />
                  </View>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[{ id: "", name: "General Fund" }, ...activeCampaigns]}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    contentContainerStyle={styles.campaignList}
                    style={{ marginTop: 8 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.campaignChip, selectedCampaign === item.id && styles.campaignChipActive]}
                        onPress={() => setSelectedCampaign(item.id)}
                      >
                        <Text style={[styles.campaignChipText, selectedCampaign === item.id && styles.campaignChipTextActive]}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Devotional Message / Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={note}
                    onChangeText={setNote}
                    placeholder="e.g. In memory of / Blessings for family"
                    placeholderTextColor={colors.outline}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleDonate} disabled={isProcessing} activeOpacity={0.8}>
                {isProcessing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Confirm Donation</Text>
                )}
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Edit Donation Modal (Allowed for Owner, Admin, Treasurer) */}
      {isEditModalVisible && (
        <Modal transparent={true} visible={isEditModalVisible} animationType="slide">
          <View style={styles.overlay}>
            <View style={[styles.modal, { maxHeight: "90%" }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Donation Entry</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.onSurface} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={[]}
                renderItem={() => null}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View style={styles.modalFormContent}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Donor Name *</Text>
                      <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Phone Number</Text>
                      <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} keyboardType="numeric" maxLength={10} />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email Address</Text>
                      <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>House No / Address</Text>
                      <TextInput style={styles.input} value={editAddress} onChangeText={setEditAddress} />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Donation Amount *</Text>
                      <TextInput style={styles.input} value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Payment Status</Text>
                      <View style={styles.modeContainer}>
                        <TouchableOpacity
                          style={[styles.modeButton, editStatus === "confirmed" && styles.modeButtonActive]}
                          onPress={() => setEditStatus("confirmed")}
                        >
                          <Text style={[styles.modeText, editStatus === "confirmed" && styles.modeTextActive]}>Paid (Confirmed)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modeButton, editStatus === "pending" && styles.modeButtonActive]}
                          onPress={() => setEditStatus("pending")}
                        >
                          <Text style={[styles.modeText, editStatus === "pending" && styles.modeTextActive]}>Due (Pending)</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Campaign Designation</Text>
                      <View style={styles.dropdownWrap}>
                        <Text style={styles.dropdownSelected}>
                          {editCampaign === ""
                            ? "General Fund"
                            : activeCampaigns?.find((c) => c.id === editCampaign)?.name ?? "General Fund"}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color={colors.outline} />
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.campaignList}
                        style={{ marginTop: 8 }}
                      >
                        {[{ id: "", name: "General Fund" }, ...activeCampaigns].map((item, index) => (
                          <TouchableOpacity
                            key={item.id || index.toString()}
                            style={[styles.campaignChip, editCampaign === item.id && styles.campaignChipActive]}
                            onPress={() => setEditCampaign(item.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.campaignChipText, editCampaign === item.id && styles.campaignChipTextActive]}>
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Notes</Text>
                      <TextInput style={[styles.input, styles.textArea]} value={editNote} onChangeText={setEditNote} multiline />
                    </View>
                  </View>
                }
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setIsEditModalVisible(false)}
                  disabled={isUpdating}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPay}
                  onPress={handleUpdateDonation}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalPayText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Mock payment modal overlay */}
      {mockOrderData && (
        <Modal transparent={true} visible={!!mockOrderData} animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Sandbox Checkout Emulator</Text>
              <Text style={styles.modalText}>Simulate transaction captures from your mobile device.</Text>

              <View style={styles.modalDetails}>
                <Text style={styles.modalDetailText}>Order: {mockOrderData.id}</Text>
                <Text style={styles.modalDetailText}>Amount: {formatRupee(mockOrderData.amount / 100)}</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setMockOrderData(null)} activeOpacity={0.8}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalPay} onPress={handleSimulatePayment} disabled={isProcessing} activeOpacity={0.8}>
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalPayText}>Simulate Capture</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
  logoAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.primaryBrand,
    backgroundColor: colors.cream,
  },
  logoAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  logoText: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.sandstone,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  headerAvatarText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 6,
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryContainer,
  },
  tabText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  tabTextActive: {
    color: colors.onPrimaryContainer,
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  kpiRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.5)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
  },
  kpiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  kpiTitle: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.kumkumRed,
    marginTop: 6,
  },
  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
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
  ledgerScroll: {
    paddingBottom: 110,
    gap: spacing.sm,
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
    flex: 1,
    gap: spacing.md,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 13,
    fontFamily: fonts.inter.bold,
  },
  donorInfo: {
    flex: 1,
    gap: 1,
  },
  rowName: {
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.bold,
  },
  rowReceipt: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  rowAmount: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
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
  campaignTag: {
    backgroundColor: "rgba(255, 149, 0, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
    maxWidth: 90,
  },
  campaignTagText: {
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  cardFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 0.9,
    justifyContent: "flex-end",
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  modeBadgeText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    textTransform: "uppercase",
  },
  makeDonationFab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    zIndex: 100,
  },
  makeDonationFabGrad: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    color: colors.onSurface,
    fontFamily: fonts.poppins.bold,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  formCard: {
    backgroundColor: "rgba(244, 241, 235, 0.5)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
    backgroundColor: colors.pujaWhite,
  },
  textArea: {
    height: 64,
    textAlignVertical: "top",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickChip: {
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
  },
  quickChipActive: {
    backgroundColor: colors.primaryContainer,
  },
  quickText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  quickTextActive: {
    color: colors.onPrimaryContainer,
  },
  modeContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.lg,
    backgroundColor: "#FFFFFF",
  },
  modeButtonActive: {
    borderColor: colors.primaryBrand,
    backgroundColor: "rgba(140, 80, 0, 0.05)",
  },
  modeText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  modeTextActive: {
    color: colors.primaryBrand,
  },
  campaignList: {
    gap: spacing.sm,
  },
  campaignChip: {
    backgroundColor: "rgba(232, 226, 214, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
    height: 36,
    justifyContent: "center",
    marginRight: 6,
  },
  campaignChipActive: {
    backgroundColor: colors.primaryBrand,
  },
  campaignChipText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  campaignChipTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: colors.primaryContainer,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginTop: spacing.md,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  modalFormContent: {
    gap: spacing.md,
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
    lineHeight: 18,
  },
  modalDetails: {
    backgroundColor: colors.pujaWhite,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: 4,
  },
  modalDetailText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.sandstone,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: borderRadius.lg,
  },
  modalCancelText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  modalPay: {
    flex: 2,
    backgroundColor: colors.primaryBrand,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: borderRadius.lg,
  },
  modalPayText: {
    fontSize: 14,
    color: "#FFFFFF",
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
  emptyText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorContainer,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    color: colors.secondaryBrand,
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    flex: 1,
  },
  successScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 40,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius["2xl"],
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.4)",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  successDiya: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  successTitle: {
    fontSize: 20,
    color: colors.onSurface,
    fontFamily: fonts.poppins.bold,
    textAlign: "center",
  },
  successText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  receiptCard: {
    width: "100%",
    backgroundColor: colors.pujaWhite,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
  },
  receiptVal: {
    fontSize: 13,
    color: colors.onSurface,
    fontFamily: fonts.inter.semibold,
  },
  receiptAmount: {
    fontSize: 15,
    color: colors.tulsiGreen,
    fontFamily: fonts.poppins.bold,
  },
  backButton: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: borderRadius.lg,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    color: colors.onPrimaryContainer,
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
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
  floatingPhoneInputRow: {
    flexDirection: "row",
    height: 56,
    gap: spacing.sm,
  },
  floatingCountryCodeBox: {
    width: 64,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingCountryCodeText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  floatingPhoneNumContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
  },
  floatingPhoneTextInput: {
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 14,
    color: colors.onSurface,
    fontFamily: fonts.inter.medium,
  },
  statusBanner: {
    backgroundColor: "rgba(244, 241, 235, 0.5)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  bannerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusSelectGroup: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    flexShrink: 0,
  },
  paymentModeIcon: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    padding: spacing.sm,
    borderRadius: 8,
  },
  bannerLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  bannerValue: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  statusSelectBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusSelectBadgeActiveConfirmed: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderColor: colors.tulsiGreen,
  },
  statusSelectBadgeActivePending: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    borderColor: colors.haldiYellow,
  },
  statusSelectBadgeInactive: {
    backgroundColor: "transparent",
    borderColor: colors.sandstone,
  },
  statusSelectBadgeText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.outline,
    letterSpacing: 0.5,
  },
  statusSelectBadgeTextActive: {
    color: colors.onSurface,
  },
  formCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  formCardTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  fieldGroup: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  phoneInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
  },
  phonePrefix: {
    fontSize: 14,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
  },
  dropdownWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownSelected: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurface,
  },
  amountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
  },
  rupeePrefix: {
    fontSize: 24,
    fontFamily: fonts.inter.regular,
    color: colors.outline,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontFamily: fonts.inter.regular,
    color: colors.primaryBrand,
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
  },
  required: {
    color: colors.kumkumRed,
  },
  requiredHint: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  formSection: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  qrContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  qrSectionHeader: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  qrCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  qrBorderDecoration: {
    padding: 8,
    borderWidth: 2,
    borderColor: colors.aartiGold,
    borderRadius: 16,
    borderStyle: "dashed",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginBottom: spacing.md,
  },
  qrCodeImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
  qrScanInstructions: {
    fontFamily: fonts.inter.medium,
    fontSize: 12,
    color: colors.charcoal,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  upiIconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.pujaWhite,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  upiBrandText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  upiBrandDot: {
    fontSize: 10,
    color: colors.outline,
  },
  qrPlaceholderCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: "rgba(255, 149, 0, 0.02)",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: 8,
  },
  qrPlaceholderTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  qrPlaceholderText: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 16,
  },
});

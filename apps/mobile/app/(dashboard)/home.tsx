import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import {
  useFinancialSummary,
  useEvents,
  useFetchDonations,
  useExpenses,
} from "@utsav/api-client";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { registerForPushNotifications } from "../lib/notifications";

const { width } = Dimensions.get("window");

export default function MobileHomeScreen() {
  const { tenantId, tenantName, role, userId } = useAuthStore();
  const { data: summary, isLoading: isSummaryLoading } = useFinancialSummary(tenantId);
  const { data: events, isLoading: isEventsLoading } = useEvents();
  const { data: donations } = useFetchDonations();
  const { data: expenses } = useExpenses();

  // State for FAB expansion
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;

  // Diya Pulse Animation
  const diyaPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    registerForPushNotifications();

    Animated.loop(
      Animated.sequence([
        Animated.timing(diyaPulse, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(diyaPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const toggleFab = () => {
    Animated.spring(fabAnim, {
      toValue: fabOpen ? 0 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
    setFabOpen(!fabOpen);
  };

  const hasFinanceAccess = ["owner", "admin", "treasurer", "committee_member"].includes(role || "");

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Derive countdown from the nearest upcoming event
  const upcomingEvent = events?.find((e: any) => new Date(e.start_at) > new Date());
  let daysRemaining: number | null = null;
  let countdownText = "12 Days to Ganesh Chaturthi";
  let countdownSubtitle = "The preparations are in full swing. Keep it up!";

  if (upcomingEvent) {
    const diffTime = new Date(upcomingEvent.start_at).getTime() - new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    countdownText = `${daysRemaining} Days to ${upcomingEvent.title}`;
    countdownSubtitle = upcomingEvent.description || "Festival preparations are underway. Tap to check details.";
  }

  // Combine real donations and expenses to show under Recent Activities
  const recentActivities: any[] = [];
  
  if (donations && donations.length > 0) {
    donations.slice(0, 2).forEach((don: any) => {
      recentActivities.push({
        id: `don-${don.id}`,
        type: "donation",
        title: `Donation from ${don.donor_name || "Anonymous Donor"}`,
        subtitle: `${don.note || "General Contribution"}`,
        value: formatRupee(don.amount),
        icon: "plus-circle",
        iconColor: colors.tulsiGreen,
        iconBg: "rgba(34, 197, 94, 0.1)",
        time: "Just now",
      });
    });
  }

  if (expenses && expenses.length > 0) {
    expenses.slice(0, 2).forEach((exp: any) => {
      recentActivities.push({
        id: `exp-${exp.id}`,
        type: "expense",
        title: `Expense: ${exp.description || exp.title || "Vendor Payment"}`,
        subtitle: `Logged by committee`,
        value: formatRupee(exp.amount),
        icon: "receipt",
        iconColor: colors.kumkumRed,
        iconBg: "rgba(217, 43, 43, 0.1)",
        time: "Today",
      });
    });
  }

  // Add default placeholders if empty
  if (recentActivities.length === 0) {
    recentActivities.push(
      {
        id: "act-1",
        type: "donation",
        title: "Donation from Rajesh Mehta",
        subtitle: "Aarti Sponsorship",
        value: "₹5,001",
        icon: "plus-circle",
        iconColor: colors.tulsiGreen,
        iconBg: "rgba(34, 197, 94, 0.1)",
        time: "2 hours ago",
      },
      {
        id: "act-2",
        type: "expense",
        title: "Expense: Mandap Flowers",
        subtitle: "Paid to floral decorator",
        value: "₹12,400",
        icon: "receipt",
        iconColor: colors.kumkumRed,
        iconBg: "rgba(217, 43, 43, 0.1)",
        time: "5 hours ago",
      },
      {
        id: "act-3",
        type: "update",
        title: "Volunteer Meeting Updated",
        subtitle: "Schedule changed by Admin",
        value: "",
        icon: "account-group",
        iconColor: colors.primaryContainer,
        iconBg: "rgba(255, 149, 0, 0.1)",
        time: "Yesterday • 6:30 PM",
      }
    );
  }

  // Quick Action Menu Animation Translations
  const fabRotation = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const menuTranslateY = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const menuOpacity = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoGroup}>
          <Image
            style={styles.logoAvatar}
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkaGZlWcWVao1wOw9nnmiyw1Sjc4dUKoqHFv4USXLKIzzs56UTJxFYKLSudOs1UCUTkODyZUtvnrdNkFvgOfYiZ4dGJZ9_tyo14Bm641x49TqKJKWHCPAmnPDUgDy7sSwByNnv_jNVG6fOM7oYRiK5ru9goAgM9y_OfFAWYypAEderPMlvdbQm0uW1H_2_mVW3NWLlzkixffoMHhCu6_CrUP4G9_ZRNGQVh4Zt53xrPzSZ6Ot6pC5u",
            }}
          />
          <Text style={styles.logoText}>UTSAV</Text>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => router.push("/(dashboard)/notifications")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greetings Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Jai Ganesh!</Text>
          <Text style={styles.greetingSub}>Here's your Mandal's summary for today.</Text>
        </View>

        {/* Festival Countdown Card */}
        <LinearGradient
          colors={["#ff9500", "#b90d18"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.countdownCard}
        >
          <View style={styles.countdownGlassOverlay} />
          <View style={styles.countdownContent}>
            <View style={styles.countdownLeft}>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownBadgeText}>Upcoming Festival</Text>
              </View>
              <Text style={styles.countdownTitle} numberOfLines={2}>
                {countdownText}
              </Text>
              <Text style={styles.countdownSub}>
                {countdownSubtitle}
              </Text>
            </View>
            <View style={styles.countdownRight}>
              <Animated.View style={{ transform: [{ scale: diyaPulse }] }}>
                <MaterialCommunityIcons name="fire" size={72} color={colors.haldiYellow} style={styles.diyaIconGlow} />
              </Animated.View>
            </View>
          </View>
        </LinearGradient>

        {/* Financial Section */}
        {hasFinanceAccess ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Financial Snapshot</Text>
              <TouchableOpacity onPress={() => router.push("/(dashboard)/donate")}>
                <Text style={styles.sectionLink}>View Ledger</Text>
              </TouchableOpacity>
            </View>
            {isSummaryLoading ? (
              <ActivityIndicator size="small" color={colors.primaryContainer} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.kpiCarousel}
              >
                {/* KPI Card 1 */}
                <View style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <MaterialCommunityIcons name="heart-flash" size={20} color={colors.tulsiGreen} />
                    <Text style={styles.kpiLabel}>Total Donations</Text>
                  </View>
                  <Text style={[styles.kpiValue, { color: colors.tulsiGreen }]}>
                    {formatRupee(summary?.total_donations || 1254000)}
                  </Text>
                  <View style={styles.kpiTrendContainer}>
                    <MaterialCommunityIcons name="trending-up" size={14} color={colors.tulsiGreen} />
                    <Text style={styles.kpiTrendText}>12% from last week</Text>
                  </View>
                </View>

                {/* KPI Card 2 */}
                <View style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <MaterialCommunityIcons name="cash-register" size={20} color={colors.haldiYellow} />
                    <Text style={styles.kpiLabel}>Pending Expenses</Text>
                  </View>
                  <Text style={[styles.kpiValue, { color: colors.haldiYellow }]}>
                    ₹45,000
                  </Text>
                  <Text style={styles.kpiSubText}>Due within 3 days</Text>
                </View>

                {/* KPI Card 3 */}
                <View style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <MaterialCommunityIcons name="wallet-outline" size={20} color={colors.primaryBrand} />
                    <Text style={styles.kpiLabel}>Net Balance</Text>
                  </View>
                  <Text style={[styles.kpiValue, { color: colors.primaryBrand }]}>
                    {formatRupee(summary?.net_balance || 842500)}
                  </Text>
                  <Text style={styles.kpiSubText}>Current Liquidity</Text>
                </View>
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📢 Financial ledgers are visible to the Mandal Committee members only. Regular updates will be posted soon.
            </Text>
          </View>
        )}

        {/* Bento Layout: Activities & Events */}
        <View style={styles.bentoContainer}>
          {/* Recent Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <View style={styles.activitiesCard}>
              {recentActivities.map((act) => (
                <TouchableOpacity key={act.id} style={styles.activityItem} activeOpacity={0.8}>
                  <View style={[styles.activityIconBg, { backgroundColor: act.iconBg }]}>
                    <MaterialCommunityIcons name={act.icon} size={20} color={act.iconColor} />
                  </View>
                  <View style={styles.activityTextContent}>
                    <Text style={styles.activityTitle}>{act.title}</Text>
                    <Text style={styles.activityTime}>{act.time}</Text>
                  </View>
                  {act.value ? (
                    <Text style={styles.activityValue}>{act.value}</Text>
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.viewAllActivitiesButton}
                onPress={() => router.push("/(dashboard)/donate")}
              >
                <Text style={styles.viewAllActivitiesText}>View All Activities</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upcoming Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => router.push("/(dashboard)/events")}>
                <Text style={styles.sectionLink}>Full Calendar</Text>
              </TouchableOpacity>
            </View>

            {isEventsLoading ? (
              <ActivityIndicator size="small" color={colors.primaryContainer} />
            ) : events && events.length > 0 ? (
              <View style={styles.eventsGrid}>
                {events.slice(0, 2).map((event: any, index: number) => {
                  const eventDate = new Date(event.start_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.eventCard}
                      onPress={() => router.push("/(dashboard)/events")}
                      activeOpacity={0.9}
                    >
                      <Image
                        style={styles.eventImage}
                        source={{
                          uri:
                            index === 0
                              ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBkA6EgiZ3X3xQP-c3TZEhiPM34Yin0b-I-PgNzhYBew44TCm4vKuXGCS-Qspzm_10Wa_wJ9kaTx6PziDypmRvy0uLSnqpxqU8k653pQXoYqn_VJcLpaSwMkdF1DDGiQIDlcCtuEA5-Pwl51BTmfRk8sXJiLixTHNpLPblGc9FoRjOG_W7WEMygHnUjFvJfogRdr1gC6Sft5X18UyykEMcoUu2UOlNWF8ur6iA7NgQ78XKtsyhnZQf5"
                              : "https://lh3.googleusercontent.com/aida-public/AB6AXuA4GiiqBDc0H0NFYbxy_Qcom3kL91fTvxrR34B78NLR9HV5841DKM54iSf1YtYu7wnhCPpaMkrrJUF5GuzwqcU1vHwFFb8ZMZwonUxRT7nxMMg1D7zvcD66-Jv6whsFsFFnJbYmXaPXPG8JiIb9iJPJfDaOSKd5UE0C1jCqENIyuRBiRDemCdLVs-sTYGaLNTuYM7ZpAPMmbbIV4tNEgTgt3eF8-Rim-v2cIns_5xPM0OnnXiqFZRpI",
                        }}
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(58, 53, 48, 0.95)"]}
                        style={styles.eventOverlay}
                      >
                        <View style={styles.eventBadge}>
                          <Text style={styles.eventBadgeText}>{eventDate}</Text>
                        </View>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.eventLocationRow}>
                          <MaterialCommunityIcons name="map-marker-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.eventLocationText}>{event.location || "Community Hall"}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.eventCard}>
                <Image
                  style={styles.eventImage}
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkA6EgiZ3X3xQP-c3TZEhiPM34Yin0b-I-PgNzhYBew44TCm4vKuXGCS-Qspzm_10Wa_wJ9kaTx6PziDypmRvy0uLSnqpxqU8k653pQXoYqn_VJcLpaSwMkdF1DDGiQIDlcCtuEA5-Pwl51BTmfRk8sXJiLixTHNpLPblGc9FoRjOG_W7WEMygHnUjFvJfogRdr1gC6Sft5X18UyykEMcoUu2UOlNWF8ur6iA7NgQ78XKtsyhnZQf5",
                  }}
                />
                <LinearGradient
                  colors={["transparent", "rgba(58, 53, 48, 0.95)"]}
                  style={styles.eventOverlay}
                >
                  <View style={[styles.eventBadge, { backgroundColor: colors.primaryContainer }]}>
                    <Text style={styles.eventBadgeText}>Aug 28</Text>
                  </View>
                  <Text style={styles.eventTitle}>Mandal decoration & Setup</Text>
                  <View style={styles.eventLocationRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.eventLocationText}>Main Chowk</Text>
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>
        </View>

        {/* Quick Links Accessibility Bento Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mandal Directory & Tools</Text>
          <View style={styles.quickLinksGrid}>
            <TouchableOpacity style={styles.quickLinkCard} onPress={() => router.push("/(dashboard)/members")}>
              <View style={[styles.quickLinkIconBg, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                <MaterialCommunityIcons name="account-group-outline" size={24} color={colors.primaryBrand} />
              </View>
              <Text style={styles.quickLinkLabel}>Members</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickLinkCard} onPress={() => router.push("/(dashboard)/expenses")}>
              <View style={[styles.quickLinkIconBg, { backgroundColor: "rgba(217, 43, 43, 0.08)" }]}>
                <MaterialCommunityIcons name="bank-transfer-out" size={24} color={colors.kumkumRed} />
              </View>
              <Text style={styles.quickLinkLabel}>Expenses</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickLinkCard} onPress={() => router.push("/(dashboard)/news")}>
              <View style={[styles.quickLinkIconBg, { backgroundColor: "rgba(34, 197, 94, 0.08)" }]}>
                <MaterialCommunityIcons name="bullhorn-outline" size={24} color={colors.tulsiGreen} />
              </View>
              <Text style={styles.quickLinkLabel}>News</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickLinkCard} onPress={() => router.push("/(dashboard)/gallery")}>
              <View style={[styles.quickLinkIconBg, { backgroundColor: "rgba(201, 146, 26, 0.08)" }]}>
                <MaterialCommunityIcons name="image-multiple-outline" size={24} color={colors.aartiGold} />
              </View>
              <Text style={styles.quickLinkLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickLinkCard} onPress={() => router.push("/(dashboard)/vendors")}>
              <View style={[styles.quickLinkIconBg, { backgroundColor: "rgba(125, 88, 0, 0.08)" }]}>
                <MaterialCommunityIcons name="store-outline" size={24} color={colors.tertiary} />
              </View>
              <Text style={styles.quickLinkLabel}>Vendors</Text>
            </TouchableOpacity>

            {["owner", "admin", "treasurer", "committee_member", "super_admin"].includes(role || "") && (
              <>
                <TouchableOpacity style={styles.quickLinkCard} onPress={() => router.push("/(dashboard)/analytics-hub")}>
                  <View style={[styles.quickLinkIconBg, { backgroundColor: "rgba(140, 80, 0, 0.08)" }]}>
                    <MaterialCommunityIcons name="chart-bar" size={24} color={colors.primaryBrand} />
                  </View>
                  <Text style={styles.quickLinkLabel}>Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickLinkCard} onPress={() => router.push("/(dashboard)/committee-directory")}>
                  <View style={[styles.quickLinkIconBg, { backgroundColor: "rgba(34, 197, 94, 0.08)" }]}>
                    <MaterialCommunityIcons name="account-group" size={24} color={colors.tulsiGreen} />
                  </View>
                  <Text style={styles.quickLinkLabel}>Committee</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.quickLinkCard} onPress={() => router.push("/(dashboard)/settings")}>
              <View style={[styles.quickLinkIconBg, { backgroundColor: "rgba(75, 85, 99, 0.08)" }]}>
                <MaterialCommunityIcons name="cog-outline" size={24} color="#4B5563" />
              </View>
              <Text style={styles.quickLinkLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button & Expanding Actions */}
      <View style={styles.fabWrapper}>
        {fabOpen && (
          <Animated.View style={[styles.fabMenu, { opacity: menuOpacity, transform: [{ translateY: menuTranslateY }] }]}>
            <TouchableOpacity style={styles.fabMenuItem} onPress={() => { toggleFab(); router.push("/(dashboard)/events"); }} activeOpacity={0.8}>
              <MaterialCommunityIcons name="calendar-plus" size={18} color={colors.primaryBrand} />
              <Text style={styles.fabMenuText}>New Event</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fabMenuItem} onPress={() => { toggleFab(); router.push("/(dashboard)/expenses"); }} activeOpacity={0.8}>
              <MaterialCommunityIcons name="cash-minus" size={18} color={colors.primaryBrand} />
              <Text style={styles.fabMenuText}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fabMenuItem} onPress={() => { toggleFab(); router.push("/(dashboard)/donate"); }} activeOpacity={0.8}>
              <MaterialCommunityIcons name="hands-pray" size={18} color={colors.primaryBrand} />
              <Text style={styles.fabMenuText}>Record Donation</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        <TouchableOpacity onPress={toggleFab} activeOpacity={0.9}>
          <LinearGradient
            colors={["#ff9500", "#b90d18"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabMain}
          >
            <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
              <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  topHeader: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
  },
  logoText: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1,
  },
  bellButton: {
    padding: spacing.xs,
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryBrand,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 110,
    paddingHorizontal: spacing.lg,
  },
  greetingSection: {
    marginVertical: spacing.md,
  },
  greetingTitle: {
    fontSize: 28,
    color: colors.onSurface,
    fontFamily: fonts.poppins.bold,
  },
  greetingSub: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.medium,
    marginTop: 2,
  },
  countdownCard: {
    borderRadius: borderRadius["2xl"],
    padding: spacing.lg,
    position: "relative",
    overflow: "hidden",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: spacing.lg,
  },
  countdownGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  countdownContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countdownLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  countdownBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  countdownBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
  },
  countdownTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
  },
  countdownSub: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  countdownRight: {
    justifyContent: "center",
    alignItems: "center",
  },
  diyaIconGlow: {
    textShadowColor: colors.haldiYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.onSurface,
    fontFamily: fonts.poppins.semibold,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.primaryBrand,
    fontFamily: fonts.inter.semibold,
  },
  kpiCarousel: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  kpiCard: {
    width: width * 0.58,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  kpiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.semibold,
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
  },
  kpiTrendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  kpiTrendText: {
    fontSize: 11,
    color: colors.tulsiGreen,
    fontFamily: fonts.inter.medium,
  },
  kpiSubText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
    marginTop: spacing.xs,
  },
  infoBox: {
    backgroundColor: "rgba(254, 243, 199, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(252, 211, 77, 0.5)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: 12,
    color: colors.primaryBrand,
    lineHeight: 18,
    fontFamily: fonts.inter.medium,
  },
  bentoContainer: {
    gap: spacing.sm,
  },
  activitiesCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
  },
  activityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  activityTextContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    color: colors.onSurface,
    fontFamily: fonts.inter.semibold,
  },
  activityTime: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.inter.regular,
    marginTop: 2,
  },
  activityValue: {
    fontSize: 13,
    color: colors.onSurface,
    fontFamily: fonts.inter.bold,
  },
  viewAllActivitiesButton: {
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  viewAllActivitiesText: {
    color: colors.primaryBrand,
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
  },
  eventsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  eventCard: {
    flex: 1,
    height: 140,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: colors.charcoal,
    position: "relative",
  },
  eventImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.md,
    justifyContent: "flex-end",
  },
  eventBadge: {
    backgroundColor: colors.primaryBrand,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
    marginBottom: spacing.xs,
  },
  eventBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: fonts.inter.semibold,
  },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.poppins.semibold,
  },
  eventLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  eventLocationText: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 11,
    fontFamily: fonts.inter.regular,
  },
  quickLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  quickLinkCard: {
    width: (width - spacing.lg * 2 - spacing.md * 2) / 3,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  quickLinkIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  quickLinkLabel: {
    fontSize: 12,
    color: colors.onSurface,
    fontFamily: fonts.inter.semibold,
  },
  fabWrapper: {
    position: "absolute",
    bottom: 24,
    right: 20,
    alignItems: "flex-end",
    gap: spacing.sm,
    zIndex: 100,
  },
  fabMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.sandstone,
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
    gap: 6,
  },
  fabMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  fabMenuText: {
    fontSize: 13,
    color: colors.primaryBrand,
    fontFamily: fonts.inter.semibold,
  },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
});

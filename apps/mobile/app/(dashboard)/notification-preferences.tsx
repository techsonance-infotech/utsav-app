import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  TextInput,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PreferenceRowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function PreferenceRow({ icon, label, value, onValueChange }: PreferenceRowProps) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.onSurfaceVariant}
        />
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryBrand }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function NotificationPreferencesScreen() {
  const [eventPush, setEventPush] = useState(true);
  const [eventSMS, setEventSMS] = useState(false);
  const [eventEmail, setEventEmail] = useState(true);

  const [donPush, setDonPush] = useState(false);
  const [donSMS, setDonSMS] = useState(true);
  const [donEmail, setDonEmail] = useState(true);

  const [newsPush, setNewsPush] = useState(true);
  const [newsSMS, setNewsSMS] = useState(false);
  const [newsEmail, setNewsEmail] = useState(true);

  const [dndEnabled, setDndEnabled] = useState(true);
  const [dndFrom, setDndFrom] = useState("22:00");
  const [dndTo, setDndTo] = useState("07:00");

  const [toastOpacity] = useState(new Animated.Value(0));

  const handleSave = () => {
    // Show success overlay
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReset = () => {
    setEventPush(true);
    setEventSMS(false);
    setEventEmail(true);
    setDonPush(true);
    setDonSMS(false);
    setDonEmail(true);
    setNewsPush(true);
    setNewsSMS(false);
    setNewsEmail(true);
    setDndEnabled(false);
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
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <MaterialCommunityIcons
          name="bell-ring-outline"
          size={24}
          color={colors.primaryBrand}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.pageTitle}>Notification Preferences</Text>
          <Text style={styles.pageSubtitle}>
            Customize how and when you receive updates from Utsav. Manage your community alerts, donation receipts, and quiet hours.
          </Text>
        </View>

        {/* Category: Event Reminders */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={styles.iconBgEvents}>
              <MaterialCommunityIcons name="party-popper" size={20} color={colors.primaryBrand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryTitle}>Event Reminders</Text>
              <Text style={styles.categoryDesc}>Upcoming festivals, puja timings, and community meets.</Text>
            </View>
          </View>
          <View style={styles.prefList}>
            <PreferenceRow icon="cellphone-sound" label="Push" value={eventPush} onValueChange={setEventPush} />
            <PreferenceRow icon="message-text-outline" label="SMS" value={eventSMS} onValueChange={setEventSMS} />
            <PreferenceRow icon="email-outline" label="Email" value={eventEmail} onValueChange={setEventEmail} />
          </View>
        </View>

        {/* Category: Donation Receipts */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={styles.iconBgDonations}>
              <MaterialCommunityIcons name="cash" size={20} color={colors.secondaryBrand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryTitle}>Donation Receipts</Text>
              <Text style={styles.categoryDesc}>Transactional confirmations and tax-deductible summaries.</Text>
            </View>
          </View>
          <View style={styles.prefList}>
            <PreferenceRow icon="cellphone-sound" label="Push" value={donPush} onValueChange={setDonPush} />
            <PreferenceRow icon="message-text-outline" label="SMS" value={donSMS} onValueChange={setDonSMS} />
            <PreferenceRow icon="email-outline" label="Email" value={donEmail} onValueChange={setDonEmail} />
          </View>
        </View>

        {/* Category: News Updates */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={styles.iconBgNews}>
              <MaterialCommunityIcons name="newspaper" size={20} color={colors.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryTitle}>News & Community Updates</Text>
              <Text style={styles.categoryDesc}>Monthly newsletters, renovation progress, and council notes.</Text>
            </View>
          </View>
          <View style={styles.prefList}>
            <PreferenceRow icon="cellphone-sound" label="Push" value={newsPush} onValueChange={setNewsPush} />
            <PreferenceRow icon="message-text-outline" label="SMS" value={newsSMS} onValueChange={setNewsSMS} />
            <PreferenceRow icon="email-outline" label="Email" value={newsEmail} onValueChange={setNewsEmail} />
          </View>
        </View>

        {/* Do Not Disturb Section */}
        <View style={[styles.categoryCard, styles.dndCard]}>
          <View style={styles.categoryHeader}>
            <View style={styles.iconBgEvents}>
              <MaterialCommunityIcons name="minus-circle" size={20} color={colors.primaryBrand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryTitle}>Do Not Disturb</Text>
              <Text style={styles.categoryDesc}>Silence all notifications during specific hours.</Text>
            </View>
            <Switch
              value={dndEnabled}
              onValueChange={setDndEnabled}
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryBrand }}
              thumbColor="#FFFFFF"
            />
          </View>

          {dndEnabled && (
            <View style={styles.dndSettings}>
              <View style={styles.timeRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeLabel}>From</Text>
                  <View style={styles.timeInputWrapper}>
                    <TextInput
                      style={styles.timeInput}
                      value={dndFrom}
                      onChangeText={setDndFrom}
                    />
                    <MaterialCommunityIcons name="clock-outline" size={18} color={colors.onSurfaceVariant} />
                  </View>
                </View>
                <View style={styles.timeCol}>
                  <Text style={styles.timeLabel}>To</Text>
                  <View style={styles.timeInputWrapper}>
                    <TextInput
                      style={styles.timeInput}
                      value={dndTo}
                      onChangeText={setDndTo}
                    />
                    <MaterialCommunityIcons name="weather-sunset-up" size={18} color={colors.onSurfaceVariant} />
                  </View>
                </View>
              </View>

              <View style={styles.repeatSection}>
                <Text style={styles.repeatLabel}>Repeat</Text>
                <View style={styles.daysRow}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dayCircle, idx < 5 ? styles.dayCircleActive : null]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dayText, idx < 5 ? styles.dayTextActive : null]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Action Bar */}
        <View style={styles.footerActions}>
          <View>
            <Text style={styles.unsubscribeTitle}>Unsubscribe from all?</Text>
            <Text style={styles.unsubscribeSubtitle}>You will still receive critical account alerts.</Text>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
              <Text style={styles.resetBtnText}>Reset Defaults</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Celebration Overlay Toast */}
      <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
        <View style={styles.toastCard}>
          <View style={styles.toastIconBg}>
            <MaterialCommunityIcons name="check-circle" size={32} color={colors.tulsiGreen} />
          </View>
          <Text style={styles.toastTitle}>Preferences Saved</Text>
          <Text style={styles.toastDesc}>Your notification settings have been updated successfully.</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pujaWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: 20,
    color: colors.primaryBrand,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 40, gap: 16 },

  introSection: { paddingVertical: 8, gap: 8 },
  pageTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 24,
    color: colors.onSurface,
  },
  pageSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },

  categoryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 16,
    padding: 16,
  },
  categoryHeader: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 12 },
  iconBgEvents: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBgDonations: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBgNews: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tertiaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    fontFamily: fonts.poppins.semibold,
    fontSize: 16,
    color: colors.onSurface,
  },
  categoryDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  prefList: {
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.5)",
    paddingTop: 8,
    gap: 8,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.pujaWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(232, 226, 214, 0.3)",
  },
  preferenceLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  preferenceLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },

  dndCard: {
    borderColor: "rgba(140, 80, 0, 0.2)",
    backgroundColor: "rgba(140, 80, 0, 0.03)",
  },
  dndSettings: {
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.5)",
    paddingTop: 16,
    gap: 16,
  },
  timeRow: { flexDirection: "row", gap: 16 },
  timeCol: { flex: 1, gap: 6 },
  timeLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  timeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    backgroundColor: colors.pujaWhite,
    borderWidth: 1,
    borderColor: colors.sandstone,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  timeInput: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurface,
  },
  repeatSection: { gap: 8 },
  repeatLabel: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    backgroundColor: colors.primaryBrand,
    borderColor: colors.primaryBrand,
  },
  dayText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  dayTextActive: {
    color: "#FFFFFF",
  },

  footerActions: {
    borderTopWidth: 1,
    borderTopColor: colors.sandstone,
    paddingTop: 24,
    gap: 16,
    marginBottom: 40,
  },
  unsubscribeTitle: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  unsubscribeSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  btnRow: { flexDirection: "row", gap: 12 },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.pujaWhite,
  },
  resetBtnText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: colors.onSurface,
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryBrand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  saveBtnText: {
    fontFamily: fonts.inter.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },

  toast: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(58, 53, 48, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },
  toastCard: {
    backgroundColor: colors.pujaWhite,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  toastIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  toastTitle: {
    fontFamily: fonts.poppins.bold,
    fontSize: 18,
    color: colors.onSurface,
    marginBottom: 8,
  },
  toastDesc: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 18,
  },
});

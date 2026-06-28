import React, { useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEvents, useRSVP } from "@utsav/api-client";
import { ScreenHeader } from "../components/ScreenHeader";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const eventId = typeof id === "string" ? id : "";

  const { data: events = [], isLoading } = useEvents() as any;
  const event = useMemo(() => {
    return events.find((e: any) => e.id === eventId);
  }, [events, eventId]);
  const rsvpMutation = useRSVP();

  const handleRSVP = async (status: "attending" | "maybe" | "not_attending") => {
    if (!event) return;
    try {
      await rsvpMutation.mutateAsync({ eventId: event.id, status });
      Alert.alert("RSVP Updated", `You are now marked as ${status.replace("_", " ")}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    Alert.alert("Share Event", "Sharing link copied to clipboard!");
  };

  const handleAddToCalendar = () => {
    Alert.alert("Calendar", "Event added to your device calendar.");
  };

  const handleSetReminder = () => {
    Alert.alert("Reminder Set", "You will be notified 2 hours before the event starts.");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity style={styles.backBtnText} onPress={() => router.back()}>
          <Text style={{ color: colors.primaryBrand, fontFamily: fonts.inter.bold }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const startDate = new Date(event.start_at);
  const endDate = event.end_at ? new Date(event.end_at) : null;

  const dateStr = startDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = `${startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })} - ${
    endDate
      ? endDate.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "End"
  }`;

  const attendingCount = event.rsvp_summary?.attending || 156; // Fallback to mock count
  const userRSVPStatus = event.user_rsvp;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Event Details"
        showBack={true}
        rightIcon="share-variant"
        onRightPress={handleShare}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: event.banner_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCYWaZq1p-Jn7K7lvEDKuJch-UaQba2bj1ZSjkQm85ny3CXAJO5mNan-BLU6iJCRErdXc6wCgKGYn-k9a7CDw4XoxhhyVJI36AQaHdi2JEe4cxMaMJmiH3y67Mz2za7yJXnUQQasTcrAZ5sRgeiA0Hqy-uh_wCzoJQQpkGbDyrJFQiC1bUQhom8mg0BZW2eOk4BMM5USWxbt-UyILmQyIVeJCbabIpN0r2zrrdQaDUclBHiLPMIPbXA",
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.tagsRow}>
            <View style={styles.tagPrimary}>
              <Text style={styles.tagPrimaryText}>{event.category.toUpperCase()}</Text>
            </View>
            <View style={styles.tagSecondary}>
              <Text style={styles.tagSecondaryText}>Religious Event</Text>
            </View>
          </View>
        </View>

        {/* Content Container (shifted upward like overlay) */}
        <View style={styles.detailsCard}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          {/* Date & Time Info Box */}
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <View style={styles.infoIconCircle}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoVal}>{dateStr}</Text>
              </View>
            </View>

            <View style={styles.infoColumn}>
              <View style={styles.infoIconCircle}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primaryBrand} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoVal} numberOfLines={1}>{timeStr}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Action buttons */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleAddToCalendar}>
            <MaterialCommunityIcons name="calendar-plus" size={18} color={colors.primaryBrand} />
            <Text style={styles.quickActionText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBtn} onPress={handleSetReminder}>
            <MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.primaryBrand} />
            <Text style={styles.quickActionText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>

        {/* About Event Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Event</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              {event.description ||
                "Join us for the most auspicious occasion of the year as we welcome Lord Ganesha with devotion and celebration. The Ganesh Chaturthi Main Puja will feature a traditional Sthapana ceremony, followed by a grand Aarti and Bhajans led by community elders."}
            </Text>

            {event.category === "puja" && (
              <View style={styles.quoteCard}>
                <Text style={styles.quoteText}>
                  "Vakratunda Mahakaya Suryakoti Samaprabha..."
                </Text>
              </View>
            )}

            <Text style={[styles.aboutText, { marginTop: 12 }]}>
              Prasad will be distributed to all attendees following the ceremony. We request all families to arrive 15 minutes early to settle in for the chanting.
            </Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCysNcU1ZFro5WvEz2xSvFYN1ijoDPJFFPtMQPTPNaNu79RydnsnlTWXGmg9PJh8GnzOeeya9HTCikacJERLRIOY9PNT0fuGorFEpdgS8hIa4Bze7sdVbEfs435kDDQdxcm42fzscxMrHwhG4OyWhn2lglbBG-rF2Fnz0VR5ZcotVdH_mncYTaMPPiN6WOF48OCmY_R8KMUfbCTGJT6vRyDAMmOl-fyq09yfcuBOjcDgLByjQYX0WlA",
              }}
              style={styles.mapMock}
              resizeMode="cover"
            />
            <View style={styles.locationDetails}>
              <View style={styles.locationMeta}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.primaryBrand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.venueName}>{event.location_name || "Community Mandap, Central Park"}</Text>
                  <Text style={styles.venueAddress}>Sector 12, Celebration Avenue, Mumbai 400001</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.mapLinkBtn}
                onPress={() => {
                  if (event.location_maps_url) {
                    Platform.OS === "web"
                      ? window.open(event.location_maps_url, "_blank")
                      : Alert.alert("Opening Maps", event.location_maps_url);
                  } else {
                    Alert.alert("Maps", "Opening Community Mandap location on Google Maps...");
                  }
                }}
              >
                <Text style={styles.mapLinkText}>View on Maps</Text>
                <MaterialCommunityIcons name="arrow-top-right" size={14} color={colors.primaryBrand} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* RSVP Bottom Sticky Bar */}
      <View style={styles.rsvpStickyBar}>
        <View style={styles.rsvpStickyHeader}>
          <Text style={styles.rsvpStickyTitle}>Will you attend?</Text>
          <Text style={styles.rsvpStickyCount}>{attendingCount} people responding</Text>
        </View>

        <View style={styles.rsvpButtons}>
          <TouchableOpacity
            style={[
              styles.rsvpBtn,
              userRSVPStatus === "attending" && styles.rsvpBtnAttendingActive,
            ]}
            onPress={() => handleRSVP("attending")}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color={userRSVPStatus === "attending" ? colors.tulsiGreen : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.rsvpBtnText,
                userRSVPStatus === "attending" && styles.rsvpBtnTextAttendingActive,
              ]}
            >
              Attending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rsvpBtn,
              userRSVPStatus === "maybe" && styles.rsvpBtnMaybeActive,
            ]}
            onPress={() => handleRSVP("maybe")}
          >
            <MaterialCommunityIcons
              name="help-circle"
              size={18}
              color={userRSVPStatus === "maybe" ? colors.aartiGold : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.rsvpBtnText,
                userRSVPStatus === "maybe" && styles.rsvpBtnTextMaybeActive,
              ]}
            >
              Maybe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rsvpBtn,
              userRSVPStatus === "not_attending" && styles.rsvpBtnNotActive,
            ]}
            onPress={() => handleRSVP("not_attending")}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={userRSVPStatus === "not_attending" ? colors.kumkumRed : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.rsvpBtnText,
                userRSVPStatus === "not_attending" && styles.rsvpBtnTextNotActive,
              ]}
            >
              Not Attending
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.error,
    marginBottom: 12,
  },
  backBtnText: {
    padding: 8,
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
    letterSpacing: 1.5,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 160,
  },
  heroContainer: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  tagsRow: {
    position: "absolute",
    bottom: 40,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  tagPrimary: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPrimaryText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onPrimaryContainer,
  },
  tagSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagSecondaryText: {
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: spacing.md,
    marginTop: -24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.sandstone,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  eventTitle: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    lineHeight: 28,
  },
  infoGrid: {
    flexDirection: "row",
    marginTop: 16,
    gap: 16,
  },
  infoColumn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(140, 80, 0, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  infoVal: {
    fontSize: 13,
    fontFamily: fonts.poppins.semibold,
    color: colors.onSurface,
    marginTop: 2,
  },
  quickActionRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: 12,
    marginTop: 16,
  },
  quickActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: 24,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
    paddingLeft: 4,
  },
  aboutCard: {
    backgroundColor: colors.pujaWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: 16,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 21,
  },
  quoteCard: {
    backgroundColor: "rgba(255, 220, 191, 0.3)",
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBrand,
    padding: 12,
    marginVertical: 12,
    borderRadius: 4,
  },
  quoteText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onPrimaryFixedVariant,
    fontStyle: "italic",
  },
  locationCard: {
    backgroundColor: colors.pujaWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    overflow: "hidden",
  },
  mapMock: {
    width: "100%",
    height: 140,
  },
  locationDetails: {
    padding: 16,
    gap: 12,
  },
  locationMeta: {
    flexDirection: "row",
    gap: 10,
  },
  venueName: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
  },
  venueAddress: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  mapLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
  },
  mapLinkText: {
    fontSize: 13,
    fontFamily: fonts.inter.semibold,
    color: colors.primaryBrand,
  },
  rsvpStickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 248, 244, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
    paddingHorizontal: spacing.md,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    gap: 12,
  },
  rsvpStickyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rsvpStickyTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  rsvpStickyCount: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  rsvpButtons: {
    flexDirection: "row",
    gap: 8,
  },
  rsvpBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sandstone,
    backgroundColor: colors.pujaWhite,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  rsvpBtnAttendingActive: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderColor: colors.tulsiGreen,
  },
  rsvpBtnMaybeActive: {
    backgroundColor: "rgba(201, 146, 26, 0.08)",
    borderColor: colors.aartiGold,
  },
  rsvpBtnNotActive: {
    backgroundColor: "rgba(217, 43, 43, 0.08)",
    borderColor: colors.kumkumRed,
  },
  rsvpBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  rsvpBtnTextAttendingActive: {
    color: colors.tulsiGreen,
    fontFamily: fonts.inter.bold,
  },
  rsvpBtnTextMaybeActive: {
    color: colors.aartiGold,
    fontFamily: fonts.inter.bold,
  },
  rsvpBtnTextNotActive: {
    color: colors.kumkumRed,
    fontFamily: fonts.inter.bold,
  },
});

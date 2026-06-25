import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@utsav/stores";
import { useEvents, useRSVP } from "@utsav/api-client";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function MobileEventsScreen() {
  const { role } = useAuthStore();
  const { data: events = [], isLoading: loadingEvents } = useEvents() as any;
  const rsvpMutation = useRSVP();

  const isAdminOrVolunteer = ["owner", "admin", "treasurer", "volunteer"].includes(role || "");

  // Calendar Year/Month States
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(2024); // Start at Sept 2024 to align with mock data, but can navigate
  const [currentMonth, setCurrentMonth] = useState(8); // September is 8 (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number | null>(14); // Default select the 14th

  const monthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Get array of day numbers for calendar grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Sunday is 0
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days: { dayNumber: number | null; isCurrentMonth: boolean; dateString: string }[] = [];
    
    // Add empty slots for previous month padding
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false, dateString: "" });
    }
    
    // Add current month days
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateString: `${currentYear}-${monthStr}-${dayStr}`,
      });
    }
    
    return days;
  }, [currentYear, currentMonth]);

  // Map events to date strings
  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    events.forEach((evt: any) => {
      if (evt.start_at) {
        const datePart = evt.start_at.split("T")[0];
        if (!map[datePart]) {
          map[datePart] = [];
        }
        map[datePart].push(evt);
      }
    });
    return map;
  }, [events]);

  // Filtered daily agenda
  const agendaEvents = useMemo(() => {
    if (selectedDay === null) {
      // If no day is selected, show all events of the current month
      return events.filter((evt: any) => {
        if (!evt.start_at) return false;
        const d = new Date(evt.start_at);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    }
    const monthStr = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(selectedDay).padStart(2, "0");
    const key = `${currentYear}-${monthStr}-${dayStr}`;
    return eventsByDate[key] || [];
  }, [selectedDay, currentYear, currentMonth, events, eventsByDate]);

  const handleRSVP = async (eventId: string, status: "attending" | "maybe" | "not_attending") => {
    try {
      await rsvpMutation.mutateAsync({ eventId, status });
    } catch (err) {
      console.error("RSVP error:", err);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="temple-hindu" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.headerLogo}>UTSAV</Text>
        </View>
        <TouchableOpacity style={styles.headerNotifyBtn}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.onSurfaceVariant} />
          <View style={styles.notifyBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calendar Card Section */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <View>
              <Text style={styles.monthName}>{monthName}</Text>
              <Text style={styles.subtext}>Bhadrapada - Ashvin Masa</Text>
            </View>
            <View style={styles.navArrows}>
              <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth}>
                <MaterialCommunityIcons name="chevron-left" size={20} color={colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth}>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Calendar Weekday Names */}
          <View style={styles.weekdayRow}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
              <Text key={idx} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((cell, idx) => {
              if (cell.dayNumber === null) {
                return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
              }

              const isSelected = selectedDay === cell.dayNumber;
              const hasEvents = !!eventsByDate[cell.dateString];
              const isToday =
                now.getDate() === cell.dayNumber &&
                now.getMonth() === currentMonth &&
                now.getFullYear() === currentYear;

              return (
                <TouchableOpacity
                  key={`day-${cell.dayNumber}`}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => setSelectedDay(cell.dayNumber)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      hasEvents && !isSelected && styles.dayTextHasEvents,
                    ]}
                  >
                    {cell.dayNumber}
                  </Text>
                  {hasEvents && (
                    <View
                      style={[
                        styles.eventDot,
                        isSelected ? styles.eventDotSelected : styles.eventDotDefault,
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend Footer */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primaryContainer }]} />
              <Text style={styles.legendLabel}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondaryBrand }]} />
              <Text style={styles.legendLabel}>Festival Day</Text>
            </View>
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => {
                const today = new Date();
                setCurrentYear(today.getFullYear());
                setCurrentMonth(today.getMonth());
                setSelectedDay(today.getDate());
              }}
            >
              <Text style={styles.todayBtnText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Highlight Banner */}
        <TouchableOpacity
          style={styles.highlightBanner}
          activeOpacity={0.9}
          onPress={() => {
            // Find Ganesh Puja event if exists, or direct to details
            const pujaEvent = events.find((e: any) => e.category === "puja");
            if (pujaEvent) {
              router.push({
                pathname: "/event-detail",
                params: { id: pujaEvent.id },
              });
            }
          }}
        >
          <View style={styles.highlightOverlay} />
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightBadgeText}>Next Highlight</Text>
          </View>
          <Text style={styles.highlightTitle}>Ganesh Chaturthi Main Puja</Text>
          <View style={styles.highlightTimeRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#FFFFFF" />
            <Text style={styles.highlightTimeText}>Sept 19 • 09:00 AM</Text>
          </View>
        </TouchableOpacity>

        {/* Agenda Section Header */}
        <View style={styles.agendaHeaderRow}>
          <Text style={styles.agendaTitle}>Daily Agenda</Text>
          <Text style={styles.agendaCountText}>
            {agendaEvents.length} {agendaEvents.length === 1 ? "Event" : "Events"}
          </Text>
        </View>

        {/* Loading / Empty / Agenda List */}
        {loadingEvents ? (
          <ActivityIndicator color={colors.primaryContainer} size="large" style={{ marginTop: 24 }} />
        ) : agendaEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>No events scheduled for this date.</Text>
          </View>
        ) : (
          <View style={styles.agendaList}>
            {agendaEvents.map((event: any) => {
              const goingCount = event.rsvp_summary?.attending || 0;
              const userRSVPStatus = event.user_rsvp;

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.agendaCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: "/event-detail",
                      params: { id: event.id },
                    })
                  }
                >
                  {/* Timeline bullet line decoration */}
                  <View style={styles.cardIndicator} />

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {event.category.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.timeLabel}>
                        {formatTime(event.start_at)}
                      </Text>
                    </View>

                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.description ? (
                      <Text style={styles.eventDesc} numberOfLines={2}>
                        {event.description}
                      </Text>
                    ) : null}

                    {event.location_name && (
                      <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={14} color={colors.outline} />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {event.location_name}
                        </Text>
                      </View>
                    )}

                    {/* RSVP Status / Attendees Count */}
                    <View style={styles.cardFooter}>
                      <Text style={styles.goingCountText}>👥 {goingCount} Going</Text>
                      {userRSVPStatus ? (
                        <View style={styles.rsvpBadge}>
                          <Text style={styles.rsvpBadgeText}>✓ RSVP: {userRSVPStatus.toUpperCase()}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Quick Attending buttons */}
                    <View style={styles.rsvpButtons}>
                      {(["attending", "maybe", "not_attending"] as const).map((status) => {
                        const isActive = userRSVPStatus === status;
                        let btnBg = "#FFFFFF";
                        let btnBorder = colors.sandstone;
                        let btnText = colors.onSurfaceVariant;

                        if (isActive) {
                          if (status === "attending") {
                            btnBg = "rgba(34, 197, 94, 0.1)";
                            btnBorder = colors.tulsiGreen;
                            btnText = colors.tulsiGreen;
                          } else if (status === "maybe") {
                            btnBg = "rgba(201, 146, 26, 0.1)";
                            btnBorder = colors.aartiGold;
                            btnText = colors.aartiGold;
                          } else {
                            btnBg = "rgba(217, 43, 43, 0.1)";
                            btnBorder = colors.kumkumRed;
                            btnText = colors.kumkumRed;
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={status}
                            style={[styles.rsvpBtn, { backgroundColor: btnBg, borderColor: btnBorder }]}
                            onPress={() => handleRSVP(event.id, status)}
                          >
                            <Text style={[styles.rsvpBtnText, { color: btnText, fontWeight: isActive ? "bold" : "normal" }]}>
                              {status === "attending" ? "Going" : status === "maybe" ? "Maybe" : "No"}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) for Scheduling Event */}
      {isAdminOrVolunteer && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push("/create-event")}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLogo: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    letterSpacing: 1.5,
  },
  headerNotifyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifyBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryBrand,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    padding: spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.md,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  monthName: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  subtext: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  navArrows: {
    flexDirection: "row",
    gap: 8,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.sandstone,
    justifyContent: "center",
    alignItems: "center",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayText: {
    width: 40,
    textAlign: "center",
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: "rgba(85, 67, 52, 0.6)",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  dayCellEmpty: {
    width: 40,
    height: 40,
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dayCellSelected: {
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
  },
  dayText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.onSurface,
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  dayTextHasEvents: {
    fontFamily: fonts.inter.bold,
    color: colors.secondaryBrand,
  },
  eventDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventDotDefault: {
    backgroundColor: colors.secondaryBrand,
  },
  eventDotSelected: {
    backgroundColor: "#FFFFFF",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.4)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
  },
  todayBtn: {
    marginLeft: "auto",
  },
  todayBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  highlightBanner: {
    height: 140,
    borderRadius: 16,
    backgroundColor: colors.charcoal,
    padding: spacing.md,
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "relative",
    marginBottom: spacing.md,
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  highlightBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(201, 146, 26, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(201, 146, 26, 0.4)",
  },
  highlightBadgeText: {
    fontSize: 10,
    fontFamily: fonts.inter.bold,
    color: colors.aartiGold,
  },
  highlightTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
    zIndex: 2,
  },
  highlightTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    zIndex: 2,
  },
  highlightTimeText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: "rgba(255, 255, 255, 0.8)",
  },
  agendaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  agendaTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  agendaCountText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
    marginTop: 10,
  },
  agendaList: {
    gap: spacing.md,
  },
  agendaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sandstone,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIndicator: {
    width: 6,
    backgroundColor: colors.primaryContainer,
  },
  cardBody: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    color: colors.primaryBrand,
  },
  timeLabel: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.charcoal,
  },
  eventDesc: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
    color: colors.outline,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  goingCountText: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  rsvpBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rsvpBadgeText: {
    fontSize: 9,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
  },
  rsvpButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.3)",
    paddingTop: 8,
  },
  rsvpBtn: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rsvpBtnText: {
    fontSize: 11,
    fontFamily: fonts.inter.medium,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

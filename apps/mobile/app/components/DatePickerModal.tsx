import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onSelect: (dateStr: string) => void;
  onClose: () => void;
  title?: string;
}

export default function DatePickerModal({
  visible,
  value,
  onSelect,
  onClose,
  title = "Select Date",
}: DatePickerModalProps) {
  // Local state to track currently viewed month/year in the calendar view
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

  // Synchronize local view state when picker opens or value changes
  useEffect(() => {
    if (visible) {
      const initialDate = value ? new Date(value) : new Date();
      if (!isNaN(initialDate.getTime())) {
        setCurrentYear(initialDate.getFullYear());
        setCurrentMonth(initialDate.getMonth());
      }
    }
  }, [visible, value]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const paddedMonth = String(currentMonth + 1).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");
    const dateString = `${currentYear}-${paddedMonth}-${paddedDay}`;
    onSelect(dateString);
    onClose();
  };

  // Helper arrays for calendar generation
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create grid cells (pads start of grid with null)
  const gridCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push(i);
  }

  // Parse today's values
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header title */}
          <Text style={styles.title}>{title}</Text>

          {/* Month/Year Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primaryBrand} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{`${monthsList[currentMonth]} ${currentYear}`}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primaryBrand} />
            </TouchableOpacity>
          </View>

          {/* Weekday Names Row */}
          <View style={styles.weekdaysRow}>
            {weekdays.map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.gridContainer}>
            {gridCells.map((dayNum, index) => {
              if (dayNum === null) {
                return <View key={`empty-${index}`} style={styles.gridCellEmpty} />;
              }

              const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = cellDateStr === value;
              const isToday = cellDateStr === todayStr;

              return (
                <TouchableOpacity
                  key={`day-${dayNum}`}
                  style={[
                    styles.gridCellDay,
                    isSelected && styles.selectedCell,
                    isToday && !isSelected && styles.todayCell,
                  ]}
                  onPress={() => handleSelectDay(dayNum)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedCellText,
                      isToday && !isSelected && styles.todayCellText,
                    ]}
                  >
                    {dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Actions Footer */}
          <View style={styles.actionsFooter}>
            <TouchableOpacity onPress={onClose} style={[styles.actionBtn, styles.cancelBtn]} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSelect("");
                onClose();
              }}
              style={[styles.actionBtn, styles.clearBtn]}
              activeOpacity={0.7}
            >
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(30, 27, 24, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.pujaWhite,
    width: "100%",
    maxWidth: 320,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(140, 80, 0, 0.08)",
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  navButton: {
    padding: spacing.xs,
  },
  monthText: {
    fontSize: 14,
    fontFamily: fonts.inter.bold,
    color: colors.onSurface,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.3)",
    paddingBottom: 4,
  },
  weekdayText: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 11,
    fontFamily: fonts.inter.bold,
    color: colors.onSurfaceVariant,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.xs,
  },
  gridCellEmpty: {
    width: "14.28%",
    aspectRatio: 1,
  },
  gridCellDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
  },
  selectedCell: {
    backgroundColor: colors.primaryBrand,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: colors.primaryBrand,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
  },
  dayText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurface,
  },
  selectedCellText: {
    color: "#FFFFFF",
    fontFamily: fonts.inter.bold,
  },
  todayCellText: {
    color: colors.primaryBrand,
    fontFamily: fonts.inter.bold,
  },
  actionsFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(232, 226, 214, 0.3)",
    paddingTop: spacing.sm,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  cancelBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.semibold,
    color: colors.onSurfaceVariant,
  },
  clearBtn: {
    backgroundColor: colors.kumkumRed,
  },
  clearBtnText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: "#FFFFFF",
  },
});

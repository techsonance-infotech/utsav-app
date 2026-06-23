import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { colors, fonts, borderRadius, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PlatformHealthScreen() {
  const [logs, setLogs] = useState<string[]>([
    "[14:52:10] INFO: DB Connection pool initialized [42 active]",
    "[14:52:18] INFO: Syncing replication nodes [Secondary matched]",
    "[14:52:45] WARN: API gateway cache hit-ratio below 70%",
    "[14:53:01] INFO: Completed Razorpay order callback validation",
    "[14:53:12] SUCCESS: Scheduled backup completed successfully",
  ]);

  // Append new mock logs automatically to simulate real-time behavior
  useEffect(() => {
    const timer = setInterval(() => {
      const phrases = [
        "INFO: GET /api/v1/donations response 200 OK (38ms)",
        "INFO: POST /api/v1/auth/refresh response 200 OK (22ms)",
        "WARN: DB memory utilization hit 78% limit",
        "INFO: Websocket ping response - client connection stabilized",
        "SUCCESS: Synchronized asset media file indexes (S3 bucket)",
      ];
      const randomMsg = `[${new Date().toLocaleTimeString()}] ${phrases[Math.floor(Math.random() * phrases.length)]}`;
      setLogs((prev) => [...prev.slice(-6), randomMsg]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const systemStats = [
    { label: "API Gateway Latency", value: "32ms", status: "Optimal", color: colors.tulsiGreen },
    { label: "CPU Load", value: "24%", status: "Low", color: colors.tulsiGreen },
    { label: "Memory Footprint", value: "4.8 GB / 8 GB", status: "Normal", color: colors.aartiGold },
    { label: "Database Connection", value: "42 active", status: "Healthy", color: colors.tulsiGreen },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Platform Health</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={styles.statusBox}>
          <View style={styles.statusHeader}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>ALL SYSTEMS OPERATIONAL</Text>
          </View>
          <Text style={styles.statusUptime}>Uptime index: 99.992% (last 30 days)</Text>
        </View>

        {/* System Stats Grid */}
        <View style={styles.statsGrid}>
          {systemStats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.statusIndicatorDot, { backgroundColor: stat.color }]} />
                <Text style={[styles.statStatus, { color: stat.color }]}>{stat.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Realtime logs streaming viewer */}
        <View style={styles.logsConsole}>
          <View style={styles.consoleHeader}>
            <MaterialCommunityIcons name="console-network" size={20} color="#FFFFFF" />
            <Text style={styles.consoleTitle}>Live Diagnostic Logs</Text>
          </View>
          <View style={styles.terminal}>
            {logs.map((log, idx) => {
              let textStyle = styles.logInfo;
              if (log.includes("WARN")) textStyle = styles.logWarn;
              if (log.includes("SUCCESS")) textStyle = styles.logSuccess;

              return (
                <Text key={idx} style={[styles.logText, textStyle]}>
                  {log}
                </Text>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pujaWhite,
  },
  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.sandstone,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  statusBox: {
    backgroundColor: colors.charcoal,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.tulsiGreen,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.inter.bold,
    color: colors.tulsiGreen,
    letterSpacing: 1,
  },
  statusUptime: {
    fontSize: 12,
    fontFamily: fonts.inter.regular,
    color: colors.outlineVariant,
    marginTop: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandstone,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statStatus: {
    fontSize: 11,
    fontFamily: fonts.inter.semibold,
  },
  logsConsole: {
    backgroundColor: "#181818",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  consoleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#222",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  consoleTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
  },
  terminal: {
    padding: spacing.md,
    fontFamily: "monospace",
    minHeight: 180,
  },
  logText: {
    fontSize: 11,
    fontFamily: fonts.inter.regular,
    lineHeight: 20,
    marginBottom: 4,
  },
  logInfo: {
    color: "#BBBBBB",
  },
  logWarn: {
    color: "#EAB308",
  },
  logSuccess: {
    color: "#22C55E",
  },
});

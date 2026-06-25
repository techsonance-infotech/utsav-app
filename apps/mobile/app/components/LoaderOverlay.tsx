import React from "react";
import { StyleSheet, View, Text, ActivityIndicator, Modal } from "react-native";
import { colors, fonts, spacing, borderRadius } from "../lib/theme";

interface LoaderOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoaderOverlay({ visible, message = "Please wait..." }: LoaderOverlayProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(30, 27, 24, 0.55)", // Deep charcoal semi-transparent backdrop
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.pujaWhite,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    width: "75%",
    maxWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(140, 80, 0, 0.08)",
  },
  message: {
    fontSize: 15,
    fontFamily: fonts.poppins.medium,
    color: colors.onSurface,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});

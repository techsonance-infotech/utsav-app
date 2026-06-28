import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { colors, fonts, spacing } from "../lib/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  showLogo?: boolean;
  logoUri?: string;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
}

export function ScreenHeader({
  title,
  showBack = true,
  showLogo = true,
  logoUri,
  rightIcon,
  onRightPress,
  rightComponent,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
        ) : showLogo ? (
          <View style={styles.brandWrapper}>
            <Image
              source={logoUri ? { uri: logoUri } : require("../../assets/image-only.png")}
              style={styles.brandLogo}
            />
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : rightIcon ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} activeOpacity={0.7}>
            <MaterialCommunityIcons name={rightIcon} size={24} color={colors.primaryBrand} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 226, 214, 0.4)",
    backgroundColor: "#FFFFFF",
  },
  leftContainer: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  rightContainer: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.primaryBrand,
    backgroundColor: colors.cream,
  },
  brandLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontFamily: fonts.poppins.bold,
    color: colors.primaryBrand,
  },
  placeholder: {
    width: 44,
  },
});

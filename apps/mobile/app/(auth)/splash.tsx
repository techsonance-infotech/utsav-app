import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, spacing } from "../lib/theme";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(10)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline entrance with delay
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Glow breathing animation (looping)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particles pulsing
    const pulseParticle = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

    pulseParticle(particle1, 0);
    pulseParticle(particle2, 800);
    pulseParticle(particle3, 1500);

    // Auto-navigate after 2.5s
    const timer = setTimeout(() => {
      router.replace("/(auth)/welcome");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#FF9500", "#E07B00"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Atmospheric Particles */}
      <Animated.View
        style={[
          styles.particle,
          {
            top: "25%",
            left: "25%",
            width: 8,
            height: 8,
            backgroundColor: "#FFFFFF",
            opacity: Animated.multiply(particle1, 0.3),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          {
            top: "75%",
            left: "33%",
            width: 12,
            height: 12,
            backgroundColor: colors.aartiGold,
            opacity: Animated.multiply(particle2, 0.25),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          {
            top: "50%",
            right: "25%",
            width: 8,
            height: 8,
            backgroundColor: "#FFFFFF",
            opacity: Animated.multiply(particle3, 0.2),
          },
        ]}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          {/* Glow Background */}
          <Animated.View
            style={[
              styles.diyaGlow,
              { transform: [{ scale: glowScale }] },
            ]}
          />

          {/* Logo Icon */}
          <Animated.View
            style={[
              styles.logoWrap,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </View>

      {/* Tagline Footer */}
      <View style={styles.taglineFooter}>
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineY }],
            alignItems: "center",
            gap: spacing.md,
          }}
        >
          <View>
            <Text style={styles.headlineText}>
              Celebrate Together.
            </Text>
            <Text style={styles.subHeadlineText}>
              Manage Everything.
            </Text>
          </View>

          <View style={styles.subtitleRow}>
            <View style={styles.subtitleLine} />
            <Text style={styles.subtitleText}>THE COMMUNITY HUB</Text>
            <View style={styles.subtitleLine} />
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  particle: {
    position: "absolute",
    borderRadius: 9999,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: spacing.md,
  },
  logoSection: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  diyaGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 222, 169, 0.2)",
  },
  logoWrap: {
    width: 260,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 220,
    height: 94,
  },
  taglineFooter: {
    position: "absolute",
    bottom: 64,
    width: "100%",
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  headlineText: {
    fontSize: 28,
    fontFamily: fonts.poppins.bold,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 34,
  },
  subHeadlineText: {
    fontSize: 24,
    fontFamily: fonts.poppins.semibold,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 30,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    opacity: 0.6,
  },
  subtitleLine: {
    height: 1,
    width: 32,
    backgroundColor: "#FFFFFF",
  },
  subtitleText: {
    fontSize: 12,
    fontFamily: fonts.inter.medium,
    color: "#FFFFFF",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
});

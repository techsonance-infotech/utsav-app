import { colors as baseColors, borderRadius } from "@utsav/design-tokens";

export const colors = {
  ...baseColors,
  surface: "#fff8f4",
  surfaceDim: "#e0d9d3",
  surfaceBright: "#fff8f4",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#faf2ed",
  surfaceContainer: "#f4ece7",
  surfaceContainerHigh: "#efe7e1",
  surfaceContainerHighest: "#e9e1dc",
  onSurface: "#1e1b18",
  onSurfaceVariant: "#554334",
  inverseSurface: "#33302c",
  inverseOnSurface: "#f7efea",
  outline: "#887361",
  outlineVariant: "#dbc2ad",
  surfaceTint: "#8c5000",
  primaryBrand: "#8c5000", // to avoid shadowing baseColors.primary
  onPrimary: "#ffffff",
  primaryContainer: "#ff9500", // Saffron Brand Accent
  onPrimaryContainer: "#643700",
  inversePrimary: "#ffb874",
  secondaryBrand: "#b90d18", // Kumkum Red
  onSecondary: "#ffffff",
  secondaryContainer: "#dd2e2e",
  onSecondaryContainer: "#fffbff",
  tertiary: "#7d5800",
  onTertiary: "#ffffff",
  tertiaryContainer: "#dfa52f",
  onTertiaryContainer: "#593d00",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  primaryFixed: "#ffdcbf",
  primaryFixedDim: "#ffb874",
  onPrimaryFixed: "#2d1600",
  onPrimaryFixedVariant: "#6a3b00",
  secondaryFixed: "#ffdad6",
  secondaryFixedDim: "#ffb4ac",
  onSecondaryFixed: "#410002",
  onSecondaryFixedVariant: "#93000e",
  tertiaryFixed: "#ffdea9",
  tertiaryFixedDim: "#f9bc45",
  onTertiaryFixed: "#271900",
  onTertiaryFixedVariant: "#5e4100",
  background: "#fff8f4",
  onBackground: "#1e1b18",
  surfaceVariant: "#e9e1dc",
  pujaWhite: "#FAFAF8",
  cream: "#F4F1EB",
  sandstone: "#E8E2D6",
  charcoal: "#3A3530",
  tulsiGreen: "#22C55E",
  haldiYellow: "#EAB308",
  aartiGold: "#C9921A",
  kumkumRed: "#D92B2B",
};

export const fonts = {
  poppins: {
    regular: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semibold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
  },
  inter: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export { borderRadius };


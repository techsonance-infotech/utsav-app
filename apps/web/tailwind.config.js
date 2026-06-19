/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8c5000",
          50: "#FFF9E6",
          100: "#FFE6B3",
          200: "#FFD380",
          300: "#FFC04D",
          400: "#FFAD1A",
          500: "#FF9500", // Saffron - Primary CTA
          600: "#E07B00",
          700: "#B86100",
          800: "#8F4800",
          900: "#663000",
        },
        secondary: {
          50: "#FFEBEB",
          100: "#FFC7C7",
          200: "#FFA34D",
          300: "#FF7E7E",
          400: "#FF5A5A",
          500: "#D92B2B", // Kumkum Red
          600: "#B82020",
          700: "#961616",
          800: "#740D0D",
          900: "#520404",
        },
        success: {
          50: "#F0FDF4",
          500: "#22C55E", // Tulsi Green
          600: "#16A34A",
        },
        warning: {
          50: "#FEFCE8",
          500: "#EAB308", // Haldi Yellow
          600: "#CA8A04",
        },
        accent: {
          500: "#C9921A", // Aarti Gold
          600: "#AA7A10",
        },
        surface: {
          50: "#FAFAF8", // Puja White
          100: "#F5F5F0",
          200: "#EAEAE0",
          300: "#DADAD0",
          400: "#BABAB0",
          500: "#9A9A90",
          600: "#7A7A70",
          700: "#5A5A50",
          800: "#3A3A30",
          900: "#1A1A10",
        },
        // Stitch design exact color tokens
        "puja-white": "#FAFAF8",
        "cream": "#F4F1EB",
        "sandstone": "#E8E2D6",
        "charcoal": "#3A3530",
        "primary-container": "#FF9500",
        "on-primary-fixed": "#2D1600",
        "on-surface-variant": "#554334",
        "aarti-gold": "#C9921A",
        "kumkum-red": "#D92B2B",
        "tulsi-green": "#22C55E",
        "haldi-yellow": "#EAB308",
        "on-surface": "#1E1B18",
        "outline": "#887361",
        "surface-container-low": "#FAF2ED",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "headline-sm": ["Poppins", "sans-serif"],
        "headline-lg": ["Poppins", "sans-serif"],
        "headline-md": ["Poppins", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "display-2xl": ["Poppins", "sans-serif"],
        "display-xl": ["Poppins", "sans-serif"],
        "mono-data": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        md: "16px",
        "margin-desktop": "32px",
        base: "8px",
        "2xl": "48px",
        sm: "8px",
        xl: "32px",
        xs: "4px",
        lg: "24px",
        gutter: "16px",
        "margin-mobile": "16px",
        "3xl": "64px"
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "14px", fontWeight: "500" }],
        "headline-sm": ["20px", { lineHeight: "26px", fontWeight: "600" }],
        "headline-lg": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "30px", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "21px", fontWeight: "400" }],
        "display-2xl": ["40px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-xl": ["32px", { lineHeight: "38px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "mono-data": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "400" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "17px", fontWeight: "500" }]
      }
    },
  },
  plugins: [],
}

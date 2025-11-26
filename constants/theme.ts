import { Platform } from "react-native";

// iOS 26 Modern Color System
const tintColorLight = "#0A84FF";
const tintColorDark = "#0A84FF";

export const Colors = {
  light: {
    // Primary Text
    text: "#1D1D1D",
    textSecondary: "#8E8E93",
    textTertiary: "#C7C7CC",
    buttonText: "#FFFFFF",
    
    // Tabs & Navigation
    tabIconDefault: "#8E8E93",
    tabIconSelected: tintColorLight,
    
    // Links & Actions
    link: "#0A84FF",
    
    // Backgrounds
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F7",
    backgroundSecondary: "#EFEFEF",
    backgroundTertiary: "#E5E5EA",
    
    // Borders
    border: "#D1D1D6",
    
    // System Colors
    success: "#34C759",
    destructive: "#FF3B30",
    warning: "#FF9500",
    
    // Glass Effects
    inputBackground: "rgba(255, 255, 255, 0.8)",
    glassOverlay: "rgba(255, 255, 255, 0.12)",
    glassBorder: "rgba(255, 255, 255, 0.3)",
    glassBlur: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    // Primary Text
    text: "#FFFFFF",
    textSecondary: "#A1A1A6",
    textTertiary: "#5A5A5F",
    buttonText: "#FFFFFF",
    
    // Tabs & Navigation
    tabIconDefault: "#A1A1A6",
    tabIconSelected: tintColorDark,
    
    // Links & Actions
    link: "#0A84FF",
    
    // Backgrounds
    backgroundRoot: "#0A0A0A",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#3A3A3C",
    
    // Borders
    border: "#424245",
    
    // System Colors
    success: "#34C759",
    destructive: "#FF3B30",
    warning: "#FF9500",
    
    // Glass Effects
    inputBackground: "rgba(30, 30, 32, 0.8)",
    glassOverlay: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.2)",
    glassBlur: "rgba(255, 255, 255, 0.05)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 52,
  buttonHeight: 52,
  fabSize: 64,
};

export const BorderRadius = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 34,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 34,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'Menlo', 'Monaco', 'Courier New', monospace",
  },
});

// Shadow Styles for Elevation
export const Shadows = {
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

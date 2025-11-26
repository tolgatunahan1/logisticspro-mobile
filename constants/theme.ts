import { Platform } from "react-native";

// Logistics Professional Color System - Bright & Modern
const primaryBlue = "#0066FF";      // Vibrant logistics blue
const accentOrange = "#FF8C00";     // Energetic amber/orange
const lightBackground = "#F7F9FC";  // Soft blue-gray background

export const Colors = {
  light: {
    // Primary Text
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    buttonText: "#FFFFFF",
    
    // Tabs & Navigation
    tabIconDefault: "#9CA3AF",
    tabIconSelected: primaryBlue,
    
    // Links & Actions
    link: primaryBlue,
    
    // Backgrounds - BRIGHT & AIRY
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F7F9FC",
    backgroundSecondary: "#F0F4F8",
    backgroundTertiary: "#E5EBF2",
    
    // Borders
    border: "#E5E7EB",
    
    // System Colors - Logistics themed
    success: "#10B981",
    destructive: "#EF4444",
    warning: accentOrange,
    
    // Glass Effects - Bright & Blue-tinted
    inputBackground: "rgba(255, 255, 255, 0.9)",
    glassOverlay: "rgba(0, 102, 255, 0.06)",
    glassBorder: "rgba(0, 102, 255, 0.15)",
    glassBlur: "rgba(0, 102, 255, 0.03)",
    
    // Logistics Brand Colors
    primaryBlue: primaryBlue,
    accentOrange: accentOrange,
  },
  dark: {
    // Primary Text
    text: "#FFFFFF",
    textSecondary: "#D1D5DB",
    textTertiary: "#9CA3AF",
    buttonText: "#FFFFFF",
    
    // Tabs & Navigation
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#3B82F6",
    
    // Links & Actions
    link: "#3B82F6",
    
    // Backgrounds - Dark but not too dark
    backgroundRoot: "#0F172A",
    backgroundDefault: "#1E293B",
    backgroundSecondary: "#334155",
    backgroundTertiary: "#475569",
    
    // Borders
    border: "#475569",
    
    // System Colors
    success: "#10B981",
    destructive: "#EF4444",
    warning: "#FFA726",
    
    // Glass Effects - Blue-tinted
    inputBackground: "rgba(30, 41, 59, 0.9)",
    glassOverlay: "rgba(59, 130, 246, 0.08)",
    glassBorder: "rgba(59, 130, 246, 0.20)",
    glassBlur: "rgba(59, 130, 246, 0.05)",
    
    // Logistics Brand Colors
    primaryBlue: "#3B82F6",
    accentOrange: "#FFA726",
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
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sm: {
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  lg: {
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

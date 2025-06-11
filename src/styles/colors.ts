// SpellCheck App Color Palette
// This file contains all the colors used throughout the application

export const colors = {
  // Asparagus Variations (Green)
  asparagus: {
    light: '#8FA76B',         // Lighter variant
    base: '#769656',          // Base color (chessboard green squares)
    dark: '#5A7042',          // Darker variant (existing hover color)
    darker: '#3F4A2A',        // Even darker variant
  },

  // Jet Variations (Dark Grays)
  jet: {
    lighter: '#4A4B4A',       // Lighter jet
    light: '#3A3B3A',         // Light jet
    base: '#2A2B2A',          // Base jet (dark neutral)
    dark: '#1A1B1A',          // Dark jet
    darker: '#0A0B0A',        // Darker jet
  },

  // Cream Variations
  cream: {
    light: '#F5F5E8',         // Lighter cream
    base: '#EEEED2',          // Base cream (chessboard light squares)
    dark: '#E0E0C8',          // Darker cream (existing hover color)
  },

  // Blue Variations
  blue: {
    light: '#5B7BC7',         // Lighter blue
    base: '#4059AD',          // Base blue (accent blue)
    dark: '#2D4185',          // Darker blue
  },

  // Red Variations
  red: {
    light: '#F4615A',         // Lighter red
    base: '#EF3E36',          // Base red (accent red)
    dark: '#C92E27',          // Darker red
  },
} as const;

// Semantic Color Names (for easier usage)
export const semanticColors = {
  // Primary Actions
  primary: colors.asparagus.base,
  primaryHover: colors.asparagus.dark,
  
  // Secondary Actions
  secondary: colors.jet.base,
  secondaryHover: colors.jet.dark,
  
  // Success/Completed States
  success: colors.asparagus.base,
  
  // Background Colors
  backgroundLight: '#FFFFFF',
  backgroundDark: colors.jet.darker,
  
  // Tab Backgrounds
  tabBackgroundLight: colors.cream.base,
  tabBackgroundDark: colors.jet.light,
  
  // Text Colors
  textPrimary: colors.jet.base,
  textSecondary: colors.jet.light,
  textLight: '#FFFFFF',
  
  // Chess Board
  chessSquareLight: colors.cream.base,
  chessSquareDark: colors.asparagus.base,
} as const;

export default colors; 
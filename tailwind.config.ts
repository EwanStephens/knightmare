import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        chess7: ['Chess7', 'sans-serif'],
      },
      colors: {
        // SpellCheck Custom Color Palette
        // Base Colors: #769656, #EEEED2, #4059AD, #2A2B2A, #EF3E36
        asparagus: {
          light: '#8FA76B',         // Lighter green
          DEFAULT: '#769656',       // Primary green (chessboard green squares)
          dark: '#5A7042',          // Darker green (hover states)
          darker: '#3F4A2A',        // Even darker green
        },
        jet: {
          lighter: '#4A4B4A',       // Lighter jet
          light: '#3A3B3A',         // Light jet (modals, containers)
          DEFAULT: '#2A2B2A',       // Base jet (main dark backgrounds)
          dark: '#1A1B1A',          // Dark jet
          darker: '#0A0B0A',        // Darker jet
        },
        cream: {
          light: '#F5F5E8',         // Lighter cream
          DEFAULT: '#EEEED2',       // Base cream (chessboard light squares)
          dark: '#E0E0C8',          // Darker cream (hover states)
        },
        'spell-blue': {
          light: '#5B7BC7',         // Lighter blue
          DEFAULT: '#4059AD',       // Base blue (accent blue)
          dark: '#2D4185',          // Darker blue (hover states)
        },
        'spell-red': {
          light: '#F4615A',         // Lighter red
          DEFAULT: '#EF3E36',       // Base red (accent red)
          dark: '#C92E27',          // Darker red (hover states)
        },
        // Legacy dark board colors (keeping for compatibility)
        dark: {
          board: {
            light: '#8e8e8e',
            dark: '#4b4b4b',
          }
        }
      },
    },
  },
  plugins: [],
}
export default config 
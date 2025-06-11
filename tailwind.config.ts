import type { Config } from 'tailwindcss'
import { colors } from './src/styles/colors'

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
        // SpellCheck Custom Colors
        asparagus: {
          light: colors.asparagus.light,
          DEFAULT: colors.asparagus.base,
          dark: colors.asparagus.dark,
          darker: colors.asparagus.darker,
        },
        jet: {
          lighter: colors.jet.lighter,
          light: colors.jet.light,
          DEFAULT: colors.jet.base,
          dark: colors.jet.dark,
          darker: colors.jet.darker,
        },
        cream: {
          light: colors.cream.light,
          DEFAULT: colors.cream.base,
          dark: colors.cream.dark,
        },
        'spell-blue': {
          light: colors.blue.light,
          DEFAULT: colors.blue.base,
          dark: colors.blue.dark,
        },
        'spell-red': {
          light: colors.red.light,
          DEFAULT: colors.red.base,
          dark: colors.red.dark,
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
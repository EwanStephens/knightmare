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
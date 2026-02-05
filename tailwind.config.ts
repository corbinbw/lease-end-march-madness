import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Lease End brand colors - matched to leaseend.com
        navy: {
          50: '#e8f4f8',   // light teal-blue (background)
          100: '#d1e9ef',
          200: '#a3d3df',
          300: '#75bdcf',
          400: '#47a7bf',
          500: '#2d8aa3',
          600: '#236d82',
          700: '#1a5161',
          800: '#1e3a5f',  // dark navy (cards, headers)
          900: '#152a43',
          950: '#0d1a2d',
        },
        gold: {
          50: '#faf6ed',
          100: '#f5eddb',
          200: '#ebdbb7',
          300: '#e1c993',
          400: '#c9a962', // muted gold (buttons)
          500: '#b8944d',
          600: '#9a7a3d',
          700: '#7c602e',
          800: '#5e4620',
          900: '#402c12',
        },
        teal: {
          400: '#47a7bf',
          500: '#2d8aa3',
          600: '#236d82',
        },
      },
    },
  },
  plugins: [],
}
export default config

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
        // Lease End brand colors - blue focused
        navy: {
          50: '#e8f4f8',
          100: '#d1e9ef',
          200: '#a3d3df',
          300: '#75bdcf',
          400: '#47a7bf',  // teal-blue accent (from logo)
          500: '#2d8aa3',
          600: '#236d82',
          700: '#1a5161',
          800: '#1e3a5f',  // dark navy
          900: '#152a43',
          950: '#0d1a2d',
        },
        // Keep gold minimal - only for special highlights
        gold: {
          400: '#c9a962',
          500: '#b8944d',
        },
      },
    },
  },
  plugins: [],
}
export default config

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tape: {
          bg: '#F7F6F2',
          secondary: '#EFEEE9',
          border: '#E6E4DD',
          accent: '#C6BBA8',
          text: {
            primary: '#242420',
            secondary: '#898780',
            muted: '#ADA9A0',
          },
          white: '#FFFFFF',
          dark: '#161614',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'tape-subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'tape-float': '0 20px 40px -15px rgba(36, 36, 32, 0.08), 0 0 1px 1px rgba(230, 228, 221, 0.6)',
        'tape-glow': '0 0 25px rgba(198, 187, 168, 0.3)',
      }
    },
  },
  plugins: [],
}

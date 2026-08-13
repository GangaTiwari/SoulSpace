module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        serenity: {
          bg: '#F5F7FB',
          surface: '#FFFFFF',
          muted: '#E6ECF7',
          text: '#0F172A',
          subtle: '#5B6475',
          indigo: '#5B66E6',
          violet: '#8A6CF5',
          teal: '#26A69A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 8px 32px rgba(15, 23, 42, 0.06)',
        card: '0 10px 28px rgba(79, 70, 229, 0.08)',
      },
    },
  },
  plugins: [
    "@tailwindcss/postcss",
  ],
};

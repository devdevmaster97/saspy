import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card-bg)',
          border: 'var(--card-border)',
        },
        primary: {
          DEFAULT: 'var(--button-bg)',
          hover: 'var(--button-hover)',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: 'var(--accent)',
        },
      },
    },
  },
  plugins: [],
};

export default config; 